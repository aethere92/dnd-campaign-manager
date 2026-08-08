import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deleteRow } from '@/features/admin/api/adminService';

/**
 * Shared CRUD + edit-state plumbing for the inline "child row" editors
 * (session events, quest objectives, encounter actions).
 *
 * WHY A HOOK, NOT A COMPONENT
 * Those three editors share their data flow almost exactly — fetch a list keyed by
 * a parent id, add an unsaved draft row, edit it inline, save (upsert) or delete —
 * but their *rendering* (edit form + view row) is entirely different per type. A
 * shared component would have to smuggle all that divergent JSX back in through
 * render props or conditionals, which reads worse than the duplication it removes.
 * A hook captures only what is genuinely identical and leaves each editor's markup
 * to itself.
 *
 * OPTIMISTIC DRAFTS
 * "Add" creates a row with a synthetic `new-…` id that lives only in local state
 * (`drafts`), merged onto the end of the server list for rendering — matching the
 * original behaviour. This is why a plain useQuery conversion wasn't enough: the
 * list is part server data (read-only cache) and part unsaved local drafts.
 *   - Saving a draft upserts it (the upsert fns strip the `new-` id), then refetch
 *     replaces it with the real row and the draft is dropped.
 *   - Cancelling or deleting a draft just removes it locally — no network call.
 *   - Editing/deleting a real row goes through the server, then refetch.
 *
 * @param {object}   opts
 * @param {Array}    opts.queryKey     react-query key (include the parent id)
 * @param {Function} opts.fetchFn      () => Promise<row[]>
 * @param {Function} opts.upsertFn     (formData) => Promise<row>
 * @param {string}   opts.deleteTable  table name for deleting a real row
 * @param {Function} opts.makeDraft    (rows) => newRow  (no id — the hook assigns it)
 * @param {boolean}  opts.enabled      whether the parent id is present
 */
export function useChildRowManager({ queryKey, fetchFn, upsertFn, deleteTable, makeDraft, enabled }) {
	const { data: savedRows = [], isLoading: loading, refetch } = useQuery({ queryKey, queryFn: fetchFn, enabled });

	// Unsaved rows, kept out of the query cache.
	const [drafts, setDrafts] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({});

	// Drafts render after the saved rows, as the originals appended them.
	const rows = [...savedRows, ...drafts];

	const isDraftId = (id) => String(id).startsWith('new');

	const startEdit = (row) => {
		setEditingId(row.id);
		setFormData({ ...row });
	};

	const addNew = () => {
		// The draft id is minted here (once) rather than in each makeDraft. The
		// `new-` prefix is load-bearing: isDraftId keys off it to tell an unsaved row
		// from a persisted one.
		const draftId = `new-${Date.now()}`;
		const draft = { id: draftId, ...makeDraft(rows) };
		setDrafts((prev) => [...prev, draft]);
		startEdit(draft);
	};

	const cancelEdit = () => {
		// A cancelled draft was never persisted, so discard it. A cancelled real row
		// keeps its saved values (formData was only ever a copy).
		if (editingId && isDraftId(editingId)) {
			setDrafts((prev) => prev.filter((d) => d.id !== editingId));
		}
		setEditingId(null);
	};

	const save = async () => {
		const draftId = editingId;
		await upsertFn(formData);
		setEditingId(null);
		// Drop the local draft (if this was one) and pull the authoritative row(s).
		if (draftId && isDraftId(draftId)) {
			setDrafts((prev) => prev.filter((d) => d.id !== draftId));
		}
		await refetch();
	};

	const remove = async (id) => {
		if (isDraftId(id)) {
			setDrafts((prev) => prev.filter((d) => d.id !== id));
			return;
		}
		await deleteRow(deleteTable, id);
		await refetch();
	};

	return {
		rows,
		loading,
		editingId,
		formData,
		setFormData,
		addNew,
		startEdit,
		cancelEdit,
		save,
		remove,
		refetch,
	};
}
