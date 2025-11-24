import { z } from 'zod';

// 1. Chain IDs
export const EvmChainId = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  HOLESKY: 17000,
  BSC: 56,
  BSC_TESTNET: 97,
  POLYGON: 137,
  POLYGON_AMOY: 80002,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  ARBITRUM: 42161,
  OPTIMISM: 10,
} as const;

export type ChainId = number;

// 2. Capabilities (Feature Flags)
export type ChainCapabilities = {
  hasBeaconChain: boolean;
  hasTokenApprovals: boolean;
};

export const CHAIN_CAPABILITIES: Record<number, ChainCapabilities> = {
  [EvmChainId.MAINNET]: { hasBeaconChain: true, hasTokenApprovals: true },
  [EvmChainId.SEPOLIA]: { hasBeaconChain: true, hasTokenApprovals: true },
  [EvmChainId.HOLESKY]: { hasBeaconChain: true, hasTokenApprovals: true },
  // Most L2s and Sidechains do not support Etherscan Beacon endpoints
  0: { hasBeaconChain: false, hasTokenApprovals: true }, // Default
};

export const SUPPORTED_CHAINS = new Set([
  1, // Ethereum Mainnet
  11155111, // Sepolia
  17000, // Holesky
  56, // BSC
  97, // BSC Testnet
  137, // Polygon
  80002, // Polygon Amoy
  8453, // Base
  84532, // Base Sepolia
  42161, // Arbitrum
  10, // Optimism
]);

export function validateChainId(chainId: number): void {
  // Warning only - don't block the user from using new chains
  if (!SUPPORTED_CHAINS.has(chainId)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[EtherscanSDK] Warning: Chain ID ${chainId} is not in the known supported list. Calls may fail if Etherscan V2 does not support it.`
      );
    }
  }
}

// Helper function to check chain capabilities
export function requireCapability(
  chainId: number,
  capability: keyof ChainCapabilities,
  methodName: string
): void {
  const capabilities = CHAIN_CAPABILITIES[chainId] || CHAIN_CAPABILITIES[0];
  if (!capabilities[capability]) {
    throw new Error(
      `Method ${methodName} is not supported on chain ${chainId} (missing ${capability} capability)`
    );
  }
}

// 3. Common Zod Schemas
// STRICT BigInt Schema - throws on invalid input (Financial Grade Safety)
export const BigIntSchema = z.string().transform((val, ctx) => {
  try {
    return BigInt(val);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid BigInt value: "${val}"`,
    });
    return z.NEVER;
  }
});

// Input Validation Schemas (Financial Grade Safety)
export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum Address');
export const HashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Transaction Hash');

export const HexString = z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid Hex String');

// Handle Etherscan's empty string -> null conversion
export const NullableString = z
  .string()
  .transform(val => (val === '' ? null : val))
  .nullable();

// Additional schemas for generated code
export const NumberStringSchema = z.string().transform(val => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
});

export const BooleanishSchema = z
  .union([z.string(), z.number(), z.boolean()])
  .transform(val => Boolean(val));

export const StatusSchema = <T>(resultSchema: z.ZodType<T>) =>
  z.object({
    status: z.string(),
    message: z.string(),
    result: resultSchema,
  });

export const TransactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  blockHash: z.string(),
  transactionIndex: z.string(),
  from: z.string(),
  to: NullableString,
  value: BigIntSchema,
  gas: z.string(),
  gasPrice: BigIntSchema,
  isError: z.string(),
  txreceipt_status: z.string(),
  input: z.string(),
  contractAddress: NullableString,
  cumulativeGasUsed: z.string(),
  gasUsed: z.string(),
  confirmations: z.string(),
}).passthrough();

export const TokenTransactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  blockHash: z.string(),
  from: z.string(),
  contractAddress: z.string(),
  to: z.string(),
  value: BigIntSchema,
  tokenName: z.string(),
  tokenSymbol: z.string(),
  tokenDecimal: z.string(),
  transactionIndex: z.string(),
  gas: z.string(),
  gasPrice: BigIntSchema,
  gasUsed: z.string(),
  cumulativeGasUsed: z.string(),
  input: z.string(),
  confirmations: z.string(),
}).passthrough();

