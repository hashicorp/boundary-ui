import factory from '../generated/factories/host';
import permissions from '../helpers/permissions';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('host') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  id: (i) => `host-id-${i}`,
  type() {
    return this.hostCatalog?.type || factory.attrs.type;
  },
  plugin() {
    if (this.type === 'plugin') {
      return this.hostCatalog.plugin;
    }
  },
});
