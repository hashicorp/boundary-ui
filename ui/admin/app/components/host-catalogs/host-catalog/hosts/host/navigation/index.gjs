/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
<template>
  <Tabs as |nav|>
    <nav.link @route='scopes.scope.host-catalogs.host-catalog.hosts.host.index'>
      {{t 'titles.details'}}
    </nav.link>
  </Tabs>
</template>
