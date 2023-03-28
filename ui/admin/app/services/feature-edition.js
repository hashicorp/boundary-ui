import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'admin/config/environment';

const { defaultEdition, featureEditions } = config.features;

export default class FeatureEditionService extends Service {
  // =services

  @service features;

  // =attributes

  @tracked edition;

  // array of edition strings
  get editions() {
    return Object.keys(featureEditions);
  }

  // =methods

  /**
   * Initializes the selected edition from the config.
   * @param {string} edition
   * @param {?string[]} enabledFeatures - list of extra features to enable
   */
  initialize(edition, enabledFeatures) {
    this.setEdition(edition || defaultEdition, enabledFeatures);
  }

  /**
   * Enables the specified edition.
   * @param {string} edition
   * @param {?string[]} enabledFeatures - list of extra features to enable
   */
  setEdition(edition, enabledFeatures) {
    this.edition = edition;
    const editionFlags = featureEditions[edition];
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
