/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/alias';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

const destinationIDs = ['', generateId('t_')];

const getCombinedSuffixForScope = (scope, server) => {
  const scopeSuffix = scope?.alias_suffix;
  if (!scopeSuffix) return null;

  if (scope.type !== 'project') return `.${scopeSuffix}`;

  const orgScopeId = scope.scope?.id;
  const orgScope = orgScopeId ? server.schema.scopes.find(orgScopeId) : null;
  const orgSuffix = orgScope?.alias_suffix;

  if (!orgSuffix) {
    return `.${scopeSuffix}`;
  }

  return `.${scopeSuffix}.${orgSuffix}`;
};

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
    const scopeId = alias.scope?.id;
    if (!scopeId) return;

    const scope = server.schema.scopes.find(scopeId);
    const combinedSuffix = getCombinedSuffixForScope(scope, server);
    if (!combinedSuffix) return;

    const currentValue = alias.value ?? '';
    if (currentValue.endsWith(combinedSuffix)) return;
    alias.update({ value: `${currentValue}${combinedSuffix}` });
  },
});
