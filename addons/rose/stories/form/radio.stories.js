import { hbs } from 'ember-cli-htmlbars';
import { text, boolean } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Form::Radio',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Radio
      @id={{id}}
      name={{name}}
      @label={{label}}
      @checked={{checked}}
      @error={{error}}
      disabled={{disabled}}
      />
  `,
  context: {
    label: text('text', 'Radiofield'),
    id: text('id', 'radio-1'),
    name: text('name', 'radio-1'),
    checked: boolean('checked', false),
    error: boolean('error', false),
    disabled: boolean('disabled', false),
  },
});
