import { useState, useMemo } from 'react';
import { User, Network, History as HistoryIcon, BookOpen } from 'lucide-react';
import TabContainer from '@/shared/components/layout/TabContainer';
import { EntityBody, EntityHistory } from '@/features/wiki/components/EntityBody';
import { CharacterSidebar } from '@/features/wiki/components/character/CharacterSidebar';
import { CharacterStats } from '@/features/wiki/components/character/CharacterStats';
import { RelationshipNetwork } from '@/features/wiki/components/character/RelationshipNetwork';
import { extractHeaders } from '@/shared/utils/markdownUtils';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';

export default function CharacterLayout({ viewModel }) {
	const { raw } = viewModel;
	const [activeTab, setActiveTab] = useState('bio');

	// Filter Relationships
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
					{/* Sidebar: Identity, Saves, Gear, Quests */}
					<div className='hidden lg:block lg:order-first min-w-0'>
						<CharacterSidebar attributes={raw.attributes} gear={gear} quests={personalQuests} />
					</div>

					{/* Mobile Sidebar */}
					<div className='lg:hidden items-center'>
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
				<RelationshipNetwork relationships={raw.relationships} />
			</div>
		</div>
	);

	// --- TAB 3: CHRONICLE ---
	const renderChronicle = () => (
		<div className='w-full px-4 sm:px-6 py-8'>
			<div className='max-w-4xl mx-auto space-y-10'>
				{/* Removed Personal Quests from here as they are now in Sidebar */}
				<div>
					<EntityHistory events={viewModel.content.history} fullHeight />
				</div>
			</div>
		</div>
	);

	// --- ROOT RENDER ---
	return (
		<div className='w-full bg-background min-h-screen'>
			<TabContainer
				tabs={[
					{ id: 'bio', label: 'Biography', icon: User, content: renderBio() },
					{ id: 'mentions', label: 'Mentions', icon: Network, content: renderNetwork() },
					{ id: 'timeline', label: 'Timeline', icon: HistoryIcon, content: renderChronicle() },
				]}
				defaultTab={activeTab}
				onChange={setActiveTab}
			/>
		</div>
	);
}
