import ApplicationSerializer from './application';

export default class ManagedGroupSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;
}
