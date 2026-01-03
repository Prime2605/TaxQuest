import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';

const Auth = () => {
    const { signUp, signIn } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering) {
                const { success } = await signUp(email, password);
                if (success) {
                    // Sign up often requires email verification depending on Supabase settings
                    // But usually, it auto-signs in on dev or if configured
                    toast.success("Account created! Verifying session...");
                }
            } else {
                const { success } = await signIn(email, password);
                if (success) {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-800 via-indigo-950 to-indigo-950">
            <div className="mb-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/50 mb-4 rotate-12">
                    <Sparkles className="text-white w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                    Tax<span className="text-indigo-400">Quest</span>
                </h1>
                <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                    <ShieldCheck size={14} /> Secured for GSP Access
                </p>
            </div>

            <div className="w-full max-w-sm glass-card p-8 border-t-4 border-t-indigo-500">
                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2 ml-1">Email Base</label>
                        <input
                            type="email"
                            placeholder="trader@taxquest.com"
                            className="w-full input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2 ml-1">Secret Key</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 mt-4 group"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        ) : (
                            <>
                                {isRegistering ? <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> : <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />}
                                <span className="uppercase tracking-widest">{isRegistering ? "Register Trader" : "Enter Dashboard"}</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-indigo-300 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {isRegistering ? "Already have a quest? Sign In" : "New Trader? Initialize Quest"}
                    </button>
                </div>
            </div>

            <p className="mt-8 text-[10px] text-indigo-400/50 font-medium uppercase tracking-[0.2em]">
                ByteQuest PS15 Winner v1.0
            </p>
        </div>
    );
};

export default Auth;
