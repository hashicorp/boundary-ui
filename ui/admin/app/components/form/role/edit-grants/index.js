/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormRoleEditGrants extends Component {
  // =attributes

  exportOptionsMap = { terraform: 'terraform', nativeHCL: 'native-hcl' };
  exportOptions = Object.values(this.exportOptionsMap);

  // TODO: Replace with actual grant lines from code editor once implemented.
  grantStringLines =
    'id=hc_123;type=host-catalog;actions=*\nid=ttcp_123;type=target;actions=read\ntype=credential;actions=*';

  @tracked showExportOptionsFlyout = false;
  @tracked selectedExportOption = this.exportOptions[0];

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
    this.grantStringLines.split('\n').forEach((line) => {
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
    this.grantStringLines.split('\n').forEach((line) => {
      formatted += `  "${line}",\n`;
    });
    formatted += `]\n`;
    return formatted;
  }

  // =actions

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
