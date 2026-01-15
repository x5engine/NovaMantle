/**
 * Cyber Ticker Component
 * Displays live asset feed from Firebase
 */
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TickerEvent {
  type: string;
  name: string;
  val: string;
  risk: number;
  timestamp: any;
}

export default function CyberTicker() {
  const [assets, setAssets] = useState<TickerEvent[]>([]);

  useEffect(() => {
    // Listen to Firebase in real-time
    const q = query(
      collection(db, 'ticker_events'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveData = snapshot.docs.map(doc => {
          const data = doc.data() as TickerEvent;
          return {
            ...data,
            id: doc.id
          };
        });
        console.log('📊 Ticker events received:', liveData.length);
        if (liveData.length === 0) {
          console.log('ℹ️  No ticker events yet. Events will appear when assets are minted.');
        }
        setAssets(liveData);
      },
      (error) => {
        console.error('❌ Firebase ticker error:', error);
        console.error('   Make sure Firebase is configured correctly in firebaseConfig.js');
        // Show error in ticker
        setAssets([{
          type: '⚠️',
          name: 'Firebase Error',
          val: 'Check console',
          risk: 0,
          timestamp: new Date()
        }]);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full border-b border-primary bg-background-secondary h-12 flex items-center overflow-hidden font-mono text-sm uppercase shadow-neon">
      <div className="px-6 bg-primary/20 h-full flex items-center text-primary font-bold border-r border-primary z-20 backdrop-blur-sm">
        <span className="animate-pulse mr-2">●</span> LIVE FEED
      </div>
      <Marquee gradient={false} speed={40} className="z-10">
        {assets.length > 0 ? (
          assets.map((asset, i) => (
            <div key={i} className="mx-8 flex items-center space-x-3 text-base">
              <span className="text-xl">{asset.type}</span>
              <span className="text-white font-bold tracking-wider">{asset.name}</span>
              <span className="text-primary text-shadow-neon">{asset.val}</span>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  asset.risk > 50
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                RISK: {asset.risk}%
              </span>
            </div>
          ))
        ) : (
          <div className="mx-8 text-gray-500">No assets yet...</div>
        )}
      </Marquee>
    </div>
  );
}

