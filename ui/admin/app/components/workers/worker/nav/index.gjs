import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
<template>
  <Tabs as |nav|>
    <nav.link @route='scopes.scope.workers.worker.index'>
      {{t 'titles.details'}}
    </nav.link>
    <nav.link @route='scopes.scope.workers.worker.tags'>
      {{t 'resources.worker.tags.title_plural'}}
    </nav.link>
  </Tabs>
</template>
