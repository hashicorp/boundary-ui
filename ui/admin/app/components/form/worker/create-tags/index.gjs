{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  @onSubmit={{this.save}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{false}}
  as |form|
>
  <Form::Field::ListWrapper @layout='vertical' @disabled={{form.disabled}}>
    <:field as |F|>
      <F.KeyValue
        @name='api_tags'
        @options={{@apiTags}}
        @disabled={{form.disabled}}
        @addOption={{this.addApiTag}}
        @removeOptionByIndex={{this.removeApiTagByIndex}}
      >
        <:key as |K|>
          <K.text />
        </:key>
        <:value as |V|>
          <V.text />
        </:value>
      </F.KeyValue>
    </:field>
  </Form::Field::ListWrapper>

  <form.actions
    @submitText={{t 'actions.save'}}
    @cancelText={{t 'actions.cancel'}}
  />
</Rose::Form>