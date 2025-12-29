import { useRef, useEffect } from 'react';
import { SearchModal } from './components/SearchModal';
import { useGlobalSearchViewModel } from './useGlobalSearchViewModel';

export default function GlobalSearch() {
	const vm = useGlobalSearchViewModel();
	const inputRef = useRef(null);

	// Focus input when opened
	useEffect(() => {
		if (vm.isOpen && inputRef.current) {
			// Small timeout to ensure DOM is ready on mobile transitions
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [vm.isOpen]);

	// If not open, don't render anything (Modal handles Portal)
	if (!vm.isOpen) return null;

	return <SearchModal vm={vm} inputRef={inputRef} />;
}
