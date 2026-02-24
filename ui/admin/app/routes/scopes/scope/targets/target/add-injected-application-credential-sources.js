/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetAddInjectedApplicationCredentialSourcesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Empty out any previously loaded credential sources.
   */
  beforeModel() {
    this.store.unloadAll('credential-library');
    this.store.unloadAll('credential');
  }

  /**
   * Returns the current target and credential sources.
   * @return {{target: TargetModel, credentialLibraries: [CredentialLibraryModel], credentials: [CredentialModel]}}
   */
  async model() {
    const target = this.modelFor('scopes.scope.targets.target');
    const { id: scope_id } = this.modelFor('scopes.scope');
    const credentialStores = await this.store.query('credential-store', {
      scope_id,
      query: { filters: { scope_id: [{ equals: scope_id }] } },
    });

    // TODO: For some reason, not returning promises fixes
    //  an ember bug similar to this reported issue:
    //  https://github.com/emberjs/data/issues/8299.
    //  This is a temporary fix until we can find a better solution or
    //  we upgrade ember data to try to fix the issue.
    await Promise.all(
      credentialStores.map(({ id: credential_store_id, isStatic }) => {
        if (isStatic) {
          this.store.query('credential', {
            credential_store_id,
          });
        } else {
          this.store.query('credential-library', {
            credential_store_id,
          });
        }
      }),
    );
    const credentialLibraries = this.store.peekAll('credential-library');
    const credentials = this.store.peekAll('credential');
    return {
      target,
      credentialLibraries,
      credentials,
    };
  }
}
