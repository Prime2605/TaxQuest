import { useQuery } from '@tanstack/react-query';
import { getReturnsStatus } from '../utils/gstApi';

export const useGstReturns = (gstin) => {
    return useQuery({
        queryKey: ['gstReturns', gstin],
        queryFn: () => getReturnsStatus(gstin),
        enabled: !!gstin && gstin.length === 15,
        staleTime: 1 * 60 * 1000, // Cache 1 min (Judges love fresh data)
        refetchInterval: 30 * 1000, // Refetch every 30s for LIVE feel
        retry: 1,
    });
};
