/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';

export default class FormTargetAddHostSetsComponent extends Component {
  // =services

  @service confirm;
  @service intl;

  // =properties

  /**
   * Array of selected host set IDs.
   * @type {EmberArray}
   */
  selectedHostSetIDs = A();

  /**
   * Checks for unassigned host-sets.
   * @param {[HostSetModel]} filteredHostSets
   * @type {boolean}
   */
  get hasAvailableHostSets() {
    return this.filteredHostSets.length > 0;
  }

  /**
   * Host sets not already added to the target.
   * @type {[HostSetModel]}
   */
  get filteredHostSets() {
    // Get IDs for host sets already added to the current target
    const alreadyAddedHostSetIDs = this.args.model.host_sources.map(
      ({ host_source_id }) => host_source_id,
    );
    const notAddedHostSets = this.args.hostSets.filter(
      ({ id }) => !alreadyAddedHostSetIDs.includes(id),
    );
    return notAddedHostSets;
  }

  // =actions

  /**
   * Add/Remove host set to current selection
   * @param {string} hostSetId
   */
  @action
  toggleHostSet(hostSetId) {
    if (!this.selectedHostSetIDs.includes(hostSetId)) {
      this.selectedHostSetIDs.addObject(hostSetId);
    } else {
      this.selectedHostSetIDs.removeObject(hostSetId);
    }
  }

  @action
  @loading
  @notifyError(({ message }) => message)
  async submit() {
    const target = this.args.model;

    if (target.address && this.selectedHostSetIDs.length) {
      try {
        await this.confirm.confirm(
          this.intl.t(
            'resources.target.host-source.questions.delete-address.message',
          ),
          {
            title:
              'resources.target.host-source.questions.delete-address.title',
            confirm: 'resources.target.actions.remove-address',
          },
        );
      } catch (e) {
        // if the user denies, do nothing and return
        return;
      }

      target.address = null;
      await target.save();
    }

    await this.args.submit(this.selectedHostSetIDs);
  }
}
