import { createContext, useContext } from 'react';
import { useCampaignPersistence } from './useCampaignPersistence';

const CampaignContext = createContext(null);

export const CampaignProvider = ({ children }) => {
	const persistence = useCampaignPersistence();

	return <CampaignContext.Provider value={persistence}>{children}</CampaignContext.Provider>;
};

export const useCampaign = () => {
	const context = useContext(CampaignContext);
	if (!context) {
		throw new Error('useCampaign must be used within CampaignProvider');
	}
	return context;
};
