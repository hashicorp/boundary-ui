import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
import Snippet from '@hashicorp/design-system-components/components/hds/copy/snippet/index';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  <@header.Title>
    {{t 'resources.user.title'}}
    <DocLink @doc='user' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.user.description'}}
  </@header.Description>
  <@header.Generic>
    <Snippet @textToCopy={{@model.id}} @color='secondary' />
  </@header.Generic>
</template>
