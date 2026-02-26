import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
import or from 'ember-truth-helpers/helpers/or';
<template>
  <Tabs as |nav|>
    <nav.link @route='scopes.scope.targets.target.index'>
      {{t 'titles.details'}}
    </nav.link>
    <nav.link @route='scopes.scope.targets.target.workers'>
      {{t 'titles.workers'}}
    </nav.link>
    <nav.link @route='scopes.scope.targets.target.host-sources'>
      {{t 'resources.target.host-source.title_plural'}}
    </nav.link>
    <nav.link @route='scopes.scope.targets.target.brokered-credential-sources'>
      {{t 'resources.target.brokered-credential-source.title_plural'}}
    </nav.link>
    {{#if (or @model.isSSH @model.isRDP)}}
      <nav.link
        @route='scopes.scope.targets.target.injected-application-credential-sources'
      >
        {{t
          'resources.target.injected-application-credential-source.title_plural'
        }}
      </nav.link>
    {{/if}}
  </Tabs>
</template>
