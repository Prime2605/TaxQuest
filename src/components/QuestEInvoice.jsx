import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QrCode, FileText, Scan, Plus, CheckCircle2, RefreshCw, Wand2, Sparkles, Video, Shield } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsQR from 'jsqr';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { generateEInvoice } from '../utils/gstApi';
import { useProfile } from '../hooks/useProfile';

const seedClients = [
    { gstin: '32ABCDE1234F1Z5', name: 'KozhiCodes', location: 'Kozhikode' },
    { gstin: '32FGHIJ5678K1Z5', name: 'ErodeAgri', location: 'Erode' },
    { gstin: '32KLMNO9012P1Z5', name: 'MalabarTea', location: 'Wayanad' },
    { gstin: '32PQRSX3456L1Z5', name: 'BackwaterSpices', location: 'Alappuzha' },
    { gstin: '32TUVWX7890M1Z5', name: 'ThrissurTraders', location: 'Thrissur' },
];

const defaultItem = { description: 'Kerala Pepper Packs', hsn_code: '090411', quantity: 1, unit_price: 5000 };

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const QuestEInvoice = ({ session }) => {
    const { profile, updateProfile } = useProfile(session?.user?.id);
    const [clients, setClients] = useState(seedClients);
    const [loadingClients, setLoadingClients] = useState(false);
    const [form, setForm] = useState({
        clientGstin: seedClients[0].gstin,
        amount: 15000,
        docNumber: `TQ-${Date.now()}`,
        buyerName: seedClients[0].name,
        location: seedClients[0].location
    });
    const [items, setItems] = useState([defaultItem]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [invoiceResult, setInvoiceResult] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVerifyingQr, setIsVerifyingQr] = useState(false);
    const [isScanningCamera, setIsScanningCamera] = useState(false);
    const [scanMessage, setScanMessage] = useState('Align QR in portal');
    const [unlockMsg, setUnlockMsg] = useState('');
    const previewRef = useRef(null);
    const videoRef = useRef(null);
    const scanLoopRef = useRef(null);

    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const { data, error } = await supabase.from('clients').select('gstin,name,location').limit(20);
                if (error) throw error;
                if (data?.length) {
                    setClients(data);
                    setForm((prev) => ({
                        ...prev,
                        clientGstin: data[0].gstin,
                        buyerName: data[0].name,
                        location: data[0].location
                    }));
                }
            } catch (error) {
                console.warn('Client fetch fallback to seeds:', error.message);
            } finally {
                setLoadingClients(false);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        return () => {
            if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const totalAmount = useMemo(
        () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0),
        [items]
    );

    useEffect(() => {
        setForm((prev) => ({ ...prev, amount: totalAmount }));
    }, [totalAmount]);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const addItemRow = () => setItems((prev) => [...prev, { description: '', hsn_code: '', quantity: 1, unit_price: 0 }]);

    const handleClientSelect = (gstin) => {
        const selected = clients.find((c) => c.gstin === gstin);
        setForm((prev) => ({
            ...prev,
            clientGstin: gstin,
            buyerName: selected?.name || prev.buyerName,
            location: selected?.location || prev.location
        }));
    };

    const renderPreview = async () => {
        if (!previewRef.current) return;
        const canvas = await html2canvas(previewRef.current, { backgroundColor: '#0f172a', scale: 2 });
        setPreviewUrl(canvas.toDataURL('image/png'));
        toast.success('Preview captured');
    };

    const decodeQrDataUrl = async (dataUrl) => {
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(imageData.data, imageData.width, imageData.height);
    };

    const decodeQr = async (dataUrl) => {
        setIsVerifyingQr(true);
        try {
            const code = await decodeQrDataUrl(dataUrl);
            if (code?.data) {
                toast.success('Invoice verified! +100XP ✨');
                if (profile) {
                    updateProfile.mutate({
                        user_id: profile.user_id,
                        xp: (profile?.xp || 0) + 100,
                        level: Math.max(profile?.level || 1, 4)
                    });
                }
                if (invoiceResult?.raw?.irn && code.data.includes(invoiceResult.raw.irn)) {
                    setUnlockMsg('Level 4: Invoice Master! 🧙');
                }
                return code.data;
            }
            toast.error('QR unreadable');
            return null;
        } finally {
            setIsVerifyingQr(false);
        }
    };

    const startCameraScan = async () => {
        if (isScanningCamera) return;
        setIsScanningCamera(true);
        setScanMessage('Opening camera…');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (!videoRef.current) return;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setScanMessage('Align QR in portal');

            const tick = () => {
                if (!videoRef.current) return;
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code?.data) {
                    setScanMessage('Invoice verified! +100XP ✨');
                    decodeQr(`data:image/png;base64,${btoa(code.data)}`).catch(() => {});
                    stopCameraScan();
                    return;
                }
                scanLoopRef.current = requestAnimationFrame(tick);
            };
            tick();
        } catch (err) {
            setScanMessage('Camera blocked. Allow access.');
            toast.error('Camera access denied');
            setIsScanningCamera(false);
        }
    };

    const stopCameraScan = () => {
        if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanningCamera(false);
    };

    const handleGenerate = async () => {
        if (!profile?.gstin) return toast.error('Add your GSTIN in profile first!');
        if (!gstinRegex.test(form.clientGstin)) return toast.error('Verify client first (invalid GSTIN)');
        if (form.amount < 5000) return toast.error('Total must be above ₹5,000 for B2B e-invoice');
        setIsGenerating(true);
        try {
            const result = await generateEInvoice({
                clientGstin: form.clientGstin,
                amount: form.amount,
                items,
                sellerGstin: profile.gstin,
                sellerTradeName: profile.trade_name || profile.name || 'TaxQuest Trader',
                docNumber: form.docNumber,
                buyerName: form.buyerName,
                location: form.location
            });
            const qrDataUrl = result.qr?.startsWith('data') ? result.qr : `data:image/png;base64,${result.qr}`;
            const enriched = {
                qr: qrDataUrl,
                pdf: result.pdf,
                raw: result.raw
            };
            setInvoiceResult(enriched);
            toast.success('E-Invoice generated!');
            if (result.raw?.irn) {
                try {
                    await supabase.from('einvoices').upsert({ irn: result.raw.irn, doc_number: form.docNumber, client_gstin: form.clientGstin });
                } catch (err) {
                    console.warn('IRN store skipped:', err.message);
                }
            }
            await decodeQr(qrDataUrl);
        } catch (error) {
            toast.error(error.message || 'GSTN queued—retry 2min');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 space-y-6 pb-28 max-w-3xl mx-auto">
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Quest 4</p>
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2">
                        <QrCode className="text-indigo-400 animate-pulse" /> E-INVOICE MAGE
                    </h1>
                    <p className="text-indigo-200 text-sm">Generate, preview, sign & verify with live QR scanner.</p>
                </div>
                <div className="glass-card px-4 py-3 text-right relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-500/10 to-pink-500/10 animate-pulse" />
                    <p className="text-[10px] uppercase text-indigo-300 font-black">Seller GSTIN</p>
                    <p className="font-mono text-sm">{profile?.gstin || 'Add in profile'}</p>
                </div>
            </header>

            <section className="glass-card p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-black text-indigo-300">B2B Client</label>
                        <select
                            value={form.clientGstin}
                            onChange={(e) => handleClientSelect(e.target.value)}
                            className="input-field w-full mt-1"
                            disabled={loadingClients}
                        >
                            {clients.map((client) => (
                                <option key={client.gstin} value={client.gstin}>
                                    {client.name} — {client.gstin} ({client.location})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-36">
                        <label className="text-[10px] uppercase font-black text-indigo-300">Amount (₹)</label>
                        <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                            className="input-field w-full mt-1"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-black text-indigo-300">Doc Number</label>
                        <input
                            value={form.docNumber}
                            onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                            className="input-field w-full mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-black text-indigo-300">Buyer Name</label>
                        <input
                            value={form.buyerName}
                            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                            className="input-field w-full mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-black text-indigo-300">Location</label>
                        <input
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            className="input-field w-full mt-1"
                        />
                    </div>
                </div>
            </section>

            <section className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                        <Wand2 size={16} className="text-purple-300" /> Line Items
                    </p>
                    <button onClick={addItemRow} className="btn-secondary text-xs flex items-center gap-1">
                        <Plus size={14} /> Item
                    </button>
                </div>
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-xl">
                            <input
                                className="input-field col-span-4"
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            />
                            <input
                                className="input-field col-span-2"
                                placeholder="HSN"
                                value={item.hsn_code}
                                onChange={(e) => handleItemChange(idx, 'hsn_code', e.target.value)}
                            />
                            <input
                                type="number"
                                className="input-field col-span-2"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            />
                            <input
                                type="number"
                                className="input-field col-span-2"
                                placeholder="Unit ₹"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            />
                            <div className="col-span-2 text-right font-mono text-sm text-indigo-200">
                                ₹ {(Number(item.quantity) || 0) * (Number(item.unit_price) || 0)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-end gap-4 text-sm font-black">
                    <span className="text-indigo-300 uppercase tracking-widest">Total</span>
                    <span className="text-2xl">₹ {totalAmount}</span>
                </div>
            </section>

            <section className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                        <FileText size={16} /> Kerala Agritech Preview (html2canvas)
                    </p>
                    <button onClick={renderPreview} className="btn-secondary text-xs flex items-center gap-1">
                        <Scan size={14} /> Capture
                    </button>
                </div>
                <div
                    ref={previewRef}
                    className="bg-gradient-to-br from-indigo-950 via-purple-950 to-black border border-purple-500/20 rounded-2xl p-4 space-y-2 shadow-[0_0_30px_rgba(88,28,135,0.4)]"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <Shield size={18} className="text-green-300" /> TaxQuest Agritech Invoice
                            </h3>
                            <p className="text-[10px] uppercase text-indigo-300">Mystic Pepper Route</p>
                        </div>
                        <span className="text-xs font-mono text-indigo-200 bg-white/5 px-2 py-1 rounded">{form.docNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-indigo-200">
                        <p>Buyer: {form.buyerName}</p>
                        <p className="text-right">GSTIN: {form.clientGstin}</p>
                        <p>Location: {form.location}</p>
                        <p className="text-right">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="border-t border-white/10 pt-2 space-y-1">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{item.description || 'Item'}</span>
                                <span className="font-mono text-green-300">
                                    ₹ {(Number(item.quantity) || 0) * (Number(item.unit_price) || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-sm font-black">Total</span>
                        <span className="text-xl font-black text-green-300">₹ {totalAmount}</span>
                    </div>
                </div>
                {previewUrl && (
                    <div className="mt-3">
                        <p className="text-[10px] uppercase font-black text-indigo-300 mb-1">Canvas Snapshot</p>
                        <img src={previewUrl} alt="Invoice preview" className="rounded-xl border border-white/10" />
                    </div>
                )}
            </section>

            <section className="glass-card p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <QrCode size={16} />}
                        Generate E-Invoice
                    </button>
                    {invoiceResult?.qr && (
                        <button
                            onClick={() => decodeQr(invoiceResult.qr)}
                            disabled={isVerifyingQr}
                            className="btn-secondary text-xs flex items-center gap-2"
                        >
                            {isVerifyingQr ? <RefreshCw className="animate-spin" size={14} /> : <Scan size={14} />}
                            Scan QR
                        </button>
                    )}
                    <button
                        onClick={isScanningCamera ? stopCameraScan : startCameraScan}
                        className="btn-secondary text-xs flex items-center gap-2"
                    >
                        <Video size={14} /> {isScanningCamera ? 'Stop Live Scan' : 'Live Camera Scan'}
                    </button>
                </div>
                {invoiceResult && (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative bg-white p-3 rounded-xl text-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 via-indigo-200/30 to-transparent animate-pulse" />
                            <p className="text-[10px] uppercase font-black text-indigo-600 mb-2">Live QR</p>
                            <div className="relative w-44 h-44 mx-auto rounded-full border-4 border-purple-500/40 shadow-[0_0_50px_rgba(109,40,217,0.6)] grid place-items-center">
                                <div className="absolute inset-2 rounded-full border border-purple-400/50 animate-spin-slow" />
                                <img src={invoiceResult.qr} alt="Invoice QR" className="w-36 h-36 relative z-10" />
                            </div>
                            <div className="flex items-center justify-center gap-1 text-green-600 mt-2 text-xs font-black uppercase">
                                <CheckCircle2 size={14} /> Ready to scan
                            </div>
                        </div>
                        <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2">
                            <p className="text-[10px] uppercase font-black text-indigo-300">Signed PDF</p>
                            {invoiceResult.pdf ? (
                                <a href={invoiceResult.pdf} target="_blank" rel="noreferrer" className="btn-secondary text-xs w-full text-center">
                                    Download PDF
                                </a>
                            ) : (
                                <p className="text-sm text-indigo-200">PDF link will appear from Quicko.</p>
                            )}
                            <p className="text-[10px] uppercase font-black text-indigo-300">IRN / meta</p>
                            <code className="text-[10px] break-words text-indigo-100">
                                {invoiceResult.raw?.irn || JSON.stringify(invoiceResult.raw)?.slice(0, 120)}...
                            </code>
                        </div>
                    </div>
                )}

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="glass-card p-4 border border-purple-500/30">
                        <p className="text-[10px] uppercase text-purple-200 font-black flex items-center gap-2">
                            <Sparkles size={14} /> QR Scanner Portal
                        </p>
                        <div className="relative mt-3 h-56 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-black border border-purple-400/30 overflow-hidden">
                            <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.15),transparent_50%)]" />
                            <video ref={videoRef} className="w-full h-full object-cover opacity-70" muted playsInline />
                            <div className="absolute inset-6 rounded-2xl border-2 border-purple-400/40 animate-[spin_14s_linear_infinite]"></div>
                            <p className="absolute bottom-3 w-full text-center text-xs font-black text-purple-100 drop-shadow">{scanMessage}</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 border border-green-500/20 flex flex-col gap-3">
                        <p className="text-[10px] uppercase text-green-200 font-black">Rewards</p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 grid place-items-center animate-pulse shadow-lg shadow-purple-800/60">
                                <Wand2 />
                            </div>
                            <div>
                                <p className="text-sm font-black">Mage staff glows during generate</p>
                                <p className="text-xs text-indigo-200">QR scan to unlock Wizard Hat avatar + Level 4</p>
                            </div>
                        </div>
                        {unlockMsg && (
                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-200 font-black text-sm">
                                {unlockMsg}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default QuestEInvoice;
