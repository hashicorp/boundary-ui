/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default class FormStorageBucketComponent extends Component {
  // =actions
  @service intl;

  @tracked scopeFieldDescription = this.intl.t(
    'resources.storage-bucket.form.scope.help'
  );

  updateScopeFieldDescription() {
    if (this.args.model.scopeModel.isGlobal) {
      this.scopeFieldDescription = this.intl.t(
        'resources.storage-bucket.form.scope.help_global'
      );
    } else {
      this.scopeFieldDescription = this.intl.t(
        'resources.storage-bucket.form.scope.help_org'
      );
    }
  }

  @action
  updateScope(event) {
    const selectedScopeId = event.target.value;
    const selectedScopeModel = this.args.scopes.find(
      (element) => element.model.id === selectedScopeId
    ).model;
    this.args.model.scopeModel = selectedScopeModel;
    this.updateScopeFieldDescription();
  }

  @action
  rollbackSecretAttrs(currentAttr) {
    const changedAttrs = this.args.model.changedAttributes();
    if (currentAttr in changedAttrs) {
      const [oldVal] = changedAttrs[currentAttr];
      set(this.args.model, currentAttr, oldVal);
    }
  }

  @action
  toggleDisableCredentialRotation() {
    this.args.model.disable_credential_rotation =
      !this.args.model.disable_credential_rotation;
  }
}
