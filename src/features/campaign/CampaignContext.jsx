import { createContext, useContext, useMemo } from 'react';
import { useCampaignPersistence } from './useCampaignPersistence';
import { useCampaignData } from './useCampaignData'; // Import the new hook

const CampaignContext = createContext(null);

export const CampaignProvider = ({ children }) => {
	// 1. Manage ID Persistence
	const { campaignId, setCampaignId } = useCampaignPersistence();

	// 2. Fetch Data based on ID
	const { campaignRow, campaignData, isLoading } = useCampaignData(campaignId);

	// 3. Combine into a single context value
	const value = useMemo(
		() => ({
			campaignId,
			setCampaignId,
			campaignRow, // The DB metadata
			campaignData, // The Resolved JS Map Config
			isLoading,
		}),
		[campaignId, setCampaignId, campaignRow, campaignData, isLoading]
	);

	return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
};

export const useCampaign = () => {
	const context = useContext(CampaignContext);
	if (!context) {
		throw new Error('useCampaign must be used within CampaignProvider');
	}
	return context;
};
