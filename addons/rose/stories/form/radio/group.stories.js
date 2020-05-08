import { hbs } from 'ember-cli-htmlbars';
import { text } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Form::Radio::Group',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Radio::Group @name={{name}} @selectedValue={{selectedValue}} as |radioGroup|>
      <radioGroup.radio
        @id="firstField"
        @label={{firstFieldLabel}}
        @value={{firstFieldValue}}
      />
      <radioGroup.radio
        @id="secondField"
        @label={{secondFieldLabel}}
        @value={{secondFieldValue}}
      />
      <radioGroup.radio
        @id="thirdField"
        @label={{thirdFieldLabel}}
        @value={{thirdFieldValue}}
      />
    </Rose::Form::Radio::Group>
  `,
  context: {
    name: text('name', 'Groupname'),
    selectedValue: text('selectedValue', 'disagree'),

    firstFieldLabel: text('first radiofield label', 'Agree'),
    firstFieldValue: text('first radiofield value', 'agree'),

    secondFieldLabel: text('second radiofield label', 'Maybe'),
    secondFieldValue: text('second radiofield value', 'maybe'),

    thirdFieldLabel: text('third radiofield label', 'Disagree'),
    thirdFieldValue: text('third radiofield value', 'disagree'),
  },
});
