/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
 */
exports.authenticateBoundaryCli = async () => {
  try {
    execSync(
      'boundary authenticate password' +
        ' -addr=' +
        process.env.BOUNDARY_ADDR +
        ' -auth-method-id=' +
        process.env.E2E_PASSWORD_AUTH_METHOD_ID +
        ' -login-name=' +
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME +
        ' -password=env://E2E_PASSWORD_ADMIN_PASSWORD'
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to connect to the specified target
 * @param {string} targetId ID of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
exports.connectToTarget = async (targetId) => {
  let connect;
  try {
    connect = exec(
      'boundary connect' +
        ' -target-id=' +
        targetId +
        ' -exec /usr/bin/ssh --' +
        ' -l ' +
        process.env.E2E_SSH_USER +
        ' -i ' +
        process.env.E2E_SSH_KEY_PATH +
        ' -o UserKnownHostsFile=/dev/null' +
        ' -o StrictHostKeyChecking=no' +
        ' -o IdentitiesOnly=yes' + // forces the use of the provided key
        ' -p {{boundary.port}}' +
        ' {{boundary.ip}}'
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return connect;
};

/**
 * Uses the boundary CLI to create a new org.
 * @returns {string} new org's id
 */
exports.createNewOrgCli = async () => {
  const orgName = 'Org ' + nanoid();
  let newOrg;
  try {
    newOrg = JSON.parse(
      execSync(
        `boundary scopes create \
         -name="${orgName}" \
         -scope-id=global \
         -format json`
      )
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
    exec('boundary scopes delete -id=' + orgId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to create a new project.
 * @param {string} orgId ID of the organization under which the project will be created.
 * @returns {string} new project's ID
 */
exports.createNewProjectCli = async (orgId) => {
  const projectName = 'Project ' + nanoid();
  let newProject;
  try {
    newProject = JSON.parse(
      execSync(
        `boundary scopes create \
         -name="${projectName}" \
         -scope-id=${orgId} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newProject.id;
};

/**
 * Uses the boundary CLI to create a new controller-led worker.
 * @returns {string} new worker's ID
 */
exports.createNewControllerLedWorkerCli = async () => {
  const workerName = 'worker-' + nanoid();
  let newWorker;
  try {
    newWorker = JSON.parse(
      execSync(
        `boundary workers create controller-led \
         -name="${workerName.toLowerCase()}" \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newWorker.id;
};

/**
 * Uses the boundary CLI to create a new password auth-method.
 * @param {string} scopeId ID of the scope under which the auth-method will be created.
 * @returns {string} new auth-method's ID
 */
exports.createNewPasswordAuthMethodCli = async (scopeId) => {
  const authMethodName = 'auth-method-' + nanoid();
  let newAuthMethod;
  try {
    newAuthMethod = JSON.parse(
      execSync(
        `boundary auth-methods create password \
         -name "${authMethodName}" \
         -scope-id ${scopeId} \
         -format json`
      )
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
        -format json`
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};

/**
 * Uses the boundary CLI to create a new password account.
 * @param {string} authMethodId ID of the auth-method that the new account will be created for.
 * @returns {string} new account's ID
 */
exports.createNewPasswordAccountCli = async (authMethodId) => {
  let passwordAccount;
  const login = 'test-login';
  process.env.ACCOUNT_PASSWORD = 'test-password';
  try {
    passwordAccount = JSON.parse(
      execSync(
        `boundary accounts create password \
         -auth-method-id ${authMethodId} \
         -login-name ${login} \
         -password env://ACCOUNT_PASSWORD \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return passwordAccount.id;
};

/**
 * Uses the boundary CLI to create a new role.
 * @param {string} scopeId ID of the scope under which the role will be created.
 * @returns {string} new role's ID
 */
exports.createNewRoleCli = async (scopeId) => {
  const roleName = 'role-' + nanoid();
  let role;
  try {
    role = JSON.parse(
      execSync(
        `boundary roles create \
         -scope-id ${scopeId} \
         -name ${roleName} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return role.id;
};

/**
 * Uses the boundary CLI to create a new group.
 * @param {string} scopeId ID of the scope under which the group will be created.
 * @returns {string} new group's ID
 */
exports.createNewGroupCli = async (scopeId) => {
  const groupName = 'group-' + nanoid();
  let group;
  try {
    group = JSON.parse(
      execSync(
        `boundary groups create \
         -scope-id ${scopeId} \
         -name ${groupName} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return group.id;
};

/**
 * Uses the boundary CLI to create a new user.
 * @param {string} scopeId ID of the scope under which the user will be created.
 * @returns {string} new user's ID
 */
exports.createNewUserCli = async (scopeId) => {
  const userName = 'user-' + nanoid();
  let user;
  try {
    user = JSON.parse(
      execSync(
        `boundary users create \
         -scope-id ${scopeId} \
         -name ${userName} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return user.id;
};

/**
 * Uses the boundary CLI to create a new static host catalog.
 * @param {string} projectId ID of the project under which the host catalog will be created.
 * @returns {string} new host catalog's ID
 */
exports.createNewStaticHostCatalogCli = async (projectId) => {
  const hostCatalogName = 'static-host-catalog-' + nanoid();
  let hostCatalog;
  try {
    hostCatalog = JSON.parse(
      execSync(
        `boundary host-catalogs create static \
         -scope-id ${projectId} \
         -name ${hostCatalogName} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostCatalog.id;
};

/**
 * Uses the boundary CLI to create a new dynamic AWS host catalog.
 * @param {string} projectId ID of the project under which the host catalog will be created.
 * @returns {string} new host catalog's ID
 */
exports.createDynamicAwsHostCatalogCli = async (projectId) => {
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
          -attr region=us-east-1 \
          -secret access_key_id=env://E2E_AWS_ACCESS_KEY_ID \
          -secret secret_access_key=env://E2E_AWS_SECRET_ACCESS_KEY \
          -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostCatalog.id;
};

/**
 * Uses the boundary CLI to create a new static host.
 * @param {string} hostCatalogId ID of the host catalog that the host will be created for.
 * @returns {string} new host's ID
 */
exports.createNewStaticHostCli = async (hostCatalogId) => {
  const hostName = 'static-host-' + nanoid();
  let host;
  try {
    host = JSON.parse(
      execSync(
        `boundary hosts create static \
         -host-catalog-id ${hostCatalogId} \
         -name ${hostName} \
         -address localhost \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return host.id;
};

/**
 * Uses the boundary CLI to create a new static host set.
 * @param {string} hostCatalogId ID of the host catalog that the host set will be created for.
 * @returns {string} new host set's ID
 */
exports.createNewHostSetCli = async (hostCatalogId) => {
  const hostSetName = 'static-host-' + nanoid();
  let hostSet;
  try {
    hostSet = JSON.parse(
      execSync(
        `boundary host-sets create static \
         -host-catalog-id ${hostCatalogId} \
         -name ${hostSetName} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostSet.id;
};

/**
 * Uses the boundary CLI to create a new static credential store.
 * @param {string} projectId ID of the project under which the credential store will be created.
 * @returns {string} new credential store's ID
 */
exports.createNewStaticCredentialStoreCli = async (projectId) => {
  const credentialStoreName = 'static-credential-store-' + nanoid();
  let staticCredentialStore;
  try {
    staticCredentialStore = JSON.parse(
      execSync(
        `boundary credential-stores create static \
         -scope-id ${projectId} \
         -name ${credentialStoreName} \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return staticCredentialStore.id;
};

/**
 * Uses the boundary CLI to create a new vault credential store.
 * @param {string} projectId ID of the project under which the credential store will be created.
 * @param {string} secretPolicyName Name of the secret policy that's used to create vault token.
 * @param {string} boundaryPolicyName Name of the boundary policy that's used to create vault token.
 * @returns {string} new credential store's ID
 */
exports.createNewVaultCredentialStoreCli = async (
  projectId,
  secretPolicyName,
  boundaryPolicyName
) => {
  let credentialStore;
  try {
    execSync(
      `vault policy write ${boundaryPolicyName} ./tests/e2e/tests/fixtures/boundary-controller-policy.hcl`
    );
    execSync(
      `vault policy write ${secretPolicyName} ./tests/e2e/tests/fixtures/kv-policy.hcl`
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
          -format=json`
      )
    );
    const clientToken = vaultToken.auth.client_token;
    const credentialStoreName = 'vault-credential-store-' + nanoid();
    credentialStore = JSON.parse(
      execSync(
        `boundary credential-stores create vault \
          -scope-id ${projectId} \
          -name ${credentialStoreName} \
          -vault-address ${process.env.E2E_VAULT_ADDR} \
          -vault-token ${clientToken} \
          -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return credentialStore.id;
};

/**
 * Uses the boundary CLI to create a new username-password credential.
 * @param {string} credentialStoreId ID of the credential store that the credential will be created for.
 * @returns {string} new credential's ID
 */
exports.createNewUsernamePasswordCredentialCli = async (credentialStoreId) => {
  let usernamePasswordCredential;
  const login = 'test-login';
  process.env.CREDENTIALS_PASSWORD = 'credentials-password';
  try {
    usernamePasswordCredential = JSON.parse(
      execSync(
        `boundary credentials create username-password \
         -name ${login} \
         -credential-store-id ${credentialStoreId} \
         -username ${login} \
         -password env://CREDENTIALS_PASSWORD \
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return usernamePasswordCredential.id;
};

/**
 * Uses the boundary CLI to create a new TCP target.
 * @param {string} projectId ID of the project under which the target will be created.
 * @returns {string} new target's ID
 */
exports.createNewTcpTarget = async (projectId) => {
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
         -format json`
      )
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return target.id;
};

/**
 * Uses the boundary CLI to create a new SSH target.
 * @param {string} projectId ID of the project under which the target will be created.
 * @returns {string} new target's ID
 */
exports.createNewSshTarget = async (projectId) => {
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
         -format json`
      )
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
      execSync(`boundary scopes list -format json -scope-id ${org.id}`)
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];
    const targets = JSON.parse(
      execSync(`boundary targets list -format json -scope-id ${project.id}`)
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];
    session = JSON.parse(
      execSync(
        `boundary targets authorize-session -id ${target.id} -format json`
      )
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return session;
};
