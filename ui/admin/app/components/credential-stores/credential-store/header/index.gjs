/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
import Snippet from '@hashicorp/design-system-components/components/hds/copy/snippet/index';
<template>
  <@header.Title>
    {{t 'resources.credential-store.title'}}
    <DocLink @doc='credential-store' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.credential-store.description'}}
  </@header.Description>
  <@header.Generic>
    <Snippet @textToCopy={{@model.id}} @color='secondary' />
  </@header.Generic>
</template>
