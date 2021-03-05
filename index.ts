import nearProvider from 'near-web3-provider';
import yargs from 'yargs';
import { createApp } from './app';

const argv = yargs
  .command('network', 'Network')
  .default('network', 'local')
  .command('port', 'Port')
  .default('port', 8545)
  .boolean('noisy')
  .default('noisy', false)
  .boolean('fail-hard')
  .default('fail-hard', false)
  .argv;

const NETWORKS = {
  local: {
    nodeUrl: 'http://localhost:3030',
    networkId: 'local',
    evmAccountId: 'evm',
    masterAccountId: 'test.near',
    keyPath: '~/.near/local/validator_key.json',
  },
  betanet: {
    nodeUrl: 'https://rpc.betanet.near.org',
    networkId: 'betanet',
    evmAccountId: 'evm',
    masterAccountId: process.env.NEAR_MASTER_ACCOUNT,
  },
  testnet: {
    nodeUrl: 'https://rpc.testnet.near.org',
    networkId: 'testnet',
    evmAccountId: 'evm',
    masterAccountId: process.env.NEAR_MASTER_ACCOUNT,
  },
  mainnet: {
    nodeUrl: 'https://rpc.mainnet.near.org',
    networkId: 'mainnet',
    evmAccountId: 'evm',
    masterAccountId: process.env.NEAR_MASTER_ACCOUNT,
  },
};

const provider = new nearProvider.NearProvider(NETWORKS[argv.network]);

const app = createApp(argv, provider);

app.listen(argv.port, () => {
  console.log(`Web3 JSON-RPC proxy for ${argv.network} listening at http://localhost:${argv.port}...`)
});
