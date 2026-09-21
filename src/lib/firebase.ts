import { initializeApp, getApps, getApp } from 'firebase/app';
import { safeStorage } from '../utils/safeStorage';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Configuração do projeto Firebase com suporte transparente tanto para o AI Studio quanto para Vercel / ambiente externo
const activeApiKey = import.meta.env.VITE_FIREBASE_API_KEY || (firebaseAppletConfig as any)?.apiKey || "AIzaSyB7f0uh8ZwYIGMSvO67T4t0II4q0p3sfUk";
const activeAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseAppletConfig as any)?.authDomain || "torresulcenter-c527c.firebaseapp.com";
const activeProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseAppletConfig as any)?.projectId || "torresulcenter-c527c";
const activeStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseAppletConfig as any)?.storageBucket || "torresulcenter-c527c.firebasestorage.app";
const activeMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseAppletConfig as any)?.messagingSenderId || "335861110894";
const activeAppId = import.meta.env.VITE_FIREBASE_APP_ID || (firebaseAppletConfig as any)?.appId || "1:335861110894:web:9661cca78a18ddf4acee7f";
const activeMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (firebaseAppletConfig as any)?.measurementId || "";

export const firebaseConfig = {
  apiKey: activeApiKey,
  authDomain: activeAuthDomain,
  projectId: activeProjectId,
  storageBucket: activeStorageBucket,
  messagingSenderId: activeMessagingSenderId,
  appId: activeAppId,
  measurementId: activeMeasurementId,
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Connect to provisioned Firestore database instance with persistent IndexedDB multi-tab cache
// This enables instant sub-millisecond local loading and real-time live background updates
let firestoreInstance: ReturnType<typeof getFirestore>;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;

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
    console.warn('Aviso ao verificar redirect login:', error);
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

    throw error;
  }
};

export const logoutUser = async () => {
  try {
    clearSessionTimestamp();
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao sair:', error);
    throw error;
  }
};

export const logoutGoogle = logoutUser;

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    saveSessionTimestamp();
    return res.user;
  } catch (error) {
    console.error('Erro no login por email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name?: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (name && name.trim()) {
      await updateProfile(res.user, { displayName: name.trim() });
    }
    saveSessionTimestamp();
    return res.user;
  } catch (error) {
    console.error('Erro no cadastro por email:', error);
    throw error;
  }
};

export const resetPasswordWithEmail = async (email: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, cleanEmail);
    return true;
  } catch (error) {
    console.error('Erro ao enviar recuperação de senha:', error);
    throw error;
  }
};

// 7-day session management
const SESSION_TIMESTAMP_KEY = 'torresul_session_timestamp';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const saveSessionTimestamp = () => {
  try {
    safeStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // storage unavailable
  }
};

export const isSessionExpired = (maxDays = 7): boolean => {
  try {
    const timestampStr = safeStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!timestampStr) {
      // If user is logged in but has no timestamp recorded yet, record it now
      saveSessionTimestamp();
      return false;
    }
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      saveSessionTimestamp();
      return false;
    }
    const elapsed = Date.now() - timestamp;
    return elapsed > (maxDays * 24 * 60 * 60 * 1000);
  } catch {
    return false;
  }
};

export const clearSessionTimestamp = () => {
  try {
    safeStorage.removeItem(SESSION_TIMESTAMP_KEY);
  } catch {
    // ignore
  }
};

export type { User };
