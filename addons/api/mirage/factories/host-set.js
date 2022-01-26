import factory from '../generated/factories/host-set';
import permissions from '../helpers/permissions';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('host-set') || [
      'no-op',
      'read',
      'update',
      'delete',
      'add-hosts',
      'remove-hosts',
    ],
  id: (i) => `host-set-id-${i}`,
  plugin() {
    if (this.type === 'plugin') {
      return this.hostCatalog.plugin;
    }
  },
});
