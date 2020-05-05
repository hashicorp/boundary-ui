import { hbs } from 'ember-cli-htmlbars';
import { select } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Icon',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Icon @name={{name}} @size={{size}} />

    <br>

    <p>For a full list of available icons, review the <code>dist</code> folder
    of the <code>@hashicorp/structure-icons</code> package.</p>
  `,
  context: {
    name: select(
      'name',
      {
        'check-circle-outline': 'check-circle-outline',
        'copy-action': 'copy-action',
        'unfold-more': 'unfold-more',
        'unfold-less': 'unfold-less',
      },
      'check-circle-outline'
    ),

    size: select(
      'size',
      {
        'large (24px / default)': 'large',
        'medium (16px)': 'medium',
        'small (12px)': 'small',
      },
      'large'
    ),
  },
});
