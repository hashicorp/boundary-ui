/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { A } from '@ember/array';

export default class FormHostSetAddHostsIndexComponent extends Component {
  // =properties

  /**
   * Array of selected host IDs.
   * @type {EmberArray}
   */
  selectedHostIDs = A();

  /**
   * Checks for unassigned hosts.
   * @param {[HostModel]} filteredHosts
   * @type {boolean}
   */
  @computed('filteredHosts.length')
  get hasAvailableHosts() {
    return this.filteredHosts.length > 0;
  }

  /**
   * Hosts currently not assigned to current host set.
   * @type {[HostModel]}
   */
  @computed('args.{model,model.host_ids,hosts}')
  get filteredHosts() {
    return this.args.hosts.filter(
      ({ id }) => !this.args.model.host_ids.includes(id),
    );
  }

  // =actions

  /**
   * Toggle host selection
   * @param {string} hostId
   */
  @action
  toggleHost(hostId) {
    if (!this.selectedHostIDs.includes(hostId)) {
      this.selectedHostIDs.addObject(hostId);
    } else {
      this.selectedHostIDs.removeObject(hostId);
    }
  }

  /**
   * Callback submit with selected host ids
   * @param {requestCallback} fn
   */
  @action
  submit(fn) {
    fn(this.selectedHostIDs);
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if this.hasAvailableHosts}}
  <Rose::Form
    class='full-width'
    @onSubmit={{fn this.submit @submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    as |form|
  >

    <form.actions
      @submitText={{t 'actions.add-hosts'}}
      @cancelText={{t 'actions.cancel'}}
    />

    <Hds::Table
      @model={{this.filteredHosts}}
      @columns={{array
        (hash label=(t 'form.id.label'))
        (hash label=(t 'form.name.label'))
        (hash label=(t 'form.type.label'))
      }}
      @valign='middle'
    >
      <:body as |B|>
        <B.Tr>
          <B.Td>
            <Hds::Form::Checkbox::Field
              {{on 'change' (fn this.toggleHost B.data.id)}}
              as |F|
            >
              <F.Label>{{B.data.id}}</F.Label>
              <F.HelperText>{{B.data.description}}</F.HelperText>
            </Hds::Form::Checkbox::Field>
          </B.Td>
          <B.Td>{{B.data.name}}</B.Td>
          <B.Td><Hds::Badge @text={{B.data.type}} /></B.Td>
        </B.Tr>
      </:body>
    </Hds::Table>
  </Rose::Form>
{{/if}}

{{#unless this.hasAvailableHosts}}
  <Rose::Layout::Centered>
    <Hds::ApplicationState as |A|>
      <A.Header
        @title={{t 'resources.host-set.host.messages.add-none.title'}}
      />
      <A.Body
        @text={{t 'resources.host-set.host.messages.add-none.description'}}
      />
      <A.Footer as |F|>
        <F.LinkStandalone
          @icon='arrow-left'
          @text={{t 'actions.back'}}
          @route='scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts'
        />
      </A.Footer>
    </Hds::ApplicationState>
  </Rose::Layout::Centered>
{{/unless}}