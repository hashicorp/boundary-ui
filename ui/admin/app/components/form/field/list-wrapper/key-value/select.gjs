/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Base from '@hashicorp/design-system-components/components/hds/form/select/base';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
<template>
  <Base
    @value={{@value}}
    @width={{@width}}
    disabled={{@disabled}}
    aria-labelledby={{@ariaLabelledBy}}
    {{on 'change' @setContext}}
    as |F|
  >
    <F.Options>
      <option hidden selected value>
        {{t 'titles.choose-an-option'}}
      </option>
      {{#each @selectOptions as |selectOption|}}
        <option value={{selectOption}} selected={{eq selectOption @value}}>
          {{selectOption}}
        </option>
      {{/each}}
    </F.Options>
  </Base>
</template>
