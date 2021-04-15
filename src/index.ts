import { NETWORKS } from '@aurora-is-near/engine';
import nearProvider from 'near-web3-provider';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { createApp } from './app.js';

const argv = yargs(hideBin(process.argv))
  .command('network', 'Network')
  .default('network', process.env['NEAR_ENV'] || 'local')
  .command('port', 'Port')
  .default('port', 8545)
  .command('master-account', 'Master Account ID')
  .default('master-account', process.env['NEAR_MASTER_ACCOUNT'] || 'test.near')
  .command('evm-account', 'EVM Account ID')
  .default('evm-account', process.env['NEAR_EVM_ACCOUNT'] || 'aurora.test.near')
  .boolean('noisy')
  .default('noisy', false)
  .boolean('fail-hard')
  .default('fail-hard', false)
  .argv;

const network = NETWORKS.get(argv.network)!;
const provider = new nearProvider.NearProvider({
  nodeUrl: network.nearEndpoint,
  networkId: network.id,
  evmAccountId: argv['evmAccount'] || network.contractID,
  masterAccountId: argv['masterAccount'] || 'test.near',
  keyPath: (network.id == 'local') ? '~/.near/local/validator_key.json' : undefined,
});
const app = createApp(argv, provider);

app.listen(argv.port, () => {
  console.log(`Web3 JSON-RPC proxy for the NEAR ${network.label} listening at http://localhost:${argv.port}...`)
});
