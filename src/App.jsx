import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';

import { useAuth } from './hooks/useAuth';

import ErrorBoundary from './components/ErrorBoundary';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import QuestVerify from './pages/QuestVerify';
import QuestGigLog from './pages/QuestGigLog'; // New Import
import QuestReturns from './pages/QuestReturns'; // New Import
import Leaderboard from './pages/Leaderboard';
import Guru from './pages/Guru';
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 shadow-xl shadow-indigo-500/20"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-indigo-950 text-white pb-24 selection:bg-indigo-500/30">
            <Routes>
              <Route path="/login" element={!session ? <Auth /> : <Navigate to="/" />} />
              <Route path="/" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
              <Route path="/quests" element={session ? <Quests session={session} /> : <Navigate to="/login" />} />
              <Route path="/quests/verify" element={session ? <QuestVerify session={session} /> : <Navigate to="/login" />} />
              <Route path="/quests/gig-log" element={session ? <QuestGigLog session={session} /> : <Navigate to="/login" />} />
              <Route path="/quests/returns" element={session ? <QuestReturns session={session} /> : <Navigate to="/login" />} />
              <Route path="/leaderboard" element={session ? <Leaderboard session={session} /> : <Navigate to="/login" />} />
              <Route path="/guru" element={session ? <Guru session={session} /> : <Navigate to="/login" />} />
            </Routes>
            {session && <Navbar />}
          </div>
        </Router>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#312e81',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              fontWeight: 600,
              fontSize: '14px'
            }
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
