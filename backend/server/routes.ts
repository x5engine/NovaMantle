/**
 * API Routes Documentation
 * All available endpoints in the MantleForge backend
 */

/**
 * GET /api/health
 * Health check endpoint
 * 
 * Response:
 * {
 *   status: 'healthy',
 *   service: 'mantle-forge-backend',
 *   chainId: 5003,
 *   rpcUrl: 'https://rpc.sepolia.mantle.xyz'
 * }
 */

/**
 * POST /mint-intent
 * Main minting endpoint - processes EIP-712 signed mint requests
 * 
 * Request Body:
 * {
 *   signature: '0x...', // EIP-712 signature
 *   assetData: {
 *     name: string,
 *     valuation: string, // BigInt as string
 *     riskScore: number,
 *     mantleDAHash: string,
 *     pdfText?: string, // Optional PDF text for AI analysis
 *     pdfData?: string, // Optional PDF data for Mantle DA upload
 *     assetType?: string // Optional asset type
 *   },
 *   userAddress: '0x...' // User's wallet address
 * }
 * 
 * Response:
 * {
 *   txHash: '0x...', // Transaction hash
 *   mantleDA_Log: '0x...', // Mantle DA blob hash
 *   gasEstimate: string,
 *   riskScore: number,
 *   valuation: number
 * }
 * 
 * Errors:
 * - 401: Invalid signature
 * - 500: Server error
 */

/**
 * GET /api/status
 * Get backend status and configuration
 * 
 * Response:
 * {
 *   status: 'operational',
 *   chainId: 5003,
 *   contractAddress: '0x...',
 *   agentAddress: '0x...',
 *   firebaseEnabled: boolean,
 *   embedapiEnabled: boolean
 * }
 */

