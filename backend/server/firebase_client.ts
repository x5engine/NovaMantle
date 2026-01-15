/**
 * Firebase Admin Client
 * Handles Firebase operations from backend
 */
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;

export function initializeFirebase(): void {
  if (db) {
    return; // Already initialized
  }

  const serviceAccountPath = resolveServiceAccountPath();
  
  try {
    // Read JSON file synchronously for Firebase Admin
    const serviceAccountContent = fs.readFileSync(path.resolve(serviceAccountPath), 'utf-8');
    const serviceAccount = JSON.parse(serviceAccountContent);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    console.error('   Make sure the Firebase service account JSON exists and is valid');
    throw error;
  }
}

function resolveServiceAccountPath(): string {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  }

  const candidates = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'taximapma-firebase-adminsdk-fbsvc-d8d2316db9.json')
  ];

  // Auto-detect any firebase admin sdk json in current dir
  try {
    const files = fs.readdirSync(process.cwd());
    const match = files.find((file) =>
      file.endsWith('.json') && file.includes('firebase-adminsdk')
    );
    if (match) {
      candidates.unshift(path.resolve(process.cwd(), match));
    }
  } catch {
    // Ignore errors and rely on candidates
  }

  const found = candidates.find((filePath) => fs.existsSync(filePath));
  if (!found) {
    throw new Error('Firebase service account JSON not found');
  }

  return found;
}

export function getFirestore(): admin.firestore.Firestore {
  if (!db) {
    initializeFirebase();
  }
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  return db;
}

/**
 * Add ticker event to Firebase
 */
export async function addTickerEvent(data: {
  type: string;
  name: string;
  val: string;
  risk: number;
}): Promise<void> {
  try {
    const firestore = getFirestore();
    await firestore.collection('ticker_events').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Ticker event added to Firebase');
  } catch (error: any) {
    console.error('❌ Failed to add ticker event:', error.message);
    throw error;
  }
}

/**
 * Update leaderboard
 */
export async function updateLeaderboard(userAddress: string, xp: number): Promise<void> {
  try {
    const firestore = getFirestore();
    const userRef = firestore.collection('leaderboard').doc(userAddress);
    
    await userRef.set({
      address: userAddress,
      xp: admin.firestore.FieldValue.increment(xp),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`✅ Leaderboard updated for ${userAddress}: +${xp} XP`);
  } catch (error: any) {
    console.error('❌ Failed to update leaderboard:', error.message);
    throw error;
  }
}

/**
 * Add mint history entry
 */
export async function addMintHistory(data: {
  userAddress: string;
  txHash: string;
  txUrl: string;
  assetName: string;
  valuation: number;
  riskScore: number;
  mantleDAHash: string;
}): Promise<void> {
  try {
    const firestore = getFirestore();
    await firestore.collection('mint_history').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Mint history added');
  } catch (error: any) {
    console.error('❌ Failed to add mint history:', error.message);
    throw error;
  }
}

/**
 * Get mint history for a user
 */
export async function getMintHistory(userAddress: string, limit: number = 20): Promise<any[]> {
  const firestore = getFirestore();
  const snapshot = await firestore
    .collection('mint_history')
    .where('userAddress', '==', userAddress)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

