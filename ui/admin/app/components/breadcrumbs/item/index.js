import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BreadcrumbsItemComponent extends Component {
  @service('breadcrumbs') breadcrumbsService;

  @tracked element = null;

  @action
  registerSelf(element) {
    this.element = element;
  }

  get current() {
    const crumbs = this.breadcrumbsService.containers[0].element.children;
    const lastCrumb = crumbs[crumbs.length - 1];
    return lastCrumb.isEqualNode(this.element);
  }
}
