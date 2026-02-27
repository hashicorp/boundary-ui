/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { TYPE_HOST_CATALOG_PLUGIN_AWS, TYPE_HOST_CATALOG_PLUGIN_AZURE, TYPE_HOST_CATALOG_PLUGIN_GCP, TYPE_HOST_CATALOG_STATIC } from 'api/models/host-catalog';
import awsHostFormComponent from './aws';
import azureHostFormComponent from './azure';
import gcpHostFormComponent from './gcp';
import staticHostFormComponent from './static';
import Static from "admin/components/form/host/static/index";

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
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

{{#if @model.compositeType}}
  <this.hostFormComponent @model={{@model}} @submit={{@submit}} @cancel={{@cancel}} />
{{else}}
  {{!-- create-and-add-host cancel route doesn't have a model and this else part is required
      to prevent erroring out here. This has been noted in the tech debt doc to further investigate --}}
  <Static @model={{@model}} @submit={{@submit}} @cancel={{@cancel}} />
{{/if}}</template>}
