/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import Badge from "@hashicorp/design-system-components/components/hds/badge/index";
import t from "ember-intl/helpers/t";
import { concat } from "@ember/helper";

const principalTypes = {
  user: 'user',
  group: 'folder-users',
  'managed-group': 'cloud-lock',
};
export default class PrincipalTypeBadgeComponent extends Component {
  /**
   * Display icons based on the pricipal type
   * @type {string}
   */

  get icon() {
    return principalTypes[this.args.model.constructor.modelName];
  }
<template>
<Badge @icon={{this.icon}} @text={{t (concat "resources.role.principal.types." @model.constructor.modelName)}} /></template>}
