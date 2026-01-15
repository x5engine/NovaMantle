import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { config } from './lib/wagmiConfig';
import Navbar from './components/Navbar';
import CyberTicker from './components/CyberTicker';
import Home from './pages/Home';
import About from './pages/About';
import Assets from './pages/Assets';
import TxHistory from './pages/TxHistory';
import './App.css';

const queryClient = new QueryClient();

// Get Privy App ID from environment
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

// Validate Privy App ID
if (!PRIVY_APP_ID || PRIVY_APP_ID.trim() === '') {
  console.error('❌ VITE_PRIVY_APP_ID is not set in .env file');
}

function App() {
  // Don't render if Privy App ID is missing
  if (!PRIVY_APP_ID || PRIVY_APP_ID.trim() === '') {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-gray-400">VITE_PRIVY_APP_ID is not set in .env file</p>
          <p className="text-sm text-gray-500 mt-2">Please check frontend/.env</p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID.trim()}
      config={{
        // Email-only authentication (no Google/Apple)
        loginMethods: ['email'],
        appearance: {
          theme: 'dark',
          accentColor: '#00ff41', // Green cyber theme
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        // CRITICAL: Disable external wallets to prevent MetaMask
        externalWallets: {
          // Disable all external wallet connectors
          coinbaseWallet: {
            connectionOptions: 'smartWalletOnly', // Only smart wallets, not direct
          },
          walletConnect: {
            connectionOptions: 'smartWalletOnly',
          },
        },
        // Don't show wallet list - only embedded wallets
        walletList: [],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-white grid grid-rows-[3rem_auto_1fr]">
              <div className="sticky top-0 z-50">
                <CyberTicker />
                <Navbar />
              </div>
              <div>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<About />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/history" element={<TxHistory />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}

export default App;
