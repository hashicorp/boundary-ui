/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Badge from '@hashicorp/design-system-components/components/hds/badge/index';
import t from 'ember-intl/helpers/t';
import { concat } from '@ember/helper';
<template>
  {{#if @model.isUnknown}}
    <Badge @text={{t 'resources.credential.types.unknown'}} />
  {{else if @model.isVault}}
    <Badge
      @text={{t (concat 'resources.credential-library.types.' @model.type)}}
    />
  {{else}}
    <Badge @text={{t (concat 'resources.credential.types.' @model.type)}} />
  {{/if}}
</template>
