import GeneratedWorkerModel from '../generated/models/worker';
import { attr } from '@ember-data/model';

export default class WorkerModel extends GeneratedWorkerModel {
  // =attributes

  @attr({
    description:
      'The deduplicated union of the tags reported by the worker ' +
      'from its configuration and any tags added through other means.\nOutput only.',
    readOnly: true,
  })
  canonical_tags;

  @attr({
    description:
      "The tags set in the worker's configuration file.\nOutput only.",
    readOnly: true,
  })
  config_tags;

  /**
   * Method to modify the adpater to handle custom POST route for creating worker.
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addWorkerLed(workerGeneratedAuthToken, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'create:worker-led',
      workerGeneratedAuthToken
    };
    return super.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }
}
