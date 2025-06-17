/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Checks that the vault cli is available
 */
export async function checkVaultCli() {
  try {
    execSync('which vault');
  } catch (e) {
    throw new Error('vault does not exist on the path');
  }
}

/**
 * Generates a vault token to be used to integrate with Boundary
 * @param {string} boundaryPolicyName Name of the boundary policy that's used to create vault token.
 * @param {string} secretPolicyName Name of the secret policy that's used to create vault token.
 * @returns {Promise<string>} Vault Token
 */
export async function getVaultToken(boundaryPolicyName, secretPolicyName) {
  let clientToken;
  try {
    execSync(
      `vault policy write ${boundaryPolicyName} ./admin/tests/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(
      `vault policy write ${secretPolicyName} ./admin/tests/fixtures/kv-policy.hcl`,
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
    clientToken = vaultToken.auth.client_token;
  } catch (e) {
    console.log(`${e.stderr}`);
  }

  return clientToken;
}

/**
 * Sets up vault oidc provider
 * @param {string} vaultAddr address of vault server
 * @param {string} userName name of user to create in OIDC server
 * @param {string} password password of user
 * @param {string} email email of user
 * @param {string} boundaryAddr address of boundary server for the redirect uri
 * @returns {Promise<object>} OIDC info
 */
export async function setupVaultOidc(
  vaultAddr,
  userName,
  password,
  email,
  boundaryAddr,
) {
  const authPolicyName = 'auth-policy';

  execSync(`vault auth enable userpass`);
  execSync(
    `vault policy write ${authPolicyName} ./admin/tests/fixtures/auth-policy.hcl`,
  );
  execSync(
    `vault write auth/userpass/users/${userName} password=${password} token_policies=${authPolicyName} token_ttl=1h`,
  );
  execSync(
    `vault write identity/entity name=${userName} metadata=email=${email} metadata=phone_number=123-456-7890 disabled=false`,
  );
  const entityId = execSync(
    `vault read -field=id identity/entity/name/${userName}`,
  )
    .toString()
    .trim();
  const groupName = 'engineering';
  execSync(
    `vault write identity/group name=${groupName} member_entity_ids=${entityId}`,
  );
  const groupId = execSync(
    `vault read -field=id identity/group/name/${groupName}`,
  )
    .toString()
    .trim();
  const authList = JSON.parse(
    execSync(`vault auth list -detailed -format json`),
  );
  const userpassAccessor = authList['userpass/'].accessor;
  execSync(
    `vault write identity/entity-alias name=${userName} canonical_id=${entityId} mount_accessor=${userpassAccessor}`,
  );
  const assignmentName = 'my-assignment';
  execSync(
    `vault write identity/oidc/assignment/${assignmentName} entity_ids=${entityId} group_ids=${groupId}`,
  );
  const keyName = 'my-key';
  execSync(
    `vault write identity/oidc/key/${keyName} allowed_client_ids=* verification_ttl=2h rotation_period=1h algorithm=RS256`,
  );
  const oidcClientName = 'boundary';
  execSync(
    `vault write identity/oidc/client/${oidcClientName}` +
      ` redirect_uris=${boundaryAddr}/v1/auth-methods/oidc:authenticate:callback` +
      ` assignments=${assignmentName}` +
      ` key=${keyName}` +
      ` id_token_ttl=30m` +
      ` access_token_ttl=1h`,
  );
  const clientId = execSync(
    `vault read -field=client_id identity/oidc/client/${oidcClientName}`,
  )
    .toString()
    .trim();
  const userScopeTemplate = `
  {
    "username": {{identity.entity.name}},
    "email": {{identity.entity.metadata.email}},
    "phone_number": {{identity.entity.metadata.phone_number}}
  }`;
  const userScopeEncoded = Buffer.from(userScopeTemplate).toString('base64');
  execSync(`vault write identity/oidc/scope/user template=${userScopeEncoded}`);
  const groupScopeTemplate = `
  {
    "groups": {{identity.entity.groups.names}}
  }`;
  const groupScopeEncoded = Buffer.from(groupScopeTemplate).toString('base64');
  execSync(
    `vault write identity/oidc/scope/groups template=${groupScopeEncoded}`,
  );

  const providerName = 'my-provider';
  execSync(
    `vault write identity/oidc/provider/${providerName} allowed_client_ids=${clientId} scopes_supported=groups,user issuer=${vaultAddr} &> /dev/null`,
  );

  const oidcConfig = JSON.parse(
    execSync(
      `curl -s ${vaultAddr}/v1/identity/oidc/provider/${providerName}/.well-known/openid-configuration`,
    ),
  );
  const issuer = oidcConfig.issuer;
  const clientSecret = execSync(
    `vault read -field=client_secret identity/oidc/client/${oidcClientName}`,
  )
    .toString()
    .trim();

  return {
    issuer: issuer,
    clientId: clientId,
    clientSecret: clientSecret,
    authPolicyName: authPolicyName,
  };
}

/**
 * Sets up a Vault credential store by configuring policies, enabling secrets,
 * and creating a token with specific permissions.
 *
 * @async
 * @function setupVaultCredentialStore
 * @param {string} boundaryPolicyName - The name of the boundary policy to be created.
 * @param {string} secretPolicyName - The name of the secret policy to be created.
 * @param {string} secretsPath - The path where the secrets engine will be enabled.
 * @param {string} secretName - The name of the secret to be stored in the secrets engine.
 * @param {string} sshUser - The SSH username to be stored in the secret.
 * @param {string} sshKeyPath - The file path to the SSH private key to be stored in the secret.
 * @returns {Promise<string>} Vault Token
 */
export async function setupVaultCredentialStore(
  boundaryPolicyName,
  secretPolicyName,
  secretsPath,
  secretName,
  sshUser,
  sshKeyPath,
) {
  let clientToken;
  try {
    execSync(
      `vault policy write ${boundaryPolicyName} ./admin/tests/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
    execSync(
      `vault kv put -mount ${secretsPath} ${secretName} ` +
        ` username=${sshUser}` +
        ` private_key=@${sshKeyPath}`,
    );
    execSync(
      `vault policy write ${secretPolicyName} ./admin/tests/fixtures/kv-policy.hcl`,
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
    clientToken = vaultToken.auth.client_token;
  } catch (e) {
    console.log(`${e.stderr}`);
  }

  return clientToken;
}
