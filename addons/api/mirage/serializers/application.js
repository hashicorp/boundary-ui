import { RestSerializer } from 'ember-cli-mirage';
import { underscore } from '@ember/string';
import { isArray } from '@ember/array';

/**
 * Manages serialization/normalization of data into and out of the mock API.
 */
export default RestSerializer.extend({

  // =attributes

  /**
   * False to disable automatically rooting payloads under a key.
   * This is handled by the `serialize()` method, see below.
   * @type {boolean}
   */
  root: false,

  /**
   * @type {boolean}
   */
  embed: true,

  // =methods

  /**
   * Generates an underscored key for the attribute.
   * @param {string} attr
   * @return {string}
   */
  keyForAttribute(attr) {
    return underscore(attr);
  },

  keyForRelationshipId(relationshipName) {
    return `${this._container.inflector.singularize(
      underscore(relationshipName)
    )}_id`;
  },

  /**
   * Serialize items into a root key `items`.
   * @return {object}
   */
  serialize() {
    let json = RestSerializer.prototype.serialize.apply(this, arguments);
    // If array, root it under a standard `items` key
    if (isArray(json)) json = {items: json};
    return json;
  },

  /**
   * Serialize scope into the payload, if set.
   * @param {object} model
   * @return {object}
   */
  _hashForModel(model) {
    const json = RestSerializer.prototype._hashForModel.apply(this, arguments);
    if (model.scope) {
      json.scope = {
        id: model.scope.id,
        type: model.scope.type
      };
    }
    return json;
  },

  /**
   * Adds a root to the payload, since `root: false` doesn't appear to affect
   * the normalize method.
   * @param {object} json
   * @return {object}
   */
  normalize(json) {
    let newJSON = json;
    if (this.modelName) {
      newJSON = {};
      newJSON[this.modelName] = json;
    }
    const value = RestSerializer.prototype.normalize.apply(this, [newJSON]);
    return value;
  }

});
