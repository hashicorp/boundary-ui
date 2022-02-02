import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormHostCatalogIndexComponent extends Component {
  // // =properties
  // /**
  // /**
  //  */
  // @tracked showDynamicPlugins = false;
  // // =actions

  // @action
  // toggleType(type) {
  //   this.renderDynamicPlugins(type);
  // }
  // //show dynamic type radio cards -> aws and azure if the type is dynamic
  // //call route action to update the query and rerender the model if static is selected
  // renderDynamicPlugins(type) {
  //   if (type === 'dynamic') {
  //     this.showDynamicPlugins = true;
  //   } else {
  //     this.showDynamicPlugins = false;
  //     //CHECK:how to call the action to update query param
  //     // this.args.model.type = 'static';
  //     // this.args.changeType();
  //   }
  // }
}
