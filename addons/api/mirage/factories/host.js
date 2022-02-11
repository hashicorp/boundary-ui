import factory from '../generated/factories/host';
import permissions from '../helpers/permissions';
import { internet, datatype } from 'faker';

/**
 * Returns an array of strings with IP addresses.
 * @returns {array}
 */
const returnIpAddressesArray = () => {
  const addressesAmount = Math.floor(Math.random() * 6) + 1;
  let result = [];
  for (let i = 0; i < addressesAmount; ++i) {
    result.push(internet.ip());
  }
  return result;
};

/**
 * Returns an array of strings with DNS names.
 * @param {string} hostType
 */
const returnDnsNames = () => {
  const dnsNamesAmount = Math.floor(Math.random() * 6) + 1;
  let result = [];
  for (let i = 0; i < dnsNamesAmount; i++) {
    result.push(internet.domainName());
  }
  return result;
};

export default factory.extend({
  id: (i) => `host-id-${i}`,
  type() {
    return this.hostCatalog?.type || factory.attrs.type;
  },
  authorized_actions: function () {
    const isStatic = this.type === 'static';
    const defaults = ['no-op', 'read'];
    // Only static allows update/delete at this time.
    if (isStatic) defaults.push('update', 'delete');
    return permissions.authorizedActionsFor('host') || defaults;
  },
  plugin() {
    if (this.type === 'plugin') {
      return this.hostCatalog.plugin;
    }
  },
  attributes() {
    return {
      address: internet.ipv6(),
      ip_addresses: returnIpAddressesArray(),
      external_id: datatype.uuid(),
      // Only aws plugins have dns_names
      dns_names:
        this.type != 'static' && this.plugin?.name === 'aws'
          ? returnDnsNames()
          : undefined,
    };
  },
});
