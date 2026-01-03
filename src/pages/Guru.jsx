import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const Guru = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Namaste! I am your AI Tax Guru. How can I help you level up your business compliance today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // AI Simulation (Placeholder for Google AI Studio)
        setTimeout(() => {
            let response = "That's a great question about GST. For your turnover level, you should focus on filing GSTR-1 by the 11th of every month.";
            if (input.toLowerCase().includes('mudra')) {
                response = "To qualify for a Mudra loan, you need a high Compliance Score. Keep logging your sales and verify your GSTIN in the Quests tab!";
            } else if (input.toLowerCase().includes('invoice')) {
                response = "E-Invoicing is mandatory for businesses with turnover above 5 Cr. However, doing it early builds immense trust with banks.";
            }

            setMessages(prev => [...prev, { role: 'bot', content: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] relative">
            <header className="p-6 bg-indigo-900/50 backdrop-blur-xl border-b border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <Bot className="text-white" size={28} />
                </div>
                <div>
                    <h1 className="text-xl font-black">AI Tax Guru</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Always Online</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`
              max-w-[85%] p-4 rounded-2xl flex gap-3
              ${msg.role === 'user' ? 'bg-indigo-600 rounded-br-none' : 'glass-card rounded-bl-none'}
            `}>
                            {msg.role === 'bot' && <Sparkles size={16} className="text-indigo-400 shrink-0 mt-1" />}
                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="glass-card p-4 rounded-2xl rounded-bl-none flex gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef}></div>
            </div>

            <div className="p-6 bg-indigo-950/80 backdrop-blur-xl border-t border-white/5">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask Guru anything..."
                        className="flex-1 input-field"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="p-3 bg-indigo-500 rounded-xl hover:bg-indigo-400 transition-all active:scale-90">
                        <Send size={20} className="text-white" />
                    </button>
                </form>
                <p className="text-[10px] text-center text-indigo-400 mt-3 font-bold uppercase tracking-widest opacity-50">Powered by Google AI Studio</p>
            </div>
        </div>
    );
};

export default Guru;
