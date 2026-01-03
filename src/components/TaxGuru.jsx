import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Send, Sparkles, Wand2, Award, ShieldCheck, Megaphone, Zap, Volume2, FileText, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useProfile } from '../hooks/useProfile';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const voiceLine = "ml-IN";

const schemesCatalog = [
    {
        id: 'pmegp',
        title: 'PMEGP 35% Subsidy',
        eligibility: 'Turnover < ₹1 Cr, manufacturing/services, UDYAM registered',
        link: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp'
    },
    {
        id: 'ksm',
        title: 'Kerala Startup Mission',
        eligibility: 'Tech/agri startup, DPIIT recognised',
        link: 'https://startupmission.kerala.gov.in/'
    },
    {
        id: 'mudra',
        title: 'Mudra Loan (Shishu/Kishor)',
        eligibility: 'Turnover < ₹10L; good compliance',
        link: 'https://www.mudra.org.in/'
    },
    {
        id: 'ews',
        title: 'EWS / Skill grants',
        eligibility: 'Turnover < ₹5L; self-employed youth',
        link: 'https://kerala.gov.in/en/ews/'
    }
];

const SchemeMatcher = ({ turnover = 250000 }) => {
    const matches = useMemo(() => {
        const out = [];
        if (turnover < 1000000) out.push('pmegp');
        if (turnover < 10000000) out.push('mudra');
        if (turnover < 500000) out.push('ews');
        out.push('ksm');
        return schemesCatalog.filter((s) => out.includes(s.id));
    }, [turnover]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-black uppercase tracking-widest">
                <Wand2 size={14} /> Smart Scheme Matcher
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                {matches.map((scheme, idx) => (
                    <div key={scheme.id} className="glass-card p-4 border border-yellow-500/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-emerald-500/5 animate-pulse" style={{ animationDelay: `${idx * 0.2}s` }} />
                        <div className="flex items-center justify-between">
                            <h4 className="font-black text-lg text-yellow-100">{scheme.title}</h4>
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 grid place-items-center text-yellow-200">
                                <Sparkles />
                            </div>
                        </div>
                        <p className="text-xs text-emerald-100 mt-2">{scheme.eligibility}</p>
                        <a
                            href={scheme.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-yellow-200 font-black mt-3 underline"
                        >
                            Apply now <LinkIcon size={14} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ComplianceBadge = ({ profile, onBadgeReady }) => {
    const [isBuilding, setIsBuilding] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const buildPdf = async () => {
        setIsBuilding(true);
        try {
            const doc = new jsPDF();
            const title = 'TaxQuest Compliance Badge';
            doc.setFillColor(9, 26, 17);
            doc.rect(0, 0, 210, 297, 'F');
            doc.setTextColor(216, 200, 153);
            doc.setFontSize(20);
            doc.text(title, 20, 30);
            doc.setFontSize(12);
            doc.text(`Holder: ${profile?.name || 'TaxQuest Hero'}`, 20, 50);
            doc.text(`GSTIN: ${profile?.gstin || '—'}`, 20, 60);
            doc.text(`Level: ${profile?.level || 1}`, 20, 70);
            doc.text(`Compliance Score: ${profile?.compliance_score || 85}%`, 20, 80);
            doc.text('Issued by: TaxQuest Growth Hub', 20, 95);
            doc.text('Kerala | Proud Trader Network', 20, 105);
            doc.setDrawColor(255, 215, 0);
            doc.circle(170, 60, 18, 'S');
            doc.text('OFFICIAL', 158, 60, { align: 'left' });
            const qrPayload = `TaxQuest Badge | GSTIN: ${profile?.gstin || 'NA'} | Level ${profile?.level || 1}`;
            const qrDataUrl = await QRCode.toDataURL(qrPayload);
            doc.addImage(qrDataUrl, 'PNG', 140, 110, 50, 50);
            const pdfData = doc.output('datauristring');
            setPreviewUrl(qrDataUrl);
            onBadgeReady?.(pdfData);
            const link = document.createElement('a');
            link.href = pdfData;
            link.download = 'TaxQuest_Compliance_Badge.pdf';
            link.click();
            toast.success('Badge ready! Share on LinkedIn');
        } catch (err) {
            toast.error('Badge generation failed');
        } finally {
            setIsBuilding(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase text-emerald-200 font-black">
                <Award size={14} /> Compliance Badge
            </div>
            <button onClick={buildPdf} className="btn-primary w-full text-sm flex items-center gap-2 justify-center">
                <FileText size={16} /> Generate PDF Badge
            </button>
            {previewUrl && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-emerald-400/20">
                    <img src={previewUrl} alt="QR" className="w-16 h-16" />
                    <p className="text-xs text-emerald-100">QR embeds GSTIN + Level — perfect for LinkedIn proof.</p>
                </div>
            )}
        </div>
    );
};

const LinkedInShareButton = ({ badgeUrl }) => {
    if (!badgeUrl) return null;
    const share = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgeUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    return (
        <button onClick={share} className="btn-secondary w-full text-sm flex items-center justify-center gap-2 mt-2">
            <LinkIcon size={14} /> Share Badge to LinkedIn
        </button>
    );
};

const TaxGuru = ({ session }) => {
    const { profile } = useProfile(session?.user?.id);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Arun chetta, ready to slice GST chaos? Ask me anything!" }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [badgeUrl, setBadgeUrl] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const speakMalayalam = (text) => {
        if (!('speechSynthesis' in window)) return;
        const utter = new SpeechSynthesisUtterance(text);
        const voice = window.speechSynthesis.getVoices().find((v) => v.lang === voiceLine) || null;
        if (voice) utter.voice = voice;
        utter.lang = voiceLine;
        utter.pitch = 1;
        utter.rate = 1;
        window.speechSynthesis.speak(utter);
    };

    const guruPrompt = (question) => {
        const turnover = profile?.turnover || 250000;
        const compliance = profile?.compliance_score || 85;
        const level = profile?.level || 1;
        return `Kerala freelancer, GSTIN verified ${profile?.gstin || 'NA'}, turnover ₹${(turnover / 100000).toFixed(1)}L, Level ${level}, compliance ${compliance}%. Recent gig ₹30k logged.
User asks: ${question}.
Give PERSONALIZED advice: filing deadlines, deductions (50% laptop/phone), penalty risks, scheme eligibility.
Talk like wise Kerala uncle in simple English + Malayalam phrases. Max 100 words. Urgent items **BOLD**.`;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);
        const prompt = guruPrompt(input);

        // Simulated AI (replace with real Claude/Vertex call using your secured key)
        setTimeout(() => {
            const response = `Arun chetta, **file GSTR-3B by 20th** to avoid ₹50/day late fee. Claim 50% laptop & phone as expense. Recent ₹30k gig → keep invoice & bank proof. Compliance ${profile?.compliance_score || 85}% means Mudra ₹10L is realistic; try PMEGP subsidy 35%. Kerala Startup Mission also fits. “Samayam thottu paykkuka”, stay on time!`;
            setMessages((prev) => [...prev, { role: 'bot', content: response }]);
            speakMalayalam(response);
            setIsThinking(false);
        }, 900);
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-4 border border-emerald-500/30 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-slate-900 to-black animate-pulse" />
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-yellow-500 grid place-items-center animate-bounce-slow shadow-lg shadow-emerald-800/60">
                    <Bot />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] uppercase text-emerald-200 font-black">Living Tax Guru Avatar</p>
                    <h2 className="text-xl font-black text-yellow-100">“Kerala Uncle” AI Guide</h2>
                    <p className="text-xs text-emerald-100">Analyzes your profile and speaks in Malayalam-English.</p>
                </div>
            </div>

            <div className="glass-card p-4 space-y-3 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs text-emerald-100 font-black uppercase tracking-widest">
                    <Sparkles size={14} /> Chat with Guru
                </div>
                <div className="h-72 overflow-y-auto space-y-3 pr-2">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl ${
                                    msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white/5 border border-emerald-500/20 rounded-bl-none text-emerald-50'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="glass-card p-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef}></div>
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Gig income ₹50k, what to file?"
                        className="flex-1 input-field bg-white/5 border border-emerald-500/30"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-gradient-to-br from-emerald-500 to-yellow-500 rounded-xl text-black font-black hover:scale-95 transition"
                    >
                        <Send size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => speakMalayalam('Arun chetta, filing Jan 20, keep invoices ready!')}
                        className="p-3 glass-card rounded-xl"
                        title="Play Malayalam voice"
                    >
                        <Volume2 size={18} />
                    </button>
                </form>
            </div>

            <div className="glass-card p-4 space-y-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-yellow-100 tracking-widest">
                    <ShieldCheck size={14} /> Growth Oracle Predictions
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-700 to-slate-900 rounded-xl border border-emerald-500/30">
                        <p className="text-xs text-emerald-100">Compliance</p>
                        <h3 className="text-xl font-black text-yellow-100">{profile?.compliance_score || 85}%</h3>
                        <p className="text-[11px] text-emerald-100/80">Stay above 80% → Mudra eligibility now.</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-yellow-700 to-slate-900 rounded-xl border border-yellow-500/30">
                        <p className="text-xs text-yellow-100">Funding</p>
                        <h3 className="text-xl font-black text-white">Mudra Loan ₹10L</h3>
                        <p className="text-[11px] text-yellow-100/80">Pre-fill PMEGP & Mudra forms from Guru tips.</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-slate-800 to-black rounded-xl border border-emerald-500/30">
                        <p className="text-xs text-emerald-100">Deadline</p>
                        <h3 className="text-xl font-black text-yellow-100">GSTR-3B: 20 Jan</h3>
                        <p className="text-[11px] text-emerald-100/80">Avoid late fee ₹50/day, set reminder.</p>
                    </div>
                </div>
            </div>

            <SchemeMatcher turnover={profile?.turnover || 250000} />

            <div className="glass-card p-4 space-y-3 border border-emerald-500/20">
                <ComplianceBadge profile={profile} onBadgeReady={setBadgeUrl} />
                <LinkedInShareButton badgeUrl={badgeUrl} />
            </div>
        </div>
    );
};

export { SchemeMatcher, ComplianceBadge, LinkedInShareButton };
export default TaxGuru;
