import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password) => {
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            toast.success("Account created! Check your email.");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success("Welcome back!");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error };
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("Logged out.");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return { session, loading, signUp, signIn, logout, user: session?.user };
};
