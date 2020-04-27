import { hbs } from 'ember-cli-htmlbars';
import { action } from '@storybook/addon-actions';
import { text /*withKnobs, boolean, select */ } from '@storybook/addon-knobs';

export default {
  title: 'Button',
};

export const Normal = () => ({
  template: hbs`
    <button {{action onClick}}>
      {{text}}
    </button>
  `,
  context: {
    text: text('text', 'Button Text'),
    onClick: action('clicked'),
  },
});
