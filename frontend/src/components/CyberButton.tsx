/**
 * Cyber Button Component
 * Main minting interface with EIP-712 signing using Privy
 */
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth';
// Removed useChainId - we use env var chainId to match backend
import { createWalletClient, custom, type Address } from 'viem';
import { mantleSepolia } from '../lib/wagmiConfig';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet: createEmbeddedWallet } = useCreateWallet();
  // Don't use wallet's chainId - use env var to match backend
  
  const [status, setStatus] = useState<Status>('IDLE');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  // CRITICAL: Wait for Privy to be ready before accessing wallets
  // CRITICAL: Get Privy embedded wallet ONLY (ignore MetaMask/external wallets)
  const privyWallet = ready ? wallets.find(w => w.walletClientType === 'privy') : undefined;
  
  // Function to manually create embedded wallet if it doesn't exist
  const handleCreateWallet = async () => {
    if (!ready || !authenticated || isCreatingWallet) return;
    
    try {
      setIsCreatingWallet(true);
      setError(null);
      console.log('🔄 Creating embedded wallet...');
      await createEmbeddedWallet();
      console.log('✅ Embedded wallet creation initiated');
    } catch (err: any) {
      console.error('❌ Failed to create embedded wallet:', err);
      setError(err.message || 'Failed to create wallet. Please try again.');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Auto-try to create wallet if authenticated but no wallet exists after 3 seconds
  useEffect(() => {
    if (ready && authenticated && !privyWallet && !isCreatingWallet) {
      const timer = setTimeout(async () => {
        console.log('⏳ Auto-creating embedded wallet (waited 3 seconds)...');
        try {
          setIsCreatingWallet(true);
          setError(null);
          await createEmbeddedWallet();
          console.log('✅ Embedded wallet creation initiated');
        } catch (err: any) {
          console.error('❌ Failed to create embedded wallet:', err);
          setError(err.message || 'Failed to create wallet. Please try again.');
        } finally {
          setIsCreatingWallet(false);
        }
      }, 3000); // Wait 3 seconds for automatic creation, then try manual
      
      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, privyWallet, isCreatingWallet, createEmbeddedWallet]);
  
  // Only use Privy wallet address - DO NOT use wagmi's useAccount (it connects to MetaMask)
  const userAddress = privyWallet?.address as `0x${string}` | undefined;
  
  // Log wallet info for debugging (only in development and when ready)
  if (import.meta.env.DEV && ready) {
    if (authenticated) {
      if (wallets.length > 0) {
        const walletInfo = wallets.map(w => ({
          address: w.address,
          type: w.walletClientType,
          isPrivy: w.walletClientType === 'privy'
        }));
        console.log('📊 Available wallets:', walletInfo);
        
        if (privyWallet) {
          console.log('✅ Privy embedded wallet found:', privyWallet.address);
        } else {
          console.warn('⚠️ User authenticated but no Privy embedded wallet yet. Wallet may still be initializing...');
        }
      } else {
        console.warn('⚠️ User authenticated but no wallets found. Wallet may still be initializing...');
      }
    }
  }

  // EIP-712 Domain (CRITICAL: Must match backend domain exactly)
  // Use environment variable chainId, NOT wallet chainId, to ensure consistency
  const domain = useMemo(() => {
    const envChainId = parseInt(import.meta.env.VITE_MANTLE_CHAIN_ID || '5003');
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    if (import.meta.env.DEV) {
      console.log('🔧 EIP-712 Domain config:', {
        chainId: envChainId,
        contractAddress,
        note: 'Using env var chainId to match backend (not wallet chainId)'
      });
    }
    
    return {
      name: 'MantleForge',
      version: '1',
      chainId: envChainId, // Use env var (5003), not wallet chainId
      verifyingContract: contractAddress as `0x${string}`
    } as const;
  }, []); // No dependencies - always use env var

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
    // CRITICAL: Check Privy ready state first (per Privy docs)
    if (!ready) {
      setError('Privy is initializing. Please wait...');
      return;
    }

    if (!authenticated) {
      login();
      return;
    }

    // Check for Privy embedded wallet
    if (!privyWallet) {
      setError('No Privy embedded wallet found. Please login with email to create one.');
      return;
    }

    if (!userAddress) {
      setError('No wallet address available');
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

      // Sign EIP-712 message using Privy wallet ONLY (NOT MetaMask)
      setIsSigning(true);
      
      if (!privyWallet) {
        throw new Error('No Privy embedded wallet connected. Please login with email to create a Privy wallet.');
      }

      // CRITICAL: Verify it's actually a Privy wallet, not MetaMask
      if (privyWallet.walletClientType !== 'privy') {
        throw new Error('Only Privy embedded wallets are supported. Please use email login to create a Privy wallet.');
      }

      if (import.meta.env.DEV) {
        console.log('✅ Using Privy embedded wallet:', privyWallet.address);
      }

      // Get Privy wallet's ethereum provider
      const ethereumProvider = await privyWallet.getEthereumProvider();
      
      // Create wallet client from Privy provider
      const walletClient = createWalletClient({
        chain: mantleSepolia,
        transport: custom(ethereumProvider)
      });

      // Get account from Privy wallet
      const accounts = await walletClient.getAddresses();
      const account = accounts[0] as Address;

      if (!account) {
        throw new Error('No account found in Privy wallet');
      }

      // Verify account matches Privy wallet address (not MetaMask)
      if (account.toLowerCase() !== privyWallet.address.toLowerCase()) {
        throw new Error(`Account mismatch! Expected Privy wallet ${privyWallet.address}, got ${account}. This might be MetaMask.`);
      }

      if (import.meta.env.DEV) {
        console.log('✅ Signing with Privy wallet:', account);
      }

      // Prepare message for signing (must match EIP-712 types exactly)
      const messageToSign = {
        name: mintRequest.name,
        valuation: mintRequest.valuation, // Already BigInt
        riskScore: BigInt(mintRequest.riskScore), // Convert to BigInt
        mantleDAHash: mintRequest.mantleDAHash || '0x'
      };

      if (import.meta.env.DEV) {
        console.log('📝 Signing EIP-712 message:', {
          domain,
          message: {
            name: messageToSign.name,
            valuation: messageToSign.valuation.toString(),
            riskScore: messageToSign.riskScore.toString(),
            mantleDAHash: messageToSign.mantleDAHash
          },
          account
        });
      }

      // Sign using Privy wallet (via walletClient)
      const signature = await walletClient.signTypedData({
        account,
        domain,
        types,
        primaryType: 'MintRequest',
        message: messageToSign
      });

      setIsSigning(false);

      if (!signature) {
        throw new Error('Failed to sign request');
      }

      setStatus('MINTING');

      // Send to backend
      // IMPORTANT: Send the exact message structure that was signed
      // The backend will extract only the EIP-712 fields for verification
      const payload = {
        signature,
          assetData: {
            // EIP-712 message fields (must match what was signed)
            name: mintRequest.name,
            valuation: mintRequest.valuation.toString(), // Convert BigInt to string for JSON
            riskScore: BigInt(mintRequest.riskScore).toString(), // Ensure it's converted to string
            mantleDAHash: mintRequest.mantleDAHash,
            // Additional fields for backend processing
            pdfText: analysisResult.pdf_text || '', // Send PDF text if available from analysis
            assetType: analysisResult.asset_type || 'invoice' // Use asset type from analysis
          },
        userAddress
      };

      if (import.meta.env.DEV) {
        console.log('📤 Sending mint request:', {
          userAddress,
          domain,
          message: {
            name: mintRequest.name,
            valuation: mintRequest.valuation.toString(),
            riskScore: BigInt(mintRequest.riskScore).toString(),
            mantleDAHash: mintRequest.mantleDAHash
          },
          signature: signature.slice(0, 20) + '...'
        });
      }

      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('SUCCESS');
        console.log('Transaction hash:', data.txHash);
        console.log('Mantle DA Log:', data.mantleDA_Log);
        if (data.txUrl) {
          console.log('Explorer link:', data.txUrl);
        }
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
      {/* Show loading state while Privy initializes */}
      {!ready && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 p-8 text-center"
        >
          <div className="text-primary font-mono">Initializing Privy...</div>
        </motion.div>
      )}

      {/* Login Prompt - Show ONLY when NOT authenticated and ready */}
      {ready && !authenticated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-8 border-2 border-primary bg-primary/5 rounded-lg max-w-md mx-auto text-center"
        >
          <div className="mb-4">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-primary font-mono mb-2">Login Required</h3>
            <p className="text-gray-400 text-sm font-mono mb-6">
              Please login with your email to create a Privy embedded wallet and start tokenizing your assets.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={login}
            className="px-8 py-3 bg-primary text-background font-mono font-bold hover:bg-primary/80 transition-colors rounded-lg"
          >
            LOGIN WITH EMAIL
          </motion.button>
        </motion.div>
      )}

      {/* Show message if authenticated but wallet still initializing - with manual create button */}
      {ready && authenticated && !privyWallet && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 border-2 border-primary/50 bg-primary/5 rounded-lg max-w-md mx-auto text-center"
        >
          <div className="text-2xl mb-3">🔐</div>
          <p className="text-primary font-mono text-sm mb-2 font-bold">Create Embedded Wallet</p>
          <p className="text-gray-400 text-xs font-mono mb-4">
            Your Privy embedded wallet needs to be created.
            <br />
            <span className="text-primary mt-2 block">You are logged in as: {user?.email?.address || 'User'}</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateWallet}
            disabled={isCreatingWallet}
            className="px-6 py-2 bg-primary text-background font-mono font-bold hover:bg-primary/80 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingWallet ? 'Creating Wallet...' : 'Create Embedded Wallet'}
          </motion.button>
          {error && (
            <p className="text-red-400 text-xs font-mono mt-2">{error}</p>
          )}
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

      {/* Upload Zone - Show when authenticated AND wallet is ready */}
      {authenticated && privyWallet && (
        <div className="mb-8 text-center">
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
            className={`cursor-pointer inline-block px-8 py-4 border-2 border-primary text-primary font-mono hover:bg-primary/10 transition-colors rounded-lg ${
              status === 'SCANNING' || status === 'MINTING' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {file ? `📄 ${file.name}` : '📤 Upload RWA Document'}
          </label>
          <p className="text-xs text-gray-500 mt-3 font-mono max-w-md mx-auto">
            Upload invoices, property deeds, bonds, or other real-world asset documents.
            <br />
            Our AI analyzes risk & valuation, then tokenizes on Mantle.
          </p>
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
