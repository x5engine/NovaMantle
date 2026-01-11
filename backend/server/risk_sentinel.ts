/**
 * Risk Sentinel
 * Automated risk monitoring and updates
 * Runs periodically to check asset risks and update on-chain
 */
import { consultRiskModel } from './tools/consult_risk_model';
import { updateAssetRisk } from './contract_client';
import { getFirestore } from './firebase_client';
import * as admin from 'firebase-admin';

const PYTHON_SAAS_URL = process.env.PYTHON_SAAS_URL || 'http://localhost:5000';
const CHECK_INTERVAL = parseInt(process.env.RISK_CHECK_INTERVAL || '3600000'); // 1 hour default

interface Asset {
  id: string;
  assetId: bigint;
  name: string;
  currentRisk: number;
  lastChecked: Date;
}

/**
 * Check and update risk for a single asset
 */
async function checkAssetRisk(asset: Asset): Promise<void> {
  try {
    console.log(`🔍 Checking risk for asset ${asset.id} (${asset.name})...`);

    // Call Python SaaS for updated risk
    const riskData = await consultRiskModel(PYTHON_SAAS_URL, {
      asset_type: 'invoice', // TODO: Get actual asset type
      valuation: 0 // TODO: Get actual valuation
    });

    const newRisk = riskData.risk_score;
    const riskIncrease = newRisk - asset.currentRisk;

    console.log(`   Current risk: ${asset.currentRisk}%, New risk: ${newRisk}%`);

    // If risk increased significantly (more than 10 points), update on-chain
    if (riskIncrease > 10) {
      console.log(`   ⚠️  Risk increased by ${riskIncrease}%. Updating on-chain...`);
      
      try {
        await updateAssetRisk(asset.assetId, newRisk);
        console.log(`   ✅ Risk updated on-chain to ${newRisk}%`);
        
        // Update in Firebase
        const firestore = getFirestore();
        await firestore.collection('assets').doc(asset.id).update({
          riskScore: newRisk,
          lastRiskCheck: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error: any) {
        console.error(`   ❌ Failed to update risk on-chain: ${error.message}`);
      }
    } else {
      console.log(`   ✅ Risk change is acceptable (${riskIncrease}%), no update needed`);
    }
  } catch (error: any) {
    console.error(`❌ Error checking asset ${asset.id}:`, error.message);
  }
}

/**
 * Get all active assets from Firebase
 */
async function getActiveAssets(): Promise<Asset[]> {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore
      .collection('assets')
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        assetId: BigInt(data.assetId || 0),
        name: data.name || 'Unknown',
        currentRisk: data.riskScore || 0,
        lastChecked: data.lastRiskCheck?.toDate() || new Date(0)
      };
    });
  } catch (error: any) {
    console.error('❌ Failed to get active assets:', error.message);
    return [];
  }
}

/**
 * Run risk check for all assets
 */
export async function runRiskCheck(): Promise<void> {
  console.log('🛡️  Risk Sentinel: Starting risk check...');
  
  try {
    const assets = await getActiveAssets();
    console.log(`   Found ${assets.length} active assets to check`);

    if (assets.length === 0) {
      console.log('   No assets to check');
      return;
    }

    // Check each asset
    for (const asset of assets) {
      await checkAssetRisk(asset);
      // Small delay between checks to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Risk Sentinel: Check complete');
  } catch (error: any) {
    console.error('❌ Risk Sentinel error:', error.message);
  }
}

/**
 * Start Risk Sentinel loop
 */
export function startRiskSentinel(): void {
  console.log(`🛡️  Risk Sentinel: Starting with ${CHECK_INTERVAL / 1000}s interval`);
  
  // Run immediately
  runRiskCheck().catch(console.error);

  // Then run on interval
  setInterval(() => {
    runRiskCheck().catch(console.error);
  }, CHECK_INTERVAL);
}

