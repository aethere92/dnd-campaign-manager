/**
 * SessionLayout Component
 * Layout for sessions (tabbed interface with ToC)
 */

import { useMemo } from 'react';
import { BookOpen, FileText, History } from 'lucide-react';
import TabContainer from '../../../components/layout/TabContainer';
import { EntityBody, EntityHistory } from '../components/EntityBody';
import { TableOfContents } from '../../table-of-contents/TableOfContents';
import { extractHeaders } from '../../../utils/text/markdownHelpers';
import { ThreeColumnLayout } from '../../../components/layout/SplitView';

/**
 * Session-specific tabbed layout
 * @param {Object} viewModel - Entity view model
 */
export default function SessionLayout({ viewModel }) {
	if (!viewModel) return null;

	// Extract ToC items from narrative
	const tocItems = useMemo(() => {
		if (viewModel.content.narrative) {
			return extractHeaders(viewModel.content.narrative);
		}
		return [];
	}, [viewModel.content.narrative]);

	// Render narrative tab content
	const renderNarrative = () => (
		<ThreeColumnLayout
			left={null}
			center={
				<div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
					<EntityBody summary={viewModel.content.narrative} sections={[]} history={null} />
				</div>
			}
			right={
				tocItems.length > 0 ? (
					<TableOfContents
						items={tocItems}
						className='ml-4'
						// Custom breakpoint: 1650px needed to fit Sidebar + 3Col Grid without overflow
						visibilityClass='hidden min-[1650px]:block'
						mobileToggleClass='min-[1650px]:hidden'
					/>
				) : null
			}
		/>
	);

	// Render summary tab content
	const renderSummary = () => (
		<div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
			<EntityBody summary={viewModel.content.summary} sections={viewModel.content.sections} history={null} />
		</div>
	);

	// Render timeline tab content
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
						id: 'events',
						label: 'Timeline',
						icon: History,
						content: renderTimeline(),
					},
				]}
				defaultTab='narrative'
				sticky
			/>

			{/* Mobile ToC Drawer */}
			{tocItems.length > 0 && (
				<div className='xl:hidden'>
					<TableOfContents items={tocItems} />
				</div>
			)}
		</>
	);
}
