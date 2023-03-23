import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'admin/config/environment';

const { selectedEdition, featureEditions } = config;

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
   */
  initialize() {
    this.setEdition(selectedEdition);
  }

  setEdition(edition) {
    const editionFlags = featureEditions[edition];
    Object.keys(editionFlags).forEach((flag) => {
      if (editionFlags[flag]) {
        this.features.enable(flag);
      } else {
        this.features.disable(flag);
      }
    });
    this.edition = edition;
  }
}
