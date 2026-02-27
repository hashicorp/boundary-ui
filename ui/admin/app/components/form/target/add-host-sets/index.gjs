/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';
import Form from "rose/components/rose/form";
import t from "ember-intl/helpers/t";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import { array, hash, fn } from "@ember/helper";
import Field from "@hashicorp/design-system-components/components/hds/form/checkbox/field";
import { on } from "@ember/modifier";
import HostCatalogTypeBadge from "admin/components/host-catalog-type-badge/index";
import Code from "@hashicorp/design-system-components/components/hds/text/code";
import Centered from "rose/components/rose/layout/centered";
import ApplicationState from "@hashicorp/design-system-components/components/hds/application-state/index";

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
      } catch {
        // if the user denies, do nothing and return
        return;
      }

      target.address = null;
      await target.save();
    }

    await this.args.submit(this.selectedHostSetIDs);
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

{{#if this.hasAvailableHostSets}}
  <Form class="full-width" @onSubmit={{this.submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} as |form|>

    <form.actions @submitText={{t "resources.target.actions.add-host-sources"}} @cancelText={{t "actions.cancel"}} />

    <Table @model={{this.filteredHostSets}} @columns={{array (hash label=(t "form.id.label")) (hash label=(t "form.name.label")) (hash label=(t "form.type.label")) (hash label=(t "resources.host-catalog.title"))}} @valign="middle">
      <:body as |B|>
        <B.Tr>
          <B.Td>
            <Field {{on "change" (fn this.toggleHostSet B.data.id)}} as |F|>
              <F.Label>{{B.data.id}}</F.Label>
              <F.HelperText>{{B.data.description}}</F.HelperText>
            </Field>
          </B.Td>
          <B.Td>{{B.data.name}}</B.Td>
          <B.Td><HostCatalogTypeBadge @model={{B.data}} /></B.Td>
          <B.Td>
            <Code>
              {{B.data.host_catalog_id}}
            </Code>
          </B.Td>
        </B.Tr>
      </:body>
    </Table>
  </Form>
{{/if}}

{{#unless this.hasAvailableHostSets}}
  <Centered>
    <ApplicationState as |A|>
      <A.Header @title={{t "resources.target.host-source.messages.none.title"}} />
      <A.Body @text={{t "resources.target.host-source.messages.none.description"}} />
      <A.Footer as |F|>
        <F.LinkStandalone @icon="arrow-left" @text={{t "actions.back"}} @route="scopes.scope.targets.target.host-sources" />
      </A.Footer>
    </ApplicationState>
  </Centered>
{{/unless}}</template>}
