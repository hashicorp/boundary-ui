/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Field from '@hashicorp/design-system-components/components/hds/form/text-input/field';
import { on } from '@ember/modifier';
<template>
  <Field
    @value={{@value}}
    disabled={{@disabled}}
    aria-labelledby={{@ariaLabelledBy}}
    {{on 'input' @setContext}}
  />
</template>
