const EDITION = process.env.EDITION || 'oss'; // Default edition is OSS

const selectedEdition = EDITION;

// Base edition declares available features, disabled by default.
const baseEdition = {
  byow: false,
  'byow-pki-hcp-cluster-id': false,
  'json-credentials': false,
  'ssh-target': false,
  'static-credentials': false,
  'target-worker-filters-v2': false,
  'target-worker-filters-v2-ingress': false,
  'target-worker-filters-v2-hcp': false,
  'target-network-address': false,
  'vault-worker-filter': false,
  'session-recording': false,
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
  'ssh-target': true,
  'target-worker-filters-v2-ingress': true,
  'vault-worker-filter': true,
  'session-recording': true,
};
featureEditions.hcp = {
  ...featureEditions.enterprise,
  'byow-pki-hcp-cluster-id': true,
  'target-worker-filters-v2-hcp': true,
};

/**
 * Takes a set of features and enables them in all editions.
 * For use in development and testing only.
 */
const enableFeaturesInAllEditions = (features = {}, ENV) => {
  Object.entries(featureEditions).forEach(
    ([key, edition]) => (ENV.featureEditions[key] = { ...features, ...edition })
  );
};

module.exports = {
  featureEditions,
  selectedEdition,
  enableFeaturesInAllEditions,
};
