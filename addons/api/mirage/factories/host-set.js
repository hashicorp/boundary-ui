import factory from '../generated/factories/host-set';
import permissions from '../helpers/permissions';
import { datatype, internet, database } from 'faker';

export default factory.extend({
  id: (i) => `host-set-id-${i}`,
  type() {
    return this.hostCatalog?.type || factory.attrs.type;
  },
  authorized_actions: function () {
    const isStatic = this.type === 'static';
    const defaults = ['no-op', 'read', 'update', 'delete'];
    // Only static allows host management at this time.
    if (isStatic) defaults.push('add-hosts', 'remove-hosts');
    return permissions.authorizedActionsFor('host-set') || defaults;
  },
  plugin() {
    if (this.type === 'plugin') {
      return this.hostCatalog.plugin;
    }
  },
  preferred_endpoints() {
    if (this.type === 'plugin') {
      const enpointsAmount = datatype.number({ min: 1, max: 5 });
      let result = [];
      for (let i = 0; i < enpointsAmount; ++i) {
        result.push(internet.ip());
      }
      return result;
    }
  },
  // AWS specific
  filters() {
    if (this.plugin?.name === 'aws') {
      const filtersAmount = datatype.number({ min: 1, max: 5 });
      let result = [];
      for (let i = 0; i < filtersAmount; ++i) {
        result.push(`${datatype.string(3)}=${datatype.string(8)}`);
      }
      return result;
    }
  },
  // Azure specific
  filter() {
    if (this.plugin?.name === 'azure') {
      return `${database.column}=${database.collation}`;
    }
  },
});