export const NFTTransactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  blockHash: z.string(),
  from: z.string(),
  contractAddress: z.string(),
  to: z.string(),
  tokenID: z.string(),
  tokenName: z.string(),
  tokenSymbol: z.string(),
  tokenDecimal: z.string(),
  transactionIndex: z.string(),
  gas: z.string(),
  gasPrice: BigIntSchema,
  gasUsed: z.string(),
  cumulativeGasUsed: z.string(),
  input: z.string(),
  confirmations: z.string(),
}).passthrough();

export const ERC1155TransactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  blockHash: z.string(),
  from: z.string(),
  contractAddress: z.string(),
  to: z.string(),
  tokenID: z.string(),
  tokenValue: BigIntSchema,
  tokenName: z.string(),
  tokenSymbol: z.string(),
  tokenDecimal: z.string().optional(), // Some ERC1155 tokens don't have decimals
  transactionIndex: z.string(),
  gas: z.string(),
  gasPrice: BigIntSchema,
  gasUsed: z.string(),
  cumulativeGasUsed: z.string(),
  input: z.string(),
  confirmations: z.string(),
}).passthrough();

export const InternalTransactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  from: z.string(),
  to: NullableString,
  value: BigIntSchema,
  contractAddress: NullableString,
  input: z.string(),
  type: z.string(),
  gas: z.string(),
  gasUsed: z.string(),
  traceId: z.string(),
  isError: z.string(),
  errCode: z.string(),
}).passthrough();

export const BalanceHistorySchema = z.object({
  account: z.string(),
  balance: BigIntSchema,
  blockNumber: z.string(),
  timeStamp: z.string(),
});

export const L2TransactionSchema = TransactionSchema.passthrough();

// Bridge Transaction Schema (for Polygon/Xdai/BTTC txnbridge endpoint)
// Based on actual Polygon PoS bridge structure - different from standard transactions
// Includes bridge-specific fields like amount and token information
export const BridgeTransactionSchema = z.object({
  hash: z.string(),
  blockNumber: z.string(),
  timeStamp: z.string(),
  from: z.string(),
  // Bridge-specific fields
  address: z.string().optional(), // Recipient address
  amount: z.string().optional().transform(val => {
    if (!val) return undefined;
    try {
      return BigInt(val);
    } catch {
      return undefined;
    }
  }),
  tokenName: z.string().optional(),
  symbol: z.string().optional(),
  contractAddress: z.string().optional(),
  divisor: z.string().optional(),
}).passthrough();

export const TransactionStatusSchema = z.object({
  isError: z.string(),
  errDescription: z.string(),
});

// ERC20 Token Holding Schema
export const ERC20TokenHoldingSchema = z.object({
  TokenAddress: z.string(),
  TokenName: z.string(),
  TokenSymbol: z.string(),
  TokenQuantity: BigIntSchema,
  TokenDivisor: z.string(),
  TokenPriceUSD: z.string(),
});

// ERC721 Token Holding Schema (for balance endpoint)
export const ERC721HoldingSchema = z.object({
  TokenAddress: z.string(),
  TokenName: z.string(),
  TokenSymbol: z.string(),
  TokenId: z.string(),
});

// ERC721 Inventory Item Schema (for inventory endpoint)
export const ERC721InventoryItemSchema = z.object({
  TokenAddress: z.string(),
  TokenId: z.string(),
});

// Block Schema
export const BlockSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  blockReward: z.string(),
}).passthrough();

// Block Countdown Schema
export const BlockCountdownSchema = z.object({
  CurrentBlock: z.string(),
  CountdownBlock: z.string(),
  RemainingBlock: NumberStringSchema,
  EstimateTimeInSec: z.string(),
});

// Contract Source Code Schema
export const SourceCodeSchema = z.object({
  SourceCode: z.string(),
  ABI: z.string(),
  ContractName: z.string(),
  CompilerVersion: z.string(),
  OptimizationUsed: z.string(),
  Runs: z.string(),
  ConstructorArguments: z.string(),
  EVMVersion: z.string(),
  Library: z.string(),
  LicenseType: z.string(),
  Proxy: z.string(),
  Implementation: z.string(),
  SwarmSource: z.string(),
}).passthrough();

