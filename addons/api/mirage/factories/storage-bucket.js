import factory from '../generated/factories/storage-bucket';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';
import {
  TYPES_STORAGE_BUCKET as types,
  TYPES_STORAGE_BUCKET_PLUGIN,
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
} from 'api/models/storage-bucket';

// Represents known plugin types, except "foobar" which models the possibility
// of receiving an _unknown_ type, which the UI must handle gracefully.
const pluginTypes = [...TYPES_STORAGE_BUCKET_PLUGIN, 'foobar'];

export default factory.extend({
  id: () => generateId('sb_'),

  // Cycle through available types
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('storage-bucket') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  plugin: function (i) {
    if (this.type === 'plugin') {
      return {
        id: `plugin-id-${i}`,
        name: pluginTypes[i % pluginTypes.length],
        description: faker.random.words(),
      };
    }
  },

  attributes() {
    switch (this.plugin?.name) {
      case TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3:
        return {
          region: `us-${faker.address.cardinalDirection()}-${faker.datatype.number(
            {
              max: 9,
            }
          )}`,
        };
    }
  },
});
