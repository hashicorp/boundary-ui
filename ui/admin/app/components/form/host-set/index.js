/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import awsFormComponent from './aws';
import azureFormComponent from './azure';
import gcpFormComponent from './gcp';
import staticFormComponent from './static';

const modelCompositeTypeToComponent = {
  aws: awsFormComponent,
  azure: azureFormComponent,
  gcp: gcpFormComponent,
  static: staticFormComponent,
};

export default class FormHostSetIndex extends Component {
  /**
   * returns the associated host set form component for the model's composite type
   */
  get hostSetForm() {
    const component =
      modelCompositeTypeToComponent[this.args.model.compositeType];
    assert(
      `Mapped component must exist for host set composite type: ${this.args.model.compositeType}`,
      component,
    );
    return component;
  }
}
