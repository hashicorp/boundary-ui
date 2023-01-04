import factory from '../generated/factories/target';
import { trait } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { TYPES_TARGET, TYPE_TARGET_TCP } from 'api/models/target';

const randomBoolean = (chance = 0.5) => Math.random() < chance;
const hostSetChance = 0.3;
const types = [...TYPES_TARGET];

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('target') || [
      'no-op',
      'read',
      'update',
      'delete',
      'authorize-session',
      'add-host-sources',
      'remove-host-sources',
      'add-credential-sources',
      'remove-credential-sources',
    ],

  /**
   * -1 means "unlimited" and we want to generate these on occasion.
   */
  session_connection_limit: () =>
    faker.helpers.arrayElement([-1, faker.datatype.number()]),
  worker_filter: (i) => (i % 2 === 0 ? faker.random.words() : null),
  egress_worker_filter: (i) => (i % 2 === 0 ? faker.random.words() : null),
  ingress_worker_filter: (i) => (i % 3 === 0 ? faker.random.words() : null),
  type: (i) => types[i % types.length],
  /**
   * Generates attributes fields by type.
   */
  afterCreate(target) {
    const id =
      target.type === TYPE_TARGET_TCP
        ? generateId('ttcp_')
        : generateId('tssh_');
    const default_port = target.type === TYPE_TARGET_TCP ? 443 : 22;
    target.update({
      id,
      attributes: {
        default_port,
      },
    });
  },

  /**
   * Randomly selects existing host sets and credential libraries to assign to target.
   */
  withAssociations: trait({
    afterCreate(target, server) {
      let randomlySelectedHostSets,
        randomlySelectedCredentialLibraries,
        randomlySelectedCredentials;
      randomlySelectedHostSets = server.schema.hostSets
        // BLERG:  fun fact, for no reason at all, the element passed
        // into a where function is not a full model instance, as you might
        // expect at this level of abstraction, but appears to be a serialized
        // representation of the model instance.  It's very confusing since
        // the result set of `where` _is a collection of model instances_.
        .where((hostSet) => hostSet.scopeId === target.scope.id)
        .models.filter(() => randomBoolean(hostSetChance));

      randomlySelectedCredentialLibraries = server.schema.credentialLibraries
        .where(
          (credentialLibrary) => credentialLibrary.scopeId === target.scope.id
        )
        .models.filter(() => randomBoolean())
        .map((cred) => cred.id);
      randomlySelectedCredentials = server.schema.credentials
        .where((credential) => credential.scopeId === target.scope.id)
        .models.filter(() => randomBoolean())
        .map((cred) => cred.id);
      target.update({
        hostSets: randomlySelectedHostSets,
        brokeredCredentialSourceIds: [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
        injectedApplicationCredentialSourceIds: [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
      });
    },
  }),
});
