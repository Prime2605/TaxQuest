import React, { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useTransactions } from '../hooks/useTransactions';
import { useGstReturns } from '../hooks/useGstQuery';
import { useLeaderboard } from '../hooks/useLeaderboard';
import {
    Sword, Shield, Trophy, MessageSquare, Zap,
    Target, TrendingUp, ChevronRight, AlertCircle,
    CheckCircle2, Star, Sparkles, LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const Dashboard = ({ session }) => {
    const { profile, isLoading: loadingProfile, updateProfile } = useProfile(session?.user?.id);
    const { transactions } = useTransactions(session?.user?.id);
    const { data: returns } = useGstReturns(profile?.gstin);
    const { userRank } = useLeaderboard(session?.user?.id);

    const [lastLevel, setLastLevel] = useState(profile?.level || 1);

    // Level Up logic
    useEffect(() => {
        if (profile?.level > lastLevel) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a5b4fc', '#ffffff', '#fbbf24']
            });
            setLastLevel(profile.level);
        }
    }, [profile?.level, lastLevel]);

    if (loadingProfile) return <div className="p-8 text-center animate-pulse text-indigo-400">Loading your TaxQuest realm...</div>;

    const level = profile?.level || 1;
    const xp = profile?.xp || 0;
    const nextLevelXp = level * 1000;
    const xpPercentage = (xp % 1000 / 1000) * 100;
    const compliance = profile?.compliance_score || 0;

    // Quest Status Logic
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions?.filter(t => t.date === today) || [];

    const quests = [
        {
            id: 'verify',
            title: 'Verify GSTIN',
            desc: profile?.gstin ? 'Identity Confirmed' : 'Reveal your business self',
            icon: <Shield className={profile?.gstin ? 'text-green-400' : 'text-indigo-400'} />,
            status: profile?.gstin ? 'complete' : 'pending',
            link: '/quests/verify'
        },
        {
            id: 'gig',
            title: "Log Today's Gig",
            desc: todayTransactions.length > 0 ? `${todayTransactions.length} logged today` : 'Record your daily wins',
            icon: <Zap className={todayTransactions.length > 0 ? 'text-yellow-400' : 'text-indigo-400'} />,
            status: todayTransactions.length > 0 ? 'complete' : 'active',
            link: '/quests/gig-log'
        },
        {
            id: 'returns',
            title: 'Check GSTR Dues',
            desc: returns ? 'Scanning Registry...' : 'Ensuring clear path',
            icon: <AlertCircle className="text-indigo-400" />,
            status: 'active',
            link: '/quests/returns'
        },
        {
            id: 'einvoice',
            title: 'Generate E-Invoice',
            desc: level >= 2 ? 'Ready for signing' : 'Unlocks at Level 2',
            icon: <Target className={level >= 2 ? 'text-purple-400' : 'text-gray-500'} />,
            status: level >= 2 ? 'active' : 'locked',
            link: '/quests'
        }
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-32">
            {/* Hero Header */}
            <header className="space-y-4 pt-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="badge badge-gold animate-bounce">Level {level}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Newbie No More</span>
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter">TRADER <span className="text-indigo-400">COMMAND</span></h1>
                    </div>
                    <div className="text-right">
                        <span className="text-indigo-300 text-[10px] font-black uppercase block mb-1">Total Power (XP)</span>
                        <span className="text-2xl font-black text-white flex items-center justify-end gap-2">
                            <Star size={20} className="fill-yellow-500 text-yellow-500" />
                            {xp.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div className="glass-card p-4 bg-indigo-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <TrendingUp size={48} />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-indigo-300 uppercase mb-2">
                        <span>Progress to Level {level + 1}</span>
                        <span>{Math.floor(xpPercentage)}%</span>
                    </div>
                    <div className="h-4 w-full bg-black/40 rounded-full p-1 border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            style={{ width: `${xpPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </header>

            {/* Stats Ring & Leaderboard Teaser */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 flex flex-col items-center justify-center text-center space-y-3 bg-indigo-900/20">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle
                                cx="48"
                                cy="48"
                                r="42"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={263.8}
                                strokeDashoffset={263.8 - (263.8 * compliance) / 100}
                                strokeLinecap="round"
                                className={`${compliance >= 80 ? 'text-green-500' : 'text-indigo-500'} transition-all duration-1000`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black leading-none">{compliance}%</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Compliance Armor</span>
                </div>

                <Link to="/leaderboard" className="glass-card p-5 flex flex-col justify-between bg-indigo-900/20 border-r-4 border-r-indigo-500 hover:bg-indigo-900/40 transition-all">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Trophy size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Arena</span>
                    </div>
                    <div>
                        <span className="text-2xl font-black">#{userRank || '--'}</span>
                        <p className="text-[10px] text-indigo-300/60 font-bold uppercase mt-1">In Kozhikode • +12 today</p>
                    </div>
                    <ChevronRight size={16} className="self-end text-indigo-400" />
                </Link>
            </div>

            {/* Quest Grid */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-black flex items-center gap-2 uppercase italic tracking-tight">
                        <Sword size={24} className="text-indigo-400" />
                        Active Quests
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quests.map((quest) => (
                        <Link
                            key={quest.id}
                            to={quest.link}
                            className={`
                glass-card p-4 flex flex-col items-center text-center space-y-3 transition-all
                ${quest.status === 'complete' ? 'border-green-500/30 bg-green-500/5' : ''}
                ${quest.status === 'locked' ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105'}
              `}
                        >
                            <div className={`p-3 rounded-2xl ${quest.status === 'complete' ? 'bg-green-500/20' : 'bg-indigo-500/10'}`}>
                                {quest.status === 'complete' ? <CheckCircle2 className="text-green-500" /> : quest.icon}
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-tight leading-tight">{quest.title}</h3>
                                <p className="text-[9px] text-indigo-300/60 font-bold uppercase mt-1 leading-tight">{quest.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-3 pt-4">
                <Link to="/guru" className="btn-primary py-4 bg-indigo-600 shadow-indigo-900/50">
                    <MessageSquare size={18} />
                    ASK GURU
                </Link>
                <button onClick={() => toast("Growth Hub coming soon!")} className="btn-secondary py-4 uppercase tracking-widest text-xs font-black">
                    GROWTH HUB
                </button>
            </section>
        </div>
    );
};

export default Dashboard;
