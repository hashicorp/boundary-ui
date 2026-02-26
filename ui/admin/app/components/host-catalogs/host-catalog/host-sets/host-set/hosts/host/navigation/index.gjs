import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
<template>
  <Tabs as |nav|>
    <nav.link
      @route='scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts.host.index'
    >
      {{t 'titles.details'}}
    </nav.link>
  </Tabs>
</template>
