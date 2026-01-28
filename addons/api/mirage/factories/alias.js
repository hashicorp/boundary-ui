/**
 * Copyright IBM Corp. 2024, 2026
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
});
