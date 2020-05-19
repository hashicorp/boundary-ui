import { RestSerializer } from 'ember-cli-mirage';
import { underscore } from '@ember/string';

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

  /**
   * Serialize items into a root key `items`.
   * @return {object}
   */
  serialize() {
    let json = RestSerializer.prototype.serialize.apply(this, arguments);
    // If array, root it under a standard `items` key
    if (json.length) json = {items: json};
    return json;
  }

});
