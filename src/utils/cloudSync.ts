import { doc, getDoc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { db, User } from '../lib/firebase';
import { ContractDeal } from '../types';

export interface UserCloudData {
  deals: ContractDeal[];
  updatedAt: string;
  userEmail: string;
  displayName: string;
}

/**
 * Deeply removes undefined and invalid values from objects/arrays so Firestore doesn't reject them
 */
export function sanitizeForFirestore<T>(input: T): T {
  if (input === undefined) {
    return null as any;
  }
  if (input === null || typeof input !== 'object') {
    return input;
  }
  if (input instanceof Date) {
    return input.toISOString() as any;
  }
  if (Array.isArray(input)) {
    return input
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as any;
  }

  const output: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      output[key] = sanitizeForFirestore(value);
    }
  }
  return output as T;
}

/**
 * Compares two deal lists for functional equality to prevent unnecessary React re-renders & sync loops
 */
export function areDealsEqual(a: ContractDeal[], b: ContractDeal[]): boolean {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Save user deals to Firestore cloud safely
 */
export async function saveDealsToCloud(user: User, deals: ContractDeal[]): Promise<void> {
  if (!user || !user.uid) return;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const rawData = {
      deals: deals || [],
      updatedAt: new Date().toISOString(),
      userEmail: user.email || '',
      displayName: user.displayName || 'Corretor Torresul',
    };
    
    // Sanitize to guarantee no undefined values reach Firestore
    const cleanData = sanitizeForFirestore(rawData);
    
    await setDoc(userDocRef, cleanData, { merge: true });
  } catch (error: any) {
    console.warn('Sincronização com nuvem (aviso não-fatal):', error?.message || error);
    // Don't crash the UI; local storage remains the robust offline-first source of truth
    throw error;
  }
}

/**
 * Fetch user deals once from Firestore
 */
export async function loadDealsFromCloud(user: User): Promise<ContractDeal[] | null> {
  if (!user || !user.uid) return null;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserCloudData;
      return Array.isArray(data.deals) ? data.deals : [];
    }
    return null;
  } catch (error: any) {
    console.warn('Aviso ao carregar dados do Firestore:', error?.message || error);
    return null;
  }
}

/**
 * Subscribe to real-time changes from Firestore safely
 */
export function subscribeToUserCloud(
  user: User, 
  onData: (deals: ContractDeal[]) => void
): () => void {
  if (!user || !user.uid) return () => {};

  try {
    const userDocRef = doc(db, 'users', user.uid);
    return onSnapshot(
      userDocRef, 
      (snapshot) => {
        // Ignore snapshots that originate from local pending writes to avoid feedback loops
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }

        if (snapshot.exists()) {
          const data = snapshot.data() as UserCloudData;
          if (Array.isArray(data.deals)) {
            onData(data.deals);
          }
        }
      }, 
      (error) => {
        console.warn('Aviso no listener de nuvem (modo offline / reconectando):', error?.message || error);
      }
    );
  } catch (err) {
    console.warn('Não foi possível iniciar listener em tempo real:', err);
    return () => {};
  }
}
