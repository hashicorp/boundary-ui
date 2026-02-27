{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if @model.compositeType}}
  <this.hostFormComponent
    @model={{@model}}
    @submit={{@submit}}
    @cancel={{@cancel}}
  />
{{else}}
  {{! create-and-add-host cancel route doesn't have a model and this else part is required
      to prevent erroring out here. This has been noted in the tech debt doc to further investigate }}
  <Form::Host::Static
    @model={{@model}}
    @submit={{@submit}}
    @cancel={{@cancel}}
  />
{{/if}}