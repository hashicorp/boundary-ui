import Component from '@glimmer/component';

export default class RoseBadgeComponent extends Component {
  // =attributes
  constructor(...args) {
    super(...args);
    //should probably check for environment here and add only to dev
    console.warn(
      '-----this will be deprecated soon, Please use HDS-----' +
        ' https://design-system-components-hashicorp.vercel.app/'
    );
  }
}
