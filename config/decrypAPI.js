import { LitNodeClient } from "@lit-protocol/lit-node-client"
import { encryptString } from "@lit-protocol/encryption";
import { LIT_NETWORK, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants"
import {
  createSiweMessage,
  LitAccessControlConditionResource,
  LitActionResource,
  generateAuthSig,
} from "@lit-protocol/auth-helpers"
import { LitContracts } from "@lit-protocol/contracts-sdk"
import * as ethers from "ethers";
import { litActionCode } from "../constants/litAction"

const NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY = process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
const NEXT_APP_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID = process.env["NEXT_APP_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID"];

// Default access control condition
const DEFAULT_ACCESS_CONTROL_CONDITIONS = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "0",
    },
  },
];

export const encryptApiKey = async (
  key, 
  accessControlConditions = DEFAULT_ACCESS_CONTROL_CONDITIONS
) => {
  let litNodeClient;

  try {
    // Validate inputs
    console.log("Encrypting key:", process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY);
    if (!key) {
      throw new Error("Encryption key is required");
    }
    if (!NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY) {
      throw new Error("Ethereum private key is not set in environment variables");
    }

    console.log("Encrypting key:", key);
    console.log("Access control conditions:", accessControlConditions);

    const ethersWallet = new ethers.Wallet(
      NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    // Connect to Lit network
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilTest,
      debug: true, // Set to true for more detailed logging
    });
    await litNodeClient.connect();

    // Connect LitContracts
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK.DatilTest,
      debug: true, // Set to true for more detailed logging
    });
    await litContracts.connect();

    // Handle capacity token
    let capacityTokenId = NEXT_APP_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (!capacityTokenId) {
      console.log("No capacity token found. Minting new capacity credits...");
      const mintResult = await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      });
      capacityTokenId = mintResult.capacityTokenIdStr;
    }
    console.log("Using capacity token ID:", capacityTokenId);

    // Perform encryption
    const encryptResult = await encryptString(
      {
        accessControlConditions,
        dataToEncrypt: key,
      },
      litNodeClient
    );

    // Validate encryption result
    if (!encryptResult || !encryptResult.ciphertext || !encryptResult.dataToEncryptHash) {
      throw new Error("Encryption failed: Invalid result from encryptString");
    }

    console.log("Encryption successful");
    return {
      ciphertext: encryptResult.ciphertext,
      dataToEncryptHash: encryptResult.dataToEncryptHash
    };

  } catch (error) {
    console.log("Encryption error:", error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    } else {
      throw new Error('Unknown encryption error occurred');
    }
  } finally {
    // Ensure client is disconnected
    if (litNodeClient) {
      try {
        litNodeClient.disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting Lit node client:", disconnectError);
      }
    }
  }
}

export const decryptApiKey = async (
  ciphertext, 
  dataToEncryptHash,
  accessControlConditions = DEFAULT_ACCESS_CONTROL_CONDITIONS,
  alchemyUrl = "https://yellowstone-explorer.litprotocol.com/api/v2/blocks?type=block%20%7C%20uncle%20%7C%2",
) => {
  let litNodeClient;

  try {
    // Validate inputs
    console.log("LIT_Ability:", LIT_ABILITY);
    if (!ciphertext || !dataToEncryptHash) {
      throw new Error("Ciphertext and dataToEncryptHash are required for decryption");
    }

    const ethersWallet = new ethers.Wallet(
      NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    // Connect to Lit network
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilTest,
      debug: true,
    });
    await litNodeClient.connect();

    // Connect LitContracts
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK.DatilTest,
      debug: true,
    });
    await litContracts.connect();

    // Handle capacity token
    let capacityTokenId = NEXT_APP_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (!capacityTokenId) {
      const mintResult = await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      });
      capacityTokenId = mintResult.capacityTokenIdStr;
    }

    // Create capacity delegation auth signature
    const { capacityDelegationAuthSig } = 
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });

    // Generate resource string
    const accsResourceString = 
      await LitAccessControlConditionResource.generateResourceString(
        accessControlConditions,
        dataToEncryptHash
      );

    // Get session signatures
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      capabilityAuthSigs: [capacityDelegationAuthSig],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      authNeededCallback: async ({ uri, expiration, resourceAbilityRequests }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: ethersWallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersWallet,
          toSign,
        });
      },
    });

    const litActionSignatures = await litNodeClient.executeJs({
        sessionSigs,
        code: litActionCode,
        jsParams: {
          accessControlConditions,
          ciphertext,
          dataToEncryptHash,
          alchemyUrl,
        },
    });
    console.log("Lit action signatures:", litActionSignatures);
    return litActionSignatures.response;
  } catch (error) {
    console.log("Decryption error:", error);
    
  } finally {
    if (litNodeClient) {
      try {
        litNodeClient.disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting Lit node client:", disconnectError);
      }
    }
  }
}