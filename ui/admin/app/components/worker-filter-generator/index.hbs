{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Hds::Form::Field as |F|>
  <F.Control>
    <Rose::CodeEditor as |c|>
      {{#unless @hideToolbar}}
        <c.toolbar @copyText={{get @model @name}} />
      {{/unless}}
      <c.fieldEditor
        @onInput={{fn this.setWorkerFilter @model @name}}
        @value={{or (get @model @name) ''}}
        @options={{hash
          mode='text/x-sh'
          gutters=(array 'CodeMirror-lint-markers')
          lint='true'
        }}
      />
    </Rose::CodeEditor>
  </F.Control>
  {{#if (get @model.errors @name)}}
    <F.Error data-test-worker-filter-error as |E|>
      {{#each (get @model.errors @name) as |error|}}
        <E.Message>{{error.message}}</E.Message>
      {{/each}}
    </F.Error>
  {{/if}}
</Hds::Form::Field>

<Hds::Separator />

<Hds::Form::Toggle::Field
  checked={{this.showFilterGenerator}}
  name='show_filter_generator'
  {{on 'change' this.toggleFilterGenerator}}
  as |F|
>
  <F.Label>{{t 'worker-filter-generator.toggle.title'}}</F.Label>
  <F.HelperText>{{t
      'worker-filter-generator.toggle.description'
    }}</F.HelperText>
</Hds::Form::Toggle::Field>

<Hds::Separator />

{{#if this.showFilterGenerator}}
  <Hds::Form::Radio::Group
    class='filter-generator-selection'
    @name='filter_generator'
    {{on 'change' this.setGeneratorType}}
    as |G|
  >
    <G.Legend>{{t 'worker-filter-generator.title'}}</G.Legend>
    <G.HelperText>
      {{t 'worker-filter-generator.description'}}
      <br />
      <Hds::Link::Inline
        @href={{doc-url 'worker-filters-format'}}
        @color='secondary'
      >
        {{t 'worker-filter-generator.link'}}
      </Hds::Link::Inline>
    </G.HelperText>
    <G.RadioField
      @value={{this.generatorTagType}}
      checked={{eq this.selectedGeneratorType this.generatorTagType}}
      as |F|
    >
      <F.Label>{{t 'worker-filter-generator.tag.label'}}</F.Label>
      <F.HelperText>{{t 'worker-filter-generator.tag.helper'}}</F.HelperText>
    </G.RadioField>
    <G.RadioField
      @value={{this.generatorNameType}}
      checked={{eq this.selectedGeneratorType this.generatorNameType}}
      as |F|
    >
      <F.Label>{{t 'worker-filter-generator.name.label'}}</F.Label>
      <F.HelperText>{{t 'worker-filter-generator.name.helper'}}</F.HelperText>
    </G.RadioField>
  </Hds::Form::Radio::Group>

  {{#let (unique-id) (unique-id) as |labelId helpId|}}
    <Hds::Form::Fieldset
      aria-labelledby={{labelId}}
      aria-describedby={{helpId}}
      class='input-values'
      as |F|
    >
      <F.Legend id={{labelId}}>{{t
          'worker-filter-generator.input-values.title'
        }}</F.Legend>
      <F.HelperText id={{helpId}}>{{t
          'worker-filter-generator.input-values.description'
        }}</F.HelperText>
      <F.Control>
        {{#if (eq this.selectedGeneratorType this.generatorTagType)}}
          <Hds::Form::TextInput::Field
            @value={{this.key}}
            name='tag_key'
            @width='320px'
            {{on 'input' (set-from-event this 'key')}}
            as |F|
          >
            <F.Label>{{t 'form.key.label'}}</F.Label>
          </Hds::Form::TextInput::Field>
        {{else}}
          <Hds::Form::Select::Field
            name='name_operator'
            @value={{this.operator}}
            @width='320px'
            {{on 'change' (set-from-event this 'operator')}}
            as |F|
          >
            <F.Label>{{t 'form.operator.label'}}</F.Label>
            <F.Options>
              <option value=''>
                {{t 'titles.choose-an-option'}}
              </option>
              {{#each this.operatorOptions as |operator|}}
                <option
                  value={{operator}}
                  selected={{eq operator this.operator}}
                >
                  {{#if (eq operator '==')}}
                    {{operator}}
                  {{else}}
                    {{t (concat 'worker-filter-generator.operator.' operator)}}
                  {{/if}}
                </option>
              {{/each}}
            </F.Options>
          </Hds::Form::Select::Field>
        {{/if}}
      </F.Control>
      <F.Control>
        <Hds::Form::TextInput::Field
          @value={{this.value}}
          name='tag_value'
          @width='320px'
          {{on 'input' (set-from-event this 'value')}}
          as |F|
        >
          <F.Label>{{t 'form.value.label'}}</F.Label>
        </Hds::Form::TextInput::Field>
      </F.Control>
    </Hds::Form::Fieldset>
  {{/let}}

  {{#let (unique-id) (unique-id) as |labelId helpId|}}
    <Hds::Form::Fieldset
      aria-labelledby={{labelId}}
      aria-describedby={{helpId}}
      class='formatted-results'
      @layout='vertical'
      as |F|
    >
      <F.Legend id={{labelId}}>{{t
          'worker-filter-generator.formatted-result.title'
        }}</F.Legend>
      <F.HelperText id={{helpId}}>{{t
          'worker-filter-generator.formatted-result.description'
        }}</F.HelperText>
      <F.Control>
        <Hds::Text::Body @tag='p' @weight='semibold'>{{t
            'worker-filter-generator.formatted-result.label'
          }}</Hds::Text::Body>
        <div class='generated-results-container'>
          <Hds::Form::TextInput::Base
            readonly
            name='generated_value'
            @value={{this.generatedResult}}
            @width='320px'
          />
          {{#if this.generatedResult}}
            <Hds::Copy::Button
              @text='Copy'
              @textToCopy={{this.generatedResult}}
            />
          {{/if}}
        </div>
      </F.Control>
    </Hds::Form::Fieldset>
  {{/let}}
{{/if}}