import Form from 'rose/components/rose/form';
import WorkerFilterGenerator from 'admin/components/worker-filter-generator/index';
import can from 'admin/helpers/can';
import t from 'ember-intl/helpers/t';
<template>
  <Form
    class='full-width'
    @onSubmit={{@submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    as |form|
  >
    <WorkerFilterGenerator
      @model={{@model}}
      @name={{@name}}
      @showFilterGenerator={{true}}
    />

    {{#if (can 'save model' @model)}}
      <form.actions
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}
  </Form>
</template>
