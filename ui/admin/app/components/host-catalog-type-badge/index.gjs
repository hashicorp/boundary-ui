/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_HOST_CATALOG_PLUGIN } from 'api/models/host-catalog';
import Badge from "@hashicorp/design-system-components/components/hds/badge/index";
import t from "ember-intl/helpers/t";
import { concat } from "@ember/helper";
export default class HostCatalogTypeComponent extends Component {
  /**
   * Display icons only for plugin compositeTypes.
   * @type {string}
   */
  get icon() {
    return (
      TYPES_HOST_CATALOG_PLUGIN.includes(this.args.model.compositeType) &&
      `${this.args.model.compositeType}-color`
    );
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Badge @icon={{this.icon}} @text={{t (concat "resources.host-catalog.types." @model.compositeType)}} /></template>}
