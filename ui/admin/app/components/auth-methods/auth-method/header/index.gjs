import t from 'ember-intl/helpers/t';
import Badge from '@hashicorp/design-system-components/components/hds/badge/index';
import DocLink from 'core/components/doc-link';
import Snippet from '@hashicorp/design-system-components/components/hds/copy/snippet/index';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  <@header.Title>
    {{t 'resources.auth-method.title'}}
    {{#if @model.isPrimary}}
      <Badge @text={{t 'states.primary'}} @color='success' />
    {{/if}}
    <DocLink @doc='auth-method' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.auth-method.description'}}
  </@header.Description>
  <@header.Generic>
    <Snippet @textToCopy={{@model.id}} @color='secondary' />
  </@header.Generic>
</template>
