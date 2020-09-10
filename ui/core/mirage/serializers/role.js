import ApplicationSerializer from './application';
import { underscore } from '@ember/string';

export default ApplicationSerializer.extend({
  modelName: 'role',

  keyForRelationshipId(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName)
    )}_id`;
  },

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(this, arguments);
    
    const serializedUsers = model.users.models.map(user => ({
      scope_id: model.scope.id,
      id: user.id,
      type: 'user'
    }));
    const serializedGroups = model.groups.models.map(group => ({
      scope_id: model.scope.id,
      id: group.id,
      type: 'group'
    }));
    json.principals = [ ...serializedUsers, ...serializedGroups ];

    json.scope = {
      id: model.scope.id,
      type: model.scope.type
    };

    return json;
  }
});
