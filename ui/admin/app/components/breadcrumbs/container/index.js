/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { modifier } from 'ember-modifier';

/*
  The `containers` property from the `breadcrumbsService` is tracked
  so registering or unregistering a container will cause the DOM
  to re-render a container with the correct breadcrumbs.
*/

export default class BreadcrumbsContainerComponent extends Component {
  @service('breadcrumbs') breadcrumbsService;

  container = null;

  insertedBreadcrumbContainer = modifier((element) => {
    this.container = {
      element: element.querySelector('ol'),
    };

    this.breadcrumbsService.registerContainer(this.container);

    return () => this.breadcrumbsService.unregisterContainer(this.container);
  });
}
