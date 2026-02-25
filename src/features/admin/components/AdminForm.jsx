import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { getStrategy } from '@/features/admin/config/adminStrategies';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { createEntity, fetchRawEntity, updateEntity } from '@/features/admin/api/adminService';
import Button from '@/shared/components/ui/Button';
import { Save, RotateCcw, ExternalLink, Plus, Trash2, Code, Braces, AlignLeft, Hash, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS, ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS } from './AdminFormStyles';

import MarkdownEditor from '@/features/admin/components/MarkdownEditor';
import SmartImageInput from '@/features/admin/components/SmartImageInput';
import AttributeValueInput from './inputs/AttributeValueInput';
import StoragePathInput from './inputs/StoragePathInput';

import SessionEventManager from './SessionEventManager';
import QuestObjectiveManager from '@/features/admin/components/QuestObjectiveManager';
import RelationshipManager from '@/features/admin/components/RelationshipManager';
import EncounterActionManager from './EncounterManager';
import EncounterNarrativeManager from './EncounterNarrativeManager'; // NEW
import TacticalMapManager from './TacticalMapManager';

export default function AdminForm({ type, id }) {
	const strategy = getStrategy(type);
	const { campaignId } = useCampaign();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
	const[isSaving, setIsSaving] = useState(false);
	const [mapKeys, setMapKeys] = useState([]);
	const [encounterTab, setEncounterTab] = useState('narrative'); // NEW Toggling State

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
			customAttributes:[],
			timeline:[], // Ensure timeline has a default
		},
	});
	const { fields, append, remove } = useFieldArray({ control, name: 'customAttributes' });

	useEffect(() => {
		const loadEntity = async () => {
			setIsLoading(true);
			try {
				if (!id) {
					reset({ attributes: {}, customAttributes: [], timeline:[] });
					setIsLoading(false);
					return;
				}
				const rawData = await fetchRawEntity(type, id);

				const definedKeys = strategy.defaultAttributes.map((a) => a.key);
				const standardAttrs = {};
				const customAttrs =[];

				(rawData.attributesList ||[]).forEach((attr) => {
					const key = attr.name;
					let value = attr.value;
					let dataType = 'string';

					if (typeof value === 'boolean' || value === 'true' || value === 'false') {
						dataType = 'boolean';
						value = String(value);
					} else if (typeof value === 'number') {
						dataType = 'number';
					} else if (Array.isArray(value)) {
						const isSimpleList = value.every((item) => ['string', 'number'].includes(typeof item));
						if (isSimpleList) {
							dataType = 'list';
							value = JSON.stringify(value);
						} else {
							dataType = 'json';
							value = JSON.stringify(value, null, 2);
						}
					} else if (typeof value === 'object' && value !== null) {
						dataType = 'map';
						value = JSON.stringify(value, null, 2);
					}

					if (definedKeys.includes(key)) {
						if (!standardAttrs[key]) standardAttrs[key] = value;
					} else {
						customAttrs.push({ key, value, type: dataType });
					}
				});

				// Set default timeline mode if empty
				if (type === 'encounter' && !standardAttrs.timeline_mode) {
					standardAttrs.timeline_mode = 'Legacy Combat Log';
				}

				reset({
					...rawData,
					attributes: standardAttrs,
					customAttributes: customAttrs,
					timeline: rawData.timeline ||[], // Ensure timeline populates
				});
			} catch (err) {
				console.error(err);
				alert('Error loading entity.');
			} finally {
				setIsLoading(false);
			}
		};
		loadEntity();
	},[type, id, reset, strategy]);

	useEffect(() => {
		if (type === 'map' && campaignId) {
			import('@/features/admin/api/adminService').then((mod) => {
				mod.fetchMapKeys(campaignId).then(setMapKeys);
			});
		}
	}, [type, campaignId]);

	const onSubmit = async (data) => {
		if (!campaignId && type !== 'campaign') {
			alert('No Campaign Selected!');
			return;
		}

		const attributesList =[];

		Object.entries(data.attributes).forEach(([key, value]) => {
			if (value && String(value).trim() !== '') {
				attributesList.push({ name: key, value });
			}
		});

		data.customAttributes.forEach((item) => {
			if (item.key && item.key.trim() !== '') {
				let finalValue = item.value;
				if (item.type === 'number') {
					finalValue = Number(item.value);
				} else if (item.type === 'boolean') {
					finalValue = String(item.value) === 'true';
				} else if (item.type === 'json' || item.type === 'list' || item.type === 'map') {
					try {
						finalValue = JSON.parse(item.value);
					} catch (e) {
						console.warn(`Failed to parse JSON for ${item.key}, saving as string.`);
					}
				}
				attributesList.push({ name: item.key, value: finalValue });
			}
		});

		const payload = { ...data, attributesList };
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
			queryClient.invalidateQueries();
		} catch (error) {
			alert(`Error: ${error.message}`);
		} finally {
			setIsSaving(false);
		}
	};

	const handleFormatJSON = (index) => {
		const currentVal = watch(`customAttributes.${index}.value`);
		try {
			const parsed = JSON.parse(currentVal);
			setValue(`customAttributes.${index}.value`, JSON.stringify(parsed, null, 2));
		} catch (e) {
			alert('Invalid JSON: ' + e.message);
		}
	};

	if (isLoading) return <div className='p-8 text-center text-muted-foreground text-sm'>Loading editor...</div>;

	const mapImageUrl = watch('attributes.map_image') || watch('attributes.map');
	const customAttrs = watch('customAttributes') ||[];
	const standardMarkers = watch('attributes.map_markers');
	const customMarkers = customAttrs.find((a) => a.key === 'map_markers')?.value;
	const activeMarkersValue = standardMarkers || customMarkers || '[]';

	const handleMarkersChange = (jsonValue) => {
		const customIdx = customAttrs.findIndex((a) => a.key === 'map_markers');
		if (customIdx >= 0) {
			setValue(`customAttributes.${customIdx}.value`, jsonValue);
			setValue(`customAttributes.${customIdx}.type`, 'json');
		} else {
			setValue('attributes.map_markers', jsonValue);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='space-y-5 animate-in slide-in-from-bottom-2 duration-300 pb-20'>
			<div className='flex items-center justify-between bg-background border border-border p-3 rounded-lg shadow-sm sticky top-0 z-20 backdrop-blur-md bg-background/80'>
				<div className='flex items-center gap-2'>
					<span className={`w-2 h-2 rounded-full ${id ? 'bg-amber-500/100' : 'bg-emerald-500/100'}`} />
					<span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
						{id ? 'Edit Mode' : 'Create Mode'}
					</span>
				</div>
				<div className='flex gap-2'>
					{id && (
						<Link
							to={`/wiki/${type}/${id}`}
							target='_blank'
							className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-card hover:border-primary border border-border rounded-md transition-colors'>
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

			<div className={ADMIN_SECTION_CLASS}>
				<h2 className={ADMIN_HEADER_CLASS}>Core Details</h2>
				<div className='grid grid-cols-1 gap-4'>
					{id && (
						<div>
							<label className={ADMIN_LABEL_CLASS}>System ID</label>
							<div className='flex gap-2 items-center'>
								<input
									type='text'
									value={id}
									readOnly
									className={`${ADMIN_INPUT_CLASS} font-mono text-xs text-muted-foreground bg-muted/50 select-all cursor-text`}
									onClick={(e) => e.target.select()}
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									icon={Copy}
									onClick={() => navigator.clipboard.writeText(id)}
									title='Copy ID'
								/>
							</div>
						</div>
					)}
					<div>
						<label className={ADMIN_LABEL_CLASS}>Name / Title</label>
						<input
							type='text'
							{...register('name', { required: true })}
							className={ADMIN_INPUT_CLASS}
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

			{mapImageUrl && (
				<TacticalMapManager imageUrl={mapImageUrl} value={activeMarkersValue} onChange={handleMarkersChange} />
			)}

			<div className={ADMIN_SECTION_CLASS}>
				<h2 className={ADMIN_HEADER_CLASS}>{strategy.label} Attributes</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{strategy.defaultAttributes.map((attr) => (
						<div key={attr.key}>
							<label className={ADMIN_LABEL_CLASS}>{attr.label}</label>
							{attr.type === 'image' ? (
								<SmartImageInput
									value={watch(`attributes.${attr.key}`)}
									onChange={(e) => setValue(`attributes.${attr.key}`, e.target.value)}
									placeholder='images/...'
								/>
							) : attr.type === 'select' ? (
								<select {...register(`attributes.${attr.key}`)} className={ADMIN_INPUT_CLASS}>
									<option value=''>Select...</option>
									{attr.options.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
							) : attr.type === 'storage_path' ? (
								<StoragePathInput
									value={watch(`attributes.${attr.key}`)}
									onChange={(val) => setValue(`attributes.${attr.key}`, val)}
									placeholder={attr.placeholder}
								/>
							) : (
								<>
									<input
										type={attr.type === 'number' ? 'number' : 'text'}
										{...register(`attributes.${attr.key}`)}
										className={ADMIN_INPUT_CLASS}
										placeholder={attr.placeholder}
										list={attr.suggestions ? `${attr.key}-suggestions` : undefined}
									/>
									{attr.suggestions === 'map_keys' && mapKeys.length > 0 && (
										<datalist id={`${attr.key}-suggestions`}>
											{mapKeys.map((k) => (
												<option key={k} value={k} />
											))}
										</datalist>
									)}
								</>
							)}
						</div>
					))}
				</div>
			</div>

			<div className={ADMIN_SECTION_CLASS}>
				<div className={ADMIN_HEADER_CLASS}>
					<span>Custom Attributes</span>
					<Button
						type='button'
						onClick={() => append({ key: '', value: '', type: 'string' })}
						size='sm'
						variant='secondary'
						icon={Plus}>
						Add New
					</Button>
				</div>
				<div className='space-y-3'>
					{fields.map((field, index) => {
						const attrType = watch(`customAttributes.${index}.type`);
						const attrValue = watch(`customAttributes.${index}.value`);
						return (
							<div key={field.id} className='flex gap-2 items-start animate-in fade-in group'>
								<div className='w-1/4 pt-1'>
									<input
										type='text'
										{...register(`customAttributes.${index}.key`)}
										placeholder='Key'
										className={`${ADMIN_INPUT_CLASS} font-bold text-muted-foreground border-transparent bg-transparent hover:bg-accent/50 focus:bg-background focus:border-input transition-all`}
									/>
								</div>
								<div className='w-24 pt-1'>
									<div className='relative'>
										<select
											{...register(`customAttributes.${index}.type`)}
											className={`${ADMIN_INPUT_CLASS} pr-8 appearance-none text-xs`}>
											<option value='string'>Text</option>
											<option value='number'>Number</option>
											<option value='boolean'>Toggle</option>
											<option value='list'>List</option>
											<option value='map'>Map</option>
											<option value='json'>JSON</option>
										</select>
										<div className='absolute right-2 top-2.5 pointer-events-none text-muted-foreground'>
											{attrType === 'json' ? <Braces size={12} /> : attrType === 'number' ? <Hash size={12} /> : <AlignLeft size={12} />}
										</div>
									</div>
								</div>
								<div className='flex-1 relative'>
									<AttributeValueInput
										type={attrType}
										value={attrValue}
										onChange={(val) => setValue(`customAttributes.${index}.value`, val)}
										placeholder='Value'
									/>
									{attrType === 'json' && (
										<button
											type='button'
											onClick={() => handleFormatJSON(index)}
											className='absolute right-2 top-2 text-[10px] bg-card text-primary px-1.5 py-0.5 rounded border border-border hover:border-primary transition-colors'>
											Format
										</button>
									)}
								</div>
								<button
									type='button'
									onClick={() => remove(index)}
									className='mt-2 p-1.5 text-muted-foreground/40 hover:text-primary hover:bg-red-500/10 rounded transition-colors'>
									<Trash2 size={16} />
								</button>
							</div>
						);
					})}
					{fields.length === 0 && (
						<div className='text-sm text-muted-foreground italic py-2'>No custom attributes defined.</div>
					)}
				</div>
			</div>

			{/* Sub Managers */}
			{id && type === 'session' && <SessionEventManager sessionId={id} />}
			{id && type === 'quest' && <QuestObjectiveManager questId={id} />}
			{id && <RelationshipManager entityId={id} />}

			{/* NEW: ENCOUNTER MANAGER TABS */}
			{id && type === 'encounter' && (
				<div className='space-y-4 pt-4'>
					<div className='flex bg-muted p-1 rounded-lg border border-border w-fit mx-auto shadow-inner'>
						<button
							type='button'
							onClick={() => setEncounterTab('narrative')}
							className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
								encounterTab === 'narrative'
									? 'bg-background shadow-sm text-foreground ring-1 ring-border'
									: 'text-muted-foreground hover:text-foreground'
							}`}>
							Narrative Timeline
						</button>
						<button
							type='button'
							onClick={() => setEncounterTab('legacy')}
							className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
								encounterTab === 'legacy'
									? 'bg-background shadow-sm text-foreground ring-1 ring-border'
									: 'text-muted-foreground hover:text-foreground'
							}`}>
							Legacy Combat Log
						</button>
					</div>

					{encounterTab === 'narrative' ? (
						<EncounterNarrativeManager
							timeline={watch('timeline') ||[]}
							onChange={(val) => setValue('timeline', val, { shouldDirty: true })}
						/>
					) : (
						<EncounterActionManager encounterId={id} />
					)}
				</div>
			)}
		</form>
	);
}