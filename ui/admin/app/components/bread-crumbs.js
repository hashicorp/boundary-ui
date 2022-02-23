import Component from '@glimmer/component';
import EmberObject, { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank, isPresent } from '@ember/utils';
import { A } from '@ember/array';

// This component copies and modifies source from ember-breadcrumbs 0.2.3,
// updating it for Ember v4 compatibility.

// The original copyright is below.

/*
The MIT License (MIT)

Copyright (c) 2014-2019 Chris Farber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

export default class BreadcrumbsComponent extends Component {
  // =services

  @service session;
  @service scope;
  @service router;

  // =properties

  /* eslint-disable-next-line ember/require-computed-property-dependencies */
  @computed('router.currentRouteName')
  get routeInfos() {
    /* eslint-disable-next-line ember/no-private-routing-service */
    return this.router._router._routerMicrolib.currentRouteInfos;
  }

  /*
    For the pathNames and controllers properties, we must be careful not to NOT
    specify the properties of the route in our dependent keys.

    Observing the controller property of the route causes some serious problems:
    https://github.com/chrisfarber/ember-breadcrumbs/issues/21
  */

  @computed('routeInfos.[]')
  get pathNames() {
    return this.routeInfos.map(function (routeInfo) {
      return routeInfo.name;
    });
  }

  @computed('routeInfos.[]')
  get controllers() {
    return this.routeInfos.map(function (routeInfo) {
      var route = routeInfo.route || routeInfo.handler;
      return route.controller;
    });
  }

  @computed(
    'controllers.@each.{breadCrumbs,breadCrumb,breadCrumbPath,breadCrumbModel}',
    'pathNames.[]'
  )
  get breadCrumbs() {
    var controllers = this.controllers;
    var defaultPaths = this.pathNames;
    var breadCrumbs = A([]);

    controllers.forEach(function (controller, index) {
      var crumbs = controller.breadCrumbs || A([]);
      var singleCrumb = controller.breadCrumb;

      if (!isBlank(singleCrumb)) {
        crumbs.push({
          label: singleCrumb,
          path: controller.breadCrumbPath,
          model: controller.breadCrumbModel,
        });
      }

      crumbs.forEach(function (crumb) {
        breadCrumbs.addObject(
          EmberObject.create({
            label: crumb.label,
            path: crumb.path || defaultPaths[index],
            model: crumb.model,
            linkable: isPresent(crumb.linkable)
              ? crumb.linkable
              : crumb.path !== false,
            isCurrent: false,
          })
        );
      });
    });

    var deepestCrumb = get(breadCrumbs, 'lastObject');
    if (deepestCrumb) {
      deepestCrumb.isCurrent = true;
    }

    return breadCrumbs;
  }
}
