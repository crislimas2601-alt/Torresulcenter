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
import generatedFirebaseConfig from '../../firebase-applet-config.json';

// Configuração do projeto Firebase
export const firebaseConfig = generatedFirebaseConfig;

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
