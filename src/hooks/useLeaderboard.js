import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useLeaderboard = (currentAuthUserId) => {
    const queryClient = useQueryClient();

    const leaderboardQuery = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            // Query the view provided in the schema
            const { data, error } = await supabase
                .from('leaderboards')
                .select(`
          user_id,
          score,
          rank
        `)
                .limit(10);

            if (error) throw error;

            // We need gstin and level for display, 
            // so we might need a join or additional fetch if the view doesn't have it.
            // Since the user didn't include gstin in the view, let's fetch profiles for these IDs.
            const userIds = data.map(d => d.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, gstin, level, compliance_score, trade_name')
                .in('user_id', userIds);

            return data.map(d => {
                const p = profiles?.find(prof => prof.user_id === d.user_id);
                return {
                    ...d,
                    xp: d.score,
                    gstin: p?.gstin,
                    level: p?.level,
                    compliance_score: p?.compliance_score,
                    trade_name: p?.trade_name
                };
            });
        },
    });

    const userRankQuery = useQuery({
        queryKey: ['userRank', currentAuthUserId],
        queryFn: async () => {
            if (!currentAuthUserId) return null;

            const { data, error } = await supabase
                .from('leaderboards')
                .select('rank')
                .eq('user_id', currentAuthUserId)
                .single();

            if (error) return null;
            return data.rank;
        },
        enabled: !!currentAuthUserId,
    });

    useEffect(() => {
        const channel = supabase
            .channel('leaderboard-live')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
                    queryClient.invalidateQueries({ queryKey: ['userRank'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return {
        topTraders: leaderboardQuery.data || [],
        isLoading: leaderboardQuery.isLoading,
        userRank: userRankQuery.data
    };
};
