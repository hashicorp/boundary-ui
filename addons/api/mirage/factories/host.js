import factory from '../generated/factories/host';
import permissions from '../helpers/permissions';

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
});
