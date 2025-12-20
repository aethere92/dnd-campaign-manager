import { createContext, useContext } from 'react';
import { useTooltipState } from './useTooltipState';
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
	if (!context) {
		throw new Error('useTooltip must be used within a TooltipProvider');
	}
	return context;
};
