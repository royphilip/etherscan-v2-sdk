markdown
# etherscan-v2-sdk

> A production-grade, fully type-safe and runtime-validated TypeScript client for the **Etherscan V2 API**.

[![npm version](https://img.shields.io/npm/v/etherscan-v2-sdk.svg)](https://www.npmjs.com/package/etherscan-v2-sdk)
[![npm downloads](https://img.shields.io/npm/dm/etherscan-v2-sdk.svg)](https://www.npmjs.com/package/etherscan-v2-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/royphilip/etherscan-v2-sdk/ci.yml?branch=main)](https://github.com/royphilip/etherscan-v2-sdk/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/royphilip/etherscan-v2-sdk)](https://codecov.io/gh/royphilip/etherscan-v2-sdk)

**This is an unofficial SDK for Etherscan API V2. It is not affiliated with or endorsed by Etherscan.**

Built for reliability in high-value financial applications. This is not a wrapper; it is a complete re-implementation leveraging the unified V2 architecture to eliminate configuration bloat while enforcing strict runtime safety.

---

## 📦 Installation

```bash
npm install etherscan-v2-sdk
# or
yarn add etherscan-v2-sdk
# or
pnpm add etherscan-v2-sdk
```

*Requires Node.js 18+*

## ⚡ Why this SDK?

Most Etherscan libraries are based on the deprecated V1 API (requiring maps of 50+ URLs) or are auto-generated wrappers that fail silently when data types change.

**etherscan-v2-sdk** is hand-written for modern Node.js environments:

- **Unified V2 Architecture:** Zero config bloat. One endpoint (`api.etherscan.io/v2/api`) handles all chains via `chainId` injection.
- **Financial Grade Safety:** Returns native `BigInt` for all monetary values (wei, token quantities). Zero precision loss. Non-monetary counters (transaction counts, block numbers) are returned as numbers for convenience.
- **Runtime Validation:** Uses **Zod** to validate every response. If the API schema drifts, the SDK fails loudly and precisely rather than returning corrupt data.
- **Configurable Rate Limiting:** Built-in **Bottleneck** leaky bucket prevents 429 errors. Configure `rateLimit: 2` for heavy historical endpoint usage (documented as 2 req/sec regardless of API tier).
- **Secure by Design:** API keys are hidden from property enumeration and stack traces.

**Parameter names mirror the official Etherscan schema for full compatibility with their documentation and debugging workflows.**

## 🚀 Quick Start

```typescript
import { EtherscanClient, EvmChainId } from 'etherscan-v2-sdk';

// Initialize for Base Mainnet (Chain ID 8453)
const client = new EtherscanClient({
  apiKey: process.env.ETHERSCAN_API_KEY, // Defaults to env var if omitted
  chain: EvmChainId.BASE,
  rateLimit: 3 // Requests per second (free tier default)
});

async function main() {
  try {
    // 1. Get Balance (Returns BigInt)
    const balance = await client.account.getBalance({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      tag: 'latest'
    });

    console.log(`Vitalik's Balance: ${balance} wei`); // 1000000000000000000n

    // 1b. Get Multiple Balances (Returns Record<string, BigInt>)
    const balances = await client.account.getBalances([
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
    ]);

    console.log(`Balances:`, balances);

    // 2. Get Transactions (Runtime Validated)
    const txs = await client.account.getTxList({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      page: 1,
      offset: 5
    });

    console.log(`Latest Tx Hash: ${txs[0].hash}`);

  } catch (error) {
    console.error(error);
  }
}

main();
```

## 🎯 I Just Want...

### Get last 10 ERC20 transfers for an address
```typescript
const transfers = await client.account.getTxList({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  page: 1,
  offset: 10,
  sort: 'desc'
});

console.log(`Latest transfer: ${transfers[0].hash}`);
```

### Get an address portfolio (native + ERC20 + NFTs)
```typescript
// Native balance
const balance = await client.account.getBalance({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
});

// ERC20 tokens
const erc20Tokens = await client.tokens.getAddressTokenBalance({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
});

// ERC721 NFTs
const nfts = await client.tokens.getAddressTokenNftBalance({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
});

console.log(`Portfolio: ${balance} wei, ${erc20Tokens.length} tokens, ${nfts.length} NFTs`);
```

### Fetch gas oracle and estimate gas in gwei
```typescript
// Get current gas prices
const gasOracle = await client.gasTracker.getGasOracle();
console.log(`Fast: ${gasOracle.FastGasPrice} gwei`);

// Estimate gas for a transaction
const gasEstimate = await client.gasTracker.getGasEstimate({
  gasPrice: '20000000000' // 20 gwei in wei
});
console.log(`Estimated gas: ${gasEstimate}`);
```

## 🧩 Modules & Resources

The SDK is organized into namespaces by functional domain. Methods are grouped by their primary use case rather than the underlying API module, providing intuitive access patterns.

 | Module | Accessor | Description |
 | :--- | :--- | :--- |
 | **Account** | `client.account` | Balances, transaction lists, token transfers, and account-specific operations |
 | **Contract** | `client.contract` | ABIs, source code, verification, and contract-specific operations |
 | **Transaction** | `client.transaction` | Transaction execution status and receipt status |
 | **Blocks** | `client.block` | Block rewards, countdowns, and block-related statistics |
 | **Logs** | `client.logs` | Event log filtering and querying by topics |
 | **Gas Tracker** | `client.gasTracker` | Gas oracle, estimation, and gas-related statistics |
 | **Stats** | `client.stats` | Global network statistics, supply metrics, and pricing data |
 | **Tokens** | `client.tokens` | Token information, supply, holders, and token-specific operations |
 | **Proxy** | `client.proxy` | Direct JSON-RPC Ethereum node calls (eth_call, eth_getBlockByNumber, etc.) |
 | **Usage** | `client.usage` | Platform metadata and supported chains |

### ⚠️ PRO API Endpoints

The following endpoints require a **paid Etherscan API plan** (PRO or higher). Free API keys will receive an error response.

#### Account
- `getBalanceHistory()` - Historical balance at specific block

#### Blocks
- `getDailyAvgBlockSize()` - Daily average block size
- `getDailyBlockCount()` - Daily block count and rewards
- `getDailyBlockRewards()` - Daily block rewards
- `getDailyAvgBlockTime()` - Daily average block time
- `getDailyUncleBlockCount()` - Daily uncle block count and rewards

#### Gas Tracker
- `getDailyAvgGasLimit()` - Daily average gas limit
- `getDailyAvgGasPrice()` - Daily average gas price
- `getDailyGasUsed()` - Daily total gas used

#### Nametags
- `getLabelMasterList()` - Label master list (Enterprise tier)
- `getExportAddressTags()` - Export address tags (Enterprise tier)
- `getAddressTag()` - Address nametag metadata (Pro Plus tier)

#### Stats
- `getEthDailyPrice()` - Historical ETH price data
- `getDailyTxnFee()` - Daily transaction fees
- `getDailyAvgNetDifficulty()` - Daily network difficulty
- `getDailyTx()` - Daily transaction count
- `getDailyAvgHashrate()` - Daily network hashrate
- `getDailyNetUtilization()` - Daily network utilization
- `getDailyNewAddress()` - Daily new address count

#### Tokens
- `getTokenHolderList()` - Token holder list by contract
- `getTopHolders()` - Top token holders
- `getTokenHolderCount()` - Token holder count
- `getTokenInfo()` - Token project information and metadata
- `getTokenSupplyHistory()` - Historical token supply
- `getTokenBalanceHistory()` - Historical token balance
- `getAddressTokenBalance()` - Address ERC20 token holdings
- `getAddressTokenNftBalance()` - Address ERC721 token holdings
- `getAddressTokenNftInventory()` - Address ERC721 token inventory

### Proxy Methods (JSON-RPC)

**Proxy methods return JSON-RPC style responses.**
The SDK ignores `jsonrpc` and `id` fields and uses `result` only.
Validation applies only to the `result` field.

```typescript
// Example: Direct JSON-RPC call
const blockNumber = await client.proxy.getBlockNumber();
// Returns: "0x1234567" (hex string, not full JSON-RPC envelope)

const tx = await client.proxy.getTransactionByHash({
  txhash: '0x...'
});
// Returns: { hash: "0x...", from: "0x...", ... } (transaction object)
```

### Usage Module Special Behavior

**`usage.getChainList()` uses the Transport layer** with `getWithUrl()` to the canonical chainlist endpoint (`/v2/chainlist`), sharing the same reliability features as other requests:

- ✅ Rate limiting and request deduplication
- ✅ Response caching with TTL
- ✅ Request/response interceptors
- ✅ Timeout and retry logic
- ✅ URL validation and content-type checks
- ✅ Error sanitization

**Key differences:**
- No `chainid` or `apikey` parameters (endpoint doesn't require them)
- Uses direct JSON response format instead of standard Etherscan envelope

This endpoint is low-risk since chainlist data is static and doesn't consume API quota.

```typescript
// Example: Direct fetch (no API key required)
const chains = await client.usage.getChainList();
// Returns: [{ chainname: "Ethereum Mainnet", chainid: "1", ... }, ...]
```

### Working with Contracts

```typescript
// Fetch ABI (Returned as parsed JSON object, not string)
const abi = await client.contract.getAbi({
  address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
});

// Verify Source Code (Zod validated response)
const source = await client.contract.getSourceCode({
  address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
});
```

## 🔒 Security & Reliability

### Enterprise-Grade Reliability Features

This SDK includes production-ready features for high-throughput applications:

- **Intelligent Caching:** Automatic response caching with TTL-based expiration prevents redundant API calls
- **Request Deduplication:** Identical concurrent requests are automatically deduplicated to optimize rate limits
- **Response Interceptors:** Pluggable middleware for request/response transformation, logging, and error handling
- **Automatic Retry Logic:** Exponential backoff for transient failures with configurable limits
- **Comprehensive Error Handling:** Structured error types with detailed context for debugging

#### Error Result Exposure
`APIError` instances include the raw Etherscan API response in the `.result` property for debugging, but this is **only exposed in development environments** (`NODE_ENV !== 'production'`). In production, `.result` returns a sanitized placeholder to prevent accidental logging of sensitive API internals.

#### Error Handling Examples
```typescript
import { APIError, RateLimitError, ValidationError } from 'etherscan-v2-sdk';

try {
  const balance = await client.account.getBalance({
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  });
  console.log(`Balance: ${balance} wei`);
} catch (err) {
  if (err instanceof RateLimitError) {
    // Rate limit exceeded - implement backoff
    console.log('Rate limited, retrying in 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else if (err instanceof ValidationError) {
    // Invalid parameters or response validation failed
    console.error('Validation error:', err.message);
  } else if (err instanceof APIError) {
    // API returned an error (invalid address, etc.)
    console.error('API error:', err.message);
    // In development, err.result contains raw API response
  } else {
    // Network or other errors
    console.error('Unexpected error:', err);
  }
}
```

### BigInt Serialization
This SDK returns `BigInt` for values like `value`, `gasPrice`, and `balance`.
**Note:** Standard `JSON.stringify()` throws an error on BigInt.

⚠️ **BigInt requires Node.js 18+**

To serialize responses:
```typescript
// Use a replacer function
JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
```

### API Key Protection
The `apiKey` is stored in a non-enumerable property within the Transport layer. Logging the `client` object to the console will **not** leak your API key.

⚠️ **Security Warning:** Never commit API keys to version control. Use environment variables and ensure proper key rotation policies.

## 🛠️ Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `process.env.ETHERSCAN_API_KEY` | Your Etherscan V2 API Key. |
| `chain` | `number` | `1` (Mainnet) | The Chain ID. Use `EvmChainId` helper or raw numbers. |
| `rateLimit` | `number` | `3` | Max requests per second. Free tier: 3/sec, Pro tiers: 10+/sec. Historical endpoints: 2/sec. |
| `reservoir` | `number` | `100000` | Daily request reservoir limit. Free tier: 100k/day, Pro tiers: up to 1.5M/day. |
| `reservoirRefreshInterval` | `number` | `86400000` (24h) | Reservoir refresh interval in milliseconds. |

### Historical Endpoints

The following SDK methods wrap **historical endpoints** that are rate-limited to **2 requests/second** regardless of your API tier. When using these methods extensively, configure your client with `rateLimit: 2`:

| SDK Method | Module | Description |
| :--- | :--- | :--- |
| `getBalanceHistory()` | `account` | Get historical native balance for an address |
| `getTokenBalanceHistory()` | `tokens` | Get historical ERC20 token balance for an address |
| `getTokenSupplyHistory()` | `tokens` | Get historical ERC20 token total supply |
| `getEthDailyPrice()` | `stats` | Get historical ETH price data |
| `getDailyAvgBlockTime()` | `stats` | Get daily average block time |
| `getDailyAvgNetDifficulty()` | `stats` | Get daily average network difficulty |
| `getDailyAvgHashrate()` | `stats` | Get daily average network hash rate |
| `getDailyAvgGasLimit()` | `gasTracker` | Get daily average gas limit |
| `getDailyTx()` | `stats` | Get daily transaction count |
| `getDailyTransactionFee()` | `stats` | Get daily network transaction fees |

```typescript
// For heavy historical data usage
const client = new EtherscanClient({
  apiKey: process.env.ETHERSCAN_API_KEY,
  chain: EvmChainId.MAINNET,
  rateLimit: 2 // Required for historical endpoints
});
```

## 🍳 Usage Pattern

### Get Full Account Portfolio

Retrieve complete account holdings including native balance, ERC20 tokens, and ERC721 NFTs:

```typescript
async function getAccountPortfolio(address: string) {
  // Native balance
  const balance = await client.account.getBalance({ address });

  // ERC20 token holdings
  const erc20Tokens = await client.tokens.getAddressTokenBalance({ address });

  // ERC721 token holdings
  const erc721Tokens = await client.tokens.getAddressTokenNftBalance({ address });

  return {
    native: balance,
    erc20: erc20Tokens,
    erc721: erc721Tokens
  };
}
```

### Trace Funding Origin

Combine `getFundedBy` with withdrawal tracking to trace complete fund flows:

```typescript
async function traceFundingOrigin(address: string) {
  // Find the address that first funded this account
  const funding = await client.account.getFundedBy({ address });

  // Check for any beacon chain withdrawals (ETH staking rewards)
  const withdrawals = await client.account.getTxsBeaconWithdrawal({ address });

  return {
    initialFunding: funding,
    stakingRewards: withdrawals
  };
}
```

### Multichain Portfolio Analysis

Use `chainlist` API with multiple clients for cross-chain analysis:

```typescript
import { EtherscanClient, EvmChainId } from 'etherscan-v2-sdk';

// Get supported chains
const chains = await client.usage.getChainList();

// Create clients for major chains
const clients = {
  ethereum: new EtherscanClient({ apiKey, chain: EvmChainId.MAINNET }),
  polygon: new EtherscanClient({ apiKey, chain: EvmChainId.POLYGON }),
  arbitrum: new EtherscanClient({ apiKey, chain: EvmChainId.ARBITRUM })
};

// Analyze portfolio across chains
async function getMultiChainBalance(address: string) {
  const balances = await Promise.all(
    Object.entries(clients).map(async ([chain, client]) => ({
      chain,
      balance: await client.account.getBalance({ address })
    }))
  );

  return balances;
}
```

### Batch Historical Data Fetcher

Efficiently fetch large historical datasets using built-in deduplication, rate limiting, and caching. This example fetches 30 days of daily transaction counts with automatic retry and backoff:

```typescript
import { EtherscanClient, RateLimitError } from 'etherscan-v2-sdk';

async function fetchHistoricalTxCounts(client: EtherscanClient, days: number = 30) {
  const results = [];
  const now = new Date();
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  // Process in batches to respect rate limits (historical endpoints: 2 req/sec)
  const batchSize = 5; // 5 days per batch
  const batches = [];

  for (let i = 0; i < days; i += batchSize) {
    const batchStart = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const batchEnd = new Date(Math.min(
      batchStart.getTime() + (batchSize * 24 * 60 * 60 * 1000),
      now.getTime()
    ));

    batches.push({ start: batchStart, end: batchEnd });
  }

  // Fetch batches with automatic deduplication and rate limiting
  for (const batch of batches) {
    try {
      const data = await client.stats.getDailyTx({
        startdate: batch.start.toISOString().split('T')[0],
        enddate: batch.end.toISOString().split('T')[0]
      });

      results.push(...data);
      console.log(`Fetched ${data.length} days of data`);

    } catch (error) {
      if (error instanceof RateLimitError) {
        // SDK handles rate limiting, but we can add custom backoff
        console.log('Rate limited, SDK will retry automatically...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }

  return results.sort((a, b) =>
    new Date(a.UTCDate).getTime() - new Date(b.UTCDate).getTime()
  );
}

// Usage with historical endpoint rate limiting
const client = new EtherscanClient({
  apiKey: process.env.ETHERSCAN_API_KEY,
  rateLimit: 2 // Required for historical endpoints
});

const historicalData = await fetchHistoricalTxCounts(client, 30);
console.log(`Fetched ${historicalData.length} days of transaction data`);
```

## 🧪 Testing & Quality

This SDK maintains **~93% code coverage** (as of Nov 2025) with comprehensive test suites:

- **Unit Tests:** 327+ tests covering all modules and error conditions
- **End-to-end Tests:** End-to-end workflows with mocked transport and deduplication
- **Security Tests:** Input validation, rate limiting, and API key protection
- **Performance Benchmarks:** Caching and concurrency performance validation

Run tests:
```bash
# Using npm
npm test

# Using pnpm
pnpm test

# Using yarn
yarn test

# Using bun (direct vitest)
bun run vitest --run
```

Run with coverage:
```bash
# Using npm
npm run test -- --coverage

# Using pnpm
pnpm run test -- --coverage

# Using yarn
yarn test --coverage

# Using bun
bun run vitest --run --coverage
```

### Testing Philosophy

Tests use mocked HTTP responses to ensure:
- **Deterministic results** across environments
- **Fast execution** without API rate limits
- **Offline development** capability
- **Reliable CI/CD** pipelines

For live API testing:
```bash
# Set environment variable and run live tests
ETHERSCAN_LIVE=1 npm run test:live
```

Or run directly:
```bash
ETHERSCAN_LIVE=1 bun run vitest --run tests/live.test.ts
```

---

## Support This Project

If this SDK saves you time or powers your project, consider:

- ⭐ **Star the repo** to help others discover it
- 🐛 **Report issues** to improve reliability  
- 💬 **Share feedback** on what works (or doesn't)

For enterprise support or custom integrations, reach out via [X/Twitter](https://x.com/royphilip_).

---

## License

MIT

---

<div align="center">
  <p align="center">
    Shipped by <strong>Roy Philip</strong>
    <br />
    <a href="https://royphilip.xyz">royphilip.xyz</a>
    ·
    <a href="https://github.com/royphilip">GitHub</a>
    ·
    <a href="https://x.com/royphilip_">X/Twitter</a>
  </p>
</div>
