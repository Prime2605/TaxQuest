import React from 'react';
import TaxGuru from '../components/TaxGuru';
import { useAuth } from '../hooks/useAuth';

const Guru = () => {
    const { session } = useAuth();
    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto pb-28">
            <div className="text-center space-y-2">
                <p className="text-[10px] uppercase text-emerald-200 font-black tracking-widest">Quest 5</p>
                <h1 className="text-3xl font-black text-yellow-100">Tax Guru AI</h1>
                <p className="text-sm text-emerald-100">Kerala uncle vibes, compliance wisdom, growth unlocks.</p>
            </div>
            <TaxGuru session={session} />
        </div>
    );
};

export default Guru;
