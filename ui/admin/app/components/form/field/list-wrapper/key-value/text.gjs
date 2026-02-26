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
