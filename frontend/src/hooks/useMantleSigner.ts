/**
 * Hook for EIP-712 signing with Mantle Network
 */
import { useState } from 'react';
import { signTypedData } from 'viem';
import { createWallet, eip712Domain, eip712Types } from '../lib/viem';
import { useAccount, useWalletClient } from 'wagmi';

export interface MintRequest {
  name: string;
  valuation: bigint;
  riskScore: number;
  mantleDAHash: string;
}

export function useMantleSigner() {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signMintRequest = async (request: MintRequest): Promise<`0x${string}` | null> => {
    setIsSigning(true);
    setError(null);

    try {
      // Get wallet client
      const wallet = createWallet();
      const [account] = await wallet.getAddresses();

      if (!account) {
        throw new Error('No account connected');
      }

      // Sign typed data (EIP-712)
      const signature = await signTypedData({
        account,
        domain: eip712Domain,
        types: eip712Types,
        primaryType: 'MintRequest',
        message: {
          name: request.name,
          valuation: request.valuation,
          riskScore: BigInt(request.riskScore),
          mantleDAHash: request.mantleDAHash
        }
      });

      return signature;
    } catch (err: any) {
      setError(err.message || 'Failed to sign request');
      console.error('Signing error:', err);
      return null;
    } finally {
      setIsSigning(false);
    }
  };

  return {
    signMintRequest,
    isSigning,
    error
  };
}

