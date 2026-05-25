'use client';

import { useEffect, useState } from 'react';
import { WocApp } from './WocApp';
import { createCurrentUser, saveCurrentUserToStorage, clearCurrentUserFromStorage } from '../logic/currentUserStorage';
import { supabaseAuthRequest } from '../../../lib/supabase/client';

type Feedback = { tone: 'success' | 'error'; message: string } | null;

export function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('aicas-supabase-email');
    if (saved) setUserEmail(saved);
  }, []);

  const runAuth = async (mode: 'signin' | 'signup') => {
    const path = mode === 'signup' ? '/signup' : '/token?grant_type=password';
    const response = await supabaseAuthRequest(path, { method: 'POST', body: JSON.stringify({ email, password }) });
    const payload = await response.json();
    if (!response.ok) {
      setFeedback({ tone: 'error', message: payload?.msg || payload?.error_description || payload?.error || 'Auth failed.' });
      return;
    }
    const nextEmail = payload?.user?.email || email;
    setUserEmail(nextEmail);
    window.localStorage.setItem('aicas-supabase-email', nextEmail);
    saveCurrentUserToStorage(createCurrentUser(nextEmail, nextEmail, '0000'));
    setFeedback({ tone: 'success', message: mode === 'signup' ? 'Account created and signed in.' : 'Signed in successfully.' });
  };

  if (!userEmail) {
    return <main className="app-shell"><div className="app-frame"><section className="stack home-screen"><article className="card"><h2>AI-CAS Sign In</h2><label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></label><label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>{feedback && <p className="field-help">{feedback.message}</p>}<div className="action-row"><button className="button primary full-width" onClick={()=>void runAuth('signin')}>Sign In</button><button className="button secondary full-width" onClick={()=>void runAuth('signup')}>Sign Up</button></div></article></section></div></main>;
  }

  return <><div className="screen-title" style={{ padding: '8px 16px' }}><span className="step-pill">Signed in: {userEmail}</span><button className="button secondary" type="button" onClick={()=>{setUserEmail(null);window.localStorage.removeItem('aicas-supabase-email');clearCurrentUserFromStorage();}}>Sign Out</button></div><WocApp /></>;
}
