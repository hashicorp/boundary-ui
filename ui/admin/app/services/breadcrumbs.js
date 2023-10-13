import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';

export default class BreadcrumbsService extends Service {
  @tracked containers = [];
  #containers = [];

  registerContainer(container) {
    assert(
      'A breadcrumb container with the same DOM element has already been registered before.',
      !this.#isContainerRegistered(container)
    );
    this.#containers = [...this.#containers, container];
    this.containers = this.#containers;
  }

  unregisterContainer(container) {
    assert(
      'No breadcrumb container was found with this DOM element.',
      this.#isContainerRegistered(container)
    );

    this.#containers = this.#containers.filter((registeredContainer) => {
      return container.element !== registeredContainer.element;
    });

    this.containers = this.#containers;
  }

  #isContainerRegistered(container) {
    return this.#containers.some((registeredContainer) => {
      return container.element === registeredContainer.element;
    });
  }
}
