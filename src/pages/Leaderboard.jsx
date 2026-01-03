import React, { useState, useEffect, useMemo } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useProfile } from '../hooks/useProfile';
import { Trophy, Medal, Star, ChevronUp, User, Zap, Flame, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

const Leaderboard = ({ session }) => {
    const { topTraders, isLoading, userRank } = useLeaderboard(session?.user?.id);
    const { profile: myProfile } = useProfile(session?.user?.id);

    const [prevRank, setPrevRank] = useState(null);
    const [showRankJump, setShowRankJump] = useState(false);

    // Dummy Competitors as requested for the ByteQuest demo vibe
    const dummyCompetitors = [
        { id: 'd1', gstin: '32ABCDE1234F1Z5', trade_name: 'Kozhi Freela', level: 3, xp: 250, compliance_score: 88 },
        { id: 'd2', gstin: '32FGHIJ5678K1Z5', trade_name: 'ChaiBoss', level: 4, xp: 420, compliance_score: 92 },
        { id: 'd3', gstin: '32KLMNO9012P1Z5', trade_name: 'AgriAI', level: 2, xp: 180, compliance_score: 85 },
        { id: 'd4', gstin: '32WXYZ7890A1Z5', trade_name: 'MalabarMerchant', level: 1, xp: 75, compliance_score: 70 }
    ];

    // Merge real data with dummy racers for a crowded feel
    const allRacers = useMemo(() => {
        if (!topTraders) return dummyCompetitors;
        const merged = [...topTraders, ...dummyCompetitors];
        return merged.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }, [topTraders]);

    // Track rank jumps for the "GASPS" effect
    useEffect(() => {
        if (userRank && prevRank && userRank < prevRank) {
            setShowRankJump(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#f59e0b', '#10b981']
            });
            setTimeout(() => setShowRankJump(false), 3000);
        }
        if (userRank) setPrevRank(userRank);
    }, [userRank]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-indigo-400 font-black animate-pulse uppercase tracking-widest">Racing to the Registry...</div>;

    return (
        <div className={`p-6 space-y-6 pb-32 transition-all duration-500 ${showRankJump ? 'bg-indigo-900/40 animate-shake' : ''}`}>
            <header className="pt-4 text-center space-y-2">
                <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(234,179,8,0.4)] rotate-3">
                        <Trophy className="text-white w-12 h-12" />
                    </div>
                    <Flame className="absolute -top-2 -right-2 text-orange-500 animate-bounce" size={24} />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">ARENA <span className="text-indigo-400">RANKING</span></h1>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">The Merchant Hall of Fame</p>
            </header>

            {/* Rank Jump Announcement */}
            {showRankJump && (
                <div className="bg-yellow-500 text-black p-4 rounded-xl text-center animate-bounce shadow-2xl z-50 relative">
                    <p className="font-black italic uppercase text-lg">RANK ADVANCED! 🚀</p>
                    <p className="text-[10px] font-bold uppercase">You just jumped to #{userRank} in Kerala!</p>
                </div>
            )}

            {/* Racer Grid */}
            <div className="space-y-4">
                {allRacers.map((trader, index) => {
                    const isMe = trader.user_id === session?.user?.id;
                    const rank = index + 1;

                    return (
                        <div
                            key={trader.user_id || trader.id}
                            className={`
                                relative glass-card p-4 flex items-center justify-between border-l-8 transition-all duration-300
                                ${isMe ? 'bg-indigo-500/30 border-l-indigo-400 scale-102 ring-2 ring-indigo-400 shadow-indigo-500/20 shadow-xl z-10' : 'border-l-white/5 opacity-80'}
                                ${isMe && showRankJump ? 'rank-flash' : ''}
                                ${rank <= 3 ? 'py-6' : ''}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl
                                        ${rank === 1 ? 'bg-yellow-500 text-black animate-pulse' :
                                            rank === 2 ? 'bg-slate-400 text-black' :
                                                rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/5 text-indigo-300'}
                                    `}>
                                        {rank}
                                    </div>
                                    {rank === 1 && <Crown className="absolute -top-3 -right-3 text-yellow-500 rotate-12 trophy-spin" size={20} />}
                                </div>

                                <div className={isMe ? 'animate-bounce-slight' : ''}>
                                    <h3 className="font-black italic uppercase text-sm tracking-tight flex items-center gap-2">
                                        {trader.trade_name || trader.gstin?.slice(0, 10) || "Shadow Trader"}
                                        {isMe && <span className="bg-white text-indigo-600 px-1 rounded text-[8px] not-italic">YOU</span>}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex bg-indigo-500/20 px-1.5 py-0.5 rounded text-[8px] font-black text-indigo-300 uppercase italic">
                                            LVL {trader.level || 1}
                                        </div>
                                        <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
                                            {trader.compliance_score || 0}% Compliance
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-yellow-400 font-black text-lg italic">
                                    <Star size={16} fill="currentColor" />
                                    <span>{(trader.xp || 0).toLocaleString()}</span>
                                </div>
                                <p className="text-[8px] font-black text-indigo-500 uppercase italic tracking-tighter">Gold Earned</p>
                            </div>

                            {/* Velocity Indicator */}
                            {rank < 5 && (
                                <div className="absolute top-1 right-2 animate-pulse">
                                    <Zap size={10} className="text-yellow-500/50" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Sticky Profile Card */}
            {myProfile && (
                <div className="fixed bottom-24 left-6 right-6 glass-card p-4 bg-indigo-600/90 border-indigo-400/50 shadow-2xl z-20 flex justify-between items-center backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-400/30 flex items-center justify-center">
                            <User className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em] italic">Current Standing</p>
                            <p className="text-xl font-black italic text-white leading-none">GLOBAL #{userRank || '...'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-indigo-300 uppercase mb-1">XP MULTIPLIER</span>
                        <div className="bg-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                            <Zap size={10} className="text-yellow-400" />
                            <span className="text-xs font-black italic text-white">x2.5</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
