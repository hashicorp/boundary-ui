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

  addWorker(workerGeneratedAuthToken, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-worker',
      workerGeneratedAuthToken,
    };
    return this.save({
      ...options,
      adapterOpions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }
}
