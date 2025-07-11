/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_HOST_CATALOG_PLUGIN } from 'api/models/host-catalog';
import HdsBadge from '@hashicorp/design-system-components/components/hds/badge';
import { t } from 'ember-intl';
import { concat } from '@ember/helper';

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

  <template>
    <HdsBadge
      @icon={{this.icon}}
      @text={{t (concat 'resources.host-catalog.types.' @model.compositeType)}}
    />
  </template>
}
