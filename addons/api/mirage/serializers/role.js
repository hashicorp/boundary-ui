/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'role',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    const serializedUsers = model.users.models.map((user) => ({
      scope_id: model.scope.id,
      id: user.id,
      type: 'user',
    }));
    const serializedGroups = model.groups.models.map((group) => ({
      scope_id: model.scope.id,
      id: group.id,
      type: 'group',
    }));
    const serializedManagedGroups = model.managedGroups.models.map(
      (managedGroup) => ({
        scope_id: model.scope.id,
        id: managedGroup.id,
        type: 'managed group',
      }),
    );
    json.principals = [
      ...serializedUsers,
      ...serializedGroups,
      ...serializedManagedGroups,
    ];

    if (!json.principals.length) delete json.principals;

    // default grant scopes
    // TODO: all grant_scope_id instances will be removed in future PR
    if (!json.grant_scope_id) json.grant_scope_id = 'this';
    if (json.grant_scope_ids.length === 0) {
      json.grant_scope_ids = ['this'];
    }

    return json;
  },
});
