/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  autocompletion,
  completionKeymap,
  keymap,
} from '@hashicorp/design-system-components/codemirror';

import { createGrantCompletionSource } from 'admin/utils/grant-completions';

export default class FormRoleEditGrantsComponent extends Component {
  @service intl;

  // =attributes

  exportOptionsMap = { terraform: 'terraform', nativeHCL: 'native-hcl' };
  exportOptions = Object.values(this.exportOptionsMap);
  completionTranslatedStrings = {
    noSuggestions: this.intl.t('resources.role.edit-grants.no-suggestions'),
    wildcardTypes: this.intl.t(
      'resources.role.edit-grants.completion-info.wildcard-types',
    ),
    wildcardIds: this.intl.t(
      'resources.role.edit-grants.completion-info.wildcard-ids',
    ),
    templateValue: this.intl.t(
      'resources.role.edit-grants.completion-info.template-value',
    ),
    wildcardActions: this.intl.t(
      'resources.role.edit-grants.completion-info.wildcard-actions',
    ),
    allFields: this.intl.t(
      'resources.role.edit-grants.completion-info.all-fields',
    ),
  };

  completionSource = createGrantCompletionSource(
    this.args.grantsSchema,
    this.completionTranslatedStrings,
  );

  @tracked grantStringsText = (this.args.model?.grant_strings ?? []).join('\n');
  @tracked currentLineText = '';
  @tracked showExportOptionsFlyout = false;
  @tracked selectedExportOption = this.exportOptions[0];

  customExtensions = [
    autocompletion({
      override: [this.completionSource],
      // Trigger autocompletion when the user completes a grant field (which we labeled as keywords)
      activateOnCompletion: (completion) => completion.type === 'keyword',
    }),
    keymap.of(completionKeymap),
  ];

  get grantStrings() {
    return this.grantStringsText
      .split('\n')
      .map((grantString) => grantString.trim())
      .filter(Boolean);
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
    this.grantStringsText.split('\n').forEach((line) => {
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
    this.grantStringsText.split('\n').forEach((line) => {
      formatted += `  "${line}",\n`;
    });
    formatted += `]\n`;
    return formatted;
  }

  // =actions

  @action
  onInput(value, view) {
    this.grantStringsText = value;

    const line = view.state.doc.lineAt(view.state.selection.main.head);
    this.currentLineText = line.text;
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
