import { Factory } from 'ember-cli-mirage';
import { random, date, datatype, address } from 'faker';

/**
 *
 * @param {object} plugin
 * @returns
 */
function isAzurePlugin(plugin) {
  if (plugin && plugin.name === 'azure') {
    return true;
  }
}

function isAwsPlugin(plugin) {
  if (plugin && plugin.name === 'aws') {
    return true;
  }
}
/**
 * GeneratedHostCatalogModelFactory
 */
export default Factory.extend({
  type: () => random.arrayElement(['static', 'plugin']),
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => datatype.boolean(),
  plugin: function (i) {
    if (this.type == 'plugin') {
      return {
        id: `pl_${datatype.hexaDecimal(5)}`,
        name: i % 2 ? 'aws' : 'azure',
        description: random.words(),
      };
    }
  },
  disable_credential_rotation: () => datatype.boolean(),
  // Azure specific fields
  region: function () {
    if (isAzurePlugin(this.plugin)) {
      return address.state();
    }
  },
  access_key_id: function () {
    if (isAzurePlugin(this.plugin)) {
      return datatype.hexaDecimal(8);
    }
  },
  secret_access_key: function () {
    if (isAzurePlugin(this.plugin)) {
      return datatype.string(12);
    }
  },
  // AWS specific fields
  tenant_id: function () {
    if (isAwsPlugin(this.plugin)) {
      return datatype.hexaDecimal(6);
    }
  },
  client_id: function () {
    if (isAwsPlugin(this.plugin)) {
      return datatype.hexaDecimal(6);
    }
  },
  subscription_id: function () {
    if (isAwsPlugin(this.plugin)) {
      return datatype.hexaDecimal(8);
    }
  },
  secret_id: function () {
    if (isAwsPlugin(this.plugin)) {
      return datatype.hexaDecimal(6);
    }
  },
  secret_value: function () {
    if (isAwsPlugin(this.plugin)) {
      return datatype.string(12);
    }
  },
});
