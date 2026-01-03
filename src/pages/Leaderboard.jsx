import React, { useEffect } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useProfile } from '../hooks/useProfile';
import { Trophy, Medal, Star, ChevronUp, User } from 'lucide-react';

const Leaderboard = ({ session }) => {
    const { topTraders, isLoading, userRank } = useLeaderboard(session?.user?.id);
    const { profile: myProfile } = useProfile(session?.user?.id);

    if (isLoading) return <div className="p-8 text-center text-indigo-300">Summoning top traders...</div>;

    return (
        <div className="p-6 space-y-6">
            <header className="pt-4 text-center space-y-2">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-yellow-500/20">
                    <Trophy className="text-yellow-500 w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black">Hall of Fame</h1>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Global Ranking of Compliance</p>
            </header>

            {/* Podium Teaser or Top 3 */}
            <div className="flex justify-center items-end gap-2 px-4 py-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-400/20 border-2 border-slate-400 flex items-center justify-center">
                        <User className="text-slate-400" size={24} />
                    </div>
                    <div className="w-16 h-16 bg-slate-400/10 border border-slate-400/20 rounded-t-xl flex items-center justify-center">
                        <span className="font-black text-slate-400">2nd</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <Medal className="text-yellow-500 animate-bounce" size={24} />
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center scale-125 z-10">
                        <User className="text-yellow-500" size={32} />
                    </div>
                    <div className="w-20 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-t-xl flex items-center justify-center">
                        <span className="font-black text-yellow-500 text-xl">1st</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-amber-700/20 border-2 border-amber-700 flex items-center justify-center">
                        <User className="text-amber-700" size={24} />
                    </div>
                    <div className="w-16 h-12 bg-amber-700/10 border border-amber-700/20 rounded-t-xl flex items-center justify-center">
                        <span className="font-black text-amber-700">3rd</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {topTraders?.map((trader, index) => (
                    <div
                        key={trader.user_id}
                        className={`
              glass-card p-4 flex items-center justify-between border-l-4 
              ${trader.user_id === session?.user?.id ? 'bg-indigo-500/20 border-l-indigo-400 ring-1 ring-indigo-400/50' : 'border-l-transparent'}
            `}
                    >
                        <div className="flex items-center gap-4">
                            <span className="w-6 text-center font-black text-indigo-300 text-lg">{index + 1}</span>
                            <div>
                                <h3 className="font-bold flex items-center gap-2">
                                    {trader.gstin ? trader.gstin.slice(0, 5) + "..." : "Anonymous Trader"}
                                    {trader.user_id === session?.user?.id && <span className="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-black">YOU</span>}
                                </h3>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Level {trader.level || 1} • {trader.compliance_score || 0}% Score</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-yellow-500 font-black">
                                <Star size={14} fill="currentColor" />
                                <span>{(trader.xp || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Sticky User Rank */}
            {myProfile && (
                <div className="fixed bottom-24 left-6 right-6 glass-card p-4 bg-indigo-600/90 border-indigo-400/50 shadow-2xl z-20">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <ChevronUp className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-tighter">Your Current Ranking</p>
                                <p className="text-lg font-black leading-none">Global #{userRank || '...'}</p>
                            </div>
                        </div>
                        <button className="text-xs font-black bg-white text-indigo-600 px-3 py-2 rounded-lg uppercase tracking-widest">
                            View Stats
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
