/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Icon from '@hashicorp/design-system-components/components/hds/icon/index';
import Field from '@hashicorp/design-system-components/components/hds/form/text-input/field';
<template>
  <div class='info-field{{if @icon " has-icon"}}'>
    {{#if @icon}}
      <Icon @name={{@icon}} @size='24' @isInline={{true}} />
    {{/if}}
    <Field @value={{@value}} readonly={{true}} ...attributes as |F|>
      {{yield F}}
    </Field>
  </div>
</template>
