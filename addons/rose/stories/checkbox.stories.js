import { hbs } from 'ember-cli-htmlbars';
import { text, boolean } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Checkbox',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Checkbox
      @id={{id}}
      @name={{name}}
      @form={{form}}
      @checked={{checked}}
      @disabled={{disabled}}
      @error={{error}}
      >
      {{label}}
    </Rose::Checkbox>
  `,
  context: {
    label: text('text', 'Checkbox 🛎'),
    id: text('text', 'Identifier'),
    name: text('text', 'name'),
    form: text('text', 'form'),
    checked: boolean('checked', false),
    disabled: boolean('disabled', false),
    error: boolean('error', false)
  },
});
