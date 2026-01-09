# 🔗 Mantle Network Resources & Links

> **Complete technical reference for Mantle Sepolia Testnet and Mainnet**

---

## 🌐 Network Configuration

### Mantle Sepolia Testnet
| Property | Value |
|----------|-------|
| **RPC URL** | `https://rpc.sepolia.mantle.xyz` |
| **Chain ID** | `5003` (0x138b) |
| **Currency Symbol** | `MNT` |
| **Block Explorer** | https://sepolia.mantlescan.xyz<br>https://explorer.sepolia.mantle.xyz |
| **WSS Endpoint** | `wss://mantle-sepolia.drpc.org` |
| **Faucet** | https://faucet.testnet.mantle.xyz |
| **Bridge UI** | https://bridge.testnet.mantle.xyz |

### Mantle Mainnet
| Property | Value |
|----------|-------|
| **RPC URL** | `https://rpc.mantle.xyz` |
| **Chain ID** | `5000` |
| **Currency Symbol** | `MNT` |
| **Block Explorer** | https://explorer.mantle.xyz<br>https://mantlescan.xyz |

---

## 📦 Essential SDKs & Packages

### 1. Core Network SDK
**Package:** `@mantlenetworkio/sdk`

**Installation:**
```bash
npm install @mantlenetworkio/sdk
```

**Key Features:**
- Cross-chain messaging
- Bridging utilities
- L2 gas estimation (`estimateTotalGasCost`)
- Transaction fee model utilities

