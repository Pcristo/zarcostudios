import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';

export function Login() {
  const { t } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('web@zarco.studio');
  const [password, setPassword] = useState('webadmin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.hash = '#admin';
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = 'Invalid email or password.';
      
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = isRegistering ? err.message : 'Login failed. Check your password or click "Forgot?".';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters.';
      } else {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b0d] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zarco-cyan/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 sm:p-20 relative z-10"
      >
        <div className="flex justify-center mb-12">
          <div className="w-16 h-16 bg-zarco-cyan/10 rounded-2xl flex items-center justify-center border border-zarco-cyan/20">
            <ShieldAlert className="w-8 h-8 text-zarco-cyan" />
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">
            {isRegistering ? 'Create Admin' : t('login.title')}
          </h1>
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40">
            {isRegistering ? 'Register a new admin account' : t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-500 text-[10px] font-bold uppercase tracking-widest text-center">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">{t('login.email')}</label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-zarco-cyan transition-colors placeholder:text-white/10 text-xl font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">{t('login.pass')}</label>
              <button 
                type="button"
                onClick={handleResetPassword}
                className="text-[10px] uppercase font-bold tracking-widest text-zarco-cyan/60 hover:text-zarco-cyan"
              >
                Forgot?
              </button>
            </div>
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-zarco-cyan transition-colors placeholder:text-white/10 text-xl font-bold"
              required
            />
          </div>

          <div className="pt-8 space-y-6">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full py-8 bg-zarco-cyan text-black font-black rounded-xl flex items-center justify-center gap-4 hover:bg-zarco-cyan/90 transition-all shadow-[0_0_30px_rgba(79,209,220,0.4)] border-none text-[13px] uppercase tracking-[0.2em] group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Register' : t('login.btn')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setMessage(null);
              }}
              className="w-full text-center px-4"
            >
              <div className="flex items-center gap-2 justify-center text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-zarco-cyan transition-colors">
                <KeyRound className="w-3 h-3" />
                {isRegistering ? 'Already have an account? Sign In' : 'Need to register? Create Admin Account'}
              </div>
            </button>
          </div>
        </form>

        <div className="mt-16 pt-12 border-t border-white/5 flex items-center justify-center gap-6">
          <div className="w-2 h-2 rounded-full bg-zarco-cyan" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Secure Admin Gateway</p>
          <div className="w-2 h-2 rounded-full bg-zarco-cyan" />
        </div>
      </motion.div>
    </div>
  );
}
