/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import orderBy from 'lodash/orderBy';

export default class ScopePickerComponent extends Component {
  // =services

  @service intl;
  @service scope;
  @service session;

  // =attributes

  /**
   * Returns display name and icon for current scope.
   * @type {object}
   */
  get currentScope() {
    if (this.scope.project) {
      return { name: this.scope.project.displayName, icon: 'grid' };
    } else if (this.scope.org.isOrg) {
      return { name: this.scope.org.displayName, icon: 'org' };
    } else {
      return { name: this.intl.t('titles.global'), icon: 'globe' };
    }
  }

  /**
   * Returns first five orgs ordered by most recently updated.
   * @type {[ScopeModel]}
   */
  get truncatedOrgsList() {
    return orderBy(this.scope.orgsList, 'updated_time', 'desc').slice(0, 5);
  }

  /**
   * Returns first five projects ordered by most recently updated.
   * @type {[ScopeModel]}
   */
  get truncatedProjectsList() {
    return orderBy(this.scope.projectsList, 'updated_time', 'desc').slice(0, 5);
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Hds::Dropdown
  class='scope-picker'
  @enableCollisionDetection={{true}}
  @listPosition='bottom-left'
  data-test-header-scope-dropdown
  ...attributes
  as |D|
>
  {{#let this.currentScope as |scope|}}
    <D.ToggleButton
      @text={{scope.name}}
      @icon={{scope.icon}}
      class='dropdown-toggle-color-override'
    />
  {{/let}}

  <D.Checkmark
    @icon='globe'
    @route='scopes.scope'
    @model='global'
    @selected={{this.scope.org.isGlobal}}
  >
    {{t 'titles.global'}}
  </D.Checkmark>

  {{#if this.scope.orgsList}}
    <D.Separator />

    <D.Title @text={{t 'resources.org.title_plural'}} />
  {{/if}}

  {{#each this.truncatedOrgsList as |org|}}
    <D.Checkmark
      @icon='org'
      @route='scopes.scope'
      @model={{org.id}}
      @selected={{and (eq this.scope.org.id org.id) (not this.scope.project)}}
      data-test-scope-picker-org-item
    >
      {{org.displayName}}
    </D.Checkmark>
  {{/each}}

  {{#if (gt this.scope.orgsList.length 5)}}
    <D.Description
      @text={{t 'descriptions.and-more'}}
      data-test-scope-picker-org-and-more-text
    />

    <D.Interactive
      @route='scopes.scope.scopes'
      @model='global'
      data-test-scope-picker-org-count
    >{{t
        'descriptions.view-all-orgs'
        total=this.scope.orgsList.length
      }}</D.Interactive>
  {{/if}}

  {{! All project scopes in org are only loaded when current scope is of project type. }}
  {{#if this.scope.project}}
    <D.Title @text={{t 'resources.project.title_plural'}} class='indentation' />

    {{#each this.truncatedProjectsList as |project|}}
      <D.Checkmark
        @icon='grid'
        @route='scopes.scope'
        @model={{project.id}}
        @selected={{eq this.scope.project.id project.id}}
        class='indentation'
        data-test-scope-picker-project-item
      >
        {{project.displayName}}
      </D.Checkmark>
    {{/each}}

    {{#if (gt this.scope.projectsList.length 5)}}
      <D.Description
        @text={{t 'descriptions.and-more'}}
        class='indentation'
        data-test-scope-picker-project-and-more-text
      />

      <D.Interactive
        @route='scopes.scope.scopes'
        @model={{this.scope.org.id}}
        class='indentation'
        data-test-scope-picker-project-count
      >{{t
          'descriptions.view-all-projects'
          total=this.scope.projectsList.length
        }}</D.Interactive>
    {{/if}}
  {{/if}}
</Hds::Dropdown>