// Gas Oracle Schema
export const GasOracleSchema = z.object({
  LastBlock: z.string(),
  SafeGasPrice: z.string(),
  ProposeGasPrice: z.string(),
  FastGasPrice: z.string(),
  suggestBaseFee: z.string(),
  gasUsedRatio: z.string(),
});

// Chain Info Schema
export const ChainInfoSchema = z.object({
  chainname: z.string(),
  chainid: z.string(),
  blockexplorer: z.string(),
  apiurl: z.string(),
  status: z.number(),
  comment: z.string(),
});

// Chainlist Envelope Schema (special format for chainlist endpoint)
export const ChainlistEnvelopeSchema = z.object({
  comments: z.string(),
  totalcount: z.number(),
  result: z.array(ChainInfoSchema),
});

export const EthSupply2Schema = z.object({
  EthSupply: z.string(),
  Eth2Staking: z.string(),
  BurntFees: z.string(),
  WithdrawnTotal: z.string(),
});

// Stats Schema
export const StatsSchema = z.object({
  ethbtc: z.string(),
  ethbtc_timestamp: z.string(),
  ethusd: z.string(),
  ethusd_timestamp: z.string(),
});

// Log Schema
export const LogSchema = z.object({
  address: z.string(),
  topics: z.array(z.string()),
  data: z.string(),
  blockNumber: z.string(),
  timeStamp: z.string(),
  gasPrice: z.string(),
  gasUsed: z.string(),
  logIndex: z.string(),
  transactionHash: z.string(),
  transactionIndex: z.string(),
}).passthrough(); // Allow additional fields like 'removed' from JSON-RPC

// Beacon Withdrawal Schema
export const BeaconWithdrawalSchema = z.object({
  withdrawalIndex: z.string(),
  validatorIndex: z.string(),
  address: z.string(),
  amount: BigIntSchema,
  blockNumber: z.string(),
  timestamp: z.string(),
});

// Funded By Schema (returns a single object with funding details)
export const FundedBySchema = z.object({
  block: z.number(),
  timeStamp: z.string(),
  fundingAddress: AddressSchema,
  fundingTxn: HashSchema,
  value: BigIntSchema,
});

// Contract Creation Schema
export const ContractCreationSchema = z.object({
  contractAddress: z.string(),
  contractCreator: z.string(),
  txHash: z.string(),
});

// Verification Result Schema
export const VerificationResultSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.string(),
});

// Verification Response Schemas (validate result field directly)
export const VerificationGuidSchema = z.string(); // GUID string
export const ProxyVerificationStatusSchema = z.string(); // Status message string
export const VerificationStatusSchema = z.string(); // Status message string

// Ethereum JSON-RPC Schemas
export const EthTransactionSchema = z.object({
  blockHash: NullableString,
  blockNumber: NullableString,
  from: z.string(),
  gas: HexString,
  gasPrice: HexString,
  hash: z.string(),
  input: z.string(),
  nonce: HexString,
  to: NullableString,
  transactionIndex: NullableString,
  value: HexString,
  v: HexString,
  r: HexString,
  s: HexString,
});

export const EthTransactionReceiptSchema = z.object({
  transactionHash: z.string(),
  transactionIndex: HexString,
  blockHash: z.string(),
  blockNumber: HexString,
  from: z.string(),
  to: NullableString,
  cumulativeGasUsed: HexString,
  gasUsed: HexString,
  contractAddress: NullableString,
  logs: z.array(LogSchema),
  logsBloom: z.string(),
  status: HexString.optional(),
});

export const EthBlockSchema = z.object({
  number: NullableString,
  hash: NullableString,
  parentHash: z.string(),
  nonce: NullableString,
  sha3Uncles: z.string(),
  logsBloom: NullableString,
  transactionsRoot: z.string(),
  stateRoot: z.string(),
  receiptsRoot: z.string(),
  miner: z.string(),
  difficulty: HexString,
  totalDifficulty: HexString.optional(),
  extraData: z.string(),
  size: HexString,
  gasLimit: HexString,
  gasUsed: HexString,
  timestamp: HexString,
  transactions: z.array(z.union([z.string(), EthTransactionSchema])),
  uncles: z.array(z.string()),
});

