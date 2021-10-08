Those scripts are for CI only.
Please don't try to run them on your local machine.

Setup does the following:
1. Build docker images for `database` and `endpoint`
2. Pull, init and run `nearcore`
3. Create account `aurora.test.near`
4. Install `aurora-engine` contract
5. Run `database`, `indexer` and `endpoint`

All containers are connected to Docker bridge-network, so Docker's dynamic service-discovery is used to allow containers access each other (`hostname` = `container name`).

**Important**:
Dependency versions are locked for CI consistency (nearcore, aurora-cli, near-cli, aurora-engine).
Perform manual edit on `.ci/common.sh` to update versions.

Each test-workflow should follow the same template:
1. Call `./.ci/setup.sh`
2. Get endpoint hostname from `./.ci/workdir/endpoint.txt`
3. Run tests
4. Print logs (if needed) by calling `./.ci/show_logs.sh [nearcore | database | indexer | endpoint]`
5. Always call `./.ci/cleanup.sh`
