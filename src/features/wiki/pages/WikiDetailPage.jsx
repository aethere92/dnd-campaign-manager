import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWikiEntry } from '@/features/wiki/api/wikiService';
import { transformWikiEntry } from '@/features/wiki/utils/wikiEntryMapper'; // Import transform
import WikiEntityView from '@/features/wiki/components/WikiEntryView';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

export default function WikiEntryPage() {
	const { type, entityId } = useParams();
	const normalizedType = type === 'sessions' ? 'session' : type;

	const {
		data: entity,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['entry', normalizedType, entityId],
		queryFn: () => getWikiEntry(entityId, normalizedType),
		select: (res) => transformWikiEntry(res.data, res.type, res.additional),
		enabled: !!entityId && !!normalizedType,
		retry: 1,
	});

	if (isLoading) return <LoadingSpinner className='h-full min-h-[50vh]' text='Loading Entry...' />;
	if (error)
		return (
			<div className='p-8 text-center text-red-600'>
				<p>Failed to load entry</p>
			</div>
		);

	return <WikiEntityView entity={entity} />;
}
