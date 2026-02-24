/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

/*
  `BreadcrumbsItem` inserts the crumbs to an existing container.
  For our purposes, there will always be at most one container.
*/

export default class BreadcrumbsItemComponent extends Component {
  @service('breadcrumbs') breadcrumbsService;

  @tracked element = null;

  insertedBreadcrumbItem = modifier((element) => {
    this.element = element;
  });

  get current() {
    const crumbs = this.breadcrumbsService.containers[0].element.children;
    const lastCrumb = crumbs[crumbs.length - 1];
    return lastCrumb.isEqualNode(this.element);
  }
}
