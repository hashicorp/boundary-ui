// import { registerDeprecationHandler } from '@ember/debug';
import Component from '@glimmer/component';
import { deprecate } from '@ember/debug';

export default class RoseBadgeComponent extends Component {
  constructor() {
    super(...arguments);
    deprecate(
      `Rose badge component is deprecated, use HDS Badge instead. For more info, refer to https://design-system-components-hashicorp.vercel.app/`,
      false,
      {
        id: 'rose.deprecation-badge',
        until: '4.0.0',
        for: 'rose',
        since: {
          enabled: '3.0.0',
        },
      }
    );
  }
}
