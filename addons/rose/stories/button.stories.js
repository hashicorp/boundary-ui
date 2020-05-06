import { hbs } from 'ember-cli-htmlbars';
import { action } from '@storybook/addon-actions';
import { text, boolean, select } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Button',
};

const icons = {
  none: null,
  'alert-circle-fill': 'alert-circle-fill',
  'chevron-right': 'chevron-right',
  'copy-action': 'copy-action',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Button
      @submit={{submit}}
      @disabled={{disabled}}
      @style={{style}}
      @iconLeft={{iconLeft}}
      @iconRight={{iconRight}}
      {{on "click" onClick}}
      >
      {{text}}
    </Rose::Button>
  `,
  context: {
    text: text('text', 'Button'),
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
    iconLeft: select('iconLeft', icons, 'copy-action'),
    iconRight: select('iconRight', icons, 'chevron-right'),
    onClick: action('clicked'),
  }
});
