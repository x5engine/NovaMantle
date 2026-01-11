import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmiConfig';
import CyberTicker from './components/CyberTicker';
import CyberButton from './components/CyberButton';
import './App.css';

const queryClient = new QueryClient();

// Get Privy App ID from environment
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Email-only authentication (no Google/Apple)
        loginMethods: ['email'],
        appearance: {
          theme: 'dark',
          accentColor: '#00ff41', // Green cyber theme
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-background text-white">
            <CyberTicker />
            <main className="container mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <h1 className="text-6xl font-bold font-mono mb-4 text-primary">
                  MANTLEFORGE
                </h1>
                <p className="text-xl text-gray-400 font-mono">
                  The Gamified RWA Orchestrator
                </p>
              </div>
              
              <CyberButton />
            </main>
          </div>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}

export default App;
