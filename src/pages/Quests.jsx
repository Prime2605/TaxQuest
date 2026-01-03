import React, { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useTransactions } from '../hooks/useTransactions';
import { verifyGSTIN, generateEInvoice } from '../utils/gstApi';
import { useGstReturns } from '../hooks/useGstQuery';
import {
    CheckCircle2, ShieldAlert, BadgeCheck, FileText,
    QrCode, Sparkles, Send, AlertCircle, Ghost
} from 'lucide-react';
import { generateMudraReport } from '../lib/pdf';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Quests = ({ session }) => {
    const { profile } = useProfile(session?.user?.id);
    const { data: returns } = useGstReturns(profile?.gstin);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isEinvoicing, setIsEinvoicing] = useState(false);
    const [einvoiceData, setEinvoiceData] = useState(null);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            await generateMudraReport(profile);
            toast.success("Mudra Report Downloaded!");
        } catch (error) {
            toast.error("Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateEInvoice = async () => {
        if (!profile?.gstin) return toast.error("Verify GSTIN first!");
        setIsEinvoicing(true);
        try {
            const result = await generateEInvoice({
                clientGstin: "33GSPTN1882G1Z3",
                amount: 15000
            });
            setEinvoiceData(result);
            toast.success("E-Invoice Generated!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsEinvoicing(false);
        }
    };

    return (
        <div className="p-6 space-y-6 pb-32 max-w-lg mx-auto">
            <h1 className="text-3xl font-black mb-8 pt-4">Quest Log</h1>

            {/* Quest 1: Verify GSTIN */}
            <Link to="/quests/verify" className="block outline-none">
                <section className={`glass-card p-6 border-l-4 ${profile?.gstin ? 'border-l-green-500 bg-green-500/5' : 'border-l-indigo-500'} hover:scale-102 transition-transform`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Quest 1</span>
                            <h2 className="text-xl font-bold">GSTIN Identity</h2>
                        </div>
                        <div className={`p-2 rounded-xl ${profile?.gstin ? 'bg-green-500/10 text-green-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <ShieldAlert size={24} />
                        </div>
                    </div>
                    {profile?.gstin ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                <BadgeCheck size={18} /> Verified: {profile.gstin}
                            </div>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase">+500 XP Earned</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-indigo-200 font-medium">Link your GSTIN to unlock premium trader stats.</p>
                            <div className="flex gap-2">
                                <div className="flex-1 input-field py-3 text-sm opacity-50">Pending Verification...</div>
                                <button className="btn-primary py-0 px-4 text-xs font-black uppercase">Start</button>
                            </div>
                        </div>
                    )}
                </section>
            </Link>

            {/* Quest 2: Log Sales */}
            <Link to="/quests/gig-log" className="block outline-none">
                <section className="glass-card p-6 border-l-4 border-l-indigo-500 hover:scale-102 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Quest 2</span>
                            <h2 className="text-xl font-bold">Market Day Log</h2>
                        </div>
                        <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                            <Send size={24} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-indigo-200 font-medium">Log your daily sales to boost your Compliance Score.</p>
                        <div className="flex gap-2">
                            <div className="flex-1 input-field py-3 text-sm opacity-50">Log Today's Gig...</div>
                            <button className="btn-primary py-0 px-4 text-xs font-black uppercase">Enter</button>
                        </div>
                    </div>
                </section>
            </Link>

            {/* Quest 3: Dues Dragon */}
            <Link to="/quests/returns" className="block outline-none">
                <section className="glass-card p-6 border-l-4 border-l-red-500 bg-red-500/5 hover:scale-102 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Quest 3</span>
                            <h2 className="text-xl font-bold">Dues Dragon</h2>
                        </div>
                        <div className="bg-red-500/10 p-2 rounded-xl text-red-400">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-indigo-200 font-medium">Scan your portal for overdue dragons.</p>
                        <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase">
                            <Ghost size={14} className="animate-bounce" /> Check Live Status
                        </div>
                    </div>
                </section>
            </Link>

            {/* Quest 4: E-Invoice */}
            <section className={`glass-card p-6 border-l-4 ${profile?.level >= 2 ? 'border-l-indigo-400' : 'border-l-gray-600 opacity-80'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Quest 4</span>
                        <h2 className="text-xl font-bold">Digital Signature</h2>
                    </div>
                    <div className="bg-indigo-500/5 p-2 rounded-xl">
                        <QrCode size={24} className="text-indigo-400" />
                    </div>
                </div>
                {einvoiceData ? (
                    <div className="space-y-4 text-center">
                        <div className="bg-white p-2 rounded-xl inline-block mx-auto">
                            <img src={einvoiceData.qr} alt="E-Invoice QR" className="w-32 h-32" />
                        </div>
                        <a href={einvoiceData.pdf} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 underline block">View Signed PDF</a>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-indigo-200 font-medium font-bold">Simulate E-invoice for your clients.</p>
                        <button
                            onClick={handleGenerateEInvoice}
                            disabled={isEinvoicing || profile?.level < 2}
                            className="w-full btn-secondary text-xs disabled:opacity-50"
                        >
                            {isEinvoicing ? "Signing..." : (profile?.level < 2 ? "Unlocked at Level 2" : "Generate E-Invoice")}
                        </button>
                    </div>
                )}
            </section>

            {/* Final Quest: Report */}
            <section className="glass-card p-6 border-l-4 border-l-purple-500 bg-purple-500/5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Final Quest</span>
                        <h2 className="text-xl font-bold">Growth Report</h2>
                    </div>
                    <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                        <FileText size={24} />
                    </div>
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full btn-primary bg-purple-600 hover:bg-purple-500 shadow-purple-900/50"
                >
                    {isGenerating ? "Preparing..." : "Export Mudra-Ready PDF"}
                </button>
            </section>
        </div>
    );
};

export default Quests;
