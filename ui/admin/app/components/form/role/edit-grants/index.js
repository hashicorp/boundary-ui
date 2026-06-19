/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import {
  tooltips,
  autocompletion,
  completionKeymap,
  startCompletion,
  keymap,
  EditorView,
  linter,
  lintGutter,
  lintKeymap,
} from '@hashicorp/design-system-components/codemirror';
import { createGrantCompletionSource } from 'admin/utils/grant-completions';
import { createGrantLinter } from 'admin/utils/grant-linter';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
  GRANT_SCOPE_KEYWORDS,
} from 'api/models/role';

export default class FormRoleEditGrantsComponent extends Component {
  @service intl;
  @service db;

  // =attributes

  #editorView;
  exportOptionsMap = { terraform: 'terraform', nativeHCL: 'native-hcl' };
  exportOptions = Object.values(this.exportOptionsMap);

  @tracked currentLineText = this.args.model?.grant_strings?.[0] ?? '';
  @tracked showExportOptionsFlyout = false;
  @tracked selectedExportOption = this.exportOptions[0];

  /**
   * Returns the scope IDs that should be used to filter ID suggestions.
   * @returns {Promise<string[]|null>}
   */
  async getAllowedScopeIds() {
    const grantScopeIds = this.args.model?.grant_scope_ids ?? [];
    const roleScopeId = this.args.model?.scopeID;

    // Descendants covers the entire subtree so no need to filter
    if (grantScopeIds.includes(GRANT_SCOPE_DESCENDANTS)) {
      return null;
    }

    const scopeIds = new Set();

    if (grantScopeIds.includes(GRANT_SCOPE_THIS)) {
      scopeIds.add(roleScopeId);
    }

    if (grantScopeIds.includes(GRANT_SCOPE_CHILDREN)) {
      // Grab direct children scopes
      try {
        const childScopes = await this.db.query('scope', {
          query: { filters: { scope_id: [{ equals: roleScopeId }] } },
          select: [{ field: 'id' }],
        });
        childScopes.forEach(({ id }) => {
          scopeIds.add(id);
        });
      } catch {
        // In cases of errors, just return all IDs without filtering rather than blocking completions entirely
        return null;
      }
    }

    // Any concrete org/project IDs specified directly
    grantScopeIds
      .filter((id) => !GRANT_SCOPE_KEYWORDS.includes(id))
      .forEach((id) => scopeIds.add(id));

    return scopeIds.size ? [...scopeIds] : null;
  }

  getIsLoading = () => {
    return this.args.loadResourcesTask?.isRunning ?? false;
  };

  /**
   * Looks up resource IDs from the local DB.
   * @param {string} partial - The current partial value the user has typed
   * @param {string[]|null} [compatibleResourceTypes] - Resource types to restrict results to
   * @returns {Promise<Array<{id: string, name: string|undefined}>>}
   */
  idLookup = async (partial, compatibleResourceTypes) => {
    // When the partial already contains an underscore we know the ID prefix
    // (e.g. "ttcp_") and can narrow down which types to query.
    let typesToQuery;
    if (partial.includes('_')) {
      const idPrefix = partial.split('_')[0];
      const matchingGrantTypes = (this.args.grantsSchema?.resource_types ?? [])
        .filter((rt) => rt.id_prefixes?.includes(idPrefix))
        .map((rt) => rt.type);

      typesToQuery = (this.args.searchableResourceTypes ?? []).filter((t) =>
        matchingGrantTypes.includes(t),
      );
    } else {
      typesToQuery = this.args.searchableResourceTypes ?? [];
    }

    // Restrict to the compatible resource types if provided
    if (compatibleResourceTypes) {
      typesToQuery = typesToQuery.filter((t) =>
        compatibleResourceTypes.includes(t),
      );
    }

    if (!typesToQuery.length) {
      return [];
    }

    const scopeIds = await this.getAllowedScopeIds();
    const filters = {};
    if (scopeIds) {
      filters.scope_id = scopeIds.map((id) => ({ equals: id }));
    }

    const results = await Promise.allSettled(
      typesToQuery.map((type) =>
        this.db.query(type, {
          query: {
            // Search both id and name so a user can type a resource name and
            // still get the ID inserted as the completion
            search: partial
              ? { text: partial, fields: ['id', 'name'] }
              : undefined,
            filters,
          },
          page: 1,
          pageSize: 10,
          select: [{ field: 'id' }, { field: 'name' }],
        }),
      ),
    );

    return results
      .filter(({ status }) => status === 'fulfilled')
      .flatMap(({ value }) => value)
      .map(({ id, name }) => ({ id, name }));
  };

