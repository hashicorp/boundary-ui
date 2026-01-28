/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'admin/config/environment';

export default class FeatureEditionService extends Service {
  // =services

  @service features;

  // =attributes

  licensedFeatures = Object.keys(config.features.licensedFeatures);

  @tracked edition;

  // array of edition strings
  get editions() {
    return Object.keys(config.features.featureEditions);
  }

  // =methods

  /**
   * Initializes the selected edition from the config.
   * @param {string} edition
   * @param {?string[]} enabledFeatures - list of extra features to enable
   */
  initialize(edition, enabledFeatures) {
    this.setEdition(edition || config.features.defaultEdition, enabledFeatures);
  }

  /**
   * Enables the specified edition.
   * @param {string} edition
   * @param {?string[]} enabledFeatures - list of extra features to enable
   */
  setEdition(edition, enabledFeatures) {
    this.edition = edition;
    const editionFlags = config.features.featureEditions[edition];
    Object.keys(editionFlags).forEach((flag) => {
      if (editionFlags[flag]) {
        this.features.enable(flag);
      } else {
        this.features.disable(flag);
      }
    });
    if (enabledFeatures) {
      enabledFeatures.forEach((flag) => this.features.enable(flag));
    }
  }
}
