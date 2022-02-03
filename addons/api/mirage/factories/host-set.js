import factory from '../generated/factories/host-set';
import permissions from '../helpers/permissions';

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
});
