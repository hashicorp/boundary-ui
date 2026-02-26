import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
<template>
  <@header.Title>
    {{t 'resources.host.titles.new'}}
    <DocLink @doc='host.new' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.host.description'}}
  </@header.Description>
</template>
