/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
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
   * Checks for unassigned hostsets.
   * @param {[HostSetModel]} filteredHostSets
   * @type {boolean}
   */
  @computed('filteredHostSets.length')
  get hasAvailableHostSets() {
    return this.filteredHostSets.length > 0;
  }

  /**
   * Host sets not already added to the target.
   * @type {[HostSetModel]}
   */
  @computed('args.{hostSets.[],model.host_sources.[]}')
  get filteredHostSets() {
    // Get IDs for host sets already added to the current target
    const alreadyAddedHostSetIDs = this.args.model.host_sources.map(
      ({ host_source_id }) => host_source_id
    );
    const notAddedHostSets = this.args.hostSets.filter(
      ({ id }) => !alreadyAddedHostSetIDs.includes(id)
    );
    return notAddedHostSets;
  }

  // =actions

  @action
  toggleHostSet(hostSet) {
    if (!this.selectedHostSetIDs.includes(hostSet.id)) {
      this.selectedHostSetIDs.addObject(hostSet.id);
    } else {
      this.selectedHostSetIDs.removeObject(hostSet.id);
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
            'resources.target.host-source.questions.delete-address.message'
          ),
          {
            title:
              'resources.target.host-source.questions.delete-address.title',
            confirm: 'resources.target.actions.remove-address',
          }
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
