/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsTargetsRoute extends Route {
  @service controllerCheck;

  async setupController(controller) {
    super.setupController(...arguments);

    await this.controllerCheck.checkPaginationSupport();

    const isPaginationSupported = this.controllerCheck.isPaginationSupported;
    if (!isPaginationSupported) {
      controller.set('isPaginationSupported', isPaginationSupported);
      const { downloadLink, downloadError } =
        await this.controllerCheck.findDownloadLink();
      controller.set('downloadLink', downloadLink);
      controller.set('downloadError', downloadError);
    }
  }
}
