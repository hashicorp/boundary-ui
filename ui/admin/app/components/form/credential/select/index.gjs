import Field from '@hashicorp/design-system-components/components/hds/form/super-select/single/field';
import t from 'ember-intl/helpers/t';
import Body from '@hashicorp/design-system-components/components/hds/text/body';
import { concat } from '@ember/helper';
<template>
  <Field
    name={{t 'form.type.label'}}
    @isRequired={{true}}
    @onChange={{@changeType}}
    @selected={{@model.type}}
    @options={{@types}}
    as |F|
  >
    <F.Label>{{t 'form.type.label'}}</F.Label>
    <F.Options>
      {{#let F.options as |credentialType|}}
        <Body @tag='p' @weight='semibold'>{{t
            (concat 'resources.credential.types.' credentialType)
          }}</Body>
        <Body @tag='p' @color='faint' @size='100'>{{t
            (concat 'resources.credential.help.' credentialType)
          }}</Body>
      {{/let}}
    </F.Options>
  </Field>
</template>
