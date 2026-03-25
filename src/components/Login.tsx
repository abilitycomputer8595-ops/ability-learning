import React, { useState } from 'react';
import { UserProfile } from '../types';
import { speakText } from '../services/geminiService';
import { Chrome, Play } from 'lucide-react';
import Logo from './Logo';
import { authService } from '../services/authService';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startApp = () => {
    setHasInteracted(true);
    speakText('Welcome to Ability Learning. Please sign in or register to continue.', 'en');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const profile = await authService.signInWithGoogle();
      onLoginSuccess(profile);
    } catch (err: any) {
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const profile = await authService.login(email, password);
        onLoginSuccess(profile);
      } else {
        const profile = await authService.register(email, password, { fullName, preferredLanguage: 'ml' });
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setError("Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasInteracted) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <button
          onClick={startApp}
          className="group flex flex-col items-center gap-6 p-12 bg-emerald-500 rounded-[3rem] shadow-2xl hover:bg-emerald-400 transition-all active:scale-95"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
            <Play className="w-12 h-12 text-emerald-600 ml-1" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter">Start Learning</h1>
            <p className="text-emerald-900 font-bold text-sm uppercase tracking-widest">പഠനം ആരംഭിക്കാൻ ഇവിടെ അമർത്തുക</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white tracking-tight">Ability Learning</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs border border-red-500/20 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name / പേര്"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-stone-800 text-white p-4 rounded-2xl outline-none border border-stone-700 focus:border-emerald-500 font-bold"
            />
          )}
          <input
            type="email"
            placeholder="Email / ഇമെയിൽ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-stone-800 text-white p-4 rounded-2xl outline-none border border-stone-700 focus:border-emerald-500 font-bold"
          />
          <input
            type="password"
            placeholder="Password / പാസ്‌വേഡ്"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-stone-800 text-white p-4 rounded-2xl outline-none border border-stone-700 focus:border-emerald-500 font-bold"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 p-4 rounded-2xl font-black text-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? '...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-800"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
            <span className="bg-stone-900 px-4 text-stone-600">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white p-4 rounded-2xl font-black text-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-stone-100 transition-all active:scale-95"
        >
          <Chrome className="w-5 h-5 text-blue-600" />
          <span>Google Login</span>
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 text-stone-500 font-bold hover:text-emerald-500 text-[10px] uppercase tracking-widest transition-colors"
        >
          {isLogin ? "New Student? Create Account" : 'Have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}
