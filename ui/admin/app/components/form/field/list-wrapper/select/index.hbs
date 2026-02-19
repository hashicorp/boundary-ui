{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Hds::Table class='list-wrapper-field' name={{@name}}>

  <:body as |B|>

    {{#each this.options as |select index|}}
      <B.Tr>
        <B.Td>
          <Hds::Form::Select::Base
            @value={{select.value}}
            @width={{@width}}
            disabled={{@disabled}}
            aria-label={{t 'titles.value'}}
            {{on 'change' (set-from-event select 'value')}}
            as |F|
          >
            <F.Options>
              {{#each @selectOptions as |selectOption|}}
                <option
                  value={{selectOption}}
                  selected={{eq select.value selectOption}}
                >
                  {{selectOption}}
                </option>
              {{/each}}
            </F.Options>
          </Hds::Form::Select::Base>
        </B.Td>

        <B.Td>
          {{#if this.removeOptionByIndex}}
            <Hds::Button
              data-test-remove-option-button={{select.value}}
              @text={{t 'actions.remove'}}
              @color='critical'
              @icon='trash'
              @isIconOnly={{true}}
              disabled={{@disabled}}
              {{on 'click' (fn this.removeOptionByIndex index)}}
            />
          {{/if}}
        </B.Td>
      </B.Tr>
    {{/each}}

    <B.Tr>
      <B.Td>
        <Hds::Form::Select::Base
          @value={{this.newOptionValue}}
          @width={{@width}}
          disabled={{@disabled}}
          aria-label={{t 'titles.value'}}
          {{on 'change' (set-from-event this 'newOptionValue')}}
          as |F|
        >

          <F.Options>
            <option disabled={{@disabled}} hidden selected value=''>
              {{t 'titles.choose-an-option'}}
            </option>
            {{#each @selectOptions as |selectOption|}}
              <option
                value={{selectOption}}
                selected={{eq selectOption this.newOptionValue}}
              >
                {{selectOption}}
              </option>
            {{/each}}
          </F.Options>

        </Hds::Form::Select::Base>
      </B.Td>

      <B.Td>
        <Hds::Button
          data-test-add-option-button
          @text={{t 'actions.add'}}
          @color='secondary'
          type='button'
          disabled={{or @disabled (not this.newOptionValue)}}
          {{on 'click' this.addOption}}
        />
      </B.Td>
    </B.Tr>
  </:body>
</Hds::Table>