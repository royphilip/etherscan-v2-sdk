import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse } from './setup';

/**
 * Helper to normalize parameters for comparison.
 * Converts all values to strings to match URLSearchParams behavior.
 */
const normalizeParams = (params: Record<string, any>) => {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      normalized[key] = String(value);
    }
  }
  return normalized;
};

interface SpecTestCase {
  name: string;
  method: (client: EtherscanClient) => Promise<any>;
  expectedParams: Record<string, string | number | boolean>;
  mockResponse: any;
  verifyResult?: (result: any) => void;
}

// Valid dummy values for testing
const VALID_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const VALID_ADDRESS = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae';
const VALID_BLOCK_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const VALID_HEX_VALUE = '0x123';

const MOCK_ETH_BLOCK = {
  number: '0x10d4f',
  hash: VALID_BLOCK_HASH,
  parentHash: VALID_BLOCK_HASH,
  nonce: '0x789',
  sha3Uncles: '0xabc',
  logsBloom: '0x0',
  transactionsRoot: '0x123',
  stateRoot: '0x456',
  receiptsRoot: '0x789',
  miner: VALID_ADDRESS,
  difficulty: '0x1',
  totalDifficulty: '0x2',
  extraData: '0x0',
  size: '0x100',
  gasLimit: '0x100000',
  gasUsed: '0x50000',
  timestamp: '0x12345678',
  transactions: [],
  uncles: []
};

const MOCK_ETH_TX = {
  blockHash: VALID_BLOCK_HASH,
  blockNumber: '0x123456',
  from: VALID_ADDRESS,
  gas: '0x5208',
  gasPrice: '0x4a817c800',
  hash: VALID_TX_HASH,
  input: '0x',
  nonce: '0x1',
  to: VALID_ADDRESS,
  transactionIndex: '0x0',
  value: '0x0',
  v: '0x1b',
  r: VALID_BLOCK_HASH,
  s: VALID_BLOCK_HASH
};

const MOCK_ETH_RECEIPT = {
  transactionHash: VALID_TX_HASH,
  transactionIndex: '0x1',
  blockHash: VALID_BLOCK_HASH,
  blockNumber: '0x123456',
  from: VALID_ADDRESS,
  to: VALID_ADDRESS,
  cumulativeGasUsed: '0x5208',
  gasUsed: '0x5208',
  contractAddress: null,
  logs: [],
  logsBloom: '0x0',
  status: '0x1'
};

