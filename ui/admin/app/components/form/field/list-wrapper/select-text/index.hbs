{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}
{{#let (unique-id) (unique-id) as |keyHeaderID valueHeaderID|}}
  <Hds::Table class='list-wrapper-field' name={{@name}}>
    <:head as |H|>
      <H.Tr>
        <H.Th id={{keyHeaderID}}>{{t 'form.key.label'}}</H.Th>
        <H.Th id={{valueHeaderID}}>{{t 'form.value.label'}}</H.Th>
        <H.Th>
          {{t 'titles.actions'}}

        </H.Th>
      </H.Tr>
    </:head>
    <:body as |B|>
      {{#each-in this.options as |select val|}}
        <B.Tr>
          <B.Td>
            <Hds::Form::Select::Base
              @value={{select}}
              disabled={{@disabled}}
              @width={{@width}}
              aria-labelledby={{keyHeaderID}}
              {{on 'change' (fn this.selectChange select val)}}
              as |F|
            >
              <F.Options>
                {{#each-in @selectOptions as |key value|}}
                  <option value={{key}} selected={{eq select key}}>
                    {{value}}
                  </option>
                {{/each-in}}
              </F.Options>
            </Hds::Form::Select::Base>
          </B.Td>

          <B.Td>
            <Hds::Form::TextInput::Field
              @value={{val}}
              @type='text'
              @width={{@width}}
              disabled={{@disabled}}
              aria-labelledby={{valueHeaderID}}
              {{on 'change' (fn this.updateInput select)}}
            />
          </B.Td>

          <B.Td>
            {{#if this.removeOptionByKey}}
              <Hds::Button
                data-test-remove-button={{select}}
                @text={{t 'actions.remove'}}
                @color='critical'
                @icon='trash'
                @isIconOnly={{true}}
                disabled={{@disabled}}
                {{on 'click' (fn this.removeOptionByKey select)}}
              />
            {{/if}}
          </B.Td>
        </B.Tr>
      {{/each-in}}

      {{#if this.showNewRow}}
        <B.Tr>
          <B.Td>
            <Hds::Form::Select::Base
              @value={{this.newOptionKey}}
              disabled={{@disabled}}
              aria-labelledby={{keyHeaderID}}
              @width={{@width}}
              {{on 'change' (set-from-event this 'newOptionKey')}}
              as |F|
            >
              <F.Options>

                <option hidden selected value=''>
                  {{t 'titles.choose-an-option'}}
                </option>
                {{#each-in this.selectOptions as |key value|}}
                  <option value={{key}} selected={{eq key this.newOptionKey}}>
                    {{value}}
                  </option>
                {{/each-in}}
              </F.Options>
            </Hds::Form::Select::Base>
          </B.Td>

          <B.Td>
            <Hds::Form::TextInput::Field
              @value={{this.newOptionValue}}
              @type='text'
              @width={{@width}}
              disabled={{@disabled}}
              aria-labelledby={{valueHeaderID}}
              {{on 'input' (set-from-event this 'newOptionValue')}}
            />
          </B.Td>

          <B.Td>
            <Hds::Button
              data-test-select-text-add-btn
              @text={{t 'actions.add'}}
              @color='secondary'
              type='button'
              disabled={{or @disabled (not this.newOptionKey)}}
              {{on 'click' this.addOption}}
            />
          </B.Td>
        </B.Tr>
      {{/if}}
    </:body>
  </Hds::Table>
{{/let}}