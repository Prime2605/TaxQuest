import { useQuery } from '@tanstack/react-query';
import { getReturnsStatus } from '../utils/gstApi';

export const useGstReturns = (gstin) => {
    return useQuery({
        queryKey: ['gstReturns', gstin],
        queryFn: () => getReturnsStatus(gstin),
        enabled: !!gstin && gstin.length === 15,
        staleTime: 5 * 60 * 1000, // Cache 5 min
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 min
        retry: 1,
    });
};
