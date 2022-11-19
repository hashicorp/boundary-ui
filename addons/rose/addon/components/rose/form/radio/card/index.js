import RoseFormRadioRadioComponent from '../radio';
import { deprecate } from '@ember/debug';

export default class RoseFormRadioCardComponent extends RoseFormRadioRadioComponent {
  // =attributes
  layout = this.args.layout;
  className = `rose-form-radio-card ${this.layout}`;

  constructor() {
    super(...arguments);
    deprecate(
      `Rose Form/Radio/Card component is deprecated, use HDS Form/RadioCard instead. For more info, refer to `,
      false,
      {
        id: 'rose.form.radio.card',
        until: '4.8.0',
        for: 'rose',
        since: {
          enabled: '3.28.8',
        },
        url: 'https://boundary-ui-storybook.vercel.app/?path=/docs/rose-badge--hds-badge',
      }
    );
  }
}
