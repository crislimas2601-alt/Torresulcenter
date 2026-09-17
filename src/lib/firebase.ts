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
import defaultConfig from '../../firebase-applet-config.json';

// Configuração do seu projeto Firebase pessoal (central-corretor-af22d)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyApF-1NZ5UWWVg5mqhtnya52b6NC35bgBk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "central-corretor-af22d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "central-corretor-af22d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "central-corretor-af22d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "458623241640",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:458623241640:web:b95cd805cc3713efb5219d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J7CL2VVT4K",
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
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
