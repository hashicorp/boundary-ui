/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { join } from '@ember/runloop';
import { runInDebug, assert } from '@ember/debug';
import { A } from '@ember/array';

/**
 * This helper is a modern update on ember-route-action-helper, which is
 * now unmaintained.
 *
 * See https://github.com/DockYard/ember-route-action-helper
 */
export default class RouteActionHelper extends Helper {
  // =services

  @service router;

  // =attributes

  get routes() {
    const { currentInfos, mapBy } = this.currentInfos;
    return A(currentInfos).mapBy(mapBy).reverse();
  }

  get currentInfos() {
    // eslint-disable-next-line ember/no-private-routing-service
    const routerLib = this.router._router._routerMicrolib;
    return {
      currentInfos:
        routerLib.currentRouteInfos || routerLib.currentHandlerInfos,
      mapBy: (routerLib.currentRouteInfos && 'route') || 'handler',
    };
  }

  // =methods

  compute([actionName, ...outerArgs]) {
    const { action, handler } = this.getRouteWithAction(actionName);

    runInDebug(() => {
      assert(
        `
        [boundary-core-helper-route-action]
        Unable to find action ${actionName}
      `,
        handler
      );
    });

    return (...innerArgs) =>
      join(handler, action, ...outerArgs.concat(innerArgs));
  }

  getRouteWithAction(actionName) {
    let action;
    const handler = A(this.routes).find((route) => {
      const actions = route.actions || route._actions;
      action = actions[actionName];
      return typeof action === 'function';
    });

    return { action, handler };
  }
}
