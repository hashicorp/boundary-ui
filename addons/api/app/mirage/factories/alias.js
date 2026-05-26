/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/alias';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

const destinationIDs = ['', generateId('t_')];

export default factory.extend({
  id: () => generateId('alt_'),
  destination_id: (i) => destinationIDs[i % destinationIDs.length],
  authorized_actions: () =>
    permissions.authorizedActionsFor('alias') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  scope: () => ({ id: 'global', type: 'global' }),

  afterCreate(alias, server) {
    const scopeId = alias.scope_id || alias.scope?.id;
    if (!scopeId) return;

    const scope = server.schema.scopes.find(scopeId);
    if (!scope?.alias_suffix) return;

    const currentValue = alias.value || '';
    if (!currentValue.endsWith(scope.alias_suffix)) {
      const separator = scope.alias_suffix.startsWith('.') ? '' : '.';
      alias.update({
        value: `${currentValue}${separator}${scope.alias_suffix}`,
      });
    }
  },
});
