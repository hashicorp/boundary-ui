import ApplicationSerializer from './application';
import { underscore } from '@ember/string';

export default ApplicationSerializer.extend({
  modelName: 'host-set',

  keyForRelationshipIds(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName)
    )}_ids`;
  },

  keyForRelationshipId(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName)
    )}_id`;
  },

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(this, arguments);
    json.host_ids = model.hostIds;
    json.host_catalog_id = model.hostCatalogId;
    json.scope = {
      id: model.scope.id,
      type: model.scope.type
    };
    return json;
  }

});
