import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
<template>
  <Tabs as |nav|>
    <nav.link @route='scopes.scope.groups.group.index'>
      {{t 'titles.details'}}
    </nav.link>
    <nav.link @route='scopes.scope.groups.group.members'>
      {{t 'resources.group.messages.members.title'}}
    </nav.link>
  </Tabs>
</template>
