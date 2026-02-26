import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
<template>
  <@header.Title>
    {{t 'resources.host-set.actions.create-and-add-host'}}
    <DocLink @doc='host.new' />
  </@header.Title>
</template>
