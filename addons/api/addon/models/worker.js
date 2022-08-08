import GeneratedWorkerModel from '../generated/models/worker';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class WorkerModel extends GeneratedWorkerModel {
  // =attributes

  /**
   * Names are optional on models in our API.  Thus we need to fallback on ID
   * for display purposes.
   * @type {string}
   */
  get displayName() {
    return this.name || this.id;
  }

  /**
   * Returns whether the worker is a pki worker.
   * @type {boolean}
   */
  get isPki() {
    return this.type === 'pki';
  }

  /**
   * @type {[FragmentTagModel]}
   */
  @fragment('fragment-tag', {
    description:
      'The deduplicated union of the tags reported by the worker ' +
      'from its configuration and any tags added through other means.\nOutput only.',
    readOnly: true,
  })
  canonical_tags;

  /**
   * @type {[FragmentTagModel]}
   */
  @fragment('fragment-tag', {
    description:
      "The tags set in the worker's configuration file.\nOutput only.",
    readOnly: true,
  })
  config_tags;
}
