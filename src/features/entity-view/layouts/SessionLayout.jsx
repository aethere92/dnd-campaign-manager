import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom'; // CHANGED: Replaces useState
import { BookOpen, History, Network } from 'lucide-react';
import TabContainer from '../../../components/layout/TabContainer';
import { EntityBody, EntityHistory } from '../components/EntityBody';
import { SessionMentions } from '../components/SessionMentions';
import { TableOfContents } from '../../table-of-contents/TableOfContents';
import { extractHeaders } from '../../../utils/text/markdownHelpers';
import { ThreeColumnLayout } from '../../../components/layout/SplitView';

export default function SessionLayout({ viewModel }) {
	// CHANGED: Use URL params for state
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get('tab') || 'narrative';

	const setActiveTab = (tabId) => {
		setSearchParams(
			(prev) => {
				prev.set('tab', tabId);
				return prev;
			},
			{ replace: true }
		); // replace prevents cluttering history stack
	};

	if (!viewModel) return null;

	const tocItems = useMemo(() => {
		if (viewModel.content.narrative) {
			return extractHeaders(viewModel.content.narrative);
		}
		return [];
	}, [viewModel.content.narrative]);

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
		<div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
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
				defaultTab={activeTab} // CHANGED
				sticky
				onChange={setActiveTab} // CHANGED
			/>

			{tocItems.length > 0 && activeTab === 'narrative' && (
				<div className='xl:hidden'>
					<TableOfContents items={tocItems} />
				</div>
			)}
		</>
	);
}
