import { Drawer } from '@/shared/components/ui/Drawer';
import { TocItem } from './TocItem';

export const TocMobileDrawer = ({ isOpen, items, activeId, onClose, onScrollTo }) => {
	return (
		<Drawer isOpen={isOpen} onClose={onClose} title='Table of Contents' position='right'>
			<div className='py-4 flex flex-col space-y-0.5'>
				{items.map((item) => (
					<TocItem key={item.id} item={item} isActive={activeId === item.id} onClick={onScrollTo} />
				))}
			</div>
		</Drawer>
	);
};
