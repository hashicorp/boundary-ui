import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';

// This service copies source code from @Bagaar/ember-breadcrumbs v4.1.0
// The original copyright is below.
/*
The MIT License (MIT)

Copyright (c) 2021

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export default class BreadcrumbsService extends Service {
  @tracked containers = [];
  #containers = [];

  registerContainer(container) {
    assert(
      'A breadcrumb container with the same DOM element has already been registered before.',
      !this.#isContainerRegistered(container),
    );
    this.#containers = [...this.#containers, container];
    this.containers = this.#containers;
  }

  unregisterContainer(container) {
    assert(
      'No breadcrumb container was found with this DOM element.',
      this.#isContainerRegistered(container),
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
