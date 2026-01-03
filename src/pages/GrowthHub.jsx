import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { SchemeMatcher, ComplianceBadge, LinkedInShareButton } from '../components/TaxGuru';
import { BarChart3, Rocket, HeartPulse, TrendingUp, Drum, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

const GrowthHub = ({ session }) => {
    const { profile } = useProfile(session?.user?.id);
    const [badgeUrl, setBadgeUrl] = React.useState(null);

    const triggerDrum = () => {
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_f2f40d5d08.mp3?filename=drumroll-44500.mp3');
        audio.play().catch(() => {});
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto pb-24">
            <header className="glass-card p-5 border border-emerald-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p className="text-[10px] uppercase text-emerald-200 font-black tracking-widest">Growth Oracle</p>
                    <h1 className="text-3xl font-black text-yellow-100">Growth Hub & Compliance Command</h1>
                    <p className="text-sm text-emerald-100">Live predictions, scheme unlocks, and shareable badges.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-yellow-500 grid place-items-center">
                        <BarChart3 />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-emerald-200 uppercase font-black">Compliance</p>
                        <p className="text-xl font-black text-yellow-100">{profile?.compliance_score || 85}%</p>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-3">
                <div className="glass-card p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-xs text-emerald-200 font-black uppercase tracking-widest">
                        <HeartPulse size={14} /> Deadlines
                    </div>
                    <h3 className="text-lg font-black text-yellow-100 mt-2">GSTR-3B by 20 Jan</h3>
                    <p className="text-xs text-emerald-100">Avoid ₹50/day late fee. Auto-remind in Guru.</p>
                </div>
                <div className="glass-card p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-xs text-yellow-100 font-black uppercase tracking-widest">
                        <Rocket size={14} /> Funding
                    </div>
                    <h3 className="text-lg font-black text-white mt-2">Mudra Loan ₹10L</h3>
                    <p className="text-xs text-yellow-100">85% compliance → good to apply. Pre-fill docs.</p>
                </div>
                <div className="glass-card p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-xs text-emerald-200 font-black uppercase tracking-widest">
                        <TrendingUp size={14} /> Unlock
                    </div>
                    <h3 className="text-lg font-black text-yellow-100 mt-2">Level {profile?.level || 1}</h3>
                    <p className="text-xs text-emerald-100">Hit Level 4 (E-Invoice) → Guru + Growth unlocked.</p>
                </div>
            </div>

            <SchemeMatcher turnover={profile?.turnover || 250000} />

            <div className="glass-card p-4 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase text-yellow-100 font-black">
                    <FileText size={14} /> Compliance Badge & Share
                </div>
                <ComplianceBadge profile={profile} onBadgeReady={(url) => { setBadgeUrl(url); triggerDrum(); }} />
                <LinkedInShareButton badgeUrl={badgeUrl} />
                <button onClick={triggerDrum} className="btn-secondary text-xs flex items-center gap-2 w-full justify-center">
                    <Drum size={14} /> Kerala drum victory sound
                </button>
            </div>
        </div>
    );
};

export default GrowthHub;
