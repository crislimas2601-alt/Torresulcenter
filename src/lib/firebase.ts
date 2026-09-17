import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
// Configuração do projeto Firebase (torresulcenter-c527c)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7f0uh8ZwYIGMSvO67T4t0II4q0p3sfUk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "torresulcenter-c527c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "torresulcenter-c527c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "torresulcenter-c527c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "335861110894",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:335861110894:web:faac48a1fd745c4eacee7f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-308EDYGLJ3",
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Analytics safely (client-side only when supported)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const checkRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.warn('Erro ao verificar redirect login:', error);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Erro ao fazer login com Google:', error);
    
    // Se o popup for bloqueado no celular ou navegador restrito, tenta redirecionamento
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return;
      } catch (redirectErr) {
        console.error('Erro ao tentar redirect login:', redirectErr);
      }
    }

    if (error.code === 'auth/unauthorized-domain') {
      alert(`⚠️ Domínio não autorizado no Firebase!\n\nO domínio do seu site na Vercel (${window.location.hostname}) precisa estar adicionado em "Domínios Autorizados" no console do Firebase Authentication.`);
    } else if (error.code === 'auth/network-request-failed') {
      alert('Erro de conexão com os servidores do Google. Verifique sua internet ou tente novamente.');
    } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
      alert(`Não foi possível conectar com o Google: ${error.message || error.code}`);
    }
    throw error;
  }
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao sair:', error);
    throw error;
  }
};

export type { User };
