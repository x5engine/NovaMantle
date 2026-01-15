/**
 * About Page
 * Comprehensive overview of all MantleForge features
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
  const features = [
    {
      icon: '🔐',
      title: 'Gasless Transactions',
      description: 'Sign EIP-712 messages with your Privy embedded wallet. No gas fees for users - the AI Agent pays for all transactions.',
      details: [
        'EIP-712 structured data signing',
        'Privy embedded wallet integration',
        'Zero gas fees for end users',
        'Agent wallet covers transaction costs'
      ]
    },
    {
      icon: '🤖',
      title: 'AI Risk Analysis',
      description: 'Powered by Claude 3.5 Sonnet via EmbedAPI. Intelligent risk scoring and asset valuation for all tokenized RWAs.',
      details: [
        'Claude 3.5 Sonnet AI model',
        'Real-time risk scoring (0-100)',
        'Automated asset valuation',
        'Confidence metrics and reasoning'
      ]
    },
    {
      icon: '📄',
      title: 'PDF Processing',
      description: 'Upload and analyze real-world asset documents. Supports invoices, property deeds, bonds, contracts, and more.',
      details: [
        'Multi-format PDF support',
        'Text and metadata extraction',
        'Structured data parsing',
        'Mantle DA storage integration'
      ]
    },
    {
      icon: '🏭',
      title: 'Asset Tokenization',
      description: 'Mint ERC-1155 yield-bearing tokens on Mantle Network. Transform real-world assets into liquid, tradeable tokens.',
      details: [
        'ERC-1155 token standard',
        'Yield-bearing capabilities',
        'On-chain asset registry',
        'Mantle Network integration'
      ]
    },
    {
      icon: '📊',
      title: 'Real-time Ticker',
      description: 'Live feed of all minted assets with real-time updates via Firebase Firestore. Track market activity instantly.',
      details: [
        'Firebase Firestore real-time sync',
        'Live asset feed',
        'Risk score display',
        'Valuation tracking'
      ]
    },
    {
      icon: '🎮',
      title: 'Gamified XP System',
      description: 'Earn XP for every asset you tokenize. Climb the leaderboard and unlock achievements as you build your portfolio.',
      details: [
        'XP rewards per mint',
        'Global leaderboard',
        'Achievement system',
        'Portfolio tracking'
      ]
    },
    {
      icon: '🛡️',
      title: 'Risk Sentinel',
      description: 'Automated risk monitoring system. Continuously checks asset risks and updates on-chain when significant changes occur.',
      details: [
        'Automated risk checks',
        'On-chain risk updates',
        'Threshold-based alerts',
        'Continuous monitoring'
      ]
    },
    {
      icon: '💾',
      title: 'Mantle DA Storage',
      description: 'Decentralized storage for PDF documents and asset metadata. Permanent, censorship-resistant data storage.',
      details: [
        'Mantle DA integration',
        'PDF document storage',
        'Metadata preservation',
        'Decentralized architecture'
      ]
    },
    {
      icon: '🔗',
      title: 'Smart Contract Integration',
      description: 'Fully deployed and verified smart contracts on Mantle Sepolia. Oracle-based risk updates and treasury management.',
      details: [
        'MantleForgeFactory contract',
        'AI Oracle role system',
        'Treasury management',
        'Role-based access control'
      ]
    },
    {
      icon: '📱',
      title: 'Email Authentication',
      description: 'Simple, secure email-based authentication via Privy. No wallet extensions required - embedded wallets created automatically.',
      details: [
        'Privy email authentication',
        'Automatic wallet creation',
        'No MetaMask required',
        'Seamless user experience'
      ]
    }
  ];

  const techStack = [
    { category: 'Frontend', tech: ['ViteJS', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
    { category: 'Backend', tech: ['Node.js', 'Fastify', 'EmbedAPI', 'Claude 3.5 Sonnet'] },
    { category: 'AI/ML', tech: ['Python', 'Flask', 'PyPDF2', 'pdfplumber', 'Risk Analysis'] },
    { category: 'Blockchain', tech: ['Mantle Network', 'ERC-1155', 'Hardhat', 'viem', 'EIP-712'] },
    { category: 'Infrastructure', tech: ['Firebase', 'Firestore', 'Mantle DA', 'Privy'] }
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold font-mono mb-4 text-primary">
            MANTLEFORGE
          </h1>
          <p className="text-2xl text-gray-400 font-mono mb-6">
            The Gamified RWA Orchestrator
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
            Turn Real-World Assets into Liquid Yield with Arcade-Speed Execution
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-background font-mono font-bold rounded hover:bg-primary/80 transition-colors"
            >
              START TOKENIZING
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold font-mono text-center mb-12 text-primary">
            FEATURES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background-secondary border border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold font-mono text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start">
                      <span className="text-primary mr-2">▸</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold font-mono text-center mb-12 text-primary">
            TECH STACK
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((stack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background-secondary border border-primary/20 rounded-lg p-6"
              >
                <h3 className="text-lg font-bold font-mono text-primary mb-4">
                  {stack.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stack.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 border border-primary/30 rounded text-xs font-mono text-primary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold font-mono text-center mb-12 text-primary">
            HOW IT WORKS
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Login & Connect',
                  description: 'Sign in with your email via Privy. An embedded wallet is automatically created for you - no extensions needed.'
                },
                {
                  step: '2',
                  title: 'Upload Asset Document',
                  description: 'Upload a PDF document (invoice, property deed, bond, contract, etc.) representing your real-world asset.'
                },
                {
                  step: '3',
                  title: 'AI Analysis',
                  description: 'Our AI analyzes your document, extracts key data, calculates risk score, and determines valuation using Claude 3.5 Sonnet.'
                },
                {
                  step: '4',
                  title: 'Sign & Mint',
                  description: 'Sign an EIP-712 message (gasless!) and our AI Agent mints your asset as an ERC-1155 token on Mantle Network.'
                },
                {
                  step: '5',
                  title: 'Track & Earn',
                  description: 'Watch your asset appear in the live ticker, earn XP, and climb the leaderboard. Risk Sentinel monitors your asset continuously.'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-background rounded-full flex items-center justify-center font-bold font-mono text-xl">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold font-mono text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-background-secondary border border-primary/20 rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-mono text-center mb-6 text-primary">
            SMART CONTRACT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Contract Address</div>
              <div className="font-mono text-primary break-all">
                0x3224870fe1ce2F729bEe585Caf54632fC92aa638
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Network</div>
              <div className="font-mono text-primary">
                Mantle Sepolia Testnet (Chain ID: 5003)
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Explorer</div>
              <a
                href="https://sepolia.mantlescan.xyz/address/0x3224870fe1ce2F729bEe585Caf54632fC92aa638"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline break-all"
              >
                View on Mantlescan
              </a>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Status</div>
              <div className="font-mono text-primary">
                ✅ Deployed & Verified
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-primary text-background font-mono font-bold text-lg rounded hover:bg-primary/80 transition-colors"
          >
            START TOKENIZING YOUR ASSETS
          </Link>
        </div>
      </div>
    </div>
  );
}

