import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sword, Trophy, MessageSquare, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: <LayoutDashboard size={20} /> },
        { path: '/quests', label: 'Quests', icon: <Sword size={20} /> },
        { path: '/leaderboard', label: 'Arena', icon: <Trophy size={20} /> },
        { path: '/guru', label: 'Guru', icon: <MessageSquare size={20} /> },
    ];

    return (
        <>
            {/* Mobile Sticky Top Bar for Hamburger */}
            <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 md:hidden bg-indigo-950/20 backdrop-blur-md border-b border-white/5">
                <h1 className="text-xl font-black italic tracking-tighter">Tax<span className="text-indigo-400">Quest</span></h1>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 glass-card rounded-xl">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Slide-out Quests / Side Menu */}
            <div className={`fixed inset-0 z-40 transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-2xl" onClick={() => setIsOpen(false)} />
                <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-xs bg-indigo-900 border-r border-white/10 p-8 space-y-8">
                    <header className="pt-4">
                        <h2 className="text-2xl font-black italic">CONQUER <span className="text-indigo-400">GST</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Quick Gear-up</p>
                    </header>
                    <div className="space-y-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `
                  flex items-center gap-4 p-4 rounded-2xl font-black uppercase tracking-tighter transition-all
                  ${isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-white/5'}
                `}
                            >
                                {item.icon} {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Glass Navigation (Bottom for Mobile, Floating for Desktop) */}
            <nav className="fixed bottom-6 left-6 right-6 z-40">
                <div className="max-w-md mx-auto glass-card flex justify-around p-3 bg-indigo-600/20 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                ${isActive ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-indigo-300 opacity-60 hover:opacity-100'}
              `}
                        >
                            <div className={({ isActive }) => isActive ? 'animate-bounce' : ''}>
                                {item.icon}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
