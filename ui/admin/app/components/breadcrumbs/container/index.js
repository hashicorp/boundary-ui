import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class BreadcrumbsContainerComponent extends Component {
  @service('breadcrumbs') breadcrumbsService;

  container = null;

  @action
  registerContainer(element) {
    // A child `ol` is rendered in the Hds::Breadcrumb container and this is
    // the element that the in-element helper should drop breadcrumbs into.
    this.container = {
      element: element.querySelector('ol'),
    };

    this.breadcrumbsService.registerContainer(this.container);
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this.breadcrumbsService.unregisterContainer(this.container);
  }
}
