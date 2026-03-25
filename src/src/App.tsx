import React, { useState, useEffect } from 'react';
import { Loader2, LogOut, Languages, Chrome, Play, BookOpen, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---
type Language = 'en' | 'ml';
interface UserProfile { fullName: string; email: string; preferredLanguage: Language; }

const MODULES = [
  { id: 'm1', title: { en: 'Basic Computer Skills', ml: 'അടിസ്ഥാന കമ്പ്യൂട്ടർ അറിവ്' }, lessons: [{ title: { en: 'What is a Computer?', ml: 'എന്താണ് കമ്പ്യൂട്ടർ?' }, content: { en: 'A computer is an electronic device that processes data.', ml: 'ഡാറ്റ പ്രോസസ്സ് ചെയ്യുന്ന ഒരു ഇലക്ട്രോണിക് ഉപകരണമാണ് കമ്പ്യൂട്ടർ.' } }] },
  { id: 'm2', title: { en: 'Internet Safety', ml: 'ഇന്റർനെറ്റ് സുരക്ഷ' }, lessons: [{ title: { en: 'Safe Browsing', ml: 'സുരക്ഷിതമായ ബ്രൗസിംഗ്' }, content: { en: 'Always use strong passwords and avoid suspicious links.', ml: 'എപ്പോഴും ശക്തമായ പാസ്‌വേഡുകൾ ഉപയോഗിക്കുക, സംശയാസ്പദമായ ലിങ്കുകൾ ഒഴിവാക്കുക.' } }] }
];

// --- Simple Voice Service ---
const speak = (text: string, lang: Language) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
  window.speechSynthesis.speak(utterance);
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Load saved profile from phone memory
  useEffect(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) setProfile(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile = { fullName: name || 'Student', email, preferredLanguage: 'ml' as Language };
    setProfile(newProfile);
    localStorage.setItem('user_profile', JSON.stringify(newProfile));
    speak('Welcome back', 'en');
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('user_profile');
    setCurrentModuleId(null);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  // --- Start Screen ---
  if (!hasInteracted) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <button onClick={() => { setHasInteracted(true); speak('Welcome', 'en'); }} className="flex flex-col items-center gap-6 p-12 bg-emerald-500 rounded-[3rem] shadow-2xl active:scale-95 transition-all">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center"><Play className="w-10 h-10 text-emerald-600 ml-1" /></div>
          <div className="text-center"><h1 className="text-2xl font-black text-black uppercase">Start Learning</h1><p className="text-emerald-900 font-bold text-xs uppercase">തുടങ്ങാൻ ഇവിടെ അമർത്തുക</p></div>
        </button>
      </div>
    );
  }

  // --- Login Screen ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-tighter">Ability Learning</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Name / പേര്" value={name} onChange={e => setName(e.target.value)} className="w-full bg-stone-800 text-white p-4 rounded-2xl outline-none border border-stone-700 focus:border-emerald-500 font-bold" required />
            <input type="email" placeholder="Email / ഇമെയിൽ" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-800 text-white p-4 rounded-2xl outline-none border border-stone-700 focus:border-emerald-500 font-bold" required />
            <button type="submit" className="w-full bg-emerald-500 p-4 rounded-2xl font-black text-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Access System</button>
          </form>
          <div className="mt-8 text-center text-stone-600 text-[10px] uppercase font-black tracking-widest">Safe & Secure Access</div>
        </div>
      </div>
    );
  }

  // --- Dashboard ---
  const currentModule = MODULES.find(m => m.id === currentModuleId);
  const lang = profile.preferredLanguage;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="bg-stone-900 border-b border-stone-800 p-6 flex justify-between items-center">
        <h1 className="text-xl font-black uppercase tracking-tighter" onClick={() => setCurrentModuleId(null)}>Ability Learning</h1>
        <button onClick={logout} className="p-2 bg-stone-800 rounded-lg text-red-500"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {!currentModuleId ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-black mb-8">{lang === 'ml' ? 'ക്ലാസ്സുകൾ' : 'Classes'}</h2>
            <div className="grid gap-4">
              {MODULES.map(m => (
                <button key={m.id} onClick={() => { setCurrentModuleId(m.id); speak(m.title[lang], lang); }} className="w-full bg-stone-900 p-6 rounded-3xl border border-stone-800 text-left hover:border-emerald-500 transition-all">
                  <h3 className="text-xl font-bold mb-2">{m.title[lang]}</h3>
                  <p className="text-stone-500 text-xs uppercase font-black tracking-widest">{lang === 'ml' ? 'തുടങ്ങാൻ അമർത്തുക' : 'Click to start'}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <button onClick={() => setCurrentModuleId(null)} className="text-emerald-500 font-black text-xs uppercase tracking-widest">← Back</button>
            <div className="bg-stone-900 p-8 rounded-[2.5rem] border border-stone-800">
              <h2 className="text-3xl font-black mb-4 text-emerald-500">{currentModule.lessons[0].title[lang]}</h2>
              <p className="text-xl leading-relaxed text-stone-300 mb-8">{currentModule.lessons[0].content[lang]}</p>
              <button onClick={() => speak(currentModule.lessons[0].content[lang], lang)} className="w-full bg-emerald-500 p-4 rounded-2xl text-black font-black uppercase tracking-widest">Listen to Lesson</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
