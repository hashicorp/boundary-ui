/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class FormTargetAddBrokeredCredentialSourcesIndexComponent extends Component {
  // =properties

  /**
   * Array of selected credential source IDs.
   * @type {EmberArray}
   */
  selectedCredentialSourceIDs = A();

  // =actions

  /**
   * Add/Remove credential source to current selection
   * @param {string} credentialSourceId
   */
  @action
  toggleCredentialSource(credentialSourceId) {
    if (!this.selectedCredentialSourceIDs.includes(credentialSourceId)) {
      this.selectedCredentialSourceIDs.addObject(credentialSourceId);
    } else {
      this.selectedCredentialSourceIDs.removeObject(credentialSourceId);
    }
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  class='full-width'
  @onSubmit={{fn @submit this.selectedCredentialSourceIDs}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  as |form|
>
  <form.actions
    @submitText={{t 'resources.target.actions.add-brokered-credential-sources'}}
    @cancelText={{t 'actions.cancel'}}
  />

  <Hds::Table
    @model={{@filteredCredentialSources}}
    @columns={{array
      (hash label=(t 'form.id.label'))
      (hash label=(t 'form.name.label'))
      (hash label=(t 'form.type.label'))
    }}
    @valign='middle'
  >
    <:body as |B|>
      <B.Tr>
        <B.Td data-test-credential-source={{B.data.type}}>
          <Hds::Form::Checkbox::Field
            {{on 'change' (fn this.toggleCredentialSource B.data.id)}}
            as |F|
          >
            <F.Label>{{B.data.id}}</F.Label>
            <F.HelperText>{{B.data.description}}</F.HelperText>
          </Hds::Form::Checkbox::Field>
        </B.Td>
        <B.Td>{{B.data.name}}</B.Td>
        <B.Td><CredSourceTypeBadge @model={{B.data}} /></B.Td>
      </B.Tr>
    </:body>
  </Hds::Table>
</Rose::Form>