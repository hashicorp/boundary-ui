/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const EDITION = process.env.EDITION || 'oss'; // Default edition is OSS

const defaultEdition = EDITION;

const devFeatures = {
  'dev-edition-toggle': false,
};
const licensedFeatures = {
  'multi-hop-sessions': false,
  'ssh-target': false,
  'session-recording': false,
};
// Base edition declares available features, disabled by default.
const baseEdition = {
  ...devFeatures,
  ...licensedFeatures,
  byow: false,
  'byow-pki-hcp-cluster-id': false,
  'json-credentials': false,
  'static-credentials': false,
  'target-worker-filters-v2': false,
  'target-worker-filters-v2-ingress': false,
  'target-worker-filters-v2-hcp': false,
  'target-network-address': false,
  'vault-worker-filter': false,
};
// Editions maps edition keys to their associated featuresets.
const featureEditions = {};
featureEditions.oss = {
  ...baseEdition,
  byow: true,
  'json-credentials': true,
  'static-credentials': true,
  'target-worker-filters-v2': true,
  'target-network-address': true,
};
featureEditions.enterprise = {
  ...featureEditions.oss,
  'target-worker-filters-v2-ingress': true,
  'vault-worker-filter': true,
};
featureEditions.hcp = {
  ...featureEditions.enterprise,
  'byow-pki-hcp-cluster-id': true,
  'target-worker-filters-v2-hcp': true,
};

module.exports = {
  featureEditions,
  defaultEdition,
  licensedFeatures,
};
