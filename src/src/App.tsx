import React, { useState, useEffect } from 'react';
import { Language, UserProfile, ScreenReader } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import { MODULES } from './constants';
import { Loader2, LogOut, Languages } from 'lucide-react';
import { speakText } from './services/geminiService';
import Logo from './components/Logo';
import { authService } from './services/authService';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((userProfile) => {
      setProfile(userProfile);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleLanguage = async () => {
    if (!profile) return;
    const newLang: Language = profile.preferredLanguage === 'en' ? 'ml' : 'en';
    const updatedProfile = { ...profile, preferredLanguage: newLang };
    setProfile(updatedProfile);
    
    const msg = newLang === 'ml' ? 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി' : 'Language changed to English';
    speakText(msg, newLang);
  };

  const handleLogout = async () => {
    await authService.logout();
    setProfile(null);
    setCurrentModuleId(null);
    setShowQuiz(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-200 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile) {
    return <Login onLoginSuccess={(p) => setProfile(p)} />;
  }

  const currentModule = MODULES.find(m => m.id === currentModuleId);

  return (
    <div className="min-h-screen bg-black text-white font-sans p-0 sm:p-2 md:p-4 flex items-center justify-center">
      <div className="w-full max-w-7xl h-full min-h-[90vh] bg-stone-900 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] border-2 border-stone-800 overflow-hidden flex flex-col">
        <div className="bg-stone-950 px-6 py-3 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">
              Ability OS v2.0 // {profile.fullName}
            </span>
          </div>
        </div>

        <header className="bg-stone-900/50 backdrop-blur-md border-b border-stone-800 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setCurrentModuleId(null); setShowQuiz(false); }}>
            <div className="p-2 bg-emerald-500 rounded-xl transition-transform">
              <Logo className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter hidden sm:block">
              {profile.preferredLanguage === 'ml' ? 'എബിലിറ്റി ലേണിംഗ്' : 'Ability Learning'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-emerald-500 hover:text-black transition-all font-black text-xs uppercase tracking-widest border border-stone-700">
              <Languages className="w-4 h-4" />
              <span>{profile.preferredLanguage === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>
            <button onClick={handleLogout} className="p-3 rounded-xl bg-stone-800 text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-stone-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-stone-900 custom-scrollbar">
          <main className="max-w-6xl mx-auto p-8 pb-24">
            {!currentModuleId ? (
              <Dashboard 
                language={profile.preferredLanguage} 
                screenReader={profile.preferredScreenReader || 'nvda'}
                onSelectModule={(id) => setCurrentModuleId(id)} 
                onUpdateLanguage={(l) => setProfile({...profile, preferredLanguage: l})}
                onUpdateScreenReader={(s) => setProfile({...profile, preferredScreenReader: s})}
              />
            ) : showQuiz ? (
              <QuizView module={currentModule!} language={profile.preferredLanguage} onComplete={() => { setShowQuiz(false); setCurrentModuleId(null); }} onBack={() => setShowQuiz(false)} />
            ) : (
              <LessonView module={currentModule!} language={profile.preferredLanguage} onStartQuiz={() => setShowQuiz(true)} onBack={() => setCurrentModuleId(null)} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
