import { hbs } from 'ember-cli-htmlbars';
import { action } from '@storybook/addon-actions';
import { text, boolean, select } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Button',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Button
      @submit={{submit}}
      @disabled={{disabled}}
      @style={{style}}
      {{action onClick}}
      >
      {{text}}
    </Rose::Button>
  `,
  context: {
    text: text('text', 'Button 🌈'),
    submit: boolean('submit', false),
    disabled: boolean('disabled', false),
    style: select(
      'style',
      {
        primary: 'primary',
        secondary: 'secondary',
        warning: 'warning',
        ghost: 'ghost',
        'inline-link-action': 'inline-link-action',
      },
      'primary'
    ),
    onClick: action('clicked'),
  },
});
