/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import {
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
  TYPE_HOST_CATALOG_STATIC,
} from 'api/models/host-catalog';
import awsHostFormComponent from './aws';
import azureHostFormComponent from './azure';
import gcpHostFormComponent from './gcp';
import staticHostFormComponent from './static';

const modelCompositeTypeToComponent = {
  [TYPE_HOST_CATALOG_PLUGIN_AWS]: awsHostFormComponent,
  [TYPE_HOST_CATALOG_PLUGIN_AZURE]: azureHostFormComponent,
  [TYPE_HOST_CATALOG_PLUGIN_GCP]: gcpHostFormComponent,
  [TYPE_HOST_CATALOG_STATIC]: staticHostFormComponent,
};

export default class FormHostIndex extends Component {
  /**
   * Returns the host form component associated with the model's composite type
   * @type {Component}
   */
  get hostFormComponent() {
    const component =
      modelCompositeTypeToComponent[this.args.model.compositeType];
    assert(
      `Mapped component must exist for host composite type: ${this.args.model.compositeType}`,
      component,
    );
    return component;
  }
}
