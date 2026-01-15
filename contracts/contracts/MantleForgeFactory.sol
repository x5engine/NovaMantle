// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for Ondo USDY (or any Yield Token on Mantle)
interface IYieldToken {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    // Add specific Ondo/Ethena minting interfaces here if needed for direct deposit
}

contract MantleForgeFactory is ERC1155, AccessControl, EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    // --- ROLES ---
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // --- STATE ---
    uint256 public assetCounter;
    address public usdyToken; // Ondo USDY Address on Mantle
    address public treasury;  // Where fees go

    // --- RWA DATA STRUCTURE (Optimized for Storage) ---
    struct RWA {
        uint256 id;
        string name;          // "NYC Penthouse"
        uint256 valuation;    // In USD (e.g., 50000 = $50k)
        uint256 riskScore;    // 0-100 (Assigned by AI)
        string mantleDAHash;  // The Blob Hash on Mantle DA (The $4k Prize Winner)
        address originator;   // The user who uploaded the PDF
        bool isActive;
    }

    mapping(uint256 => RWA) public assets;
    mapping(address => uint256) public userXP; // GameFi Leaderboard

    // --- EVENTS (For the Frontend Ticker) ---
    event AssetMinted(uint256 indexed id, string name, uint256 valuation, uint256 risk, address indexed owner);
    event YieldClaimed(address indexed user, uint256 amount);
    event RiskUpdated(uint256 indexed id, uint256 newRiskScore);

    constructor(address _usdyToken, address _initialOracle) 
        ERC1155("https://api.mantleforge.com/metadata/{id}.json") 
        EIP712("MantleForge", "1") 
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AI_ORACLE_ROLE, _initialOracle); // This is your Hetzner Server's Wallet
        usdyToken = _usdyToken;
        treasury = msg.sender;
    }

    // --- CORE LOGIC: THE "BIG BUTTON" MINT ---
    // User calls this. They MUST provide a signature from your Python AI.
    // This proves the AI verified the PDF before the chain touched it.
    function mintRWA(
        string memory _name,
        uint256 _valuation,
        uint256 _riskScore,
        string memory _mantleDAHash, // "0x..." Blob ID from Mantle DA
        bytes calldata _signature    // The AI's Stamp of Approval
    ) external nonReentrant {
        
        // 1. Verify the AI actually signed this data (Anti-Fraud)
        bytes32 structHash = keccak256(abi.encode(
            keccak256("MintRequest(string name,uint256 valuation,uint256 riskScore,string mantleDAHash,address minter)"),
            keccak256(bytes(_name)),
            _valuation,
            _riskScore,
            keccak256(bytes(_mantleDAHash)),
            msg.sender
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, _signature);
        
        require(hasRole(AI_ORACLE_ROLE, signer), "Invalid AI Signature");
        require(_riskScore < 90, "Risk Too High: Mint Rejected"); // AI Gatekeeper

        // 2. Mint the Token (ERC1155)
        assetCounter++;
        _mint(msg.sender, assetCounter, 1, ""); // 1 NFT representing the Asset

        // 3. Store Data (On-Chain Proof)
        assets[assetCounter] = RWA({
            id: assetCounter,
            name: _name,
            valuation: _valuation,
            riskScore: _riskScore,
            mantleDAHash: _mantleDAHash,
            originator: msg.sender,
            isActive: true
        });

        // 4. GameFi: Award XP
        userXP[msg.sender] += 50; 

        emit AssetMinted(assetCounter, _name, _valuation, _riskScore, msg.sender);
    }

    // --- YIELD OPTIMIZER (DeFi Track) ---
    // In a real app, users deposit USDT, we swap to USDY.
    // For Hackathon, we simulate "Yield Claiming" based on XP.
    function claimYield() external nonReentrant {
        uint256 xp = userXP[msg.sender];
        require(xp > 0, "No XP to claim yield");

        // Reward calculation logic...
        uint256 reward = xp * 10**16; // Dummy math
        
        // Reset XP (Game Loop)
        userXP[msg.sender] = 0;
        
        // Transfer USDY (Real Money)
        // require(IERC20(usdyToken).transfer(msg.sender, reward), "Transfer failed");
        
        emit YieldClaimed(msg.sender, reward);
    }

    // --- DYNAMIC RISK UPDATES (AI Track) ---
    // Your AI re-scans the news. If "Real Estate Market Crashes", it updates the risk on-chain.
    function updateAssetRisk(uint256 _id, uint256 _newRisk) external onlyRole(AI_ORACLE_ROLE) {
        require(assets[_id].isActive, "Asset not active");
        assets[_id].riskScore = _newRisk;
        emit RiskUpdated(_id, _newRisk);
    }

    // Required overrides for AccessControl + ERC1155
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}