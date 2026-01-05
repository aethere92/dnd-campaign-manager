import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import {
	Bold,
	Italic,
	List,
	Heading1,
	Heading2,
	Heading3,
	Quote,
	Code,
	Link as LinkIcon,
	Undo,
	Redo,
	AtSign,
	Wand2,
	X,
	FileCode,
	Eye,
} from 'lucide-react';
import EntitySearch from './EntitySearch';
import { ADMIN_LABEL_CLASS } from './AdminFormStyles';
import clsx from 'clsx';

// --- TOOLBAR COMPONENT ---
const MenuBar = ({ editor, mode, setMode, onMentionClick }) => {
	// Helper for buttons
	const Btn = ({ icon: Icon, onClick, isActive, disabled, title }) => (
		<button
			type='button'
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={clsx(
				'p-1.5 rounded transition-colors flex items-center justify-center h-7 w-7',
				isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
				disabled && 'opacity-30 cursor-not-allowed'
			)}>
			<Icon size={14} strokeWidth={2.5} />
		</button>
	);

	return (
		<div className='flex items-center gap-1 p-1.5 border-b border-border bg-muted/20 select-none flex-wrap'>
			{/* Standard Formatting Tools - Only active in Visual Mode */}
			<div className={clsx('flex items-center gap-1', mode === 'source' && 'opacity-30 pointer-events-none grayscale')}>
				<Btn
					icon={Bold}
					title='Bold'
					onClick={() => editor?.chain().focus().toggleBold().run()}
					isActive={editor?.isActive('bold')}
				/>
				<Btn
					icon={Italic}
					title='Italic'
					onClick={() => editor?.chain().focus().toggleItalic().run()}
					isActive={editor?.isActive('italic')}
				/>
				<div className='w-px h-4 bg-border mx-1 opacity-50' />
				<Btn
					icon={Heading1}
					title='H1'
					onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
					isActive={editor?.isActive('heading', { level: 1 })}
				/>
				<Btn
					icon={Heading2}
					title='H2'
					onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
					isActive={editor?.isActive('heading', { level: 2 })}
				/>
				<Btn
					icon={Heading3}
					title='H3'
					onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
					isActive={editor?.isActive('heading', { level: 3 })}
				/>
				<Btn
					icon={List}
					title='Bullet List'
					onClick={() => editor?.chain().focus().toggleBulletList().run()}
					isActive={editor?.isActive('bulletList')}
				/>
				<Btn
					icon={Quote}
					title='Blockquote'
					onClick={() => editor?.chain().focus().toggleBlockquote().run()}
					isActive={editor?.isActive('blockquote')}
				/>
				<Btn
					icon={Code}
					title='Code Block'
					onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
					isActive={editor?.isActive('codeBlock')}
				/>
				<div className='w-px h-4 bg-border mx-1 opacity-50' />
				<Btn
					icon={LinkIcon}
					title='Link'
					isActive={editor?.isActive('link')}
					onClick={() => {
						const previousUrl = editor?.getAttributes('link').href;
						const url = window.prompt('URL', previousUrl);
						if (url === null) return;
						if (url === '') {
							editor?.chain().focus().extendMarkRange('link').unsetLink().run();
							return;
						}
						editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
					}}
				/>
			</div>

			{/* Mention Button (Works in both, but handled manually in Source) */}
			<div className='w-px h-4 bg-border mx-1 opacity-50' />
			<button
				type='button'
				onClick={onMentionClick}
				className={clsx(
					'ml-1 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded hover:bg-primary/10 transition-colors',
					'text-primary'
				)}
				title='Mention Entity (@)'>
				<AtSign size={13} />
				<span className='hidden sm:inline'>Mention</span>
			</button>

			{/* Right Side: Mode Toggle */}
			<div className='flex-1' />

			{/* Undo/Redo - Only Visual */}
			<div className={clsx('flex gap-1 mr-2', mode === 'source' && 'hidden')}>
				<Btn
					icon={Undo}
					title='Undo'
					onClick={() => editor?.chain().focus().undo().run()}
					disabled={!editor?.can().undo()}
				/>
				<Btn
					icon={Redo}
					title='Redo'
					onClick={() => editor?.chain().focus().redo().run()}
					disabled={!editor?.can().redo()}
				/>
			</div>

			<div className='flex bg-muted rounded p-0.5 border border-border'>
				<button
					type='button'
					onClick={() => setMode('visual')}
					className={clsx(
						'px-2 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-all',
						mode === 'visual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
					)}>
					<Eye size={12} /> Visual
				</button>
				<button
					type='button'
					onClick={() => setMode('source')}
					className={clsx(
						'px-2 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-all',
						mode === 'source' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
					)}>
					<FileCode size={12} /> Source
				</button>
			</div>
		</div>
	);
};

