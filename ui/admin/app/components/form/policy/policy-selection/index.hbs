{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Hds::Form::Fieldset @isRequired={{true}} class='policy' as |F|>

  <F.Legend>{{t (concat 'resources.policy.form.' @name '.label')}}</F.Legend>
  <F.HelperText>
    {{t (concat 'resources.policy.form.' @name '.help')}}
  </F.HelperText>

  <F.Control>
    <Hds::Form::Select::Field
      name={{@name}}
      disabled={{or @disabled this.isDeleteDisable}}
      aria-label={{t (concat 'resources.policy.form.' @name '.label')}}
      data-select={{@name}}
      @width='70%'
      {{on 'change' this.handlePolicyTypeSelection}}
      as |F|
    >
      <F.Options>
        <option disabled hidden selected value=''>
          {{t 'titles.choose-an-option'}}
        </option>
        {{#each-in @options as |key value|}}
          <option value={{value}} selected={{eq key @selectedOption}}>
            {{t
              (concat 'resources.policy.form.' @name '_options.' key '.label')
            }}
          </option>
        {{/each-in}}
      </F.Options>

    </Hds::Form::Select::Field>
    {{#if @model.scope.isGlobal}}
      <Hds::Form::Toggle::Field
        name={{@customInputName}}
        checked={{this.isOverridable}}
        disabled={{this.toggleDisabled}}
        data-toggle={{@customInputName}}
        {{on 'change' this.handleOverridableToggle}}
        as |F|
      >
        <F.Label>{{t 'resources.policy.form.overridable.label'}}</F.Label>
      </Hds::Form::Toggle::Field>
    {{/if}}
  </F.Control>
</Hds::Form::Fieldset>
{{#if this.showCustomInput}}
  <Hds::Form::Field class='policy-custom-input' @layout='vertical' as |F|>
    <F.Label>{{t (concat 'resources.policy.titles.' @customInputName)}}
    </F.Label>
    <F.Control>
      <Hds::SegmentedGroup as |S|>
        <S.TextInput
          name={{@customInputName}}
          @value={{@inputValue}}
          disabled={{@disabled}}
          aria-label={{t 'resources.policy.title'}}
          data-input={{@customInputName}}
          {{on 'input' this.handleInputChange}}
        />
        <S.Generic>
          <Hds::Badge
            class={{if @disabled 'disabled'}}
            @text={{t 'resources.policy.titles.days'}}
            @color='neutral'
            @type='outlined'
          />
        </S.Generic>
      </Hds::SegmentedGroup>

    </F.Control>

  </Hds::Form::Field>
{{/if}}