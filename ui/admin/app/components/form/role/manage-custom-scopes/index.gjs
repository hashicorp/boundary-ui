/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormRoleManageCustomScopesIndexComponent extends Component {
  // =attributes

  @tracked selectedOrgs = [];
  @tracked selectedOrg = '';

  /**
   * Returns the display name of the selectedOrg.
   * @type {string}
   */
  get orgDisplayName() {
    const org = this.args.model.scopes.find(
      ({ id }) => id === this.selectedOrg,
    );
    return org.displayName;
  }

  // =actions

  /**
   * Handles the org selection changes for the paginated table.
   * @param {object} selectableRowsStates
   * @param {object} selectionKey
   */
  @action
  orgSelectionChange({ selectableRowsStates, selectionKey }) {
    const { role, projectTotals } = this.args.model;

    const addOrRemoveValues = (add, remove, orgId) => {
      let selectedOrg;
      const includesId = role.grant_scope_ids.includes(orgId);
      const selected = projectTotals[orgId]?.selected;
      if (add && !includesId) {
        role.grant_scope_ids = [...role.grant_scope_ids, orgId];
      } else if (remove && includesId) {
        if (selected?.length) {
          selectedOrg = orgId;
        }
        role.grant_scope_ids = role.grant_scope_ids.filter(
          (item) => item !== orgId,
        );
      }
      return selectedOrg;
    };

    if (selectionKey === 'all') {
      const selectedOrgs = [];
      selectableRowsStates.forEach(({ selectionKey, isSelected }) => {
        const selectedOrg = addOrRemoveValues(
          isSelected,
          !isSelected,
          selectionKey,
        );
        if (selectedOrg) {
          selectedOrgs.push(selectedOrg);
        }
      });
      this.selectedOrgs = selectedOrgs;
    } else {
      this.selectedOrg = addOrRemoveValues(true, true, selectionKey);
    }
  }

  /**
   * Removes projects from an org that was deselected and toggles the correct modal off.
   * @param {boolean} toggleRemoveAllModal
   */
  @action
  removeProjects(toggleRemoveAllModal) {
    const selectedOrgs = toggleRemoveAllModal
      ? this.selectedOrgs
      : [this.selectedOrg];
    const { role, projectTotals } = this.args.model;
    selectedOrgs.forEach((orgId) => {
      const { selected, total } = projectTotals[orgId];
      role.grant_scope_ids = role.grant_scope_ids.filter(
        (item) => !selected.includes(item),
      );
      projectTotals[orgId] = { selected: [], total };
    });
    if (toggleRemoveAllModal) {
      this.toggleRemoveAllModal();
    } else {
      this.toggleRemoveOrgModal();
    }
  }

  /**
   * Toggles the modal to remove an org and projects off.
   */
  @action
  toggleRemoveOrgModal() {
    this.selectedOrg = '';
  }

  /**
   * Toggles the modal to remove orgs and projects off.
   */
  @action
  toggleRemoveAllModal() {
    this.selectedOrgs = [];
  }

  /**
   * Handles the project selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  projectSelectionChange({ selectableRowsStates }) {
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
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if @model.totalItemsCount}}
  <Rose::Form
    class='full-width role-manage-custom-scopes-form'
    @onSubmit={{@submit}}
    @cancel={{@cancel}}
    @disabled={{@model.role.isSaving}}
    as |form|
  >
    <Hds::SegmentedGroup as |S|>
      <S.TextInput
        @value={{@search}}
        @type='search'
        placeholder={{t 'actions.search'}}
        aria-label={{t 'actions.search'}}
        {{on 'input' @handleSearchInput}}
      />
      {{#unless @model.canSelectOrgs}}
        <S.Generic>
          <Dropdown
            name='org'
            @toggleText={{t 'resources.org.title'}}
            @itemOptions={{@orgScopes}}
            @checkedItems={{@orgs}}
            @applyFilter={{fn @applyFilter 'orgs'}}
            @isSearchable={{true}}
          />
        </S.Generic>
      {{/unless}}
    </Hds::SegmentedGroup>

    {{#if @model.scopes}}
      {{#if @model.canSelectOrgs}}
        <div class='table-selected-items-text'>
          {{#if @model.role.grantScopeOrgIDs.length}}
            <Hds::Text::Body @tag='p' @color='faint'>
              {{t
                'resources.role.scope.titles.selected'
                items=@model.role.grantScopeOrgIDs.length
                total=@model.totalItemsCount
              }}
            </Hds::Text::Body>
          {{/if}}
        </div>

        <Hds::Table
          @columns={{array
            (hash label=(t 'resources.role.scope.title'))
            (hash label=(t 'form.id.label'))
            (hash label=(t 'resources.role.scope.titles.projects_selected'))
          }}
          @model={{@model.scopes}}
          @isSelectable={{true}}
          @onSelectionChange={{this.orgSelectionChange}}
          @valign='middle'
        >
          <:body as |B|>
            <B.Tr
              @selectionKey={{B.data.id}}
              @isSelected={{includes B.data.id @model.role.grantScopeOrgIDs}}
              @selectionAriaLabelSuffix='row {{B.data.id}}'
              data-test-org-scopes-table-row={{B.data.id}}
            >
              <B.Td>
                <Hds::Text::Body @tag='p'>
                  {{B.data.displayName}}
                </Hds::Text::Body>
              </B.Td>
              <B.Td>
                <Hds::Copy::Snippet
                  @textToCopy={{B.data.id}}
                  @color='secondary'
                />
              </B.Td>
              <B.Td>
                {{#let (get @model.projectTotals B.data.id) as |projectTotals|}}
                  {{#if projectTotals}}
                    <Hds::Link::Standalone
                      @icon='arrow-right'
                      @iconPosition='trailing'
                      @text={{t
                        'resources.role.scope.actions.view-projects'
                        selected=projectTotals.selected.length
                        total=projectTotals.total
                      }}
                      @route='scopes.scope.roles.role.manage-scopes.manage-org-projects'
                      @model={{B.data.id}}
                    />
                  {{/if}}
                {{/let}}
              </B.Td>
            </B.Tr>
          </:body>
        </Hds::Table>
      {{else}}
        <FilterTags @filters={{@filters}} />

        <div class='table-selected-items-text'>
          {{#if @model.role.grantScopeProjectIDs.length}}
            <Hds::Text::Body @tag='p' @color='faint'>
              {{t
                'resources.role.scope.titles.selected'
                items=@model.role.grantScopeProjectIDs.length
                total=@model.totalItemsCount
              }}
            </Hds::Text::Body>
          {{/if}}
        </div>

        <Hds::Table
          @columns={{array
            (hash label=(t 'resources.project.title'))
            (hash label=(t 'form.id.label'))
            (hash
              label=(t 'resources.org.title')
              tooltip=(t
                'resources.role.scope.messages.manage-custom-scopes.tooltip'
              )
            )
          }}
          @model={{@model.scopes}}
          @isSelectable={{true}}
          @onSelectionChange={{this.projectSelectionChange}}
          @valign='middle'
        >
          <:body as |B|>
            <B.Tr
              @selectionKey={{B.data.id}}
              @isSelected={{includes
                B.data.id
                @model.role.grantScopeProjectIDs
              }}
              @selectionAriaLabelSuffix='row {{B.data.id}}'
              data-test-project-scopes-table-row={{B.data.id}}
            >
              <B.Td>
                <Hds::Text::Body @tag='p'>
                  {{B.data.displayName}}
                </Hds::Text::Body>
              </B.Td>
              <B.Td>
                <Hds::Copy::Snippet
                  @textToCopy={{B.data.id}}
                  @color='secondary'
                />
              </B.Td>
              <B.Td>
                {{#if (can 'read model' B.data)}}
                  <Hds::Link::Inline
                    @route='scopes.scope'
                    @model={{B.data.scope.id}}
                    @icon='org'
                    @iconPosition='leading'
                  >
                    {{~or B.data.scope.name B.data.scope.id}}
                  </Hds::Link::Inline>
                {{else}}
                  {{or B.data.scope.name B.data.scope.id}}
                {{/if}}
              </B.Td>
            </B.Tr>
          </:body>
        </Hds::Table>
      {{/if}}
      <Rose::Pagination
        @model={{@model.role.id}}
        @totalItems={{@model.totalItems}}
        @currentPage={{@page}}
        @currentPageSize={{@pageSize}}
      />

      <form.actions
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{else}}
      <Hds::ApplicationState data-test-no-grant-scope-results as |A|>
        <A.Header @title={{t 'titles.no-results-found'}} />
        <A.Body
          @text={{t
            'descriptions.no-search-results'
            query=@search
            resource=(t 'resources.scope.title_plural')
          }}
        />
      </Hds::ApplicationState>
    {{/if}}
  </Rose::Form>
{{else}}
  <Hds::ApplicationState as |A|>
    <A.Header
      @title={{t
        'resources.role.scope.messages.no-scopes.title'
        type=(t 'resources.org.title')
      }}
    />
    <A.Body
      @text={{t
        'resources.role.scope.messages.no-scopes.description'
        type=(t 'resources.org.title')
      }}
    />
    <A.Footer as |F|>
      <F.LinkStandalone
        @icon='arrow-left'
        @text={{t 'actions.back'}}
        @route='scopes.scope.roles.role.manage-scopes'
      />
    </A.Footer>
  </Hds::ApplicationState>
{{/if}}

{{#if this.selectedOrg}}
  <Hds::Modal
    @onClose={{this.toggleRemoveOrgModal}}
    data-test-manage-scopes-remove-org-modal
    as |M|
  >
    <M.Header>{{t 'resources.role.scope.remove-org.title'}}</M.Header>
    <M.Body>
      <Hds::Text::Body @tag='p' @color='primary'>
        {{t
          'resources.role.scope.remove-org.description'
          orgDisplayName=this.orgDisplayName
        }}
      </Hds::Text::Body>
    </M.Body>
    <M.Footer as |F|>
      <Hds::ButtonSet>
        <Hds::Button
          @text={{t 'resources.role.scope.actions.remove-org-and-projects'}}
          {{on 'click' (fn this.removeProjects false)}}
        />
        <Hds::Button
          @color='secondary'
          @text={{t 'resources.role.scope.actions.remove-org-only'}}
          {{on 'click' F.close}}
        />
      </Hds::ButtonSet>
    </M.Footer>
  </Hds::Modal>
{{/if}}

{{#if this.selectedOrgs}}
  <Hds::Modal
    @onClose={{this.toggleRemoveAllModal}}
    data-test-manage-scopes-remove-all-orgs-modal
    as |M|
  >
    <M.Header>{{t 'resources.role.scope.remove-all-orgs.title'}}</M.Header>
    <M.Body>
      <Hds::Text::Body @tag='p' @color='primary'>
        {{t 'resources.role.scope.remove-all-orgs.description'}}
      </Hds::Text::Body>
    </M.Body>
    <M.Footer as |F|>
      <Hds::ButtonSet>
        <Hds::Button
          @text={{t 'resources.role.scope.actions.remove-orgs-and-projects'}}
          {{on 'click' (fn this.removeProjects true)}}
        />
        <Hds::Button
          @color='secondary'
          @text={{t 'resources.role.scope.actions.remove-orgs-only'}}
          {{on 'click' F.close}}
        />
      </Hds::ButtonSet>
    </M.Footer>
  </Hds::Modal>
{{/if}}