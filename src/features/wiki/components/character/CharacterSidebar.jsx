import { Tag, Shield, Gem, Scroll, Save, Eye, Swords, Activity } from 'lucide-react';
import EntityLink from '@/domain/entity/components/EntityLink';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import { clsx } from 'clsx';

// Helper: Split string by comma and trim
const parseTags = (str) => {
	if (!str) return [];
	if (Array.isArray(str)) return str;
	return String(str)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
};

const SidebarHeader = ({ title, icon: Icon }) => (
	<h4 className='flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3 mt-5 border-b border-border/40 pb-1'>
		{Icon && <Icon size={12} />} {title}
	</h4>
);

const TagPill = ({ text }) => (
	<span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border/50'>
		{text}
	</span>
);

const StatRowItem = ({ label, value }) => (
	<div className='flex flex-col items-center justify-center p-2 bg-muted/20 rounded border border-border/30'>
		<span className='text-[9px] font-bold uppercase text-muted-foreground/70 tracking-wider mb-0.5'>{label}</span>
		<span className='text-sm font-bold text-foreground font-serif'>{value}</span>
	</div>
);

const SkillItem = ({ text }) => {
	// split "Acrobatics (+1)" into name and val
	const match = text.match(/^(.*)\s(\([+-]?\d+\))$/);
	const name = match ? match[1] : text;
	const val = match ? match[2] : '';

	return (
		<div className='flex justify-between items-center text-[11px] py-0.5 px-1 border-b border-border/20 last:border-0'>
			<span className='text-muted-foreground'>{name}</span>
			<span className='font-mono text-foreground opacity-80 text-[10px]'>{val}</span>
		</div>
	);
};

const SidebarLink = ({ entity }) => (
	<EntityLink
		id={entity.entity_id}
		type={entity.entity_type}
		inline={true}
		showIcon={false}
		className={clsx(
			'!flex !w-full !items-center !justify-between !p-2 !rounded-lg !border !bg-card/60 !transition-all !cursor-pointer !no-underline !mb-2',
			'!border-border hover:!border-primary/40 hover:!shadow-sm hover:!bg-card'
		)}>
		<div className='flex items-center gap-2.5 flex-1 min-w-0'>
			<EntityIcon type={entity.entity_type} size={16} className='opacity-80 group-hover:opacity-100' />
			<span className='text-xs font-semibold text-card-foreground truncate group-hover:text-foreground transition-colors'>
				{entity.entity_name}
			</span>
		</div>
	</EntityLink>
);

export const CharacterSidebar = ({ attributes, gear, quests }) => {
	const proficiencies = parseTags(attributes.proficiencies || attributes.tools);
	const languages = parseTags(attributes.languages);
	const saves = attributes['saving throw'] || attributes['saves'] || [];
	const saveList = Array.isArray(saves) ? saves : [];

	// Extract special stats manually
	const initiative = attributes.initiative;
	const proficiencyBonus = attributes.proficiency || attributes.proficiency_bonus;
	const skills = parseTags(attributes.skills);
	const senses = parseTags(attributes['additional senses'] || attributes.senses);

	// Filter keys that we handle explicitly
	const ignoredKeys = new Set([
		// Header
		'class',
		'race',
		'level',
		// Stats Bar
		'ability score',
		'stats',
		'saving throw',
		'saves',
		'armor class',
		'ac',
		'hit points',
		'hp',
		'speed',
		'passive_perception',
		'passive',
		// Explicit Sections
		'languages',
		'proficiencies',
		'tools',
		'skills',
		'initiative',
		'proficiency',
		'proficiency_bonus',
		'additional senses',
		'senses',
		// System
		'icon',
		'background_image',
		'is_active',
		'campaign_id',
	]);

	// Get any remaining attributes (Alignment, Faith, etc.)
	const otherAttributes = Object.entries(attributes).filter(([key, val]) => {
		const k = key.toLowerCase();
		if (ignoredKeys.has(k)) return false;
		if (!val || (typeof val === 'object' && !Array.isArray(val))) return false;
		return true;
	});

	return (
		<div className='font-sans'>
			{/* 1. Combat Vitals Row (Initiative / Proficiency) */}
			{(initiative || proficiencyBonus) && (
				<div className='grid grid-cols-2 gap-2 mb-4'>
					{initiative && <StatRowItem label='Initiative' value={initiative} />}
					{proficiencyBonus && <StatRowItem label='Proficiency' value={proficiencyBonus} />}
				</div>
			)}

			{/* 2. Saving Throws */}
			{saveList.length > 0 && (
				<div>
					<SidebarHeader title='Saving Throws' icon={Save} />
					<div className='flex flex-wrap gap-1.5'>
						{saveList.map((save, i) => (
							<TagPill key={i} text={save} />
						))}
					</div>
				</div>
			)}

			{/* 3. Skills (Compact Grid) */}
			{skills.length > 0 && (
				<div>
					<SidebarHeader title='Skills' icon={Activity} />
					<div className='grid grid-cols-2 gap-x-4 gap-y-0.5'>
						{skills.map((skill, i) => (
							<SkillItem key={i} text={skill} />
						))}
					</div>
				</div>
			)}

			{/* 4. Senses */}
			{senses.length > 0 && (
				<div>
					<SidebarHeader title='Senses' icon={Eye} />
					<div className='flex flex-col gap-1'>
						{senses.map((sense, i) => (
							<div key={i} className='text-xs text-muted-foreground border-l-2 border-border pl-2 py-0.5'>
								{sense}
							</div>
						))}
					</div>
				</div>
			)}

			{/* 5. Languages */}
			{languages.length > 0 && (
				<div>
					<SidebarHeader title='Languages' icon={Tag} />
					<div className='flex flex-wrap gap-1.5'>
						{languages.map((lang, i) => (
							<TagPill key={i} text={lang} />
						))}
					</div>
				</div>
			)}

			{/* 6. Dynamic Attributes */}
			{otherAttributes.map(([key, val]) => {
				const tags = parseTags(val);
				return (
					<div key={key}>
						<SidebarHeader title={key.replace(/_/g, ' ')} icon={Swords} />
						<div className='flex flex-wrap gap-1.5'>
							{tags.map((t, i) => (
								<TagPill key={i} text={t} />
							))}
						</div>
					</div>
				);
			})}

			{/* 7. Personal Quests */}
			{quests && quests.length > 0 && (
				<div>
					<SidebarHeader title='Personal Quests' icon={Scroll} />
					<div>
						{quests.map((quest) => (
							<SidebarLink key={quest.entity_id} entity={quest} />
						))}
					</div>
				</div>
			)}

			{/* 8. Signature Gear */}
			{gear && gear.length > 0 && (
				<div>
					<SidebarHeader title='Signature Gear' icon={Gem} />
					<div>
						{gear.map((item) => (
							<SidebarLink key={item.entity_id} entity={item} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};