  translateLintingError = (key, options = {}) =>
    this.intl.t(`resources.role.edit-grants.linting-errors.${key}`, options);
  translateCompletionString = (key, options = {}) =>
    this.intl.t(`resources.role.edit-grants.completion-info.${key}`, options);

  completionSource = createGrantCompletionSource(
    this.args.grantsSchema,
    this.translateCompletionString,
    this.idLookup,
    this.getIsLoading,
  );
  linterSource = createGrantLinter(
    this.args.grantsSchema,
    this.translateLintingError,
  );

  rootElementSelector = getOwner(this).rootElement;
  rootElement = getOwner(this)
    .lookup('service:-document')
    .querySelector(this.rootElementSelector);

  customExtensions = [
    // Configure tooltips to render in app root to avoid overflow issues within the editor container.
    tooltips({ parent: this.rootElement }),
    autocompletion({
      override: [this.completionSource],
      // Trigger autocompletion when the user completes a grant field (which we labeled as keywords)
      activateOnCompletion: (completion) => completion.type === 'keyword',
    }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged || update.selectionSet) {
        const line = update.state.doc.lineAt(update.state.selection.main.head);
        this.currentLineText = line.text;
        if (update.docChanged) {
          const text = update.state.doc.toString();
          this.args.model.grant_strings = text
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        // Trigger autocomplete when we're on an empty line
        if (line.text === '') {
          startCompletion(update.view);
        }
      }
    }),
    linter(this.linterSource),
    lintGutter(),
    keymap.of([...completionKeymap, ...lintKeymap]),
  ];

  willDestroy() {
    super.willDestroy();
    this.#editorView?.destroy();
  }

  get grantStringsText() {
    return this.grantStrings.join('\n');
  }

  get grantStrings() {
    return this.args.model?.grant_strings ?? [];
  }

  /**
   * Returns the formatted export based on the selected export option.
   * @type {string}
   */
  get formattedExport() {
    if (this.selectedExportOption === this.exportOptionsMap.terraform) {
      return this.terraformFormattedExport;
    }
    return this.nativeHclFormattedExport;
  }

  /**
   * Formats grant strings into a Terraform format.
   * @type {string}
   */
  get terraformFormattedExport() {
    let formatted = `grant_strings = [ \n`;
    this.grantStrings.forEach((line) => {
      formatted += `  "${line}",\n`;
    });
    formatted += `]\n`;
    return formatted;
  }

  /**
   * Formats grant strings into a Native HCL format.
   * @type {string}
   */
  get nativeHclFormattedExport() {
    let formatted = `[ \n`;
    this.grantStrings.forEach((line) => {
      formatted += `  "${line}",\n`;
    });
    formatted += `]\n`;
    return formatted;
  }

  // =actions

  @action
  onSetup(view) {
    this.#editorView = view;
  }

  /**
   * Toggles the export options flyout open and closed.
   */
  @action
  toggleExportOptionsFlyout() {
    this.showExportOptionsFlyout = !this.showExportOptionsFlyout;
  }

  /**
   * Triggers the download of the formatted export as a file.
   */
  @action
  downloadFormattedExport() {
    const fileName =
      this.selectedExportOption === this.exportOptionsMap.terraform
        ? 'grant-strings.tf'
        : 'grant-strings.hcl';
    const blob = new Blob([this.formattedExport], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    const flyoutElement = document.getElementById('export-options-flyout');
    flyoutElement.appendChild(a);
    a.click();
    flyoutElement.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
