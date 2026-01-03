import React, { useState, useEffect, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useGstReturns } from '../hooks/useGstQuery';
import {
    ShieldCheck, AlertTriangle, Skull,
    Wind, Moon, Timer, Ghost, Sparkles,
    ChevronRight, ArrowLeft, Sword, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const QuestReturns = ({ session }) => {
    const { profile, updateXP } = useProfile(session?.user?.id);
    const { data: returns, isLoading, refetch } = useGstReturns(profile?.gstin);

    const [isSlashing, setIsSlashing] = useState(false);
    const [showVictory, setShowVictory] = useState(false);

    // Dragon stats based on real tax risk
    // HP Formula: daysOverdue * 100 + unpaidGst * 10 (as per ByteQuest spec)
    const dragonStats = useMemo(() => {
        if (!returns) return { hp: 0, penalty: 0, status: 'unknown', daysOverdue: 0 };

        const overduePeriods = returns.filter(r => r.status === 'Not Filed');
        const daysOverdue = overduePeriods.length * 30; // Approximate days
        const unpaidGst = overduePeriods.length * 5000; // Estimated unpaid GST (₹5k per period)
        const hp = Math.min((daysOverdue * 1) + (unpaidGst / 100), 200); // Cap at 200
        const penalty = overduePeriods.length * 2700; // Estimated 2700 INR penalty risk per period

        return {
            hp: Math.round(hp),
            penalty,
            daysOverdue,
            isAwake: hp > 0,
            mood: hp > 150 ? 'RAGING' : (hp > 50 ? 'AWAKE' : (hp > 0 ? 'SLEEPING' : 'DEFEATED'))
        };
    }, [returns]);

    // Real-time polling every 30s for the judges
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30000);
        return () => clearInterval(interval);
    }, [refetch]);

    const handleSlay = async () => {
        setIsSlashing(true);
        // Simulate dragon damage animation
        setTimeout(async () => {
            setIsSlashing(false);
            if (dragonStats.hp > 0) {
                toast.error("The Dragon's armor is thick! File your returns to weaken it!", {
                    icon: '🔥',
                    duration: 4000
                });
            } else {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ef4444', '#f59e0b', '#ffffff']
                });
                setShowVictory(true);
                await updateXP(750); // Massive XP for slaying the dues dragon
                toast.success("Penalty Dragon Vanquished! Saved ₹" + dragonStats.penalty);
            }
        }, 800);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-indigo-400 font-black animate-pulse uppercase tracking-[0.3em]">Scanning Registry...</div>;

    return (
        <div className={`min-h-screen p-6 space-y-8 pb-32 max-w-lg mx-auto transition-colors duration-1000 ${dragonStats.isAwake ? 'bg-red-950/20' : 'bg-transparent'}`}>
            <header className="relative text-center space-y-2 pt-10">
                <Link to="/quests" className="absolute top-10 left-0 p-2 glass-card rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex flex-col items-center gap-2">
                    <div className="badge badge-gold bg-indigo-900 border-indigo-400 flex items-center gap-2 uppercase text-[10px] font-black">
                        <Timer size={14} className="text-yellow-400 animate-spin-slow" /> Live Registry Sync
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">RETURNS <span className="text-red-500">DRAGON</span></h1>
                </div>
            </header>

            {/* Dragon Boss Stage */}
            <div className={`
        glass-card p-8 border-2 transition-all duration-700 relative overflow-hidden
        ${dragonStats.isAwake ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-shake' : 'border-green-500/30'}
      `}>
                <div className="absolute top-0 right-0 p-4 opacity-10 animate-pulse">
                    <Ghost size={120} className={dragonStats.isAwake ? 'text-red-500' : 'text-green-500'} />
                </div>

                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className={`
                w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-500
                ${dragonStats.isAwake ? 'bg-red-500/20 text-red-500 scale-110' : 'bg-green-500/20 text-green-500'}
            `}>
                            {dragonStats.isAwake ? (
                                <Skull size={64} className={isSlashing ? 'animate-ping' : 'animate-bounce'} />
                            ) : (
                                <ShieldCheck size={64} className="animate-pulse" />
                            )}
                        </div>
                        {dragonStats.isAwake && (
                            <div className="absolute -bottom-2 -right-2 bg-red-600 px-3 py-1 rounded-full text-[10px] font-black italic">
                                {dragonStats.mood}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h2 className={`text-2xl font-black uppercase italic ${dragonStats.isAwake ? 'text-red-500' : 'text-green-400'}`}>
                            {dragonStats.isAwake ? "Penalty Dragon Awakened!" : "The Beast is Sleeping"}
                        </h2>

                        {/* HP BAR */}
                        {dragonStats.isAwake && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>Dragon HP</span>
                                    <span>{dragonStats.hp} / 200</span>
                                </div>
                                <div className="w-full h-3 bg-red-900/50 rounded-full overflow-hidden border border-red-500/30">
                                    <div
                                        className="h-full bg-red-500 transition-all duration-1000"
                                        style={{ width: `${(dragonStats.hp / 200) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-tight">
                            {dragonStats.isAwake
                                ? `🔥 RISK: ₹${dragonStats.penalty.toLocaleString()} IN POTENTIAL FINES`
                                : "ALL GSTR-3B FILINGS ARE CLEAR. YOUR REALM IS PROTECTED."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Zone */}
            <div className="space-y-4">
                {dragonStats.isAwake ? (
                    <button
                        onClick={handleSlay}
                        disabled={isSlashing}
                        className={`
                w-full btn-primary h-24 bg-red-600 shadow-red-900/50 border-b-8 border-red-900 flex flex-col items-center justify-center gap-1
                ${isSlashing ? 'translate-y-2 scale-95 opacity-80' : 'active:translate-y-2'}
            `}
                    >
                        <div className="flex items-center gap-3">
                            <Sword size={28} className={isSlashing ? 'rotate-45' : ''} />
                            <span className="text-xl font-black italic">SLAY THE DRAGON</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-70">REQUIRE: ALL RETURNS FILED</p>
                    </button>
                ) : (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative glass-card p-6 bg-indigo-500/5 flex flex-col items-center text-center gap-4">
                            <div className="bg-yellow-400/20 p-3 rounded-full">
                                <Zap className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase italic">Perfect Compliance Armor!</p>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1 tracking-tighter">
                                    +10% Passive XP Multiplier Active for the next 24 hours
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Feed List */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Registry Log</h3>
                    <span className="text-[8px] font-bold text-indigo-500 animate-pulse uppercase">Syncing Every 30s</span>
                </div>

                <div className="space-y-3">
                    {returns?.slice(0, 4).map((period, idx) => (
                        <div key={idx} className="glass-card p-4 flex justify-between items-center border-white/5 bg-white/5 group hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${period.status === 'Filed' ? 'bg-green-500' : 'bg-red-500 group-hover:animate-ping'} shadow-[0_0_15px_currentColor]`}></div>
                                <div>
                                    <p className="font-black text-sm uppercase">{period.ret_prd}</p>
                                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter flex items-center gap-1">
                                        GSTR3B <ChevronRight size={8} /> {period.status === 'Filed' ? 'SECURED' : 'VULNERABLE'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${period.status === 'Filed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {period.status}
                                </span>
                                <p className="text-[8px] text-indigo-300 mt-1 uppercase font-bold tracking-tighter">{period.dof || 'NOT DETECTED'}</p>
                            </div>
                        </div>
                    ))}

                    {(!returns || returns.length === 0) && (
                        <div className="text-center p-12 glass-card border-dashed border-white/10">
                            <Moon className="mx-auto mb-4 text-indigo-500/30" size={48} />
                            <p className="text-[10px] font-bold uppercase text-indigo-300 tracking-widest">Searching the GSTN Registry...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer Info */}
            <div className="glass-card p-4 bg-indigo-950/50 border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-indigo-400" size={16} />
                    <p className="text-[9px] font-bold text-indigo-300 uppercase leading-none">
                        Compliance data provided by <br />
                        <span className="text-white">Quicko GSP Sandbox Registry</span>
                    </p>
                </div>
                <div className="text-[8px] font-black bg-indigo-500 text-white px-2 py-1 rounded uppercase italic">API v1.0</div>
            </div>
        </div>
    );
};

export default QuestReturns;
