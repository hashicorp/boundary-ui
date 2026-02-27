/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import t from 'ember-intl/helpers/t';
import DocLink from 'core/components/doc-link';
<template>
  <@header.Title>
    {{t 'resources.host-set.titles.new'}}
    <DocLink @doc='host-set.new' />
  </@header.Title>
  <@header.Description>
    {{t 'resources.host-set.description'}}
  </@header.Description>
</template>
