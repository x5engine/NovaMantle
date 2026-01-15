/**
 * Transaction History Page
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

export default function TxHistory() {
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
          throw new Error(data.error || 'Failed to load history');
        }
        return res.json();
      })
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <main className="container mx-auto px-4 py-12 pt-16">
      <div className="mb-10">
        <h1 className="text-3xl font-mono text-primary mb-2">Tx History</h1>
        <p className="text-gray-400">Live ledger of your mint activity.</p>
      </div>

      {!ready && (
        <div className="text-gray-500">Initializing Privy...</div>
      )}

      {ready && !authenticated && (
        <div className="text-gray-400">
          Please login to view your history.
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
        <div className="text-gray-500">Loading history...</div>
      )}

      {!loading && !error && items.length === 0 && authenticated && (
        <div className="text-gray-500">No history yet. Mint an asset to see a record.</div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-primary/30 bg-background-secondary p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-400">Asset</div>
                <div className="text-primary font-mono">{item.assetName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Valuation</div>
                <div className="text-white">${Math.round(item.valuation / 1000)}k</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Risk</div>
                <div className="text-white">{item.riskScore}%</div>
              </div>
              <div className="text-xs text-gray-500 break-all">
                {item.txHash}
              </div>
              {item.txUrl && (
                <a
                  href={item.txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-xs"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

