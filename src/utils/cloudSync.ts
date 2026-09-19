import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, User } from '../lib/firebase';
import { ContractDeal } from '../types';

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
 * Merges local deals and cloud deals by deal ID.
 * Cloud version is preferred unless local has a newer updatedAt.
 */
export function mergeDeals(cloudDeals: ContractDeal[], localDeals: ContractDeal[]): ContractDeal[] {
  const map = new Map<string, ContractDeal>();

  // 1. Insert local deals
  for (const deal of localDeals || []) {
    if (deal && deal.id) {
      map.set(deal.id, deal);
    }
  }

  // 2. Overlay cloud deals
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
 * Cross-tab instant communication channel
 */
export const dealsBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('torresul_deals_sync')
  : null;

export function notifyOtherTabs() {
  try {
    dealsBroadcast?.postMessage({ type: 'DEALS_UPDATED', timestamp: Date.now() });
  } catch (err) {
    console.debug('BroadcastChannel notice:', err);
  }
}

/**
 * Save a single deal into Firestore under users/{userId}/deals/{dealId}
 */
export async function saveSingleDealToCloud(user: User, deal: ContractDeal): Promise<{ success: boolean; error?: any }> {
  if (!user || !user.uid || !deal || !deal.id) return { success: false, error: 'Dados inválidos' };
  try {
    const dealDocRef = doc(db, 'users', user.uid, 'deals', deal.id);
    const cleanDeal = sanitizeForFirestore({
      ...deal,
      updatedAt: deal.updatedAt || new Date().toISOString(),
    });
    await setDoc(dealDocRef, cleanDeal, { merge: true });

    // Also update user profile metadata
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      lastActiveAt: new Date().toISOString(),
      userEmail: user.email || '',
      displayName: user.displayName || 'Corretor Torresul',
    }, { merge: true });

    notifyOtherTabs();
    return { success: true };
  } catch (error: any) {
    console.warn('Erro ao salvar contrato no Firestore:', error);
    return { success: false, error };
  }
}

/**
 * Delete a single deal from Firestore
 */
export async function deleteSingleDealFromCloud(user: User, dealId: string): Promise<{ success: boolean; error?: any }> {
  if (!user || !user.uid || !dealId) return { success: false, error: 'Dados inválidos' };
  try {
    const dealDocRef = doc(db, 'users', user.uid, 'deals', dealId);
    await deleteDoc(dealDocRef);
    notifyOtherTabs();
    return { success: true };
  } catch (error: any) {
    console.warn('Erro ao excluir contrato do Firestore:', error);
    return { success: false, error };
  }
}

/**
 * Bulk save / migrate multiple deals to Firestore using batches
 */
export async function saveAllDealsToCloud(user: User, deals: ContractDeal[]): Promise<{ success: boolean; error?: any }> {
  if (!user || !user.uid) return { success: false, error: 'Usuário não autenticado' };
  if (!deals || deals.length === 0) return { success: true };

  try {
    const batch = writeBatch(db);
    for (const deal of deals) {
      if (deal && deal.id) {
        const dealDocRef = doc(db, 'users', user.uid, 'deals', deal.id);
        const clean = sanitizeForFirestore({
          ...deal,
          updatedAt: deal.updatedAt || new Date().toISOString(),
        });
        batch.set(dealDocRef, clean, { merge: true });
      }
    }

    const userDocRef = doc(db, 'users', user.uid);
    batch.set(userDocRef, {
      updatedAt: new Date().toISOString(),
      userEmail: user.email || '',
      displayName: user.displayName || 'Corretor Torresul',
    }, { merge: true });

    await batch.commit();
    notifyOtherTabs();
    return { success: true };
  } catch (error: any) {
    console.warn('Erro na gravação em lote do Firestore:', error);
    return { success: false, error };
  }
}

/**
 * Fetch all deals for a user from Firestore subcollection: users/{userId}/deals
 * Also checks legacy root doc for backward compatibility.
 */
export async function loadDealsFromCloud(user: User): Promise<{ deals: ContractDeal[] | null; error?: any }> {
  if (!user || !user.uid) return { deals: null, error: 'Usuário não autenticado' };
  try {
    const dealsColRef = collection(db, 'users', user.uid, 'deals');
    const snapshot = await getDocs(dealsColRef);

    let fetchedDeals: ContractDeal[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ContractDeal;
        if (data && data.id) {
          fetchedDeals.push(data);
        }
      });
    } else {
      // Fallback: Check if user has legacy data in users/{userId} document
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (Array.isArray(data?.deals) && data.deals.length > 0) {
          fetchedDeals = data.deals;
          // Auto-migrate legacy data to subcollection
          saveAllDealsToCloud(user, fetchedDeals).catch(() => {});
        }
      }
    }

    // Sort by contractDate descending
    fetchedDeals.sort((a, b) => (b.contractDate || '').localeCompare(a.contractDate || ''));
    return { deals: fetchedDeals };
  } catch (error: any) {
    console.warn('Erro ao carregar contratos do Firestore:', error?.message || error);
    return { deals: null, error };
  }
}

/**
 * Subscribe to real-time changes in users/{userId}/deals
 * Delivers data from IndexedDB cache immediately, then streams live updates from Firestore server
 */
export function subscribeToUserCloud(
  user: User, 
  onData: (deals: ContractDeal[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!user || !user.uid) return () => {};

  try {
    const dealsColRef = collection(db, 'users', user.uid, 'deals');
    return onSnapshot(
      dealsColRef, 
      (snapshot) => {
        const deals: ContractDeal[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ContractDeal;
          if (data && data.id) {
            deals.push(data);
          }
        });

        deals.sort((a, b) => (b.contractDate || '').localeCompare(a.contractDate || ''));
        onData(deals);
      }, 
      (error) => {
        console.warn('Listener Firestore notice:', error?.message || error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Não foi possível registrar listener do Firestore:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Register listener for changes from other tabs in the same browser
 */
export function listenToOtherTabs(callback: () => void): () => void {
  if (!dealsBroadcast) return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'DEALS_UPDATED') {
      callback();
    }
  };

  dealsBroadcast.addEventListener('message', handleMessage);
  return () => {
    dealsBroadcast.removeEventListener('message', handleMessage);
  };
}
