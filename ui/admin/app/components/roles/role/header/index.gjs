import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
import Snippet from '@hashicorp/design-system-components/components/hds/copy/snippet/index';
<template>
  <@header.Title>
    {{t 'resources.role.title'}}
    <DocLink @doc='role' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.role.description'}}
  </@header.Description>
  <@header.Generic>
    <Snippet @textToCopy={{@model.id}} @color='secondary' />
  </@header.Generic>
</template>
