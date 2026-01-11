/**
 * Cyber Button Component
 * Main minting interface with EIP-712 signing using Privy
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSignTypedData } from 'wagmi';
import { mantleSepolia } from '../lib/wagmiConfig';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// EIP-712 Domain (must match backend)
const domain = {
  name: 'MantleForge',
  version: '1',
  chainId: 5003,
  verifyingContract: import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
} as const;

const types = {
  MintRequest: [
    { name: 'name', type: 'string' },
    { name: 'valuation', type: 'uint256' },
    { name: 'riskScore', type: 'uint256' },
    { name: 'mantleDAHash', type: 'string' }
  ]
} as const;

type Status = 'IDLE' | 'SCANNING' | 'MINT_READY' | 'SIGNING' | 'MINTING' | 'SUCCESS' | 'ERROR';

export default function CyberButton() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  
  const [status, setStatus] = useState<Status>('IDLE');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Get user's wallet address
  const userAddress = wallets[0]?.address as `0x${string}` | undefined;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setFile(selectedFile);
    setStatus('SCANNING');
    setError(null);

    try {
      // Upload PDF to Python SaaS for analysis
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const pythonSaaSUrl = import.meta.env.VITE_PYTHON_SAAS_URL || 'http://localhost:5000';
      const response = await fetch(`${pythonSaaSUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setStatus('MINT_READY');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze PDF');
      setStatus('ERROR');
    }
  };

  const handleMint = async () => {
    // Check authentication
    if (!ready) {
      setError('Privy not ready');
      return;
    }

    if (!authenticated) {
      login();
      return;
    }

    if (!userAddress) {
      setError('No wallet connected');
      return;
    }

    if (!file || !analysisResult) {
      setError('Please upload and analyze a PDF first');
      return;
    }

    try {
      setStatus('SIGNING');
      setError(null);

      // Prepare mint request
      const mintRequest = {
        name: file.name.replace('.pdf', ''),
        valuation: BigInt(analysisResult.valuation || 150000),
        riskScore: analysisResult.risk_score || 15,
        mantleDAHash: analysisResult.mantleDAHash || '0x'
      };

      // Sign EIP-712 message (gasless)
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'MintRequest',
        message: {
          name: mintRequest.name,
          valuation: mintRequest.valuation,
          riskScore: BigInt(mintRequest.riskScore),
          mantleDAHash: mintRequest.mantleDAHash
        }
      });

      if (!signature) {
        throw new Error('Failed to sign request');
      }

      setStatus('MINTING');

      // Send to backend
      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          assetData: {
            ...mintRequest,
            valuation: mintRequest.valuation.toString(),
            riskScore: mintRequest.riskScore,
            pdfText: '', // Backend will handle PDF if needed
            assetType: 'invoice' // Default, can be extracted from analysis
          },
          userAddress
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('SUCCESS');
        console.log('Transaction hash:', data.txHash);
        console.log('Mantle DA Log:', data.mantleDA_Log);
      } else {
        throw new Error(data.error || 'Minting failed');
      }
    } catch (err: any) {
      setStatus('ERROR');
      setError(err.message || 'Minting failed');
      console.error('Mint error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      {/* Login Prompt */}
      {!authenticated && ready && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 border-2 border-primary bg-primary/10 rounded-lg"
        >
          <p className="text-primary font-mono mb-4">Connect your wallet to continue</p>
          <button
            onClick={login}
            className="px-6 py-2 bg-primary text-background font-mono font-bold hover:bg-primary/80 transition-colors"
          >
            CONNECT WALLET
          </button>
        </motion.div>
      )}

      {/* Hacking Text Effect */}
      {status === 'SCANNING' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-primary mb-8 whitespace-pre text-center"
        >
          {`> ESTABLISHING SECURE LINK...\n> UPLOADING TO MANTLE DA...\n> AI VERIFYING ASSET...`}
        </motion.div>
      )}

      {/* Upload Zone */}
      {authenticated && (
        <div className="mb-8">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
            disabled={status === 'SCANNING' || status === 'MINTING'}
          />
          <label
            htmlFor="pdf-upload"
            className={`cursor-pointer px-6 py-3 border-2 border-primary text-primary font-mono hover:bg-primary/10 transition-colors ${
              status === 'SCANNING' || status === 'MINTING' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {file ? `📄 ${file.name}` : '📤 Upload PDF'}
          </label>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && status === 'MINT_READY' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 border border-primary/50 bg-primary/5 rounded-lg font-mono text-sm"
        >
          <div className="space-y-2">
            <div>💰 Valuation: ${(analysisResult.valuation / 1000).toFixed(0)}k</div>
            <div>⚠️ Risk Score: {analysisResult.risk_score}%</div>
            <div>📊 Confidence: {(analysisResult.confidence * 100).toFixed(0)}%</div>
          </div>
        </motion.div>
      )}

      {/* The Button */}
      <motion.button
        whileHover={status !== 'IDLE' && status !== 'SCANNING' && !isSigning ? { scale: 1.05, boxShadow: '0px 0px 30px rgb(0, 255, 65)' } : {}}
        whileTap={status !== 'IDLE' && status !== 'SCANNING' && !isSigning ? { scale: 0.95 } : {}}
        onClick={handleMint}
        disabled={
          !authenticated ||
          status === 'IDLE' ||
          status === 'SCANNING' ||
          isSigning ||
          status === 'MINTING' ||
          !file ||
          !analysisResult
        }
        className="w-72 h-72 rounded-full border-4 border-primary bg-background text-primary text-2xl font-bold tracking-widest relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-all" />
        {!authenticated && 'CONNECT'}
        {authenticated && status === 'IDLE' && 'INITIALIZE'}
        {status === 'SCANNING' && 'SCANNING...'}
        {status === 'MINT_READY' && 'MINT'}
        {status === 'SIGNING' && 'SIGNING...'}
        {status === 'MINTING' && 'MINTING...'}
        {status === 'SUCCESS' && 'SUCCESS!'}
        {status === 'ERROR' && 'ERROR'}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-red-500 font-mono text-sm max-w-md text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Success Message */}
      {status === 'SUCCESS' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-primary font-mono text-sm"
        >
          ✅ Asset minted successfully!
        </motion.div>
      )}
    </div>
  );
}
