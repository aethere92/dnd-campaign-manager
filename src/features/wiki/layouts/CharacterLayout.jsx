import { useState, useMemo } from 'react';
import { User, Network, History as HistoryIcon, BookOpen } from 'lucide-react';
import TabContainer from '@/shared/components/layout/TabContainer';
import MobileInfoSheet from '@/shared/components/layout/MobileInfoSheet';
import { EntityBody, EntityHistory } from '@/features/wiki/components/EntityBody';
import { CharacterSidebar } from '@/features/wiki/components/character/CharacterSidebar';
import { CharacterStats } from '@/features/wiki/components/character/CharacterStats';
import { RelationshipNetwork } from '@/features/wiki/components/character/RelationshipNetwork';
import { extractHeaders } from '@/shared/utils/markdownUtils';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';
import { EntityLocalGraph } from '@/features/wiki/components/EntityLocalGraph'; // Import

export default function CharacterLayout({ viewModel }) {
	const { raw } = viewModel;
	const [activeTab, setActiveTab] = useState('bio');

	const gear = useMemo(() => (raw.relationships || []).filter((r) => r.entity_type === 'item'), [raw.relationships]);
	const personalQuests = useMemo(
		() =>
			(raw.relationships || []).filter(
				(r) => r.entity_type === 'quest' && ['quest_giver', 'quest_participant'].includes(r.type)
			),
		[raw.relationships]
	);

	// TOC for Bio
	const tocItems = useMemo(() => {
		if (activeTab === 'bio' && viewModel.content.summary) {
			return extractHeaders(viewModel.content.summary);
		}
		return [];
	}, [activeTab, viewModel.content.summary]);

	// --- TAB 1: BIOGRAPHY ---
	const renderBio = () => (
		<div className='w-full px-4 sm:px-6 py-8'>
			<div className='max-w-6xl mx-auto'>
				{/* 1. HERO STATS (Bio Exclusive) */}
				<CharacterStats attributes={raw.attributes} />

				{/* 2. SPLIT LAYOUT */}
				<div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 xl:gap-12'>
					{/* Desktop Sidebar (Hidden on Mobile) */}
					<div className='hidden lg:block lg:order-first min-w-0'>
						<CharacterSidebar attributes={raw.attributes} gear={gear} quests={personalQuests} />
					</div>

					{/* Content */}
					<div className='min-w-0 flex gap-8'>
						<div className='flex-1 min-w-0'>
							<EntityBody summary={viewModel.content.summary} sections={viewModel.content.sections} history={null} />
						</div>
						{tocItems.length > 0 && (
							<div className='hidden xl:block w-56 shrink-0 sticky top-4 border-l border-border pl-4 h-fit'>
								<TableOfContents items={tocItems} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	// --- TAB 2: NETWORK ---
	const renderNetwork = () => (
		<div className='w-full px-4 sm:px-6 py-8'>
			<div className='max-w-6xl mx-auto'>
				{/* NEW: Graph Section */}
				{raw.relationships && raw.relationships.length > 0 && (
					<div className='mb-10'>
						<EntityLocalGraph entity={raw} relationships={raw.relationships} height='h-[400px]' className='mb-8' />
					</div>
				)}
				<RelationshipNetwork relationships={raw.relationships} />
			</div>
		</div>
	);

	// --- TAB 3: CHRONICLE ---
	const renderChronicle = () => (
		<div className='w-full px-4 sm:px-6 py-8'>
			<div className='max-w-4xl mx-auto space-y-10'>
				{personalQuests.length > 0 && (
					<div>
						<h3 className='text-xs font-bold font-sans uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border pb-2'>
							<BookOpen size={14} /> Personal Quests
						</h3>
						<div className='grid gap-2'>
							{personalQuests.map((q) => (
								<div
									key={q.entity_id}
									className='p-3 border border-border rounded bg-card flex justify-between items-center'>
									<span className='font-bold text-sm text-foreground'>{q.entity_name}</span>
									<span className='text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded'>
										{q.type.replace(/_/g, ' ')}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
				<div>
					<h3 className='text-xs font-bold font-sans uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 border-b border-border pb-2'>
						<HistoryIcon size={14} /> Timeline
					</h3>
					<EntityHistory events={viewModel.content.history} fullHeight />
				</div>
			</div>
		</div>
	);

	// --- ROOT RENDER ---
	return (
		<div className='w-full bg-background min-h-screen relative'>
			<TabContainer
				tabs={[
					{ id: 'bio', label: 'Biography', icon: User, content: renderBio() },
					{ id: 'network', label: 'Network', icon: Network, content: renderNetwork() },
					{ id: 'chronicle', label: 'Chronicle', icon: HistoryIcon, content: renderChronicle() },
				]}
				defaultTab={activeTab}
				onChange={setActiveTab}
			/>

			<MobileInfoSheet title='Character Details'>
				<CharacterSidebar attributes={raw.attributes} gear={gear} quests={personalQuests} />
			</MobileInfoSheet>
		</div>
	);
}
