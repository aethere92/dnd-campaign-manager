import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWikiEntry } from '../../../services/entities'; // Fixed import to use service
import WikiEntityView from '../WikiEntityView';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function WikiEntryPage() {
	// We need both entityId and type (e.g., 'session', 'character')
	const { type, entityId } = useParams();

	const normalizedType = type === 'sessions' ? 'session' : type;

	const {
		data: entity,
		isLoading,
		error,
	} = useQuery({
		// Include type in the query key so it refetches if type changes
		queryKey: ['entry', normalizedType, entityId],
		queryFn: () => getWikiEntry(entityId, normalizedType),
		enabled: !!entityId && !!normalizedType,
		retry: 1,
	});

	if (isLoading) {
		return <LoadingSpinner className='h-full min-h-[50vh]' text='Loading Entry...' />;
	}

	if (error) {
		return (
			<div className='h-full min-h-[50vh] flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-600 mb-2 font-bold'>Failed to load entry</p>
					<p className='text-sm text-gray-500 max-w-xs mx-auto'>{error.message}</p>
				</div>
			</div>
		);
	}

	return <WikiEntityView entity={entity} />;
}
