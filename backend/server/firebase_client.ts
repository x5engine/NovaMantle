/**
 * Firebase Admin Client
 * Handles Firebase operations from backend
 */
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;

export function initializeFirebase(): void {
  if (db) {
    return; // Already initialized
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  
  try {
    const serviceAccount = require(path.resolve(serviceAccountPath));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    console.error('   Make sure serviceAccountKey.json exists and is valid');
    throw error;
  }
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

