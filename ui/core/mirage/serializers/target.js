import ApplicationSerializer from './application';
import { underscore } from '@ember/string';

export default ApplicationSerializer.extend({
  modelName: 'target',

  keyForRelationshipIds(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName)
    )}_ids`;
  },

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(this, arguments);
    const { hostSets } = this.schema;
    json.host_sets = model.hostSetIds.map(host_set_id => {
      const hostSet = hostSets.find(host_set_id);
      const host_catalog_id = hostSet?.hostCatalog?.id;
      return { id: host_set_id, host_catalog_id };
    });
    return json;
  }

});
