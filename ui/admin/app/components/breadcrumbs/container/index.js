/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
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
    // A child `ol` is rendered in the Hds::Breadcrumb container and this is
    // the element that the in-element helper should drop breadcrumbs into.
    this.container = {
      element: element.querySelector('ol'),
    };

    this.breadcrumbsService.registerContainer(this.container);

    return () => this.breadcrumbsService.unregisterContainer(this.container);
  });
}
