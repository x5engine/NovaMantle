/**
 * @fileoverview Unit tests for MantleForgeFactory contract
 */
import { expect } from "chai";
import { ethers } from "hardhat";
import { MantleForgeFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MantleForgeFactory", function () {
  let factory: MantleForgeFactory;
  let owner: SignerWithAddress;
  let aiOracle: SignerWithAddress;
  let user: SignerWithAddress;
  let usdyAddress: string;
  let oracleAddress: string;

  beforeEach(async function () {
    [owner, aiOracle, user] = await ethers.getSigners();
    
    // Deploy mock USDY token
    const MockUSDY = await ethers.getContractFactory("ERC20Mock");
    const mockUSDY = await MockUSDY.deploy("USDY", "USDY");
    await mockUSDY.waitForDeployment();
    usdyAddress = await mockUSDY.getAddress();
    
    // Oracle address is the AI oracle signer
    oracleAddress = await aiOracle.getAddress();

    // Deploy factory
    const Factory = await ethers.getContractFactory("MantleForgeFactory");
    factory = await Factory.deploy(usdyAddress, oracleAddress);
    await factory.waitForDeployment();

    // Grant AI_ORACLE role
    const AI_ORACLE_ROLE = await factory.AI_ORACLE_ROLE();
    await factory.grantRole(AI_ORACLE_ROLE, oracleAddress);
  });

  describe("Deployment", function () {
    it("Should deploy with correct USDY address", async function () {
      expect(await factory.usdyToken()).to.equal(usdyAddress);
    });

    it("Should deploy with correct oracle address", async function () {
      expect(await factory.aiOracle()).to.equal(oracleAddress);
    });

    it("Should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await factory.DEFAULT_ADMIN_ROLE();
      expect(await factory.hasRole(DEFAULT_ADMIN_ROLE, await owner.getAddress())).to.be.true;
    });
  });

  describe("Role Management", function () {
    it("Should grant AI_ORACLE role", async function () {
      const AI_ORACLE_ROLE = await factory.AI_ORACLE_ROLE();
      expect(await factory.hasRole(AI_ORACLE_ROLE, oracleAddress)).to.be.true;
    });

    it("Should allow admin to grant roles", async function () {
      const newOracle = (await ethers.getSigners())[3];
      const AI_ORACLE_ROLE = await factory.AI_ORACLE_ROLE();
      
      await factory.grantRole(AI_ORACLE_ROLE, await newOracle.getAddress());
      expect(await factory.hasRole(AI_ORACLE_ROLE, await newOracle.getAddress())).to.be.true;
    });

    it("Should reject non-admin from granting roles", async function () {
      const AI_ORACLE_ROLE = await factory.AI_ORACLE_ROLE();
      const newOracle = (await ethers.getSigners())[3];
      
      await expect(
        factory.connect(user).grantRole(AI_ORACLE_ROLE, await newOracle.getAddress())
      ).to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Minting RWA", function () {
    const assetName = "Test Asset";
    const valuation = ethers.parseEther("100000");
    const riskScore = 15;
    const mantleDAHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    it("Should mint RWA with valid signature", async function () {
      // Create EIP-712 signature
      const domain = {
        name: "MantleForge",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await factory.getAddress()
      };

      const types = {
        MintRequest: [
          { name: "name", type: "string" },
          { name: "valuation", type: "uint256" },
          { name: "riskScore", type: "uint256" },
          { name: "mantleDAHash", type: "string" }
        ]
      };

      const message = {
        name: assetName,
        valuation: valuation,
        riskScore: riskScore,
        mantleDAHash: mantleDAHash
      };

      const signature = await user.signTypedData(domain, types, message);

      // Mint as oracle
      await expect(
        factory.connect(aiOracle).mintRWA(
          assetName,
          valuation,
          riskScore,
          mantleDAHash,
          signature
        )
      ).to.emit(factory, "AssetMinted");

      // Check asset was created
      const assetCount = await factory.assetCount();
      expect(assetCount).to.equal(1n);

      const asset = await factory.assets(0);
      expect(asset.name).to.equal(assetName);
      expect(asset.valuation).to.equal(valuation);
      expect(asset.riskScore).to.equal(riskScore);
    });

    it("Should reject minting with invalid signature", async function () {
      const invalidSignature = "0x" + "00".repeat(65);

      await expect(
        factory.connect(aiOracle).mintRWA(
          assetName,
          valuation,
          riskScore,
          mantleDAHash,
          invalidSignature
        )
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should reject minting from non-oracle", async function () {
      const signature = "0x" + "00".repeat(65);

      await expect(
        factory.connect(user).mintRWA(
          assetName,
          valuation,
          riskScore,
          mantleDAHash,
          signature
        )
      ).to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
    });

    it("Should award XP to user", async function () {
      // Create signature
      const domain = {
        name: "MantleForge",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await factory.getAddress()
      };

      const types = {
        MintRequest: [
          { name: "name", type: "string" },
          { name: "valuation", type: "uint256" },
          { name: "riskScore", type: "uint256" },
          { name: "mantleDAHash", type: "string" }
        ]
      };

      const message = {
        name: assetName,
        valuation: valuation,
        riskScore: riskScore,
        mantleDAHash: mantleDAHash
      };

      const signature = await user.signTypedData(domain, types, message);

      await factory.connect(aiOracle).mintRWA(
        assetName,
        valuation,
        riskScore,
        mantleDAHash,
        signature
      );

      const xp = await factory.userXP(await user.getAddress());
      expect(xp).to.be.gt(0);
    });
  });

  describe("Risk Updates", function () {
    it("Should update asset risk score", async function () {
      // First mint an asset
      const domain = {
        name: "MantleForge",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await factory.getAddress()
      };

      const types = {
        MintRequest: [
          { name: "name", type: "string" },
          { name: "valuation", type: "uint256" },
          { name: "riskScore", type: "uint256" },
          { name: "mantleDAHash", type: "string" }
        ]
      };

      const message = {
        name: "Test Asset",
        valuation: ethers.parseEther("100000"),
        riskScore: 15,
        mantleDAHash: "0x1234"
      };

      const signature = await user.signTypedData(domain, types, message);

      await factory.connect(aiOracle).mintRWA(
        message.name,
        message.valuation,
        message.riskScore,
        message.mantleDAHash,
        signature
      );

      // Update risk
      const newRisk = 25;
      await expect(
        factory.connect(aiOracle).updateAssetRisk(0, newRisk)
      ).to.emit(factory, "RiskUpdated");

      const asset = await factory.assets(0);
      expect(asset.riskScore).to.equal(newRisk);
    });

    it("Should reject risk update from non-oracle", async function () {
      await expect(
        factory.connect(user).updateAssetRisk(0, 25)
      ).to.be.revertedWithCustomError(factory, "AccessControlUnauthorizedAccount");
    });
  });

  describe("XP System", function () {
    it("Should track user XP", async function () {
      const initialXP = await factory.userXP(await user.getAddress());
      expect(initialXP).to.equal(0n);
    });

    it("Should increment XP on mint", async function () {
      // Mint asset (see previous tests for full implementation)
      // XP should be awarded
      // This is tested in the minting tests above
    });
  });
});

