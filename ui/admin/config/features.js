/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const EDITION = process.env.EDITION || 'oss'; // Default edition is OSS

const defaultEdition = EDITION;

const devFeatures = {
  'dev-edition-toggle': false,
};
const licensedFeatures = {
  'multi-hop-sessions': false,
  'ssh-target': false,
  'ssh-session-recording': false,
  'rdp-target': false,
};
// Base edition declares available features, disabled by default.
const baseEdition = {
  ...devFeatures,
  ...licensedFeatures,
  byow: false,
  'byow-pki-hcp-cluster-id': false,
  'static-credentials': false,
  'target-network-address': false,
  'ldap-auth-methods': false,
  'worker-filter': false,
  'worker-filter-hcp': false,
};
// Editions maps edition keys to their associated feature sets.
const featureEditions = {};
featureEditions.oss = {
  ...baseEdition,
  byow: true,
  'static-credentials': true,
  'target-network-address': true,
  'ldap-auth-methods': true,
};
featureEditions.enterprise = {
  ...featureEditions.oss,
  'worker-filter': true,
};
featureEditions.hcp = {
  ...featureEditions.enterprise,
  'byow-pki-hcp-cluster-id': true,
  'worker-filter-hcp': true,
};

module.exports = {
  featureEditions,
  defaultEdition,
  licensedFeatures,
};
