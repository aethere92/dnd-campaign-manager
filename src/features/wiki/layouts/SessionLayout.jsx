import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, History, Network } from 'lucide-react';
import TabContainer from '@/shared/components/layout/TabContainer';
import { EntityBody, EntityHistory } from '@/features/wiki/components/EntityBody';
import { SessionMentions } from '@/features/wiki/components/SessionMentions';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';
import { extractHeaders } from '@/shared/utils/markdownUtils';
import { ThreeColumnLayout } from '@/shared/components/layout/SplitView';
import { EntityLocalGraph } from '@/features/wiki/components/EntityLocalGraph'; // Import

export default function SessionLayout({ viewModel }) {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get('tab') || 'narrative';

	const setActiveTab = (tabId) => {
		setSearchParams(
			(prev) => {
				prev.set('tab', tabId);
				return prev;
			},
			{ replace: true }
		);
	};

	const tocItems = useMemo(() => {
		if (viewModel.content.narrative) {
			return extractHeaders(viewModel.content.narrative);
		}
		return [];
	}, [viewModel.content.narrative]);

	if (!viewModel) return null;

	const renderNarrative = () => (
		<ThreeColumnLayout
			left={null}
			center={
				<div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
					<EntityBody
						summary={viewModel.content.narrative}
						sections={[]}
						history={null}
						levelUp={viewModel.content.levelUp}
					/>
				</div>
			}
			right={
				tocItems.length > 0 ? (
					<TableOfContents
						items={tocItems}
						className='ml-4'
						visibilityClass='hidden min-[1650px]:block'
						mobileToggleClass='min-[1650px]:hidden'
					/>
				) : null
			}
		/>
	);

	const renderMentions = () => (
		<div className='max-w-6xl mx-auto px-4 sm:px-6 py-10'>
			{/* NEW: Graph Section */}
			{viewModel.raw.relationships && viewModel.raw.relationships.length > 0 && (
				<div className='mb-10 max-w-6xl mx-auto'>
					<EntityLocalGraph entity={viewModel.raw} relationships={viewModel.raw.relationships} height='h-[350px]' />
				</div>
			)}
			<SessionMentions mentions={viewModel.content.mentions} />
		</div>
	);

	const renderTimeline = () => (
		<div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
			<EntityHistory events={viewModel.content.history} fullHeight={true} />
		</div>
	);

	return (
		<>
			<TabContainer
				tabs={[
					{
						id: 'narrative',
						label: 'Narrative',
						icon: BookOpen,
						content: renderNarrative(),
					},
					{
						id: 'mentions',
						label: 'Mentions',
						icon: Network,
						content: renderMentions(),
					},
					{
						id: 'events',
						label: 'Timeline',
						icon: History,
						content: renderTimeline(),
					},
				]}
				defaultTab={activeTab}
				sticky
				onChange={setActiveTab}
			/>

			{tocItems.length > 0 && activeTab === 'narrative' && (
				<div className='xl:hidden'>
					<TableOfContents items={tocItems} />
				</div>
			)}
		</>
	);
}
