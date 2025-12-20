import { BookOpen } from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState'; // Adjust path

export const SidebarEmptyState = ({ label }) => {
	// Remove 's' from end for singular usage if needed, or just use as is
	const singular = label.endsWith('s') ? label.slice(0, -1) : label;

	return (
		<EmptyState
			icon={BookOpen}
			title={`No ${label} Yet`}
			description={`Create your first ${singular.toLowerCase()} to get started.`}
			className='py-8'
		/>
	);
};
