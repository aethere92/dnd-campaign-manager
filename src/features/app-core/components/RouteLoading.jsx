import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export const RouteLoading = ({ text }) => (
	<div className='flex items-center justify-center h-full min-h-screen bg-muted'>
		<LoadingSpinner size='lg' text={text} />
	</div>
);
