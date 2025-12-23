import { useState, useMemo } from 'react';
import { BookOpen, History, Network } from 'lucide-react';
import TabContainer from '../../../components/layout/TabContainer';
import { EntityBody, EntityHistory } from '../components/EntityBody';
import { SessionMentions } from '../components/SessionMentions';
import { TableOfContents } from '../../table-of-contents/TableOfContents';
import { extractHeaders } from '../../../utils/text/markdownHelpers';
import { ThreeColumnLayout } from '../../../components/layout/SplitView';

export default function SessionLayout({ viewModel }) {
	const [activeTab, setActiveTab] = useState('narrative');

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
						levelUp={viewModel.content.levelUp} // Pass new prop
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
				defaultTab='narrative'
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
