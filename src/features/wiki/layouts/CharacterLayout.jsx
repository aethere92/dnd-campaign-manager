import { useState, useMemo } from 'react';
import { User, Network, History as HistoryIcon, BookOpen, Info, X } from 'lucide-react';
import { Drawer } from 'vaul';
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

			{/* MOBILE INFO DRAWER */}
			<div className='lg:hidden'>
				<Drawer.Root shouldScaleBackground>
					<Drawer.Trigger asChild>
						<button className='fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-background text-foreground border border-border rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform hover:border-primary/50'>
							<Info size={18} />
							<span>Info</span>
						</button>
					</Drawer.Trigger>

					<Drawer.Portal>
						<Drawer.Overlay className='fixed inset-0 bg-black/60 z-[60] backdrop-blur-[2px]' />
						<Drawer.Content className='bg-background flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[60] focus:outline-none border-t border-border'>
							{/* Drag Handle & Header */}
							<div className='p-4 bg-muted/30 rounded-t-[10px] flex-shrink-0 border-b border-border'>
								<div className='mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mb-4' />
								<div className='flex justify-between items-center'>
									<Drawer.Title className='font-serif font-bold text-xl text-foreground'>
										Character Details
									</Drawer.Title>
									<Drawer.Close className='p-2 bg-muted/50 hover:bg-muted rounded-full text-muted-foreground transition-colors'>
										<X size={18} />
									</Drawer.Close>
								</div>
							</div>

							{/* Content */}
							<div className='p-4 overflow-y-auto custom-scrollbar flex-1'>
								<CharacterSidebar attributes={raw.attributes} gear={gear} quests={personalQuests} />
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>
			</div>
		</div>
	);
}
