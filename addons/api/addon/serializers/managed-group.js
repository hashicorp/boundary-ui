import ApplicationSerializer from './application';
import { copy } from 'ember-copy';

export default class ManagedGroupSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  serialize() {
    const serialized = super.serialize(...arguments);

    if (serialized.attributes.filter_string !== undefined) {
      serialized.attributes.filter = serialized.attributes.filter_string;
    }
    delete serialized.attributes.filter_string;

    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);

    if (normalizedHash?.attributes?.filter) {
      normalizedHash.attributes.filter_string =
        normalizedHash.attributes.filter;
      delete normalizedHash.attributes.filter;
    }

    return super.normalize(typeClass, normalizedHash, ...rest);
  }
}
