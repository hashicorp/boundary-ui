import Component from '@glimmer/component';
import { deprecate } from '@ember/debug';

export default class RoseBadgeComponent extends Component {
  constructor() {
    super(...arguments);
    deprecate(
      `Rose badge component is deprecated, use HDS Badge instead. For more info, refer to `,
      false,
      {
        id: 'rose.badge',
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
