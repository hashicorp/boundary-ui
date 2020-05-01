import { hbs } from 'ember-cli-htmlbars';
import { text, boolean, select } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Checkbox',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Checkbox
      @checked={{checked}}
      @disabled={{disabled}}
      @error={{error}}
      @style={{style}}
      >
      {{text}}
    </Rose::Checkbox>
  `,
  context: {
    text: text('text', 'Checkbox 🛎'),
    checked: boolean('checked', false),
    disabled: boolean('disabled', false),
    error: boolean('error', false),
    style: select('style', { default: 'default'}, 'default')
  },
});
