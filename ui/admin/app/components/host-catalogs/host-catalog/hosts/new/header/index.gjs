/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

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