// Block Reward Schema
export const BlockRewardSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  blockMiner: z.string(),
  blockReward: BigIntSchema,
  uncles: z.array(
    z.object({
      miner: z.string(),
      unclePosition: z.string(),
      blockreward: BigIntSchema,
    })
  ),
  uncleInclusionReward: BigIntSchema,
});

// Daily Stats Schemas - Specific to each endpoint
export const DailyBlockSizeSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  blockSize_bytes: NumberStringSchema,
});

export const DailyBlockTimeSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  blockTime_sec: z.string(),
});

export const DailyTransactionCountSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  transactionCount: NumberStringSchema,
});

export const DailyGasPriceSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  maxGasPrice_Wei: z.string(),
  minGasPrice_Wei: z.string(),
  avgGasPrice_Wei: z.string(),
});

export const DailyGasLimitSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  gasLimit: z.string(),
});

export const DailyGasUsedSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  gasUsed: z.string(),
});

export const DailyNetworkUtilizationSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  networkUtilization: z.string(),
});

export const DailyNewAddressSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  newAddressCount: NumberStringSchema,
});

export const DailyTransactionFeeSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  transactionFee_Eth: z.string(),
});

export const DailyEthPriceSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  value: z.string(),
});

export const DailyHashrateSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  networkHashRate: z.string(),
});

export const DailyNetworkDifficultySchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  networkDifficulty: z.string(),
});

export const NodeCountSchema = z.object({
  UTCDate: z.string(),
  TotalNodeCount: z.string(),
});

export const DailyBlockCountSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  blockCount: NumberStringSchema,
  blockRewards_Eth: z.string(),
});

export const DailyBlockRewardsSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  blockRewards_Eth: z.string(),
});

export const DailyUncleBlockCountSchema = z.object({
  UTCDate: z.string(),
  unixTimeStamp: z.string(),
  uncleBlockCount: NumberStringSchema,
  uncleBlockRewards_Eth: z.string(),
});

export const ChainSizeSchema = z.object({
  blockNumber: z.string(),
  chainTimeStamp: z.string(),
  chainSize: z.string(),
});

// Nametag Schemas
export const LabelSchema = z.object({
  label: z.string(),
  address: z.string(),
  name: z.string(),
});

export const LabelMasterListSchema = z.object({
  labelname: z.string(),
  labelslug: z.string(),
  shortdescription: z.string(),
  notes: z.string(),
  lastupdatedtimestamp: z.number(),
});

export const AddressTagSchema = z.object({
  address: z.string(),
  nametag: z.string(),
  url: z.string().optional(),
  labels: z.array(z.string()).optional(),
  labels_slug: z.array(z.string()).optional(),
}).passthrough(); // Allow additional fields

// Token Schemas
export const TokenHolderSchema = z.object({
  TokenHolderAddress: z.string(),
  TokenHolderQuantity: BigIntSchema,
}).passthrough(); // Allow additional fields like TokenHolderAddressType

export const TokenInfoSchema = z.object({
  contractAddress: z.string(),
  tokenName: z.string(),
  symbol: z.string(),
  divisor: z.string(),
  tokenType: z.string(),
  totalSupply: BigIntSchema,
  blueCheckmark: z.string(),
  description: z.string(),
  website: z.string(),
  email: z.string(),
  blog: z.string(),
  reddit: z.string(),
  slack: z.string(),
  facebook: z.string(),
  twitter: z.string(),
  bitcointalk: z.string(),
  github: z.string(),
  telegram: z.string(),
  linkedin: z.string(),
  discord: z.string(),
  whitepaper: z.string(),
  tokenPriceUSD: z.string(),
}).passthrough(); // Allow additional fields like 'image'

// Ethereum ABI Schema
export const ABISchema = z.array(
  z.object({
    inputs: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        indexed: z.boolean().optional(),
        internalType: z.string().optional(),
      })
    ).optional(),
    name: z.string().optional(),
    outputs: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          internalType: z.string().optional(),
        })
      )
      .optional(),
    stateMutability: z.string().optional(),
    type: z.string(),
    anonymous: z.boolean().optional(),
  })
);
