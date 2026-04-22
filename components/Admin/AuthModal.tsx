import React, { useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(false);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Admin check - only let the owner in
      if (result.user.email === 'oritsemisanogbe@gmail.com') {
          onSuccess();
      } else {
          await signOut(auth);
          throw new Error('Unauthorized');
      }
    } catch (e) {
      setError(true);
      setShake(true);
      setTimeout(() => {
          setShake(false);
          onClose(); // Boot them out
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
        <div 
            className={`
                bg-[#111] border-2 border-red-900/50 p-8 rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.2)]
                flex flex-col items-center gap-6 w-[300px] text-center
                ${shake ? 'animate-shake border-red-500' : ''}
            `}
        >
            <div className="text-red-600">
                {error ? <AlertTriangle className="w-12 h-12 animate-pulse mx-auto" /> : <Lock className="w-12 h-12 mx-auto" />}
            </div>
            
            <h2 className="text-red-500 font-mono tracking-widest text-sm uppercase">Restricted Access</h2>
            
            <button 
                onClick={handleLogin}
                disabled={loading}
                className="bg-red-900/30 hover:bg-red-900 border border-red-900 text-red-500 font-mono tracking-widest p-3 outline-none focus:border-red-500 w-full rounded transition-colors disabled:opacity-50"
            >
                {loading ? 'AUTHENTICATING...' : 'GOOGLE LOGIN'}
            </button>
            
            {error && <div className="text-red-500 font-mono text-xs animate-pulse">UNAUTHORIZED USER</div>}
            
            <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono text-xs mt-2">CANCEL</button>
        </div>
    </div>
  );
};

export default AuthModal;