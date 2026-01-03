import React, { useState, useEffect, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useTransactions } from '../hooks/useTransactions';
import {
    IndianRupee, Zap, TrendingUp, Briefcase,
    ChevronDown, Flame, Sparkles, Wallet,
    MinusCircle, PlusCircle, Coins, ArrowRight,
    TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const QuestGigLog = ({ session }) => {
    const { profile, updateProfile } = useProfile(session?.user?.id);
    const { transactions, addTransaction } = useTransactions(session?.user?.id);

    const [amount, setAmount] = useState('');
    const [isLogging, setIsLogging] = useState(false);
    const [claimExpenses, setClaimExpenses] = useState(false);
    const [isError, setIsError] = useState(false);
    const [showBackwaters, setShowBackwaters] = useState(false);

    // Live Calculations (PS15 Standard)
    const calculations = useMemo(() => {
        const val = parseFloat(amount) || 0;
        const gstRate = 0.18;
        const gst = val * gstRate;
        // Real Net = Amount - GST (User's simplified model: 0.82)
        const net = val * 0.82;
        // If claiming 44AD, we show a different insight but transaction reflects real amount
        return { gst, net, total: val };
    }, [amount]);

    // Streak Calculation (Last 7 Days)
    const streak = useMemo(() => {
        if (!transactions) return 0;
        const today = new Date();
        const dates = transactions.map(t => new Date(t.date).toDateString());
        const uniqueDates = [...new Set(dates)];

        let currentStreak = 0;
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            if (uniqueDates.includes(checkDate.toDateString())) {
                currentStreak++;
            } else if (i > 0) break; // Streak broken
        }
        return currentStreak || 1; // At least 1 if logging now
    }, [transactions]);

    const triggerMoneyRain = (val) => {
        const end = Date.now() + 2000;
        const velocity = Math.min(15, (val / 1000) + 5);

        const coin = confetti.shapeFromPath({
            path: 'M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0',
            fill: true
        });

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#fbbf24', '#f59e0b', '#d97706'],
                shapes: [coin],
                scalar: 1,
                velocity: velocity
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#fbbf24', '#f59e0b', '#d97706'],
                shapes: [coin],
                scalar: 1,
                velocity: velocity
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const handleError = (msg) => {
        setIsError(true);
        toast.error(msg);
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
        setTimeout(() => setIsError(false), 500);
    };

    const handleLogGig = async () => {
        const val = parseFloat(amount);
        if (!amount || val <= 0) return handleError("Gig income > ₹0 for coins to rain!");

        setIsLogging(true);
        if ('vibrate' in navigator) navigator.vibrate(50);

        try {
            await addTransaction.mutateAsync({
                amount: val,
                type: 'income',
                gst_rate: 0.18,
                category: 'Gig Hunter'
            });

            triggerMoneyRain(val);
            setShowBackwaters(true);

            const baseXP = 25;
            const xpGain = baseXP * streak;

            updateProfile.mutate({
                xp: (profile?.xp || 0) + xpGain,
                compliance_score: Math.min(100, (profile?.compliance_score || 0) + 10),
                current_streak: streak,
                level: (profile?.xp + xpGain) >= 1000 && profile?.level < 3 ? 3 : profile?.level // Level Up Logic
            });

            toast.success(`Rainfall: +${xpGain}XP (${streak}x Streak!)`);
            setAmount('');
            setTimeout(() => setShowBackwaters(false), 3000);
        } catch (error) {
            toast.error("Realm connection lost. Try again!");
        } finally {
            setIsLogging(false);
        }
    };

    const presets = [
        { label: "Chaiwala (₹500)", value: 500, icon: "☕" },
        { label: "React Dev (₹25k)", value: 25000, icon: "💻" },
        { label: "Agritech (₹40k)", value: 40000, icon: "🌿" },
        { label: "Spice Trade (₹1L)", value: 100000, icon: "🌶️" }
    ];

    return (
        <div className={`min-h-screen p-6 space-y-8 pb-32 transition-all duration-1000 ${showBackwaters ? 'bg-cyan-900/40' : ''}`}>
            {/* Backwaters Flare */}
            {showBackwaters && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm animate-pulse">
                    <div className="text-cyan-400 opacity-20 scale-[5]">
                        <Zap size={200} />
                    </div>
                </div>
            )}

            <header className="text-center space-y-2 pt-10">
                <div className="flex flex-col items-center gap-2">
                    <div className="badge badge-gold bg-yellow-600/20 border-yellow-500/30 text-yellow-500 flex items-center gap-2">
                        <Flame size={14} className={streak >= 3 ? "animate-pulse" : ""} /> {streak}-Day Gig Streak
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white">GIG <span className="text-yellow-500">HUNTER</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Convert Gigs to Gold</p>
                </div>
            </header>

            {/* Preset Piles */}
            <div className="grid grid-cols-2 gap-3">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => setAmount(preset.value.toString())}
                        className="glass-card p-4 flex flex-col items-center text-center gap-2 border-white/5 active:scale-95 transition-all hover:border-yellow-500/30"
                    >
                        <span className="text-2xl">{preset.icon}</span>
                        <p className="text-[10px] font-black uppercase text-indigo-300">{preset.label}</p>
                    </button>
                ))}
            </div>

            <div className={`space-y-6 ${isError ? 'animate-shake' : ''}`}>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-yellow-500 transition-colors">
                        <IndianRupee size={24} />
                    </div>
                    <input
                        type="number"
                        placeholder="Gig Income Amount"
                        className="w-full input-field pl-14 text-2xl font-black placeholder:text-indigo-900/40"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                {/* Live Calc Cards (PS15 Exclusive) */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-4 bg-red-500/5 border-red-500/10">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[9px] font-black uppercase text-red-400">GST Dues (18%)</p>
                            <TrendingUp size={12} className="text-red-400" />
                        </div>
                        <p className="text-lg font-black text-white">₹{calculations.gst.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-4 bg-green-500/5 border-green-500/10">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[9px] font-black uppercase text-green-400">Net Profit</p>
                            <Coins size={12} className="text-green-400" />
                        </div>
                        <p className="text-lg font-black text-green-400">₹{calculations.net.toLocaleString()}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogGig}
                    disabled={isLogging}
                    className="w-full btn-primary h-20 text-xl font-black italic bg-gradient-to-r from-indigo-700 to-indigo-600 border-b-8 border-indigo-900 group"
                >
                    {isLogging ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
                    ) : (
                        <>
                            <Wallet size={28} className="group-hover:rotate-12 transition-transform" />
                            LOG GIG & RAIN GOLD
                        </>
                    )}
                </button>
            </div>

            <div className="p-4 glass-card bg-indigo-500/5 flex items-center gap-4">
                <Sparkles className="text-indigo-400" />
                <p className="text-[10px] font-bold text-indigo-200 uppercase">
                    Streak Multiplier: <span className="text-white">{streak}x XP Gain</span> (Last 7 days active)
                </p>
            </div>
        </div>
    );
};

export default QuestGigLog;
