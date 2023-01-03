import factory from '../generated/factories/role';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('role') || [
      'no-op',
      'read',
      'update',
      'delete',
      'set-grants',
      'add-principals',
      'remove-principals',
    ],
  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  grant_strings: () => [
    'id=*;action=*',
    'id=*;type=host-catalog;actions=create,read',
  ],

  id: () => generateId('r_'),

  /**
   * Adds principals to the role.
   */
  withPrincipals: trait({
    afterCreate(role, server) {
      const { scope } = role;
      const { id: scopeId } = scope;
      const users = server.createList('user', 2, { scope });
      const groups = server.createList('group', 2, { scope });
      const managedGroups = server.schema.managedGroups.where({
        scopeId,
      }).models;
      role.update({ users, groups, managedGroups });
    },
  }),

  /**
   * Set the grant scope ID to match the scope ID.
   */
  afterCreate(role) {
    const {
      scope: { id },
    } = role;
    role.update({ grant_scope_id: id });
  },
});