**Documentation:** [Mantle SDK Docs](https://docs.mantle.xyz/sdk)

---

### 2. Mantle AI Agent SDK
**Package:** `@mantle-agent-sdk/core`

**Installation:**
```bash
npm install @mantle-agent-sdk/core
```

**Key Features:**
- Agent orchestration
- LLM integration (OpenAI, Gemini)
- Tool calling system
- Mantle DA integration
- Reasoning loops

**Usage:**
```typescript
import { Agent, GeminiProvider } from "@mantle-agent-sdk/core";

const agent = new Agent(
  config,
  new GeminiProvider(API_KEY),
  // ... other providers/observers
);
```

**Documentation:** [Mantle Agent SDK](https://docs.mantle.xyz/agent-sdk)

**Note:** Early/Hackathon tooling. Requires LLM API key (OpenAI or Gemini).

---

### 3. Viem (Standard Web3 Library)
**Package:** `viem`

**Installation:**
```bash
npm install viem
```

**Mantle Chain Definitions:**
```typescript
import { mantleSepolia } from 'viem/chains';
import { mantle } from 'viem/chains'; // Mainnet
```

**Key Features:**
- EIP-712 signing (`signTypedData`)
- Signature verification (`verifyTypedData`)
- Contract interactions
- Chain configuration

**Documentation:** [Viem Docs](https://viem.sh)

---

## 🔐 Critical Contract Addresses

### Mantle Sepolia Testnet

#### Bridge Contracts (L1 Sepolia → L2 Mantle Sepolia)
| Contract | Address |
|---------|---------|
| **L1 Standard Bridge** | `0x21F308067241B2028503c07bd7cB3751FFab0Fb2` |
| **L1 Cross Domain Messenger** | `0x37dAC5312e31Adb8BB0802Fc72Ca84DA5cDfcb4c` |

#### Token Addresses (On L2 Mantle Sepolia)
| Token | Address | Notes |
|-------|---------|-------|
| **WETH** (Wrapped Ether) | `0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111` | On Mantle, MNT is native gas token. ETH exists as ERC-20. |
| **USDT** (Testnet) | `0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE` | Test token |
| **USDC** (Testnet) | `0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9` | Test token |
| **MNT** (L2 Native) | `0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000` | Predeployed native token |

### Mantle Mainnet

#### Token Addresses
| Token | Address | Notes |
|-------|---------|-------|
| **Ondo USDY** | `0x5bE26527e817999639B563495F53bb94D253d891` | Base Yield Asset for RWA |
| **mETH** | `0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa` | Staked ETH (Optional Collateral) |

---

## 🛠 Tools & Utilities

### Faucets
- **Mantle Testnet Faucet:** https://faucet.testnet.mantle.xyz
  - Requires small amount of Sepolia ETH on L1 to cover gas for minting MNT

### Bridge Interfaces
- **Testnet Bridge:** https://bridge.testnet.mantle.xyz
  - Use this UI to move Sepolia ETH to Mantle Sepolia MNT if faucet is dry
- **Mainnet Bridge:** https://bridge.mantle.xyz

### Block Explorers
- **Testnet:**
  - https://sepolia.mantlescan.xyz
  - https://explorer.sepolia.mantle.xyz
- **Mainnet:**
  - https://explorer.mantle.xyz
  - https://mantlescan.xyz

### ChainList
- **Mantle Sepolia:** https://chainlist.org/chain/5003
- **Mantle Mainnet:** https://chainlist.org/chain/5000

---

## 📚 Documentation Links

### Official Documentation
- [Mantle Network Docs](https://docs.mantle.xyz)
- [Mantle SDK Documentation](https://docs.mantle.xyz/sdk)
- [Mantle Agent SDK](https://docs.mantle.xyz/agent-sdk)
- [Mantle Bridge FAQ](https://bridge.mantle.xyz/faq)

### GitHub Resources
- [Mantle Tutorial Repository](https://github.com/mantlenetworkio/mantle-tutorial)
- [Mantle SDK NPM Package](https://www.npmjs.com/package/@mantlenetworkio/sdk)
- [Mantle Agent SDK NPM Package](https://www.npmjs.com/package/@mantle-agent-sdk/core)

### Community Resources
- [Mantle Discord](https://discord.gg/mantle)
- [Mantle Twitter](https://twitter.com/0xMantle)
- [Mantle Blog](https://www.mantle.xyz/blog)

---

## 🔧 Quick Setup Examples

### Viem Configuration (Testnet)
```typescript
import { createPublicClient, http } from 'viem';
import { mantleSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: mantleSepolia,
  transport: http('https://rpc.sepolia.mantle.xyz')
});
```

### Viem Configuration (Mainnet)
```typescript
import { createPublicClient, http } from 'viem';
import { mantle } from 'viem/chains';

const client = createPublicClient({
  chain: mantle,
  transport: http('https://rpc.mantle.xyz')
});
```

### Hardhat Configuration
```typescript
// hardhat.config.ts
networks: {
  mantleTestnet: {
    url: "https://rpc.sepolia.mantle.xyz",
    chainId: 5003,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
  mantle: {
    url: "https://rpc.mantle.xyz",
    chainId: 5000,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
}
```

### Gas Estimation (Mantle SDK)
```typescript
import { estimateTotalGasCost } from '@mantlenetworkio/sdk';

const gasCost = await estimateTotalGasCost(rpcUrl, {
  to: contractAddress,
  data: encodedData
});
```

---

## 🚨 Important Notes

1. **Native Token:** MNT is the native gas token on Mantle. ETH exists as an ERC-20 token.

2. **Bridging:** To get MNT on testnet:
   - Use faucet (requires Sepolia ETH on L1)
   - Or use bridge UI to bridge Sepolia ETH → Mantle Sepolia MNT

3. **Agent SDK:** Currently in early/hackathon phase. Requires LLM API key.

4. **Gas Costs:** Use `estimateTotalGasCost` from Mantle SDK to calculate L1 + L2 fees.

5. **Chain IDs:**
   - Testnet: `5003` (0x138b)
   - Mainnet: `5000`

---

## 📝 Environment Variables Template

```bash
# Mantle Network Configuration
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
MANTLE_CHAIN_ID=5003
MANTLE_EXPLORER_URL=https://sepolia.mantlescan.xyz

# For Mainnet
# MANTLE_RPC_URL=https://rpc.mantle.xyz
# MANTLE_CHAIN_ID=5000
# MANTLE_EXPLORER_URL=https://explorer.mantle.xyz

# Contract Addresses (Testnet)
L1_STANDARD_BRIDGE=0x21F308067241B2028503c07bd7cB3751FFab0Fb2
L1_CROSS_DOMAIN_MESSENGER=0x37dAC5312e31Adb8BB0802Fc72Ca84DA5cDfcb4c
WETH_ADDRESS=0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111

# Contract Addresses (Mainnet)
ONDO_USDY_ADDRESS=0x5bE26527e817999639B563495F53bb94D253d891
METH_ADDRESS=0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa
```

---

*Last Updated: [Auto-generated]*
*For latest information, check [Mantle Documentation](https://docs.mantle.xyz)*
