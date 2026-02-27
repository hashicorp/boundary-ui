/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
<template>
  <Tabs as |nav|>
    <nav.link @route='scopes.scope.users.user.index'>
      {{t 'titles.details'}}
    </nav.link>
    <nav.link @route='scopes.scope.users.user.accounts'>
      {{t 'resources.user.messages.accounts.title'}}
    </nav.link>
  </Tabs>
</template>
