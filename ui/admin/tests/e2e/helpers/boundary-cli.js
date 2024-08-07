/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');

export { createPasswordAccountCli } from './boundary-cli/accounts';

export { deleteAliasCli } from './boundary-cli/aliases';

export { createPasswordAuthMethodCli } from './boundary-cli/auth-methods';

export { authenticateBoundaryCli } from './boundary-cli/authenticate';

export { connectSshToTarget, connectToTarget } from './boundary-cli/connect';

export {
  createStaticCredentialStoreCli,
  createVaultCredentialStoreCli,
} from './boundary-cli/credential-stores';

export { createUsernamePasswordCredentialCli } from './boundary-cli/credentials';

export { createGroupCli } from './boundary-cli/groups';

export {
  createStaticHostCatalogCli,
  createDynamicAwsHostCatalogCli,
} from './boundary-cli/host-catalogs';

export { createHostSetCli } from './boundary-cli/host-sets';

export { createStaticHostCli } from './boundary-cli/hosts';

export {
  deletePolicyCli,
  getPolicyIdFromNameCli,
} from './boundary-cli/policies';

export { createRoleCli } from './boundary-cli/roles';

export {
  createOrgCli,
  createProjectCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  makeAuthMethodPrimaryCli,
} from './boundary-cli/scopes';

export { waitForSessionRecordingCli } from './boundary-cli/session-recordings';

export { deleteStorageBucketCli } from './boundary-cli/storage-buckets';

export {
  authorizeSessionByAliasCli,
  authorizeSessionByTargetIdCli,
  createSshTargetCli,
  createTcpTarget,
  getTargetIdFromNameCli,
} from './boundary-cli/targets';

export { createUserCli } from './boundary-cli/users';

export { createControllerLedWorkerCli } from './boundary-cli/workers';

/**
 * Checks that the boundary cli is available
 */
export async function checkBoundaryCli() {
  try {
    execSync('which boundary');
  } catch (e) {
    throw new Error('boundary does not exist on the path');
  }
}
