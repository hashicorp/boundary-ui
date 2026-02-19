{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#let (unique-id) (unique-id) as |keyHeaderID valueHeaderID|}}
  <Hds::Table class='list-wrapper-field' name={{@name}}>
    <:head as |H|>
      <H.Tr>
        <H.Th id={{keyHeaderID}}>
          {{#if @keyLabel}}
            {{@keyLabel}}
          {{else}}
            {{t 'form.key.label'}}
          {{/if}}</H.Th>
        <H.Th id={{valueHeaderID}}>
          {{#if @valueLabel}}
            {{@valueLabel}}
          {{else}}
            {{t 'form.value.label'}}
          {{/if}}
        </H.Th>
        <H.Th>
          {{t 'titles.actions'}}
        </H.Th>
      </H.Tr>
    </:head>
    <:body as |B|>
      {{#each this.options as |option index|}}
        <B.Tr>
          <B.Td>
            {{yield
              (hash
                text=(component
                  'form/field/list-wrapper/key-value/text'
                  disabled=@disabled
                  value=option.key
                  ariaLabelledBy=keyHeaderID
                  setContext=(set-from-event option 'key')
                )
                select=(component
                  'form/field/list-wrapper/key-value/select'
                  disabled=@disabled
                  value=option.key
                  ariaLabelledBy=keyHeaderID
                  setContext=(set-from-event option 'key')
                  width=@width
                )
              )
              to='key'
            }}
          </B.Td>

          <B.Td>
            {{yield
              (hash
                text=(component
                  'form/field/list-wrapper/key-value/text'
                  disabled=@disabled
                  value=option.value
                  ariaLabelledBy=valueHeaderID
                  setContext=(set-from-event option 'value')
                )
                select=(component
                  'form/field/list-wrapper/key-value/select'
                  disabled=@disabled
                  value=option.value
                  ariaLabelledBy=valueHeaderID
                  width=@width
                  setContext=(set-from-event option 'value')
                )
              )
              to='value'
            }}
          </B.Td>

          <B.Td>
            {{#if this.removeOptionByIndex}}
              <Hds::Button
                data-test-remove-button
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
      {{#if this.showNewRow}}
        <B.Tr>
          <B.Td>
            {{#if (has-block 'newKey')}}
              {{yield
                (hash
                  text=(component
                    'form/field/list-wrapper/key-value/text'
                    disabled=@disabled
                    value=this.newOptionKey
                    ariaLabelledBy=keyHeaderID
                    setContext=(set-from-event this 'newOptionKey')
                  )
                  select=(component
                    'form/field/list-wrapper/key-value/select'
                    disabled=@disabled
                    value=this.newOptionKey
                    ariaLabelledBy=keyHeaderID
                    width=@width
                    setContext=(set-from-event this 'newOptionKey')
                  )
                )
                to='newKey'
              }}

            {{else}}
              {{yield
                (hash
                  text=(component
                    'form/field/list-wrapper/key-value/text'
                    disabled=@disabled
                    value=this.newOptionKey
                    ariaLabelledBy=keyHeaderID
                    setContext=(set-from-event this 'newOptionKey')
                  )
                  select=(component
                    'form/field/list-wrapper/key-value/select'
                    disabled=@disabled
                    value=this.newOptionKey
                    ariaLabelledBy=keyHeaderID
                    width=@width
                    setContext=(set-from-event this 'newOptionKey')
                  )
                )
                to='key'
              }}
            {{/if}}
          </B.Td>

          <B.Td>
            {{#if (has-block 'newValue')}}
              {{yield
                (hash
                  text=(component
                    'form/field/list-wrapper/key-value/text'
                    disabled=@disabled
                    value=this.newOptionValue
                    ariaLabelledBy=valueHeaderID
                    setContext=(set-from-event this 'newOptionValue')
                  )
                  select=(component
                    'form/field/list-wrapper/key-value/select'
                    disabled=@disabled
                    value=this.newOptionValue
                    ariaLabelledBy=valueHeaderID
                    width=@width
                    setContext=(set-from-event this 'newOptionValue')
                  )
                )
                to='newValue'
              }}

            {{else}}
              {{yield
                (hash
                  text=(component
                    'form/field/list-wrapper/key-value/text'
                    disabled=@disabled
                    value=this.newOptionValue
                    ariaLabelledBy=valueHeaderID
                    setContext=(set-from-event this 'newOptionValue')
                  )
                  select=(component
                    'form/field/list-wrapper/key-value/select'
                    disabled=@disabled
                    value=this.newOptionValue
                    ariaLabelledBy=valueHeaderID
                    width=@width
                    setContext=(set-from-event this 'newOptionValue')
                  )
                )
                to='value'
              }}
            {{/if}}
          </B.Td>

          <B.Td>

            <Hds::Button
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