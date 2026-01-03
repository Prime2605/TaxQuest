import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProfile } from '../hooks/useProfile';
import { verifyGSTIN } from '../utils/gstApi';
import {
    ShieldAlert, Scan, Mic, Sword, Flame,
    CheckCircle2, AlertCircle, Camera, Upload,
    Sparkles, Skull, Crown, Timer, Target, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { Howl } from 'howler';
import _ from 'lodash';

// Sounds - using generic public assets for simulation
const roarSfx = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3'] });
const fireSfx = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'] });
const successSfx = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] });
const scanSfx = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1470/1470-preview.mp3'] });

const QuestVerify = ({ session }) => {
    const { profile, updateProfile } = useProfile(session?.user?.id);
    const [gstin, setGstin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [dragonHp, setDragonHp] = useState(100);
    const [scanProgress, setScanProgress] = useState(0);
    const [dragonState, setDragonState] = useState('idle'); // idle, fire, dead
    const [showMural, setShowMural] = useState(false);

    // Haptic Feedback Helper
    const triggerHaptic = (pattern = 100) => {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
    };

    // Shake Phone Detection
    useEffect(() => {
        let lastShake = 0;
        const handleMotion = (event) => {
            const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
            const acceleration = Math.sqrt(x * x + y * y + z * z);
            const currentTime = Date.now();

            if (acceleration > 20 && currentTime - lastShake > 1000) {
                lastShake = currentTime;
                triggerHaptic([50, 100, 50]);
                toast("GSTIN Hunter Activated! 📱", { icon: '🔥' });
                roarSfx.play();
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, []);

    useEffect(() => {
        if (profile?.gstin_verified) {
            setDragonHp(0);
            setDragonState('dead');
        } else {
            setDragonHp(100 - (profile?.compliance_score || 0));
        }
    }, [profile]);

    const startVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return toast.error("Voice not supported here!");

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.start();
        setIsListening(true);
        triggerHaptic(50);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toUpperCase().replace(/\s/g, '');
            setGstin(transcript);
            setIsListening(false);
            toast.success("Voice Captured!");
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast.error("Low signal... Try again!");
        };
    };

    const handleScanSimulation = () => {
        setIsScanning(true);
        setScanProgress(0);
        scanSfx.play();
        triggerHaptic(100);

        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    setGstin('33GSPTN1882G1Z3');
                    confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
                    toast.success("Receipt Deciphered!");
                    return 100;
                }
                return prev + 10;
            });
        }, 80);
    };

    const verifyAndSlay = async () => {
        if (!gstin) return toast.error("Target GSTIN is missing!");
        setIsVerifying(true);

        try {
            const result = await verifyGSTIN(gstin);

            // Success Sequence
            successSfx.play();
            setShowMural(true);
            triggerHaptic([100, 50, 100, 50, 200]);

            updateProfile.mutate({
                gstin: gstin,
                gstin_verified: true,
                xp: (profile?.xp || 0) + 750,
                compliance_score: 100,
                level: profile?.level < 2 ? 2 : profile?.level
            });

            // Coin Rain Animation via Confetti
            const end = Date.now() + 3000;
            const colors = ['#fbbf24', '#f59e0b', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            toast.success("PENALTY DRAGON SLAIN! 🐉🗡️", { duration: 5000 });
            setDragonHp(0);
            setDragonState('dead');
            setTimeout(() => setShowMural(false), 2000);

        } catch (error) {
            // Fire Animation on failure
            setDragonState('fire');
            fireSfx.play();
            triggerHaptic(500);
            toast.error("The Dragon Breathes Fire! Try again hero!", { icon: '🔥' });
            setTimeout(() => setDragonState('idle'), 2000);
        } finally {
            setIsVerifying(false);
        }
    };

    const getAvatar = () => {
        if (profile?.level >= 3) return { label: "Mudra Merchant", icon: <Crown className="text-yellow-400" /> };
        if (profile?.level >= 2) return { label: "GST Warrior", icon: <Sword className="text-indigo-400" /> };
        return { label: "Street Chaiwala", icon: <Target className="text-indigo-300" /> };
    };

    return (
        <div className={`p-6 space-y-8 pb-32 max-w-lg mx-auto transition-all duration-1000 ${showMural ? 'bg-orange-600/20' : ''}`}>
            {/* Mural Overlay (Kerala Style) */}
            {showMural && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-orange-500/10 backdrop-blur-sm animate-pulse">
                    <div className="text-orange-500 opacity-20 rotate-45 scale-[3]">
                        <Crown size={200} />
                    </div>
                </div>
            )}

            <header className="relative text-center space-y-2 pt-10">
                <div className="flex flex-col items-center gap-2">
                    <div className="badge badge-gold bg-indigo-600 border-indigo-400 flex items-center gap-2">
                        {getAvatar().icon} {getAvatar().label}
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white">GSTIN <span className="text-red-500">HUNTER</span></h1>
                </div>
            </header>

            {/* Dragon Boss Component */}
            <div className={`
        glass-card p-6 border-2 relative overflow-hidden transition-all duration-500
        ${dragonState === 'fire' ? 'border-orange-500 bg-orange-500/10 scale-105' : 'border-red-500/20 bg-red-950/20'}
        ${dragonState === 'dead' ? 'grayscale opacity-50' : ''}
      `}>
                {dragonState === 'fire' && (
                    <div className="absolute inset-0 flex items-center justify-center animate-ping pointer-events-none">
                        <Flame size={150} className="text-orange-500 opacity-50" />
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Skull className={dragonState === 'fire' ? 'text-orange-500' : 'text-red-500'} size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">The Penalty Dragon</span>
                    </div>
                    <span className="font-mono text-red-500 font-bold">{dragonHp}% HP</span>
                </div>

                <div className="h-4 w-full bg-black/40 rounded-full p-1 border border-red-900/40">
                    <div
                        className={`h-full bg-gradient-to-r rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(239,68,68,0.5)] ${dragonState === 'fire' ? 'from-orange-600 to-red-600' : 'from-red-600 via-orange-500 to-red-600'}`}
                        style={{ width: `${dragonHp}%` }}
                    ></div>
                </div>

                <p className="mt-4 text-[10px] font-bold text-red-300/60 uppercase tracking-widest text-center italic">
                    {dragonState === 'dead' ? "QUEST COMPLETE: Dragon Neutralized" : (dragonState === 'fire' ? "RAWRRR! MISSED!" : "Identify your business to shield your gains")}
                </p>
            </div>

            <div className="space-y-4">
                {/* AR-STYLE RECEIPT ZONE */}
                <div
                    className={`
            glass-card p-8 border-dashed border-2 flex flex-col items-center justify-center text-center gap-4 transition-all
            ${isScanning ? 'border-indigo-400 bg-indigo-500/5 animate-pulse' : 'border-indigo-500/30'}
          `}
                    onDrop={(e) => { e.preventDefault(); handleScanSimulation(); }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {isScanning ? (
                        <div className="space-y-4 w-full">
                            <Scan className="text-indigo-400 mx-auto animate-spin" size={48} />
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-indigo-300">Deciphering Scroll...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Scan size={32} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Digital Scroll Reader</h3>
                                <p className="text-[10px] text-indigo-300/50 font-bold uppercase mt-1">Scribe into the scanner zone</p>
                            </div>
                            <button onClick={handleScanSimulation} className="text-xs text-indigo-400 font-black underline uppercase tracking-widest">Scan Receipt</button>
                        </>
                    )}
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="00XXXXX0000X0Z0"
                        className="w-full input-field pr-12 text-lg font-black tracking-widest uppercase"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                    />
                    <button
                        onClick={startVoiceSearch}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all ${isListening ? 'text-red-500 scale-125 animate-pulse' : 'text-indigo-400 hover:text-white'}`}
                    >
                        <Mic size={24} />
                    </button>
                </div>

                <button
                    onClick={verifyAndSlay}
                    disabled={isVerifying || dragonState === 'dead'}
                    className="w-full btn-primary h-20 text-xl font-black italic disabled:opacity-50 group border-b-8 border-indigo-800"
                >
                    {isVerifying ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
                    ) : (
                        <>
                            <Sword size={28} className="group-hover:rotate-45 transition-transform" />
                            SLAY PENALTY DRAGON
                        </>
                    )}
                </button>
            </div>

            <div className="flex gap-4 p-4 glass-card bg-indigo-500/5 items-center">
                <Sparkles className="text-yellow-400 shrink-0" />
                <p className="text-[10px] font-bold text-indigo-200">
                    PRO TIP: Shake your phone to roar back at the dragon! 📳
                </p>
            </div>
        </div>
    );
};

export default QuestVerify;
