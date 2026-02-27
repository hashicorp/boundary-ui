import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import { hash } from "@ember/helper";
import FormFieldListWrapperKeyValue from "admin/components/form/field/list-wrapper/key-value/index";
import FormFieldListWrapperTextInput from "admin/components/form/field/list-wrapper/text-input/index";
import FormFieldListWrapperTextarea from "admin/components/form/field/list-wrapper/textarea/index";
import FormFieldListWrapperSelect from "admin/components/form/field/list-wrapper/select/index";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Fieldset @layout={{@layout}} @isRequired={{@isRequired}} @isOptional={{@isOptional}} as |F|>

  {{yield F to="fieldset"}}

  <F.Control>
    {{yield (hash KeyValue=(component FormFieldListWrapperKeyValue disabled=@disabled) TextInput=(component FormFieldListWrapperTextInput disabled=@disabled) Textarea=(component FormFieldListWrapperTextarea disabled=@disabled) Select=(component FormFieldListWrapperSelect disabled=@disabled)) to="field"}}
  </F.Control>

</Fieldset></template>