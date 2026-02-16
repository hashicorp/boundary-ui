/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetBrokeredCredentialSourcesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Loads all credential sources under the current target.
   * @return {Promise{[CredentialLibraryModel, CredentialModel]}}
   */
  beforeModel() {
    const { brokered_credential_source_ids: sourceIDFragments } = this.modelFor(
      'scopes.scope.targets.target',
    );
    return all(
      sourceIDFragments.map(({ value }) => {
        const isStatic = value.includes('cred');
        if (isStatic) {
          return this.store.findRecord('credential', value, {
            reload: true,
          });
        } else {
          return this.store.findRecord('credential-library', value, {
            reload: true,
          });
        }
      }),
    );
  }

  /**
   * Returns the previously loaded target instance.
   * @return {TargetModel}
   */
  model() {
    return this.modelFor('scopes.scope.targets.target');
  }
}
