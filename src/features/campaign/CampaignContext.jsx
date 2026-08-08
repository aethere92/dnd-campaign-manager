import { createContext, useContext, useMemo } from 'react';
import { useCampaignPersistence } from '@/features/campaign/hooks/useCampaignPersistence';
import { useCampaignData } from '@/features/campaign/hooks/useCampaignData'; // Import the new hook

const CampaignContext = createContext(null);

export const CampaignProvider = ({ children }) => {
	// 1. Manage ID Persistence
	const { campaignId, setCampaignId } = useCampaignPersistence();

	// 2. Fetch Data based on ID
	const { campaignRow, campaignData, isLoading, isError, notFound } = useCampaignData(campaignId);

	// 3. Combine into a single context value
	const value = useMemo(
		() => ({
			campaignId,
			setCampaignId,
			campaignRow, // The DB metadata
			campaignData, // The Resolved JS Map Config
			isLoading,
			// The route guard needs these to tell apart: request in flight (isLoading),
			// request failed (isError), and request succeeded but matched nothing
			// (notFound) — each renders differently, and conflating them is what made
			// a bad id spin forever.
			isError,
			notFound,
		}),
		[campaignId, setCampaignId, campaignRow, campaignData, isLoading, isError, notFound]
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
