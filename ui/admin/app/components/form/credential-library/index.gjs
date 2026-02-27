{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if @model.type}}
  <this.credentialLibraryFormComponent
    @model={{@model}}
    @submit={{@submit}}
    @cancel={{@cancel}}
    @changeType={{@changeType}}
    @edit={{@edit}}
  />
{{/if}}