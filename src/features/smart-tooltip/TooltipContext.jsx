import { createContext, useContext } from 'react';
import { useTooltipState } from '@/features/smart-tooltip/hooks/useTooltipState';
import { TooltipContainer } from './TooltipContainer';

const TooltipContext = createContext(null);

export const TooltipProvider = ({ children }) => {
	const { activeTooltip, openTooltip, closeTooltip, cancelClose } = useTooltipState();

	return (
		<TooltipContext.Provider value={{ openTooltip, closeTooltip, cancelClose }}>
			{children}

			{/* Pass interaction handlers to the Overlay Layer */}
			<TooltipContainer target={activeTooltip} onMouseEnter={cancelClose} onMouseLeave={closeTooltip} />
		</TooltipContext.Provider>
	);
};

export const useTooltip = () => {
	const context = useContext(TooltipContext);

	// Degrade gracefully rather than throwing: entity links render in contexts
	// (e.g. tooltip previews) that intentionally sit outside the provider.
	if (!context) {
		// Return dummy functions so components don't break
		return {
			openTooltip: () => {},
			closeTooltip: () => {},
			cancelClose: () => {},
		};
	}
	return context;
};
