import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useTransactions = (authUserId) => {
    const queryClient = useQueryClient();

    const transactionsQuery = useQuery({
        queryKey: ['transactions', authUserId],
        queryFn: async () => {
            if (!authUserId) return [];

            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', authUserId)
                .single();

            if (!profile) return [];

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', profile.id)
                .order('date', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!authUserId,
    });

    const generateTodayCount = () => {
        const today = new Date().toISOString().split('T')[0];
        return transactionsQuery.data?.filter(t => t.date === today).length || 0;
    };

    const addTransaction = useMutation({
        mutationFn: async (transaction) => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', authUserId)
                .single();

            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    ...transaction,
                    user_id: profile.id,
                    type: transaction.type === 'sale' ? 'income' : transaction.type
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions', authUserId] });
        },
    });

    return {
        transactions: transactionsQuery.data || [],
        todayCount: generateTodayCount(),
        isLoading: transactionsQuery.isLoading,
        addTransaction
    };
};