describe('Etherscan V2 Specification Compliance', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    // Initialize with a mock key to bypass generic validation
    client = new EtherscanClient({ apiKey: 'YourApiKeyToken' });
  });

  const runTest = async (testCase: SpecTestCase) => {
    // 1. Setup Mock Response
    mockFetchResponse(testCase.mockResponse);

    // 2. Execute SDK Method
    try {
      const result = await testCase.method(client);

      // 3. Verify Request Parameters
      const callArgs = (global.fetch as any).mock.calls[0];
      if (!callArgs) throw new Error('No API call was made');

      const url = new URL(callArgs[0]);
      const actualParams = Object.fromEntries(url.searchParams.entries());

      // Filter out transport-injected params (apikey, chainid)
      const { apikey, chainid, ...relevantParams } = actualParams;

      const expected = normalizeParams(testCase.expectedParams);

      // Strict equality check for parameters
      expect(relevantParams).toEqual(expected);

      // 4. Verify Response parsing (if applicable)
      if (testCase.verifyResult) {
        testCase.verifyResult(result);
      }
    } catch (error) {
      // Enhance error message with context
      if (error instanceof Error) {
        const enhancedError = new Error(`[${testCase.name}] ${error.message}`);
        enhancedError.cause = error;
        throw enhancedError;
      }
      throw error;
    }
  };

  // ===========================================================================
  // 1. ACCOUNTS (23 Endpoints)
  // ===========================================================================
  describe('Account Endpoints', () => {
    it('Get Native Balance', async () => {
      await runTest({
        name: 'balance',
        method: c => c.account.getBalance({ address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', tag: 'latest' }),
        expectedParams: { module: 'account', action: 'balance', address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', tag: 'latest' },
        mockResponse: { status: '1', message: 'OK', result: '172774397764084972158218' }
      });
    });

    it('Get Historical Native Balance', async () => {
      await runTest({
        name: 'balancehistory',
        method: c => c.account.getBalanceHistory({ address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', blockno: 8000000 }),
        expectedParams: { module: 'account', action: 'balancehistory', address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', blockno: 8000000 },
        mockResponse: { status: '1', message: 'OK', result: '610538078574759898951277' } // SDK expects BigInt string
      });
    });

    it('Get Normal Transactions', async () => {
      await runTest({
        name: 'txlist',
        method: c => c.account.getTxList({ address: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'txlist', address: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Internal Transactions by Address', async () => {
      await runTest({
        name: 'txlistinternal (address)',
        method: c => c.account.getTxListInternal({ address: '0x2c1ba59d6f58433fb1eaee7d20b26ed83bda51a3', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'txlistinternal', address: '0x2c1ba59d6f58433fb1eaee7d20b26ed83bda51a3', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Internal Transactions by Hash', async () => {
      await runTest({
        name: 'txlistinternal (txhash)',
        method: c => c.account.getTxListInternalTxHash({ txhash: VALID_TX_HASH }),
        expectedParams: { module: 'account', action: 'txlistinternal', txhash: VALID_TX_HASH },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Internal Transactions by Block Range', async () => {
      await runTest({
        name: 'txlistinternal (blockrange)',
        method: c => c.account.getTxListInternalBlockRange({ startblock: 13481773, endblock: 13481773, page: 1, offset: 10, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'txlistinternal', startblock: 13481773, endblock: 13481773, page: 1, offset: 10, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get ERC20 Token Transfers', async () => {
      await runTest({
        name: 'tokentx',
        method: c => c.account.getTokenTx({ address: '0x4e83362442b8d1bec281594cea3050c8eb01311c', contractaddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', page: 1, offset: 100, startblock: 0, endblock: 99999999, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'tokentx', address: '0x4e83362442b8d1bec281594cea3050c8eb01311c', contractaddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', page: 1, offset: 100, startblock: 0, endblock: 99999999, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get ERC721 Token Transfers', async () => {
      await runTest({
        name: 'tokennfttx',
        method: c => c.account.getTokenNftTx({ address: '0x6975be450864c02b4613023c2152ee0743572325', contractaddress: '0x06012c8cf97bead5deae237070f9587f8e7a266d', page: 1, offset: 100, startblock: 0, endblock: 99999999, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'tokennfttx', address: '0x6975be450864c02b4613023c2152ee0743572325', contractaddress: '0x06012c8cf97bead5deae237070f9587f8e7a266d', page: 1, offset: 100, startblock: 0, endblock: 99999999, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get ERC1155 Token Transfers', async () => {
      await runTest({
        name: 'token1155tx',
        method: c => c.account.getToken1155Tx({ address: '0x83f564d180b58ad9a02a449105568189ee7de8cb', contractaddress: '0x76be3b62873462d2142405439777e971754e8e77', page: 1, offset: 100, startblock: 0, endblock: 99999999, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'token1155tx', address: '0x83f564d180b58ad9a02a449105568189ee7de8cb', contractaddress: '0x76be3b62873462d2142405439777e971754e8e77', page: 1, offset: 100, startblock: 0, endblock: 99999999, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Blocks Validated by Address', async () => {
      await runTest({
        name: 'getminedblocks',
        method: c => c.account.getMinedBlocks({ address: '0x9dd134d14d1e65f84b706d6f205cd5b1cd03a46b', blocktype: 'blocks', page: 1, offset: 10 }),
        expectedParams: { module: 'account', action: 'getminedblocks', address: '0x9dd134d14d1e65f84b706d6f205cd5b1cd03a46b', blocktype: 'blocks', page: 1, offset: 10 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Beacon Chain Withdrawals', async () => {
      await runTest({
        name: 'txsBeaconWithdrawal',
        method: c => c.account.getTxsBeaconWithdrawal({ address: '0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'asc' }),
        expectedParams: { module: 'account', action: 'txsBeaconWithdrawal', address: '0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'asc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Address Funded By', async () => {
      await runTest({
        name: 'fundedby',
        method: c => c.account.getFundedBy({ address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97' }),
        expectedParams: { module: 'account', action: 'fundedby', address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97' },
        mockResponse: {
          status: '1', message: 'OK', result: {
            block: 53708500,
            timeStamp: '1708349932',
            fundingAddress: '0x6969174fd72466430a46e18234d0b530c9fd5f49',
            fundingTxn: VALID_TX_HASH,
            value: '1000000000000000'
          }
        }
      });
    });

    it('Get ERC20 Token Account Balance', async () => {
      await runTest({
        name: 'tokenbalance',
        method: c => c.tokens.getTokenBalance({ address: '0xe04f27eb70e025b78871a2ad7eabe85e61212761', contractaddress: '0x57d90b64a1a57749b0f932f1a3395792e12e7055', tag: 'latest' }),
        expectedParams: { module: 'account', action: 'tokenbalance', address: '0xe04f27eb70e025b78871a2ad7eabe85e61212761', contractaddress: '0x57d90b64a1a57749b0f932f1a3395792e12e7055', tag: 'latest' },
        mockResponse: { status: '1', message: 'OK', result: '135499' }
      });
    });

    it('Get Historical ERC20 Token Balance', async () => {
      await runTest({
        name: 'tokenbalancehistory',
        method: c => c.tokens.getTokenBalanceHistory({ address: '0xe04f27eb70e025b78871a2ad7eabe85e61212761', contractaddress: '0x57d90b64a1a57749b0f932f1a3395792e12e7055', blockno: 8000000 }),
        expectedParams: { module: 'account', action: 'tokenbalancehistory', address: '0xe04f27eb70e025b78871a2ad7eabe85e61212761', contractaddress: '0x57d90b64a1a57749b0f932f1a3395792e12e7055', blockno: 8000000 },
        mockResponse: { status: '1', message: 'OK', result: '135499' }
      });
    });

    it('Get Address ERC20 Token Holding', async () => {
      await runTest({
        name: 'addresstokenbalance',
        method: c => c.tokens.getAddressTokenBalance({ address: '0x983e3660c0bE01991785F80f266A84B911ab59b0', page: 1, offset: 100 }),
        expectedParams: { module: 'account', action: 'addresstokenbalance', address: '0x983e3660c0bE01991785F80f266A84B911ab59b0', page: 1, offset: 100 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Address ERC721 Token Holding', async () => {
      await runTest({
        name: 'addresstokennftbalance',
        method: c => c.tokens.getAddressTokenNftBalance({ address: '0x6b52e83941eb10f9c613c395a834457559a80114', page: 1, offset: 100 }),
        expectedParams: { module: 'account', action: 'addresstokennftbalance', address: '0x6b52e83941eb10f9c613c395a834457559a80114', page: 1, offset: 100 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Address ERC721 Token Inventory', async () => {
      await runTest({
        name: 'addresstokennftinventory',
        method: c => c.tokens.getAddressTokenNftInventory({ address: '0x123432244443b54409430979df8333f9308a6040', contractaddress: '0xed5af388653567af2f388e6224dc7c4b3241c544', page: 1, offset: 100 }),
        expectedParams: { module: 'account', action: 'addresstokennftinventory', address: '0x123432244443b54409430979df8333f9308a6040', contractaddress: '0xed5af388653567af2f388e6224dc7c4b3241c544', page: 1, offset: 100 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Plasma Deposits (L2)', async () => {
      await runTest({
        name: 'txnbridge',
        method: c => c.l2.getTxnBridge({ address: '0x4880bd4695a8e59dc527d124085749744b6c988e', page: 1, offset: 10 }),
        expectedParams: { module: 'account', action: 'txnbridge', address: '0x4880bd4695a8e59dc527d124085749744b6c988e', page: 1, offset: 10 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Deposit Txs (L2)', async () => {
      await runTest({
        name: 'getdeposittxs',
        method: c => c.l2.getDepositTxs({ address: '0x80f3950a4d371c43360f292a4170624abd9eed03', page: 1, offset: 10, sort: 'desc' }),
        expectedParams: { module: 'account', action: 'getdeposittxs', address: '0x80f3950a4d371c43360f292a4170624abd9eed03', page: 1, offset: 10, sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Withdrawal Txs (L2)', async () => {
      await runTest({
        name: 'getwithdrawaltxs',
        method: c => c.l2.getWithdrawalTxs({ address: '0x80f3950a4d371c43360f292a4170624abd9eed03', page: 1, offset: 10, sort: 'desc' }),
        expectedParams: { module: 'account', action: 'getwithdrawaltxs', address: '0x80f3950a4d371c43360f292a4170624abd9eed03', page: 1, offset: 10, sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 2. CONTRACTS (12 Endpoints)
  // ===========================================================================
  describe('Contract Endpoints', () => {
    it('Get Contract ABI', async () => {
      await runTest({
        name: 'getabi',
        method: c => c.contract.getAbi({ address: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413' }),
        expectedParams: { module: 'contract', action: 'getabi', address: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413' },
        mockResponse: { status: '1', message: 'OK', result: '[]' }
      });
    });

    it('Get Contract Source Code', async () => {
      await runTest({
        name: 'getsourcecode',
        method: c => c.contract.getSourceCode({ address: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413' }),
        expectedParams: { module: 'contract', action: 'getsourcecode', address: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Verify Solidity Source Code', async () => {
      await runTest({
        name: 'verifysourcecode',
        method: c => c.contract.verifySourceCode({
          contractaddress: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413',
          sourceCode: 'code',
          codeformat: 'solidity-standard-json-input',
          contractname: 'contract',
          compilerversion: 'v0.8.24',
          optimizationUsed: '1',
          runs: '200',
          licenseType: '1'
        }),
        expectedParams: {
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413',
          sourceCode: 'code',
          codeformat: 'solidity-standard-json-input',
          contractname: 'contract',
          compilerversion: 'v0.8.24',
          optimizationUsed: '1',
          runs: '200',
          licenseType: '1'
        },
        mockResponse: { status: '1', message: 'OK', result: 'guid' }
      });
    });

    it('Check Verify Status', async () => {
      await runTest({
        name: 'checkverifystatus',
        method: c => c.contract.checkVerifyStatus({ guid: 'guid' }),
        expectedParams: { module: 'contract', action: 'checkverifystatus', guid: 'guid' },
        mockResponse: { status: '1', message: 'OK', result: 'Pass' }
      });
    });

    it('Verify Proxy Contract', async () => {
      await runTest({
        name: 'verifyproxycontract',
        method: c => c.contract.verifyProxyContract({ address: VALID_ADDRESS, expectedimplementation: VALID_ADDRESS }),
        expectedParams: { module: 'contract', action: 'verifyproxycontract', address: VALID_ADDRESS, expectedimplementation: VALID_ADDRESS },
        mockResponse: { status: '1', message: 'OK', result: 'guid' }
      });
    });

    it('Check Proxy Verification Status', async () => {
      await runTest({
        name: 'checkproxyverification',
        method: c => c.contract.checkProxyVerification({ guid: 'guid' }),
        expectedParams: { module: 'contract', action: 'checkproxyverification', guid: 'guid' },
        mockResponse: { status: '1', message: 'OK', result: 'Pass' }
      });
    });

    it('Verify Stylus Source Code', async () => {
      await runTest({
        name: 'verifystylus',
        method: c => c.contract.verifyStylus({
          contractaddress: '0x915f0B2f34F5B5b84D1F066b398D7F0E3C2F8f83',
          sourceCode: 'git-url',
          contractname: 'stylus',
          compilerversion: 'stylus:0.5.3',
          licenseType: 3,
          codeformat: 'stylus'
        }),
        expectedParams: {
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: '0x915f0B2f34F5B5b84D1F066b398D7F0E3C2F8f83',
          sourceCode: 'git-url',
          contractname: 'stylus',
          compilerversion: 'stylus:0.5.3',
          licenseType: 3,
          codeformat: 'stylus'
        },
        mockResponse: { status: '1', message: 'OK', result: 'guid' }
      });
    });

    it('Verify Vyper Source Code', async () => {
      await runTest({
        name: 'verifyvyper',
        method: c => c.contract.verifyVyper({
          contractaddress: VALID_ADDRESS,
          sourceCode: 'code',
          codeformat: 'vyper-json',
          contractname: 'name',
          compilerversion: 'v0.3.0',
          optimizationUsed: '1'
        }),
        expectedParams: {
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: VALID_ADDRESS,
          sourceCode: 'code',
          codeformat: 'vyper-json',
          contractname: 'name',
          compilerversion: 'v0.3.0',
          optimizationUsed: '1'
        },
        mockResponse: { status: '1', message: 'OK', result: 'guid' }
      });
    });

    it('Verify zkSync Source Code', async () => {
      await runTest({
        name: 'verifyzksyncsourcecode',
        method: c => c.contract.verifyZkSyncSourceCode({
          contractaddress: VALID_ADDRESS,
          sourceCode: 'code',
          contractname: 'name',
          compilerversion: 'v0.8.0',
          zksolcVersion: 'v1.0',
          compilermode: 'zksync',
          codeformat: 'json'
        }),
        expectedParams: {
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: VALID_ADDRESS,
          sourceCode: 'code',
          contractname: 'name',
          compilerversion: 'v0.8.0',
          zksolcVersion: 'v1.0',
          compilermode: 'zksync',
          codeformat: 'json'
        },
        mockResponse: { status: '1', message: 'OK', result: 'guid' }
      });
    });

    it('Get Contract Creator', async () => {
      await runTest({
        name: 'getcontractcreation',
        method: c => c.contract.getContractCreation({ contractaddresses: VALID_ADDRESS }),
        expectedParams: { module: 'contract', action: 'getcontractcreation', contractaddresses: VALID_ADDRESS },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 3. TRANSACTIONS (2 Endpoints)
  // ===========================================================================
  describe('Transaction Endpoints', () => {
    it('Check Contract Execution Status', async () => {
      await runTest({
        name: 'getstatus',
        method: c => c.transaction.getStatus({ txhash: VALID_TX_HASH }),
        expectedParams: { module: 'transaction', action: 'getstatus', txhash: VALID_TX_HASH },
        mockResponse: { status: '1', message: 'OK', result: { isError: '0', errDescription: '' } }
      });
    });

    it('Check Transaction Receipt Status', async () => {
      await runTest({
        name: 'gettxreceiptstatus',
        method: c => c.transaction.getReceiptStatus({ txhash: VALID_TX_HASH }),
        expectedParams: { module: 'transaction', action: 'gettxreceiptstatus', txhash: VALID_TX_HASH },
        mockResponse: { status: '1', message: 'OK', result: { status: '1' } }
      });
    });
  });

  // ===========================================================================
  // 4. BLOCKS (7 Endpoints)
  // ===========================================================================
  describe('Block Endpoints', () => {
    it('Get Block Rewards', async () => {
      await runTest({
        name: 'getblockreward',
        method: c => c.block.getBlockReward({ blockno: 2165403 }),
        expectedParams: { module: 'block', action: 'getblockreward', blockno: 2165403 },
        mockResponse: {
          status: '1', message: 'OK', result: {
            blockNumber: '2165403',
            timeStamp: '1472533979',
            blockMiner: '0x13a06d3dfe21e0db5c016c03ea7d2509f7f8d1e3',
            blockReward: '5314181600000000000',
            uncles: [],
            uncleInclusionReward: '0'
          }
        }
      });
    });

    it('Get Block Countdown', async () => {
      await runTest({
        name: 'getblockcountdown',
        method: c => c.block.getBlockCountdown({ blockno: 16701588 }),
        expectedParams: { module: 'block', action: 'getblockcountdown', blockno: 16701588 },
        mockResponse: {
          status: '1',
          message: 'OK',
          result: {
            CurrentBlock: '16701587',
            CountdownBlock: '16701588',
            RemainingBlock: '1',
            EstimateTimeInSec: '12.5'
          }
        }
      });
    });

    it('Get Block Number by Timestamp', async () => {
      await runTest({
        name: 'getblocknobytime',
        method: c => c.block.getBlockNoByTime({ timestamp: 1578638524, closest: 'before' }),
        expectedParams: { module: 'block', action: 'getblocknobytime', timestamp: 1578638524, closest: 'before' },
        mockResponse: { status: '1', message: 'OK', result: '12345' }
      });
    });

    it('Get Daily Avg Block Size', async () => {
      await runTest({
        name: 'dailyavgblocksize',
        method: c => c.block.getDailyAvgBlockSize({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyavgblocksize', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Block Count', async () => {
      await runTest({
        name: 'dailyblkcount',
        method: c => c.block.getDailyBlockCount({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyblkcount', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Block Rewards', async () => {
      await runTest({
        name: 'dailyblockrewards',
        method: c => c.block.getDailyBlockRewards({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyblockrewards', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Avg Block Time', async () => {
      await runTest({
        name: 'dailyavgblocktime',
        method: c => c.block.getDailyAvgBlockTime({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyavgblocktime', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Uncle Block Count', async () => {
      await runTest({
        name: 'dailyuncleblkcount',
        method: c => c.block.getDailyUncleBlockCount({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyuncleblkcount', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 5. LOGS (3 Endpoints)
  // ===========================================================================
  describe('Logs Endpoints', () => {
    it('Get Logs (Address)', async () => {
      await runTest({
        name: 'getLogs (address)',
        method: c => c.logs.getLogs({ address: VALID_ADDRESS, fromBlock: 100, toBlock: 200 }),
        expectedParams: { module: 'logs', action: 'getLogs', address: VALID_ADDRESS, fromBlock: 100, toBlock: 200 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Logs (Topics)', async () => {
      await runTest({
        name: 'getLogs (topics)',
        method: c => c.logs.getLogsByTopics({ fromBlock: 100, toBlock: 200, topic0: VALID_BLOCK_HASH, topic0_1_opr: 'and' }),
        expectedParams: { module: 'logs', action: 'getLogs', fromBlock: 100, toBlock: 200, topic0: VALID_BLOCK_HASH, topic0_1_opr: 'and' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Logs (Address + Topics)', async () => {
      await runTest({
        name: 'getLogs (address+topics)',
        method: c => c.logs.getLogsByAddressAndTopics({ address: VALID_ADDRESS, fromBlock: 100, toBlock: 200, topic0: VALID_BLOCK_HASH, topic0_1_opr: 'and' }),
        expectedParams: { module: 'logs', action: 'getLogs', address: VALID_ADDRESS, fromBlock: 100, toBlock: 200, topic0: VALID_BLOCK_HASH, topic0_1_opr: 'and' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 6. PROXY (16 Endpoints)
  // ===========================================================================
  describe('Proxy Endpoints', () => {
    it('eth_blockNumber', async () => {
      await runTest({
        name: 'eth_blockNumber',
        method: c => c.proxy.getBlockNumber(),
        expectedParams: { module: 'proxy', action: 'eth_blockNumber' },
        mockResponse: { result: VALID_HEX_VALUE }
      });
    });

    it('eth_getBlockByNumber', async () => {
      await runTest({
        name: 'eth_getBlockByNumber',
        method: c => c.proxy.getBlockByNumber({ tag: '0x10d4f', boolean: 'true' }),
        expectedParams: { module: 'proxy', action: 'eth_getBlockByNumber', tag: '0x10d4f', boolean: 'true' },
        mockResponse: { result: MOCK_ETH_BLOCK }
      });
    });

    it('eth_getUncleByBlockNumberAndIndex', async () => {
      await runTest({
        name: 'eth_getUncleByBlockNumberAndIndex',
        method: c => c.proxy.getUncleByBlockNumberAndIndex({ tag: '0x10d4f', index: '0x0' }),
        expectedParams: { module: 'proxy', action: 'eth_getUncleByBlockNumberAndIndex', tag: '0x10d4f', index: '0x0' },
        mockResponse: { result: MOCK_ETH_BLOCK }
      });
    });

    it('eth_getBlockTransactionCountByNumber', async () => {
      await runTest({
        name: 'eth_getBlockTransactionCountByNumber',
        method: c => c.proxy.getBlockTransactionCountByNumber({ tag: '0x10d4f' }),
        expectedParams: { module: 'proxy', action: 'eth_getBlockTransactionCountByNumber', tag: '0x10d4f' },
        mockResponse: { result: '0x1' }
      });
    });

    it('eth_getTransactionByHash', async () => {
      await runTest({
        name: 'eth_getTransactionByHash',
        method: c => c.proxy.getTransactionByHash({ txhash: VALID_TX_HASH }),
        expectedParams: { module: 'proxy', action: 'eth_getTransactionByHash', txhash: VALID_TX_HASH },
        mockResponse: { result: MOCK_ETH_TX }
      });
    });

    it('eth_getTransactionByBlockNumberAndIndex', async () => {
      await runTest({
        name: 'eth_getTransactionByBlockNumberAndIndex',
        method: c => c.proxy.getTransactionByBlockNumberAndIndex({ tag: '0x10d4f', index: '0x0' }),
        expectedParams: { module: 'proxy', action: 'eth_getTransactionByBlockNumberAndIndex', tag: '0x10d4f', index: '0x0' },
        mockResponse: { result: MOCK_ETH_TX }
      });
    });

    it('eth_getTransactionCount', async () => {
      await runTest({
        name: 'eth_getTransactionCount',
        method: c => c.proxy.getTransactionCount({ address: VALID_ADDRESS, tag: 'latest' }),
        expectedParams: { module: 'proxy', action: 'eth_getTransactionCount', address: VALID_ADDRESS, tag: 'latest' },
        mockResponse: { result: '0x1' }
      });
    });

    it('eth_sendRawTransaction', async () => {
      await runTest({
        name: 'eth_sendRawTransaction',
        method: c => c.proxy.sendRawTransaction({ hex: VALID_TX_HASH }),
        expectedParams: { module: 'proxy', action: 'eth_sendRawTransaction', hex: VALID_TX_HASH },
        mockResponse: { result: VALID_TX_HASH }
      });
    });

    it('eth_getTransactionReceipt', async () => {
      await runTest({
        name: 'eth_getTransactionReceipt',
        method: c => c.proxy.getTransactionReceipt({ txhash: VALID_TX_HASH }),
        expectedParams: { module: 'proxy', action: 'eth_getTransactionReceipt', txhash: VALID_TX_HASH },
        mockResponse: { result: MOCK_ETH_RECEIPT }
      });
    });

    it('eth_call', async () => {
      await runTest({
        name: 'eth_call',
        method: c => c.proxy.call({ to: VALID_ADDRESS, data: VALID_HEX_VALUE, tag: 'latest' }),
        expectedParams: { module: 'proxy', action: 'eth_call', to: VALID_ADDRESS, data: VALID_HEX_VALUE, tag: 'latest' },
        mockResponse: { result: VALID_HEX_VALUE }
      });
    });

    it('eth_getCode', async () => {
      await runTest({
        name: 'eth_getCode',
        method: c => c.proxy.getCode({ address: VALID_ADDRESS, tag: 'latest' }),
        expectedParams: { module: 'proxy', action: 'eth_getCode', address: VALID_ADDRESS, tag: 'latest' },
        mockResponse: { result: VALID_HEX_VALUE }
      });
    });

    it('eth_getStorageAt', async () => {
      await runTest({
        name: 'eth_getStorageAt',
        method: c => c.proxy.getStorageAt({ address: VALID_ADDRESS, position: VALID_HEX_VALUE, tag: 'latest' }),
        expectedParams: { module: 'proxy', action: 'eth_getStorageAt', address: VALID_ADDRESS, position: VALID_HEX_VALUE, tag: 'latest' },
        mockResponse: { result: VALID_HEX_VALUE }
      });
    });

    it('eth_gasPrice', async () => {
      await runTest({
        name: 'eth_gasPrice',
        method: c => c.proxy.getGasPrice(),
        expectedParams: { module: 'proxy', action: 'eth_gasPrice' },
        mockResponse: { result: VALID_HEX_VALUE }
      });
    });

    it('eth_estimateGas', async () => {
      await runTest({
        name: 'eth_estimateGas',
        method: c => c.proxy.estimateGas({ to: VALID_ADDRESS, data: VALID_HEX_VALUE, value: VALID_HEX_VALUE, gas: VALID_HEX_VALUE }),
        expectedParams: { module: 'proxy', action: 'eth_estimateGas', to: VALID_ADDRESS, data: VALID_HEX_VALUE, value: VALID_HEX_VALUE, gas: VALID_HEX_VALUE },
        mockResponse: { result: VALID_HEX_VALUE }
      });
    });
  });

  // ===========================================================================
  // 7. STATS (14 Endpoints)
  // ===========================================================================
  describe('Stats Endpoints', () => {
    it('Get Total Supply of Ether', async () => {
      await runTest({
        name: 'ethsupply',
        method: c => c.stats.getEthSupply(),
        expectedParams: { module: 'stats', action: 'ethsupply' },
        mockResponse: { status: '1', message: 'OK', result: '122373866217800000000000000' }
      });
    });

    it('Get Total Supply of Ether 2', async () => {
      await runTest({
        name: 'ethsupply2',
        method: c => c.stats.getEthSupply2(),
        expectedParams: { module: 'stats', action: 'ethsupply2' },
        mockResponse: { status: '1', message: 'OK', result: { EthSupply: '0', Eth2Staking: '0', BurntFees: '0', WithdrawnTotal: '0' } }
      });
    });

    it('Get Ether Last Price', async () => {
      await runTest({
        name: 'ethprice',
        method: c => c.stats.getEthPrice(),
        expectedParams: { module: 'stats', action: 'ethprice' },
        mockResponse: { status: '1', message: 'OK', result: { ethbtc: '0', ethbtc_timestamp: '0', ethusd: '0', ethusd_timestamp: '0' } }
      });
    });

    it('Get Ethereum Nodes Size', async () => {
      await runTest({
        name: 'chainsize',
        method: c => c.stats.getChainSize({ startdate: '2019-02-01', enddate: '2019-02-28', clienttype: 'geth', syncmode: 'default', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'chainsize', startdate: '2019-02-01', enddate: '2019-02-28', clienttype: 'geth', syncmode: 'default', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Total Nodes Count', async () => {
      await runTest({
        name: 'nodecount',
        method: c => c.stats.getNodeCount(),
        expectedParams: { module: 'stats', action: 'nodecount' },
        mockResponse: { status: '1', message: 'OK', result: { UTCDate: '', TotalNodeCount: '0' } }
      });
    });

    it('Get Daily Transaction Fee', async () => {
      await runTest({
        name: 'dailytxnfee',
        method: c => c.stats.getDailyTxnFee({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailytxnfee', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily New Address Count', async () => {
      await runTest({
        name: 'dailynewaddress',
        method: c => c.stats.getDailyNewAddress({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailynewaddress', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Network Utilization', async () => {
      await runTest({
        name: 'dailynetutilization',
        method: c => c.stats.getDailyNetUtilization({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailynetutilization', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Avg Network Hash Rate', async () => {
      await runTest({
        name: 'dailyavghashrate',
        method: c => c.stats.getDailyAvgHashrate({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyavghashrate', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Transaction Count', async () => {
      await runTest({
        name: 'dailytx',
        method: c => c.stats.getDailyTx({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailytx', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Avg Network Difficulty', async () => {
      await runTest({
        name: 'dailyavgnetdifficulty',
        method: c => c.stats.getDailyAvgNetDifficulty({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyavgnetdifficulty', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Ether Historical Price', async () => {
      await runTest({
        name: 'ethdailyprice',
        method: c => c.stats.getEthDailyPrice({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'ethdailyprice', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 8. TOKENS (7 Endpoints)
  // ===========================================================================
  describe('Token Endpoints', () => {
    it('Get Token Supply', async () => {
      await runTest({
        name: 'tokensupply',
        method: c => c.tokens.getTokenSupply({ contractaddress: VALID_ADDRESS }),
        expectedParams: { module: 'stats', action: 'tokensupply', contractaddress: VALID_ADDRESS },
        mockResponse: { status: '1', message: 'OK', result: '100' }
      });
    });

    it('Get Token Supply History', async () => {
      await runTest({
        name: 'tokensupplyhistory',
        method: c => c.tokens.getTokenSupplyHistory({ contractaddress: VALID_ADDRESS, blockno: 123 }),
        expectedParams: { module: 'stats', action: 'tokensupplyhistory', contractaddress: VALID_ADDRESS, blockno: 123 },
        mockResponse: { status: '1', message: 'OK', result: '100' }
      });
    });

    it('Get Token Balance', async () => {
      await runTest({
        name: 'tokenbalance',
        method: c => c.tokens.getTokenBalance({ contractaddress: VALID_ADDRESS, address: VALID_ADDRESS, tag: 'latest' }),
        expectedParams: { module: 'account', action: 'tokenbalance', contractaddress: VALID_ADDRESS, address: VALID_ADDRESS, tag: 'latest' },
        mockResponse: { status: '1', message: 'OK', result: '100' }
      });
    });

    it('Get Token Balance History', async () => {
      await runTest({
        name: 'tokenbalancehistory',
        method: c => c.tokens.getTokenBalanceHistory({ contractaddress: VALID_ADDRESS, address: VALID_ADDRESS, blockno: 123 }),
        expectedParams: { module: 'account', action: 'tokenbalancehistory', contractaddress: VALID_ADDRESS, address: VALID_ADDRESS, blockno: 123 },
        mockResponse: { status: '1', message: 'OK', result: '100' }
      });
    });

    it('Get Token Holder List', async () => {
      await runTest({
        name: 'tokenholderlist',
        method: c => c.tokens.getTokenHolderList({ contractaddress: VALID_ADDRESS, page: 1, offset: 10 }),
        expectedParams: { module: 'token', action: 'tokenholderlist', contractaddress: VALID_ADDRESS, page: 1, offset: 10 },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Token Holder Count', async () => {
      await runTest({
        name: 'tokenholdercount',
        method: c => c.tokens.getTokenHolderCount({ contractaddress: VALID_ADDRESS }),
        expectedParams: { module: 'token', action: 'tokenholdercount', contractaddress: VALID_ADDRESS },
        mockResponse: { status: '1', message: 'OK', result: '100' }
      });
    });

    it('Get Token Info', async () => {
      await runTest({
        name: 'tokeninfo',
        method: c => c.tokens.getTokenInfo({ contractaddress: VALID_ADDRESS }),
        expectedParams: { module: 'token', action: 'tokeninfo', contractaddress: VALID_ADDRESS },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Top Token Holders', async () => {
      await runTest({
        name: 'toptokenholders',
        method: c => c.tokens.getTopHolders({ contractaddress: VALID_ADDRESS, offset: 100 }),
        expectedParams: { module: 'token', action: 'topholders', contractaddress: VALID_ADDRESS, offset: 100 }, // Spec doc says action=topholders
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 9. GAS TRACKER (5 Endpoints)
  // ===========================================================================
  describe('Gas Tracker Endpoints', () => {
    it('Get Gas Estimate', async () => {
      await runTest({
        name: 'gasestimate',
        method: c => c.gasTracker.getGasEstimate({ gasprice: '2000000000' }),
        expectedParams: { module: 'gastracker', action: 'gasestimate', gasprice: '2000000000' },
        mockResponse: { status: '1', message: 'OK', result: '123' }
      });
    });

    it('Get Gas Oracle', async () => {
      await runTest({
        name: 'gasoracle',
        method: c => c.gasTracker.getGasOracle(),
        expectedParams: { module: 'gastracker', action: 'gasoracle' },
        mockResponse: { status: '1', message: 'OK', result: { LastBlock: '0', SafeGasPrice: '0', ProposeGasPrice: '0', FastGasPrice: '0', suggestBaseFee: '0', gasUsedRatio: '0' } }
      });
    });

    it('Get Daily Avg Gas Limit', async () => {
      await runTest({
        name: 'dailyavggaslimit',
        method: c => c.gasTracker.getDailyAvgGasLimit({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyavggaslimit', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Avg Gas Price', async () => {
      await runTest({
        name: 'dailyavggasprice',
        method: c => c.gasTracker.getDailyAvgGasPrice({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailyavggasprice', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Get Daily Gas Used', async () => {
      await runTest({
        name: 'dailygasused',
        method: c => c.gasTracker.getDailyGasUsed({ startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' }),
        expectedParams: { module: 'stats', action: 'dailygasused', startdate: '2019-02-01', enddate: '2019-02-28', sort: 'desc' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });
  });

  // ===========================================================================
  // 10. NAMETAGS (3 Endpoints)
  // ===========================================================================
  describe('Nametag Endpoints', () => {
    it('Get Address Nametag', async () => {
      await runTest({
        name: 'getaddresstag',
        method: c => c.nametags.getAddressTag({ address: VALID_ADDRESS }),
        expectedParams: { module: 'nametag', action: 'getaddresstag', address: VALID_ADDRESS },
        mockResponse: { status: '1', message: 'OK', result: [] } // Array result? Spec example says array.
      });
    });

    it('Get Label Master List', async () => {
      await runTest({
        name: 'getlabelmasterlist',
        method: c => c.nametags.getLabelMasterList({ format: 'json' }),
        expectedParams: { module: 'nametag', action: 'getlabelmasterlist', format: 'json' },
        mockResponse: { status: '1', message: 'OK', result: [] }
      });
    });

    it('Export Address Tags', async () => {
      await runTest({
        name: 'exportaddresstags',
        method: c => c.nametags.getExportAddressTags({ label: 'test', format: 'csv' }),
        expectedParams: { module: 'nametag', action: 'exportaddresstags', label: 'test', format: 'csv' },
        mockResponse: { status: '1', message: 'OK', result: 'csv-data' }
      });
    });
  });

  // ===========================================================================
  // 11. USAGE (1 Endpoint)
  // ===========================================================================
  describe('Usage Endpoints', () => {
    it('Chainlist', async () => {
      // Chainlist uses a different base URL usually, handled in SDK.
      await runTest({
        name: 'chainlist',
        method: c => c.usage.getChainList(),
        expectedParams: {}, // No params for chainlist usually
        mockResponse: { comments: 'List of API endpoints maintained by Etherscan EAAS. Available Status codes are (0)=Offline, (1)=Ok, (2)=Degraded', totalcount: 66, result: [] }
      });
    });
  });

});