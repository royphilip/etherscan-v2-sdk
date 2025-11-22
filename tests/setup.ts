// Global test setup
import { _beforeAll, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Test API key (use a fake one for tests)
process.env.ETHERSCAN_API_KEY = 'TEST_API_KEY';

// Known test addresses
export const TEST_ADDRESSES = {
  VITALIK: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  CONTRACT: '0xA0b86a33E6441e88C5F2712C3E9b74F5b8F1E8b9',
  ZERO: '0x0000000000000000000000000000000000000000',
};

// Mock responses
export const mockResponses = {
  balance: {
    status: '1',
    message: 'OK',
    result: '1000000000000000000', // 1 ETH in wei
  },
  balancemulti: {
    status: '1',
    message: 'OK',
    result: [
      {
        account: TEST_ADDRESSES.VITALIK,
        balance: '1000000000000000000',
      },
      {
        account: TEST_ADDRESSES.CONTRACT,
        balance: '2000000000000000000',
      },
    ],
  },
  transactions: {
    status: '1',
    message: 'OK',
    result: [
      {
        blockNumber: '12345678',
        timeStamp: '1609459200',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        nonce: '1',
        blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
        transactionIndex: '0',
        from: TEST_ADDRESSES.VITALIK,
        to: TEST_ADDRESSES.CONTRACT,
        value: '1000000000000000000',
        gas: '21000',
        gasPrice: '20000000000',
        isError: '0',
        txreceipt_status: '1',
        input: '0x',
        contractAddress: '',
        cumulativeGasUsed: '21000',
        gasUsed: '21000',
        confirmations: '100',
      },
    ],
  },
  beaconWithdrawals: {
    status: '1',
    message: 'OK',
    result: [
      {
        withdrawalIndex: '12345',
        validatorIndex: '67890',
        address: TEST_ADDRESSES.VITALIK,
        amount: '32000000000',
        blockNumber: '12345678',
        timestamp: '1609459200',
      },
    ],
  },
  abi: {
    status: '1',
    message: 'OK',
    result:
      '[{"inputs":[],"name":"test","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
  },
  sourceCode: {
    status: '1',
    message: 'OK',
    result: [
      {
        SourceCode: 'pragma solidity ^0.8.0; contract Test {}',
        ABI: '[]',
        ContractName: 'Test',
        CompilerVersion: 'v0.8.0+commit.c7dfd78e',
        OptimizationUsed: '1',
        Runs: '200',
        ConstructorArguments: '',
        EVMVersion: 'Default',
        Library: '',
        LicenseType: 'MIT',
        Proxy: '0',
        Implementation: '',
        SwarmSource: '',
      },
    ],
  },
  txStatus: {
    status: '1',
    message: 'OK',
    result: {
      isError: '0',
      errDescription: '',
    },
  },
  txReceiptStatus: {
    status: '1',
    message: 'OK',
    result: {
      status: '1',
    },
  },
  error: {
    status: '0',
    message: 'Error',
    result: 'Invalid API Key',
  },
  verification: {
    status: '1',
    message: 'OK',
    result: 'a7lpxkm9kpcpicx7daftmjifrfhiuhf5vqqnawhkfhzfrcpnxj',
  },
  rateLimit: {
    status: '0',
    message: 'Error',
    result: 'Max rate limit reached, please use API Key for higher rate limit',
  },
  noTransactions: {
    status: '0',
    message: 'No transactions found',
    result: '',
  },
  gasOracle: {
    status: '1',
    message: 'OK',
    result: {
      LastBlock: '12345678',
      SafeGasPrice: '20000000000',
      ProposeGasPrice: '25000000000',
      FastGasPrice: '30000000000',
      suggestBaseFee: '20000000000',
      gasUsedRatio: '0.5,0.6,0.7',
    },
  },
  dailyStats: {
    status: '1',
    message: 'OK',
    result: [
      {
        UTCDate: '2023-01-01',
        unixTimeStamp: '1672531200',
        value: '1000000000000000000',
      },
    ],
  },
  gasEstimate: {
    status: '1',
    message: 'OK',
    result: '30',
  },
  labelMasterList: {
    status: '1',
    message: 'OK',
    result: [
      {
        labelname: 'Axelar',
        labelslug: 'axelar',
        shortdescription: 'Cross-chain bridge protocol',
        notes: '',
        lastupdatedtimestamp: 1712897117,
      },
    ],
  },
  exportAddressTags: {
    status: '1',
    message: 'OK',
    result: `address,name,tag\n${TEST_ADDRESSES.VITALIK},Vitalik Buterin,Ethereum Founder`,
  },
  addressTag: {
    status: '1',
    message: 'OK',
    result: [
      {
        address: TEST_ADDRESSES.VITALIK,
        nametag: 'Vitalik Buterin',
        url: 'https://vitalik.ca',
        labels: ['Ethereum', 'Founder'],
        labels_slug: ['ethereum', 'founder'],
      },
    ],
  },
  blockReward: {
    status: '1',
    message: 'OK',
    result: {
      blockNumber: '12345678',
      timeStamp: '1609459200',
      blockMiner: TEST_ADDRESSES.VITALIK,
      blockReward: '2000000000000000000',
      uncles: [],
      uncleInclusionReward: '0',
    },
  },
  blockNoByTime: {
    status: '1',
    message: 'OK',
    result: '12345678',
  },
  blockCountdown: {
    status: '1',
    message: 'OK',
    result: {
      CurrentBlock: '23853694',
      CountdownBlock: '24015880',
      RemainingBlock: '162186',
      EstimateTimeInSec: '1962465.6',
    },
  },
  ethSupply: {
    status: '1',
    message: 'OK',
    result: '120000000000000000000000000',
  },
  ethPrice: {
    status: '1',
    message: 'OK',
    result: {
      ethbtc: '0.05',
      ethbtc_timestamp: '1609459200',
      ethusd: '2000',
      ethusd_timestamp: '1609459200',
    },
  },
  tokenInfo: {
    status: '1',
    message: 'OK',
    result: [
      {
        contractAddress: TEST_ADDRESSES.CONTRACT,
        tokenName: 'Test Token',
        symbol: 'TEST',
        divisor: '18',
        tokenType: 'ERC20',
        totalSupply: '1000000000000000000000000',
        blueCheckmark: 'true',
        description: 'Test token description',
        website: 'https://test.com',
        email: 'test@test.com',
        blog: 'https://blog.test.com',
        reddit: 'https://reddit.com/r/test',
        slack: 'https://slack.test.com',
        facebook: 'https://facebook.com/test',
        twitter: 'https://twitter.com/test',
        bitcointalk: 'https://bitcointalk.org/test',
        github: 'https://github.com/test',
        telegram: 'https://telegram.org/test',
        linkedin: 'https://linkedin.com/test',
        discord: 'https://discord.com/test',
        whitepaper: 'https://whitepaper.test.com',
        tokenPriceUSD: '1.00',
      },
    ],
  },
  tokenHolders: {
    status: '1',
    message: 'OK',
    result: [
      {
        TokenHolderAddress: TEST_ADDRESSES.VITALIK,
        TokenHolderQuantity: '1000000000000000000000',
      },
    ],
  },
  tokenBalance: {
    status: '1',
    message: 'OK',
    result: '1000000000000000000000',
  },
  addressTokenBalance: {
    status: '1',
    message: 'OK',
    result: [
      {
        TokenAddress: TEST_ADDRESSES.CONTRACT,
        TokenName: 'Test Token',
        TokenSymbol: 'TEST',
        TokenQuantity: '1000000000000000000000',
        TokenDivisor: '18',
        TokenPriceUSD: '1.00',
      },
    ],
  },
  addressNftBalance: {
    status: '1',
    message: 'OK',
    result: [
      {
        TokenAddress: TEST_ADDRESSES.CONTRACT,
        TokenName: 'Test NFT',
        TokenSymbol: 'TNFT',
        TokenId: '1',
      },
    ],
  },
  logs: {
    status: '1',
    message: 'OK',
    result: [
      {
        address: TEST_ADDRESSES.CONTRACT,
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
          '0x000000000000000000000000a0b86a33e6441e88c5f2712c3e9b74f5b8f1e8b9',
        ],
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        blockNumber: '12345678',
        timeStamp: '1609459200',
        gasPrice: '20000000000',
        gasUsed: '21000',
        logIndex: '0',
        transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
        transactionIndex: '0',
      },
    ],
  },
  l2Tx: {
    status: '1',
    message: 'OK',
    result: [
      {
        blockNumber: '12345678',
        timeStamp: '1609459200',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        l1BlockNumber: '12345677',
        l1TxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        status: '1',
        from: TEST_ADDRESSES.VITALIK,
        to: TEST_ADDRESSES.CONTRACT,
        contractAddress: '',
        input: '0x',
        value: '1000000000000000000',
        gas: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        isError: '0',
        errDescription: '',
      },
    ],
  },
  l2Deposits: {
    status: '1',
    message: 'OK',
    result: [
      {
        blockNumber: '12345678',
        timeStamp: '1609459200',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: TEST_ADDRESSES.VITALIK,
        to: TEST_ADDRESSES.CONTRACT,
        value: '1000000000000000000',
        contractAddress: '',
        input: '0x',
        gas: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        isError: '0',
        txreceipt_status: '1',
      },
    ],
  },
  chainList: {
    comments: 'Supported Etherscan chains',
    totalcount: 1,
    result: [
      {
        chainname: 'Ethereum Mainnet',
        chainid: '1',
        blockexplorer: 'https://etherscan.io/',
        apiurl: 'https://api.etherscan.io/v2/api?chainid=1',
        status: 1,
        comment: '',
      },
    ],
  },
};

// Helper to mock fetch response
export function mockFetchResponse(response: any, status = 200, contentType = 'application/json') {
  const responseText = contentType.includes('json') ? JSON.stringify(response) : (response.result || response);
  (global.fetch as any).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (header: string) => {
        if (header === 'content-type') return contentType;
        if (header === 'content-length') return responseText.length.toString();
        return null;
      },
    },
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(responseText),
  });
}

// Helper to reset mocks
export function resetMocks() {
  vi.clearAllMocks();
  // Reset fetch mock to default state that returns a mock response
  (global.fetch as any).mockReset();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    status: 200,
    headers: {
      get: (header: string) => {
        if (header === 'content-type') return 'application/json';
        return null;
      },
    },
    json: () => Promise.resolve({ status: '1', message: 'OK', result: 'mocked' }),
    text: () => Promise.resolve('{"status":"1","message":"OK","result":"mocked"}'),
  });
}
