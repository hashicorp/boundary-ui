/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import HdsFormTextInputField from '@hashicorp/design-system-components/components/hds/form/text-input/field';
import HdsIcon from '@hashicorp/design-system-components/components/hds/icon';

<template>
  <div class='info-field{{if @icon " has-icon"}}'>
    {{#if @icon}}
      <HdsIcon @name={{@icon}} @size='24' @isInline={{true}} />
    {{/if}}
    <HdsFormTextInputField
      @value={{@value}}
      readonly={{true}}
      ...attributes
      as |F|
    >
      {{yield F}}
    </HdsFormTextInputField>
  </div>
</template>
