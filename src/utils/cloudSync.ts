import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
 * Merges local deals and cloud deals without duplicate loss.
 * If a user already had deals stored in local storage before logging in,
 * this function preserves them and ensures they are migrated to the cloud.
 */
export function mergeDeals(cloudDeals: ContractDeal[], localDeals: ContractDeal[]): ContractDeal[] {
  const map = new Map<string, ContractDeal>();

  // 1. Insert local deals first
  for (const deal of localDeals || []) {
    if (deal && deal.id) {
      map.set(deal.id, deal);
    }
  }

  // 2. Overlay cloud deals (preserve newer updates or add cloud deals)
  for (const deal of cloudDeals || []) {
    if (deal && deal.id) {
      const existing = map.get(deal.id);
      if (!existing) {
        map.set(deal.id, deal);
      } else {
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const cloudTime = deal.updatedAt ? new Date(deal.updatedAt).getTime() : 0;
        if (cloudTime >= existingTime) {
          map.set(deal.id, deal);
        }
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Save user deals to Firestore cloud safely and return success or error info
 */
export async function saveDealsToCloud(user: User, deals: ContractDeal[]): Promise<{ success: boolean; error?: any }> {
  if (!user || !user.uid) return { success: false, error: 'Usuário não autenticado' };
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
    return { success: true };
  } catch (error: any) {
    console.warn('Erro ao salvar no Firestore:', error?.message || error);
    return { success: false, error };
  }
}

/**
 * Fetch user deals once from Firestore
 */
export async function loadDealsFromCloud(user: User): Promise<{ deals: ContractDeal[] | null; error?: any }> {
  if (!user || !user.uid) return { deals: null, error: 'Usuário não autenticado' };
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserCloudData;
      return { deals: Array.isArray(data.deals) ? data.deals : [] };
    }
    return { deals: [] };
  } catch (error: any) {
    console.warn('Aviso ao carregar dados do Firestore:', error?.message || error);
    return { deals: null, error };
  }
}

/**
 * Subscribe to real-time changes from Firestore safely
 */
export function subscribeToUserCloud(
  user: User, 
  onData: (deals: ContractDeal[]) => void,
  onError?: (err: any) => void
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
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Não foi possível iniciar listener em tempo real:', err);
    if (onError) onError(err);
    return () => {};
  }
}
