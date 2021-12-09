## About

Scripts in this directory allow to setup relayer-testing environment:
1. Build docker images for `database` and `endpoint`
2. Pull, init and run `nearcore`
3. Create account `aurora.test.near`
4. Install `aurora-engine` contract
5. Run `database`, `indexer` and `endpoint`

All containers are connected to Docker bridge-network, so Docker's dynamic service-discovery is used to allow containers access each other (`hostname` = `container name`).

In case of local run, containers publish their ports to `localhost`. When CI is launched on runners,
hostnames are written into `.ci/workers/nearcore.txt`, `.ci/workers/database.txt` and `.ci/workers/endpoint.txt`
accordingly.

Ports:
- Nearcore: `3030`
- Database: `5432`
- Endpoint: `8545`

**Important**:
Dependency versions are locked for CI consistency (nearcore, aurora-cli, near-cli, aurora-engine).
Perform manual edit on `.ci/controls/common.sh` to update versions.

## Usage

### 1. Setting up environment

Use `./setup.sh` script to setup testing environment.
Parameters:
- `--start` - start relayer after setup
- `--rebuild` - rebuild relayer docker images (if nothing was changed, it usually takes no time)
- `--reset` - reset near state to the contract initialization point
- `--reinit` - reinitialize near data from scratch
- `--reinstall-cli` - reinstall aurora-cli and near-cli, useful only in case when version-locks for them was updated

**Note:** Running `./setup.sh --start` if components are already running will cause errors.

### 2. Exploring logs

You can explore logs of each component when they are running like this:
- `./show_logs.sh nearcore`
- `./show_logs.sh database`
- `./show_logs.sh indexer`
- `./show_logs.sh endpoint`

### 3. Stopping

To teardown the testing environment, run `./stop.sh`. To also remove docker-images from your system run `./stop.sh --clean`.

### Typical usage scenario

Most usually, you will want to use this scripts like this:

- Run `./setup.sh`, adding `--rebuild` (if relayer codebase was updated), adding `--reinit`
(if nearcore version-lock was updated or you want to reset neardata) and adding `--reinstall-cli`
(if aurora-cli or near-cli version locks were updated)
- `./setup.sh --reset --start`
- Run test #1
- `./stop.sh`
- `./setup.sh --reset --start`
- Run test #2
- `./stop.sh`
- ...
