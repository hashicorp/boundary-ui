/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import fetch from 'fetch';

async function autoInitializeFeatureEdition(owner) {
  const service = owner.lookup('service:feature-edition');
  const url = '/metadata.json';
  let edition;
  let features;

  // Attempt to load edition for the metadata JSON
  try {
    const response = await fetch(url);
    const json = await response.json();
    edition = json?.license?.edition;
    features = json?.license?.features;
  } catch (e) {
    // if the request fails, the service will initialize the default edition
    // as specified in the config
  }

  // Initialize the feature edition and its associated features
  service.initialize(edition, features);
}

export async function initialize(owner) {
  const config = owner.resolveRegistration('config:environment');
  const isTesting = config.environment === 'test';
  // Do not auto-init in a test environment.
  // Tests should explicitly enable editions and features as needed.
  if (!isTesting) {
    await autoInitializeFeatureEdition(owner);
  }
}

export default {
  initialize,
};
