/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class FormRoleAddGrantTemplatesIndexComponent extends Component {
  // =services

  @service intl;

  // =properties

  @tracked selectedGrantTemplates = [];

  /**
   * Grant template definitions with their grant strings.
   * @type {Array<{id: string, grantStrings: Array<string>}>}
   */
  grantTemplateDefinitions = [
    {
      id: 'global-admin',
      grantStrings: ['ids=*;type=*;actions=*'],
    },
    {
      id: 'org-access',
      grantStrings: ['ids=<org-id>;type=scope;actions=*'],
    },
    {
      id: 'org-admin',
      grantStrings: [
        'ids=*;type=auth-method;actions=*',
        'ids=*;type=user;actions=*',
        'ids=*;type=group;actions=*',
        'ids=*;type=role;actions=*',
      ],
    },
    {
      id: 'project-access',
      grantStrings: ['ids=<project-id>;type=scope;actions=*'],
    },
    {
      id: 'project-admin',
      grantStrings: [
        'ids=*;type=host-catalog;actions=*',
        'ids=*;type=target;actions=*',
        'ids=*;type=credential-store;actions=*',
        'ids=*;type=session;actions=*',
      ],
    },
    {
      id: 'session-manager',
      grantStrings: [
        'ids=*;type=session;actions=*',
        'ids=*;type=target;actions=read,list',
      ],
    },
    {
      id: 'target-manager',
      grantStrings: ['ids=*;type=target;actions=*'],
    },
    {
      id: 'host-resource-manager',
      grantStrings: [
        'ids=*;type=host-catalog;actions=*',
        'ids=*;type=host-set;actions=*',
        'ids=*;type=host;actions=*',
      ],
    },
    {
      id: 'credential-manager',
      grantStrings: [
        'ids=*;type=credential;actions=*',
        'ids=*;type=credential-store;actions=*',
        'ids=*;type=credential-library;actions=*',
      ],
    },
    {
      id: 'user-manager',
      grantStrings: [
        'ids=*;type=user;actions=*',
        'ids=*;type=group;actions=*',
        'ids=*;type=account;actions=*',
      ],
    },
    {
      id: 'auth-method-manager',
      grantStrings: [
        'ids=*;type=auth-method;actions=*',
        'ids=*;type=managed-group;actions=*',
      ],
    },
    {
      id: 'session-auditor',
      grantStrings: [
        'ids=*;type=session;actions=list,read',
        'ids=*;type=session-recording;actions=list,list-exports,read,download,export,export:cancel',
      ],
    },
    {
      id: 'target-user',
      grantStrings: [
        'ids=*;type=target;actions=authorize-session,read,list',
        'ids=*;type=session;actions=read:self,cancel:self',
      ],
    },
    {
      id: 'read-only-user',
      grantStrings: ['ids=*;type=*;actions=list,read'],
    },
  ];

  /**
   * Grant templates with translated names and descriptions.
   * @type {Array<{id: string, name: string, grantStrings: Array<string>, description: string}>}
   */
  get grantTemplates() {
    return this.grantTemplateDefinitions.map((template) => ({
      id: template.id,
      name: this.intl.t(
        `resources.role.grant-templates.templates.${template.id}.name`,
      ),
      grantStrings: template.grantStrings,
      description: this.intl.t(
        `resources.role.grant-templates.templates.${template.id}.description`,
      ),
    }));
  }

  /**
   * Filtered grant templates based on search query.
   * @return {Array<{id: string, name: string, grantStrings: Array<string>, description: string}>}
   */
  get filteredTemplates() {
    let filteredTemplates = this.grantTemplates;

    if (this.args.search) {
      filteredTemplates = this.grantTemplates.filter((template) => {
        const searchTerm = this.args.search?.toLowerCase() ?? '';
        return (
          template.name.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm) ||
          template.grantStrings.some((grant) => grant.includes(searchTerm))
        );
      });
    }

    return filteredTemplates;
  }

  /**
   * Paginated templates for current page.
   * @type {Array}
   */
  get paginatedTemplates() {
    return this.filteredTemplates.slice(
      (this.args.page - 1) * this.args.pageSize,
      this.args.page * this.args.pageSize,
    );
  }

  get totalCount() {
    return this.grantTemplateDefinitions.length;
  }
  // =actions

  @action
  onSelectionChange({ selectionKey, selectedRowsKeys }) {
    const oldKeys = new Set(this.selectedGrantTemplates);
    if (selectionKey === 'all') {
      const newKeys = new Set(selectedRowsKeys);
      if (newKeys.size === 0) {
        this.selectedGrantTemplates = [...newKeys.difference(oldKeys)];
      } else {
        this.selectedGrantTemplates = [...newKeys.union(oldKeys)];
      }
    } else {
      if (oldKeys.has(selectionKey)) {
        oldKeys.delete(selectionKey);
      } else {
        oldKeys.add(selectionKey);
      }
      this.selectedGrantTemplates = [...oldKeys];
    }
  }

  @action
  submit() {
    // Convert selected template IDs to their grant strings
    const grantStrings = this.grantTemplates
      .filter((template) => this.selectedGrantTemplates.includes(template.id))
      .flatMap((template) => template.grantStrings);
    this.args.submit(grantStrings);
  }
}
