/**
 * Assets Page
 * Displays user's minted assets (placeholder summary for now)
 */
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type HistoryItem = {
  id: string;
  txHash: string;
  txUrl?: string;
  assetName: string;
  valuation: number;
  riskScore: number;
  mantleDAHash: string;
  timestamp?: { seconds?: number };
};

export default function Assets() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const privyWallet = ready ? wallets.find(w => w.walletClientType === 'privy') : undefined;
  const address = privyWallet?.address;

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/mint-history/${address}?limit=25`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load assets');
        }
        return res.json();
      })
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || 'Failed to load assets'))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <main className="container mx-auto px-4 py-12 pt-16">
      <div className="mb-10">
        <h1 className="text-3xl font-mono text-primary mb-2">Assets</h1>
        <p className="text-gray-400">Your minted RWAs, listed like a portfolio.</p>
      </div>

      {!ready && (
        <div className="text-gray-500">Initializing Privy...</div>
      )}

      {ready && !authenticated && (
        <div className="text-gray-400">
          Please login to view your assets.
          <button
            onClick={() => login()}
            className="ml-3 px-4 py-2 bg-primary text-background font-mono text-xs font-bold rounded"
          >
            LOGIN
          </button>
        </div>
      )}

      {ready && authenticated && !address && (
        <div className="text-gray-400">No embedded wallet found.</div>
      )}

      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      {loading && (
        <div className="text-gray-500">Loading assets...</div>
      )}

      {!loading && !error && items.length === 0 && authenticated && (
        <div className="text-gray-500">No assets yet. Mint one to see it here.</div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border border-primary/30 bg-background-secondary p-5">
              <div className="text-lg font-mono text-primary mb-2">{item.assetName}</div>
              <div className="text-sm text-gray-400 mb-3">
                Valuation: ${Math.round(item.valuation / 1000)}k • Risk: {item.riskScore}%
              </div>
              <div className="text-xs text-gray-500 break-all">
                Tx: {item.txHash}
              </div>
              {item.txUrl && (
                <a
                  href={item.txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-xs mt-2 inline-block"
                >
                  View on Explorer →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

