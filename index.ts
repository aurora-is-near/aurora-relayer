import nearProvider from 'near-web3-provider';
import yargs from 'yargs';
import { createApp } from './app';

const argv = yargs
  .command('network', 'Network')
  .default('network', process.env.NEAR_ENV || 'local')
  .command('port', 'Port')
  .default('port', 8545)
  .command('master-account', 'Master Account ID')
  .default('master-account', process.env.NEAR_MASTER_ACCOUNT)
  .command('evm-account', 'EVM Account ID')
  .default('evm-account', process.env.NEAR_EVM_ACCOUNT || 'evm')
  .boolean('noisy')
  .default('noisy', false)
  .boolean('fail-hard')
  .default('fail-hard', false)
  .argv;

const NETWORKS = {
  local: {
    label: "LocalNet",
    config: {
      nodeUrl: 'http://localhost:3030',
      networkId: 'local',
      evmAccountId: argv.evmAccount,
      masterAccountId: argv.masterAccount || 'test.near',
      keyPath: '~/.near/local/validator_key.json',
    },
  },
  betanet: {
    label: "BetaNet",
    config: {
      nodeUrl: 'https://rpc.betanet.near.org',
      networkId: 'betanet',
      evmAccountId: argv.evmAccount,
      masterAccountId: argv.masterAccount,
    },
  },
  testnet: {
    label: "TestNet",
    config: {
      nodeUrl: 'https://rpc.testnet.near.org',
      networkId: 'testnet',
      evmAccountId: argv.evmAccount,
      masterAccountId: argv.masterAccount,
    },
  },
  mainnet: {
    label: "MainNet",
    config: {
      nodeUrl: 'https://rpc.mainnet.near.org',
      networkId: 'mainnet',
      evmAccountId: argv.evmAccount,
      masterAccountId: argv.masterAccount,
    },
  },
};

const network = NETWORKS[argv.network];
const provider = new nearProvider.NearProvider(network.config);
const app = createApp(argv, provider);

app.listen(argv.port, () => {
  console.log(`Web3 JSON-RPC proxy for the NEAR ${network.label} listening at http://localhost:${argv.port}...`)
});