export default function MarkdownEditorImpl({ label, value, onChange, placeholder }) {
	const [mode, setMode] = useState('visual'); // 'visual' | 'source'
	const [mentionPos, setMentionPos] = useState(null);
	const sourceRef = React.useRef(null);

	// --- TIPTAP CONFIG ---
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' },
			}),
			Markdown,
		],
		editorProps: {
			attributes: {
				class:
					'prose prose-sm prose-neutral dark:prose-invert max-w-none min-h-[180px] px-4 py-3 focus:outline-none custom-scrollbar',
			},
			handleKeyDown: (view, event) => {
				if (event.key === '@') {
					const { top, left } = view.coordsAtPos(view.state.selection.from);
					setMentionPos({ top: top + 20, left });
					return false;
				}
				return false;
			},
		},
		content: value,
		onUpdate: ({ editor }) => {
			// Sync to parent form
			if (mode === 'visual') {
				onChange({ target: { value: editor.storage.markdown.getMarkdown() } });
			}
		},
	});

	// --- SYNCING LOGIC ---
	useEffect(() => {
		// When switching back to Visual, or when Form resets, sync Tiptap
		if (editor && mode === 'visual') {
			const currentContent = editor.storage.markdown.getMarkdown();
			if (value !== currentContent) {
				// Check if empty to avoid jumping cursor on slight formatting diffs
				if (value === '' || value === undefined) {
					editor.commands.setContent('');
				} else if (Math.abs(value.length - currentContent.length) > 5) {
					// Only hard reset if significant change (e.g. from Source edit)
					editor.commands.setContent(value);
				}
			}
		}
	}, [value, editor, mode]);

	// --- HANDLERS ---
	const handleMentionClick = (e) => {
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		setMentionPos({ top: rect.bottom + 5, left: rect.left });
	};

	const handleInsertEntity = (entity) => {
		const link = `[:: ${entity.name} ::](#entity/${entity.id}/${entity.type})`;

		if (mode === 'visual' && editor) {
			// Visual Mode: Insert as Link Node
			const href = `#entity/${entity.id}/${entity.type}`;
			const label = `:: ${entity.name} ::`;

			// Remove pending '@'
			const { from } = editor.state.selection;
			const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from);
			if (textBefore === '@')
				editor
					.chain()
					.focus()
					.deleteRange({ from: from - 1, to: from })
					.run();

			editor.chain().focus().setLink({ href }).insertContent(label).run();
		} else {
			// Source Mode: Insert raw text
			const textarea = sourceRef.current;
			if (textarea) {
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				const text = textarea.value;
				const before = text.substring(0, start);
				const after = text.substring(end);

				// Remove pending '@' if exists
				const finalBefore = before.endsWith('@') ? before.slice(0, -1) : before;

				const newValue = finalBefore + link + after;

				// Fire change event manually for React Hook Form
				onChange({ target: { value: newValue } });

				// Restore focus
				setTimeout(() => {
					textarea.focus();
					textarea.setSelectionRange(finalBefore.length + link.length, finalBefore.length + link.length);
				}, 0);
			}
		}
		setMentionPos(null);
	};

	return (
		<div className='flex flex-col gap-1.5 group'>
			{label && <label className={ADMIN_LABEL_CLASS}>{label}</label>}

			<div
				className={clsx(
					'border rounded-lg bg-background overflow-hidden shadow-sm transition-all flex flex-col',
					'focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500',
					'border-border'
				)}>
				<MenuBar editor={editor} mode={mode} setMode={setMode} onMentionClick={handleMentionClick} />

				<div className='relative bg-background min-h-[180px]'>
					{mode === 'visual' ? (
						<div onClick={() => editor?.commands.focus()} className='cursor-text h-full'>
							<EditorContent editor={editor} />
						</div>
					) : (
						<textarea
							ref={sourceRef}
							value={value}
							onChange={onChange}
							className='w-full h-full min-h-[180px] p-4 font-mono text-sm resize-y outline-none bg-transparent'
							placeholder='Type raw markdown here...'
							onKeyDown={(e) => {
								if (e.key === '@') {
									// Naive source mode positioning (bottom of textarea)
									// Precise positioning in textarea is hard without libraries,
									// so we default to the mention button position logic or fixed center
									const rect = e.target.getBoundingClientRect();
									setMentionPos({ top: rect.top + 20, left: rect.left + 20 });
								}
							}}
						/>
					)}
				</div>
			</div>

			{/* Mention Popup */}
			{mentionPos && (
				<div
					className='fixed z-[9999] w-72 bg-background border border-primary/30 shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-100 flex flex-col'
					style={{ top: mentionPos.top, left: mentionPos.left }}
					onClick={(e) => e.stopPropagation()}>
					<div className='flex justify-between items-center p-2 border-b border-border bg-muted/50'>
						<span className='text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-1'>
							<Wand2 size={10} /> Link Entity
						</span>
						<button
							type='button'
							onClick={() => setMentionPos(null)}
							className='text-muted-foreground hover:text-red-500'>
							<X size={14} />
						</button>
					</div>
					<div className='p-2'>
						<EntitySearch onSelect={handleInsertEntity} autoFocus />
					</div>
					{/* Click-away listener backdrop */}
					<div className='fixed inset-0 z-[-1]' onClick={() => setMentionPos(null)} />
				</div>
			)}
		</div>
	);
}
