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
 * Deeply removes undefined fields from objects/arrays so Firestore doesn't reject them
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
 * Save user deals to Firestore cloud
 */
export async function saveDealsToCloud(user: User, deals: ContractDeal[]): Promise<void> {
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
  } catch (error) {
    console.error('Erro ao sincronizar com Firestore:', error);
    throw error;
  }
}

/**
 * Fetch user deals once from Firestore
 */
export async function loadDealsFromCloud(user: User): Promise<ContractDeal[] | null> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserCloudData;
      return Array.isArray(data.deals) ? data.deals : [];
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar dados do Firestore:', error);
    return null;
  }
}

/**
 * Subscribe to real-time changes from Firestore
 */
export function subscribeToUserCloud(
  user: User, 
  onData: (deals: ContractDeal[]) => void
): () => void {
  const userDocRef = doc(db, 'users', user.uid);
  return onSnapshot(userDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as UserCloudData;
      if (Array.isArray(data.deals)) {
        onData(data.deals);
      }
    }
  }, (error) => {
    console.error('Erro no listener de nuvem:', error);
  });
}
