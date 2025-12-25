import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { getStrategy } from '../config/strategies';
import { useCampaign } from '../../campaign-session/CampaignContext';
import { createEntity, fetchRawEntity, updateEntity } from '../../../services/admin'; // Removed getSessionList
import Button from '../../../components/ui/Button';
import { Save, RotateCcw, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { INPUT_CLASS, LABEL_CLASS, SECTION_CLASS, HEADER_CLASS } from './ui/FormStyles';

// Inputs
import MarkdownEditor from './MarkdownEditor';
import SmartImageInput from './SmartImageInput';

// Sub-managers
import SessionEventManager from './SessionEventManager';
import QuestObjectiveManager from './QuestObjectiveManager';
import RelationshipManager from './RelationshipManager';
import EncounterActionManager from './EncounterActionManager';

export default function AdminForm({ type, id }) {
	const strategy = getStrategy(type);
	const { campaignId } = useCampaign();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	// REMOVED: const [sessions, setSessions] = useState([]);

	const {
		register,
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: {
			attributes: {},
			customAttributes: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'customAttributes',
	});

	// 1. LOAD DATA
	useEffect(() => {
		const loadEntity = async () => {
			setIsLoading(true);
			try {
				// REMOVED: The session loading logic

				if (!id) {
					reset({ attributes: {}, customAttributes: [] });
					setIsLoading(false);
					return;
				}

				const rawData = await fetchRawEntity(type, id);
				const definedKeys = strategy.defaultAttributes.map((a) => a.key);
				const standardAttrs = {};
				const customAttrs = [];

				(rawData.attributesList || []).forEach((attr) => {
					const key = attr.name;
					const value = attr.value;

					if (definedKeys.includes(key)) {
						if (!standardAttrs[key]) {
							standardAttrs[key] = value;
						} else {
							customAttrs.push({ key, value });
						}
					} else {
						customAttrs.push({ key, value });
					}
				});

				reset({
					...rawData,
					attributes: standardAttrs,
					customAttributes: customAttrs,
				});
			} catch (err) {
				console.error(err);
				alert('Error loading entity.');
			} finally {
				setIsLoading(false);
			}
		};
		loadEntity();
	}, [type, id, reset, strategy]); // REMOVED campaignId dependency

	// 2. SAVE HANDLER
	const onSubmit = async (data) => {
		if (!campaignId && type !== 'campaign') {
			alert('No Campaign Selected! Select one from the home screen first.');
			return;
		}

		// Flatten everything into a single list for the Service
		const attributesList = [];

		// 1. Add Standard Attributes
		Object.entries(data.attributes).forEach(([key, value]) => {
			if (value && String(value).trim() !== '') {
				attributesList.push({ name: key, value });
			}
		});

		// 2. Add Custom Attributes (Allowing duplicates)
		data.customAttributes.forEach((item) => {
			if (item.key && item.key.trim() !== '') {
				attributesList.push({ name: item.key, value: item.value });
			}
		});

		const payload = {
			...data,
			attributesList, // Send the array, not the object
		};

		// Cleanup internal form state
		delete payload.attributes;
		delete payload.customAttributes;

		setIsSaving(true);
		try {
			if (id) {
				await updateEntity(type, id, payload);
			} else {
				await createEntity(type, { ...payload, campaign_id: campaignId });
				if (!id) reset();
			}
		} catch (error) {
			alert(`Error: ${error.message}`);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) return <div className='p-8 text-center text-muted-foreground text-sm'>Loading editor...</div>;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='space-y-5 animate-in slide-in-from-bottom-2 duration-300 pb-20'>
			{/* --- TOP BAR --- */}
			<div className='flex items-center justify-between bg-background border border-border p-3 rounded-lg shadow-sm sticky top-0 z-20 backdrop-blur-md bg-background/80'>
				<div className='flex items-center gap-2'>
					<span className={`w-2 h-2 rounded-full ${id ? 'bg-amber-500' : 'bg-emerald-500'}`} />
					<span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
						{id ? 'Edit Mode' : 'Create Mode'}
					</span>
				</div>
				<div className='flex gap-2'>
					{id && (
						<Link
							to={`/wiki/${type}/${id}`}
							target='_blank'
							className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors'>
							<ExternalLink size={14} /> View Live
						</Link>
					)}
					<Button type='button' variant='secondary' size='sm' icon={RotateCcw} onClick={() => reset()}>
						Reset
					</Button>
					<Button type='submit' variant='primary' size='sm' icon={Save} disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</div>

			{/* --- CORE DETAILS --- */}
			<div className={SECTION_CLASS}>
				<h2 className={HEADER_CLASS}>Core Details</h2>
				<div className='grid grid-cols-1 gap-4'>
					<div>
						<label className={LABEL_CLASS}>Name / Title</label>
						<input
							type='text'
							{...register('name', { required: true })}
							className={INPUT_CLASS}
							placeholder='Entity Name...'
						/>
						{errors.name && <span className='text-xs text-red-500 mt-1'>Required</span>}
					</div>

					{strategy.hasNarrative && (
						<div>
							<MarkdownEditor
								label='Description / Narrative'
								rows={8}
								value={watch('description') || ''}
								onChange={(e) => setValue('description', e.target.value)}
								placeholder='Write description using Markdown...'
							/>
						</div>
					)}
				</div>
			</div>

			{/* --- STANDARD ATTRIBUTES --- */}
			<div className={SECTION_CLASS}>
				<h2 className={HEADER_CLASS}>{strategy.label} Attributes</h2>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{strategy.defaultAttributes.map((attr) => (
						<div key={attr.key}>
							<label className={LABEL_CLASS}>{attr.label}</label>

							{/* RENDER LOGIC: Check type explicitly to avoid duplication */}
							{attr.type === 'image' ? (
								<SmartImageInput
									value={watch(`attributes.${attr.key}`)}
									onChange={(e) => setValue(`attributes.${attr.key}`, e.target.value)}
									placeholder='images/...'
								/>
							) : attr.type === 'select' ? (
								<select {...register(`attributes.${attr.key}`)} className={INPUT_CLASS}>
									<option value=''>Select...</option>
									{attr.options.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
							) : (
								<input
									type={attr.type === 'number' ? 'number' : 'text'}
									{...register(`attributes.${attr.key}`)}
									className={INPUT_CLASS}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			{/* --- CUSTOM ATTRIBUTES (Dynamic) --- */}
			<div className={SECTION_CLASS}>
				<div className={HEADER_CLASS}>
					<span>Custom Attributes</span>
					<Button
						type='button'
						onClick={() => append({ key: '', value: '' })}
						size='sm'
						variant='secondary'
						icon={Plus}>
						Add New
					</Button>
				</div>

				<div className='space-y-2'>
					{fields.map((field, index) => (
						<div key={field.id} className='flex gap-3 items-start animate-in fade-in'>
							<div className='w-1/3'>
								<input
									type='text'
									{...register(`customAttributes.${index}.key`)}
									placeholder='Key (e.g. SecretIdentity)'
									className={`${INPUT_CLASS} font-bold text-muted-foreground`}
								/>
							</div>
							<div className='flex-1'>
								<input
									type='text'
									{...register(`customAttributes.${index}.value`)}
									placeholder='Value'
									className={INPUT_CLASS}
								/>
							</div>
							<button
								type='button'
								onClick={() => remove(index)}
								className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors'>
								<Trash2 size={16} />
							</button>
						</div>
					))}
					{fields.length === 0 && (
						<div className='text-sm text-muted-foreground italic py-2'>No custom attributes defined.</div>
					)}
				</div>
			</div>

			{/* --- CHILD MANAGERS --- */}
			{id && type === 'session' && <SessionEventManager sessionId={id} />}
			{id && type === 'quest' && <QuestObjectiveManager questId={id} />}
			{id && type === 'encounter' && <EncounterActionManager encounterId={id} />}
			{id && <RelationshipManager entityId={id} />}
		</form>
	);
}
