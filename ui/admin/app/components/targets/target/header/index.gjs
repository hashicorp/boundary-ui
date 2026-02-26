import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
import Snippet from '@hashicorp/design-system-components/components/hds/copy/snippet/index';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  <@header.Title>
    {{t 'resources.target.title'}}
    <DocLink @doc='target' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.target.description'}}
  </@header.Description>
  <@header.Generic>
    <Snippet @textToCopy={{@model.id}} @color='secondary' />
  </@header.Generic>
</template>
