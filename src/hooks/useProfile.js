import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export const useProfile = (authUserId) => {
    const queryClient = useQueryClient();

    const profileQuery = useQuery({
        queryKey: ['profile', authUserId],
        queryFn: async () => {
            if (!authUserId) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', authUserId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data || null;
        },
        enabled: !!authUserId,
    });

    const updateProfile = useMutation({
        mutationFn: async (updates) => {
            if (!authUserId) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: authUserId,
                    ...updates
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            if (variables.xp) {
                toast.success(`Level Up! 🎉 +${variables.xp - (profileQuery.data?.xp || 0)}XP`, {
                    icon: '🚀',
                    duration: 3000
                });
            }
            queryClient.invalidateQueries({ queryKey: ['profile', authUserId] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });

    return {
        profile: profileQuery.data,
        gstin_verified: !!profileQuery.data?.gstin,
        isLoading: profileQuery.isLoading,
        updateProfile
    };
};
