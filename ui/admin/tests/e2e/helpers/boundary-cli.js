/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { execSync, exec } = require('child_process');
const { nanoid } = require('nanoid');

/**
 * Checks that the boundary cli is available
 */
exports.checkBoundaryCli = async () => {
  try {
    execSync('which boundary');
  } catch (e) {
    throw new Error('boundary does not exist on the path');
  }
};

/**
 * Uses the boundary CLI to authenticate to the specified Boundary instance
 * @param {string} addr Address of the Boundary instance to be authenticated to
 * @param {string} authMethodId ID of the auth method to be used for authentication
 * @param {string} loginName Login name to be used for authentication
 * @param {string} password Password to be used for authentication
 */
exports.authenticateBoundaryCli = async (
  addr,
  authMethodId,
  loginName,
  password,
) => {
  try {
    execSync(
      'boundary authenticate password' +
        ` -addr=${addr}` +
        ` -auth-method-id=${authMethodId}` +
        ` -login-name=${loginName}` +
        ' -password=env://BPASS',
      { env: { ...process.env, BPASS: password } },
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to connect to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @param {string} sshUser User to be used for the ssh connection
 * @param {string} sshKeyPath Path to the ssh key to be used for the ssh connection
 * @returns ChildProcess representing the result of the command execution
 */
exports.connectToTarget = async (targetId, sshUser, sshKeyPath) => {
  let connect;
  try {
    connect = exec(
      `boundary connect -target-id=${targetId}` +
        ' -exec /usr/bin/ssh --' +
        ` -l ${sshUser}` +
        ` -i ${sshKeyPath}` +
        ' -o UserKnownHostsFile=/dev/null' +
        ' -o StrictHostKeyChecking=no' +
        ' -o IdentitiesOnly=yes' + // forces the use of the provided key
        ' -p {{boundary.port}}' +
        ' {{boundary.ip}}',
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return connect;
};

/**
 * Uses the boundary CLI to connect ssh to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
exports.connectSshToTarget = async (targetId) => {
  let connect;
  try {
    connect = exec(
      'boundary connect ssh' +
        ` -target-id=${targetId}` +
        ' --' +
        ' -o UserKnownHostsFile=/dev/null' +
        ' -o StrictHostKeyChecking=no' +
        ' -o IdentitiesOnly=yes', // forces the use of the provided key
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return connect;
};

/**
 * Uses the bounadry CLI to connect to the specified alias
 * If the alias
 * @param {string} alias alias of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
exports.authorizeAlias = async (alias) => {
  try {
    execSync(`boundary targets authorize-session ${alias}`);
  } catch (e) {
    throw new Error(`Failed to connect to alias: ${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to create a new org.
 * @returns {Promise<string>} new org's id
 */
exports.createOrgCli = async () => {
  const orgName = 'Org ' + nanoid();
  let newOrg;
  try {
    newOrg = JSON.parse(
      execSync(
        `boundary scopes create \
        -name="${orgName}" \
        -scope-id=global \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newOrg.id;
};

/**
 * Uses the boundary CLI to delete the specified organization
 * @param {string} orgId ID of the organization to be deleted
 */
exports.deleteOrgCli = async (orgId) => {
  try {
    execSync('boundary scopes delete -id=' + orgId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to delete the specified storage bucket
 * @param {string} storageBucketId ID of the storage bucket to be deleted
 */
exports.deleteStorageBucketCli = async (storageBucketId) => {
  try {
    execSync('boundary storage-buckets delete -id=' + storageBucketId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to delete the specified policy
 * @param {string} policyId ID of the policy to be deleted
 */
exports.deletePolicyCli = async (policyId) => {
  try {
    execSync('boundary policies delete -id=' + policyId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to delete the specified alias
 * @param {string} aliasValue Value of the alias to be deleted
 */
exports.deleteAliasCli = async (aliasValue) => {
  try {
    const aliases = JSON.parse(execSync('boundary aliases list -format json'));
    const alias = aliases.items.filter((obj) => obj.value == aliasValue)[0];

    execSync('boundary aliases delete -id=' + alias.id);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to create a new project.
 * @param {string} orgId ID of the organization under which the project will be created.
 * @returns {Promise<string>} new project's ID
 */
exports.createProjectCli = async (orgId) => {
  const projectName = 'Project ' + nanoid();
  let newProject;
  try {
    newProject = JSON.parse(
      execSync(
        `boundary scopes create \
        -name="${projectName}" \
        -scope-id=${orgId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newProject.id;
};

/**
 * Uses the boundary CLI to create a new controller-led worker.
 * @returns {Promise<string>} new worker's ID
 */
exports.createControllerLedWorkerCli = async () => {
  const workerName = 'worker-' + nanoid();
  let newWorker;
  try {
    newWorker = JSON.parse(
      execSync(
        `boundary workers create controller-led \
        -name="${workerName.toLowerCase()}" \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newWorker.id;
};

/**
 * Uses the boundary CLI to create a new password auth-method.
 * @param {string} scopeId ID of the scope under which the auth-method will be created.
 * @returns {Promise<string>} new auth-method's ID
 */
exports.createPasswordAuthMethodCli = async (scopeId) => {
  const authMethodName = 'auth-method-' + nanoid();
  let newAuthMethod;
  try {
    newAuthMethod = JSON.parse(
      execSync(
        `boundary auth-methods create password \
        -name "${authMethodName}" \
        -scope-id ${scopeId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newAuthMethod.id;
};

/**
 * Uses the boundary CLI to make an auth-method primary.
 * @param {string} scopeId ID of the scope that the auth-method belongs to.
 * @param {string} authMethodId ID of the auth method that will be made primary.
 */
exports.makeAuthMethodPrimaryCli = async (scopeId, authMethodId) => {
  try {
    execSync(
      `boundary scopes update \
        -id=${scopeId} \
        -primary-auth-method-id ${authMethodId} \
        -format json`,
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to create a new password account.
 * @param {string} authMethodId ID of the auth-method that the new account will be created for.
 * @returns {Promise<string>} new account's ID
 */
exports.createPasswordAccountCli = async (authMethodId) => {
  let passwordAccount;
  const login = 'test-login';
  try {
    passwordAccount = JSON.parse(
      execSync(
        `boundary accounts create password \
        -auth-method-id ${authMethodId} \
        -login-name ${login} \
        -password env://ACCOUNT_PASSWORD \
        -format json`,
        { env: { ...process.env, ACCOUNT_PASSWORD: 'test-password' } },
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return passwordAccount.id;
};

/**
 * Uses the boundary CLI to create a new role.
 * @param {string} scopeId ID of the scope under which the role will be created.
 * @returns {Promise<string>} new role's ID
 */
exports.createRoleCli = async (scopeId) => {
  const roleName = 'role-' + nanoid();
  let role;
  try {
    role = JSON.parse(
      execSync(
        `boundary roles create \
        -scope-id ${scopeId} \
        -name ${roleName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return role.id;
};

/**
 * Uses the boundary CLI to create a new group.
 * @param {string} scopeId ID of the scope under which the group will be created.
 * @returns {Promise<string>} new group's ID
 */
exports.createGroupCli = async (scopeId) => {
  const groupName = 'group-' + nanoid();
  let group;
  try {
    group = JSON.parse(
      execSync(
        `boundary groups create \
        -scope-id ${scopeId} \
        -name ${groupName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return group.id;
};

/**
 * Uses the boundary CLI to create a new user.
 * @param {string} scopeId ID of the scope under which the user will be created.
 * @returns {Promise<string>} new user's ID
 */
exports.createUserCli = async (scopeId) => {
  const userName = 'user-' + nanoid();
  let user;
  try {
    user = JSON.parse(
      execSync(
        `boundary users create \
        -scope-id ${scopeId} \
        -name ${userName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return user.id;
};

/**
 * Uses the boundary CLI to create a new static host catalog.
 * @param {string} projectId ID of the project under which the host catalog will be created.
 * @returns {Promise<string>} new host catalog's ID
 */
exports.createStaticHostCatalogCli = async (projectId) => {
  const hostCatalogName = 'static-host-catalog-' + nanoid();
  let hostCatalog;
  try {
    hostCatalog = JSON.parse(
      execSync(
        `boundary host-catalogs create static \
        -scope-id ${projectId} \
        -name ${hostCatalogName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostCatalog.id;
};

/**
 * Uses the boundary CLI to create a new dynamic AWS host catalog.
 * @param {string} projectId ID of the project under which the host catalog will be created.
 * @param {string} region Name of the AWS region that the host catalog will be created for.
 * @returns {Promise<string>} new host catalog's ID
 */
exports.createDynamicAwsHostCatalogCli = async (projectId, region) => {
  const hostCatalogName = 'dynamic-aws-host-catalog-' + nanoid();
  let hostCatalog;
  try {
    hostCatalog = JSON.parse(
      execSync(
        `boundary host-catalogs create plugin \
          -name ${hostCatalogName} \
          -scope-id ${projectId} \
          -plugin-name aws \
          -attr disable_credential_rotation=true \
          -attr region=${region} \
          -secret access_key_id=env://E2E_AWS_ACCESS_KEY_ID \
          -secret secret_access_key=env://E2E_AWS_SECRET_ACCESS_KEY \
          -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostCatalog.id;
};

/**
 * Uses the boundary CLI to create a new static host.
 * @param {string} hostCatalogId ID of the host catalog that the host will be created for.
 * @returns {Promise<string>} new host's ID
 */
exports.createStaticHostCli = async (hostCatalogId) => {
  const hostName = 'static-host-' + nanoid();
  let host;
  try {
    host = JSON.parse(
      execSync(
        `boundary hosts create static \
        -host-catalog-id ${hostCatalogId} \
        -name ${hostName} \
        -address localhost \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return host.id;
};

/**
 * Uses the boundary CLI to create a new static host set.
 * @param {string} hostCatalogId ID of the host catalog that the host set will be created for.
 * @returns {Promise<string>} new host set's ID
 */
exports.createHostSetCli = async (hostCatalogId) => {
  const hostSetName = 'static-host-' + nanoid();
  let hostSet;
  try {
    hostSet = JSON.parse(
      execSync(
        `boundary host-sets create static \
        -host-catalog-id ${hostCatalogId} \
        -name ${hostSetName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostSet.id;
};

/**
 * Uses the boundary CLI to create a new static credential store.
 * @param {string} projectId ID of the project under which the credential store will be created.
 * @returns {Promise<string>} new credential store's ID
 */
exports.createStaticCredentialStoreCli = async (projectId) => {
  const credentialStoreName = 'static-credential-store-' + nanoid();
  let staticCredentialStore;
  try {
    staticCredentialStore = JSON.parse(
      execSync(
        `boundary credential-stores create static \
        -scope-id ${projectId} \
        -name ${credentialStoreName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return staticCredentialStore.id;
};

/**
 * Uses the boundary CLI to create a new vault credential store.
 * @param {string} projectId ID of the project under which the credential store will be created.
 * @param {string} vaultAddr Address of the vault that the credential store will be created for.
 * @param {string} secretPolicyName Name of the secret policy that's used to create vault token.
 * @param {string} boundaryPolicyName Name of the boundary policy that's used to create vault token.
 * @returns {Promise<string>} new credential store's ID
 */
exports.createVaultCredentialStoreCli = async (
  projectId,
  vaultAddr,
  secretPolicyName,
  boundaryPolicyName,
) => {
  let credentialStore;
  try {
    execSync(
      `vault policy write ${boundaryPolicyName} ./tests/e2e/tests/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(
      `vault policy write ${secretPolicyName} ./tests/e2e/tests/fixtures/kv-policy.hcl`,
    );
    const vaultToken = JSON.parse(
      execSync(
        `vault token create \
          -no-default-policy=true \
          -policy=${boundaryPolicyName} \
          -policy=${secretPolicyName} \
          -orphan=true \
          -period=20m \
          -renewable=true \
          -format=json`,
      ),
    );
    const clientToken = vaultToken.auth.client_token;
    const credentialStoreName = 'vault-credential-store-' + nanoid();
    credentialStore = JSON.parse(
      execSync(
        `boundary credential-stores create vault \
          -scope-id ${projectId} \
          -name ${credentialStoreName} \
          -vault-address ${vaultAddr} \
          -vault-token ${clientToken} \
          -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return credentialStore.id;
};

/**
 * Uses the boundary CLI to create a new username-password credential.
 * @param {string} credentialStoreId ID of the credential store that the credential will be created for.
 * @returns {Promise<string>} new credential's ID
 */
exports.createUsernamePasswordCredentialCli = async (credentialStoreId) => {
  let usernamePasswordCredential;
  const login = 'test-login';
  try {
    usernamePasswordCredential = JSON.parse(
      execSync(
        `boundary credentials create username-password \
        -name ${login} \
        -credential-store-id ${credentialStoreId} \
        -username ${login} \
        -password env://CREDENTIALS_PASSWORD \
        -format json`,
        {
          env: { ...process.env, CREDENTIALS_PASSWORD: 'credentials-password' },
        },
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return usernamePasswordCredential.id;
};

/**
 * Uses the boundary CLI to create a new TCP target.
 * @param {string} projectId ID of the project under which the target will be created.
 * @returns {Promise<string>} new target's ID
 */
exports.createTcpTarget = async (projectId) => {
  const targetName = 'target-' + nanoid();
  const defaultPort = 22;
  let target;
  try {
    target = JSON.parse(
      execSync(
        `boundary targets create tcp \
        -default-port ${defaultPort} \
        -name ${targetName} \
        -scope-id ${projectId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return target.id;
};

/**
 * Uses the boundary CLI to create a new SSH target.
 * @param {string} projectId ID of the project under which the target will be created.
 * @returns {Promise<string>} new target's ID
 */
exports.createSshTargetCli = async (projectId) => {
  const targetName = 'target-' + nanoid();
  const defaultPort = 22;
  let target;
  try {
    target = JSON.parse(
      execSync(
        `boundary targets create ssh \
        -default-port ${defaultPort} \
        -name ${targetName} \
        -scope-id ${projectId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return target.id;
};

/**
 * Uses the boundary CLI to get a session created for the specified target
 * @param {string} orgName Name of the organization with the specified project
 * @param {string} projectName Name of project with the specified target
 * @param {string} targetName Name of the target that the anticipated session is created for
 * @returns An object representing an active session created for the specified target
 */
exports.getSessionCli = async (orgName, projectName, targetName) => {
  let session;
  try {
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    const projects = JSON.parse(
      execSync(`boundary scopes list -format json -scope-id ${org.id}`),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];
    const targets = JSON.parse(
      execSync(`boundary targets list -format json -scope-id ${project.id}`),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];
    session = JSON.parse(
      execSync(
        `boundary targets authorize-session -id ${target.id} -format json`,
      ),
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return session;
};

/**
 * Uses the boundary CLI to wait for a session recording to be available.
 * @param {string} storageBucketId ID of storage bucket that the session recording is associated with
 * @returns An object representing a session recording
 */
exports.waitForSessionRecordingCli = async (storageBucketId) => {
  let i = 0;
  let filteredSessionRecording = [];
  do {
    i = i + 1;
    const sessionRecordings = JSON.parse(
      execSync('boundary session-recordings list --recursive -format json'),
    );
    filteredSessionRecording = sessionRecordings.items.filter(
      (obj) =>
        obj.storage_bucket_id == storageBucketId && obj.state == 'available',
    );
    if (filteredSessionRecording.length > 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (i < 5);

  return filteredSessionRecording[0];
};
