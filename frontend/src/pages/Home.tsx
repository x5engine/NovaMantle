/**
 * Home Page
 */
import CyberTicker from '../components/CyberTicker'
import CyberButton from '../components/CyberButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white">
      <CyberTicker />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold font-mono mb-4 text-primary">
            MANTLEFORGE
          </h1>
          <p className="text-xl text-gray-400 font-mono mb-8">
            The Gamified RWA Orchestrator
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Turn Real-World Assets into Liquid Yield with Arcade-Speed Execution
          </p>
        </div>

        {/* Main CTA */}
        <div className="flex justify-center mb-16">
          <CyberButton />
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="border border-primary/30 p-6 bg-background-secondary">
            <h3 className="text-xl font-mono text-primary mb-2">⚡ One-Click Mint</h3>
            <p className="text-gray-400">Upload PDF, AI analyzes, instant tokenization</p>
          </div>
          <div className="border border-primary/30 p-6 bg-background-secondary">
            <h3 className="text-xl font-mono text-primary mb-2">🎮 Gamified</h3>
            <p className="text-gray-400">Earn XP, climb leaderboards, unlock achievements</p>
          </div>
          <div className="border border-primary/30 p-6 bg-background-secondary">
            <h3 className="text-xl font-mono text-primary mb-2">💰 Gasless</h3>
            <p className="text-gray-400">Agent pays gas, you just sign and mint</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-mono text-primary">$0.02</div>
              <div className="text-sm text-gray-500 mt-2">Avg Gas Cost</div>
            </div>
            <div>
              <div className="text-3xl font-mono text-primary">50 XP</div>
              <div className="text-sm text-gray-500 mt-2">Per Asset Mint</div>
            </div>
            <div>
              <div className="text-3xl font-mono text-primary">~90%</div>
              <div className="text-sm text-gray-500 mt-2">Gas Savings</div>
            </div>
            <div>
              <div className="text-3xl font-mono text-primary">1-Click</div>
              <div className="text-sm text-gray-500 mt-2">Minting Process</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

