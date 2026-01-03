import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useGstReturns } from '../hooks/useGstQuery';
import {
    ShieldCheck, AlertTriangle, Skull,
    Wind, Moon, Timer, Ghost, Sparkles,
    ChevronRight, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const QuestReturns = ({ session }) => {
    const { profile } = useProfile(session?.user?.id);
    const { data: returns, isLoading, isError } = useGstReturns(profile?.gstin);

    const [dragonMood, setDragonMood] = useState('sleeping'); // sleeping, waking, aggressive

    useEffect(() => {
        if (returns) {
            const hasDues = returns.some(r => r.status === 'Not Filed');
            setDragonMood(hasDues ? 'aggressive' : 'sleeping');
        }
    }, [returns]);

    if (isLoading) return <div className="p-8 text-center text-indigo-400 animate-pulse">Scanning the Registry...</div>;

    return (
        <div className="p-6 space-y-8 pb-32 max-w-lg mx-auto">
            <header className="relative text-center space-y-2 pt-10">
                <div className="flex flex-col items-center gap-2">
                    <div className="badge badge-gold bg-indigo-900 border-indigo-400 flex items-center gap-2">
                        <Moon size={14} className="text-indigo-400" /> Compliance Night Watch
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">DUES <span className="text-indigo-400">DRAGON</span></h1>
                </div>
            </header>

            {/* Dragon Status Display */}
            <div className={`
        glass-card p-8 border-2 transition-all duration-1000 relative overflow-hidden
        ${dragonMood === 'sleeping' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}
      `}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Ghost size={120} className={dragonMood === 'sleeping' ? '' : 'animate-bounce'} />
                </div>

                <div className="text-center space-y-4">
                    <div className={`
            w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-transform duration-1000
            ${dragonMood === 'sleeping' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500 scale-110 animate-pulse'}
          `}>
                        {dragonMood === 'sleeping' ? <ShieldCheck size={48} /> : <AlertTriangle size={48} />}
                    </div>

                    <div>
                        <h2 className="text-2xl font-black uppercase italic">
                            {dragonMood === 'sleeping' ? "Dragon is Sleeping" : "The Dragon Awakens!"}
                        </h2>
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1">
                            {dragonMood === 'sleeping' ? "All GSTR3B filings are up to date" : "Overdue filings detected in your realm"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Live Returns List */}
            <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 ml-1">Filing History</h3>

                <div className="space-y-3">
                    {returns?.slice(0, 3).map((period, idx) => (
                        <div key={idx} className="glass-card p-4 flex justify-between items-center border-white/5 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${period.status === 'Filed' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_10px_currentColor]`}></div>
                                <div>
                                    <p className="font-black text-sm uppercase">{period.ret_prd || 'Period Unknown'}</p>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">GSTR3B • {period.rtntype}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${period.status === 'Filed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {period.status}
                                </span>
                                <p className="text-[8px] text-indigo-300 mt-1 uppercase font-bold">{period.dof || 'No Date'}</p>
                            </div>
                        </div>
                    ))}

                    {!returns?.length && (
                        <div className="text-center p-8 glass-card border-dashed border-white/10 opacity-50">
                            <p className="text-xs font-bold uppercase text-indigo-300">No filing history found on GSTN</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Action Zone */}
            <div className="space-y-4 pt-4">
                {dragonMood === 'aggressive' ? (
                    <button
                        onClick={() => toast("Redirecting to Filing Portal...")}
                        className="w-full btn-primary h-20 bg-red-600 shadow-red-900/50 border-b-8 border-red-900"
                    >
                        <Sword size={24} />
                        BANISH OVERDUE DUES
                    </button>
                ) : (
                    <div className="glass-card p-6 bg-indigo-500/5 flex flex-col items-center text-center gap-3">
                        <Sparkles className="text-yellow-400" />
                        <p className="text-sm font-bold text-indigo-100 uppercase italic">Your compliance armor is impenetrable!</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">+10% Passive XP Multiplier Active</p>
                    </div>
                )}
            </div>

            <div className="p-4 glass-card bg-indigo-950 border-white/5 flex items-center gap-4">
                <Timer className="text-indigo-400" />
                <p className="text-[10px] font-bold text-indigo-300 uppercase">
                    Live Sync: Every 10 minutes from <span className="text-white">Quicko GSP API</span>
                </p>
            </div>
        </div>
    );
};

export default QuestReturns;
