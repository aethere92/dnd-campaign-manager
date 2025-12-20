import { useRef, useEffect } from 'react';
import { SearchTrigger } from './components/SearchTrigger';
import { SearchModal } from './components/SearchModal';
import { useGlobalSearchViewModel } from './useGlobalSearchViewModel';

export default function GlobalSearch() {
	const vm = useGlobalSearchViewModel();
	const inputRef = useRef(null);

	// Focus input when opened
	useEffect(() => {
		if (vm.isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [vm.isOpen]);

	return (
		<>
			<SearchTrigger onClick={() => vm.setIsOpen(true)} />
			{vm.isOpen && <SearchModal vm={vm} inputRef={inputRef} />}
		</>
	);
}
