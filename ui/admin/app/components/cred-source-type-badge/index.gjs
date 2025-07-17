/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import HdsBadge from '@hashicorp/design-system-components/components/hds/badge';
import { t } from 'ember-intl';
import { concat } from '@ember/helper';

<template>
  {{#if @model.isUnknown}}
    <HdsBadge @text={{t 'resources.credential.types.unknown'}} />
  {{else if @model.isVault}}
    <HdsBadge
      @text={{t (concat 'resources.credential-library.types.' @model.type)}}
    />
  {{else}}
    <HdsBadge @text={{t (concat 'resources.credential.types.' @model.type)}} />
  {{/if}}
</template>
