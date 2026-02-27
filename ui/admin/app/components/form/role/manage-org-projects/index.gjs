/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import SegmentedGroup from "@hashicorp/design-system-components/components/hds/segmented-group/index";
import t from "ember-intl/helpers/t";
import { on } from "@ember/modifier";
import Body from "@hashicorp/design-system-components/components/hds/text/body";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import { array, hash } from "@ember/helper";
import includes from "@nullvoxpopuli/ember-composable-helpers/helpers/includes";
import Snippet from "@hashicorp/design-system-components/components/hds/copy/snippet/index";
import Pagination from "rose/components/rose/pagination";
import ApplicationState from "@hashicorp/design-system-components/components/hds/application-state/index";

export default class FormRoleManageOrgProjectsIndexComponent extends Component {
  // =attributes

  get selectedProjectsCount() {
    const { role, remainingProjectIDs } = this.args.model;
    return role.grantScopeProjectIDs.length - remainingProjectIDs.length;
  }

  // =actions

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  selectionChange({ selectableRowsStates }) {
    const { role } = this.args.model;
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = role.grant_scope_ids.includes(key);
      if (isSelected && !includesId) {
        role.grant_scope_ids = [...role.grant_scope_ids, key];
      } else if (!isSelected && includesId) {
        role.grant_scope_ids = role.grant_scope_ids.filter(
          (item) => item !== key,
        );
      }
    });
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

{{#if @model.totalItemsCount}}
  <Form class="full-width role-manage-custom-scopes-form" @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.role.isSaving}} as |form|>
    <SegmentedGroup as |S|>
      <S.TextInput @value={{@search}} @type="search" placeholder={{t "actions.search"}} aria-label={{t "actions.search"}} {{on "input" @handleSearchInput}} />
    </SegmentedGroup>
    {{#if @model.projectScopes}}
      <div class="table-selected-items-text">
        {{#if this.selectedProjectsCount}}
          <Body @tag="p" @color="faint">
            {{t "resources.role.scope.titles.selected" items=this.selectedProjectsCount total=@model.totalItemsCount}}
          </Body>
        {{/if}}
      </div>
      <Table @columns={{array (hash label=(t "resources.project.title")) (hash label=(t "form.id.label"))}} @model={{@model.projectScopes}} @isSelectable={{true}} @onSelectionChange={{this.selectionChange}} @valign="middle">
        <:body as |B|>
          <B.Tr @selectionKey={{B.data.id}} @isSelected={{includes B.data.id @model.role.grant_scope_ids}} @selectionAriaLabelSuffix="row {{B.data.id}}" data-test-project-scopes-table-row={{B.data.id}}>
            <B.Td>
              <Body @tag="p">
                {{B.data.displayName}}
              </Body>
            </B.Td>
            <B.Td>
              <Snippet @textToCopy={{B.data.id}} @color="secondary" />
            </B.Td>
          </B.Tr>
        </:body>
      </Table>
      <Pagination @model={{@model.orgScope.id}} @totalItems={{@model.totalItems}} @currentPage={{@page}} @currentPageSize={{@pageSize}} />

      <form.actions @submitText={{t "resources.role.scope.actions.apply"}} @cancelText={{t "actions.cancel"}} />
    {{else}}
      <ApplicationState data-test-no-grant-scope-results as |A|>
        <A.Header @title={{t "titles.no-results-found"}} />
        <A.Body @text={{t "descriptions.no-search-results" query=@search resource=(t "resources.scope.title_plural")}} />
      </ApplicationState>
    {{/if}}
  </Form>
{{else}}
  <ApplicationState as |A|>
    <A.Header @title={{t "resources.role.scope.messages.no-scopes.title" type=(t "resources.project.title")}} />
    <A.Body @text={{t "resources.role.scope.messages.no-scopes.description" type=(t "resources.project.title")}} />
    <A.Footer as |F|>
      <F.LinkStandalone @icon="arrow-left" @text={{t "actions.back"}} @route={{if @model.role.scope.isGlobal "scopes.scope.roles.role.manage-scopes.manage-custom-scopes" "scopes.scope.roles.role.manage-scopes"}} />
    </A.Footer>
  </ApplicationState>
{{/if}}</template>}
