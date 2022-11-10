import Component from '@glimmer/component';

export default class RoseBadgeComponent extends Component {
  // =attributes
  constructor(...args) {
    super(...args);
    console.warn(
      '-----this will be deprecated soon, Please use HDS-----' +
        ' https://design-system-components-hashicorp.vercel.app/'
    );
  }
}
