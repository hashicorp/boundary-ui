import GeneratedRoleModel from '../generated/models/role';
import { array } from 'ember-data-model-fragments/attributes';

export default class RoleModel extends GeneratedRoleModel {

  // =attributes

  /**
   * Grants is read-only _most_ under normal circumstances.  But grants can
   * be persisted via a dedicated call to `saveGrants()`.
   */
  @array({readOnly: true}) grants;

  // =methods

  /**
   * Saves the `grants` array on the role via the `set-grants` method.
   * See serializer and adapter for more information.
   * @return {Promise}
   */
  saveGrants() {
    return this.save({
      adapterOptions: {
        method: 'set-grants',
        serializeGrants: true
      }
    });
  }

}
