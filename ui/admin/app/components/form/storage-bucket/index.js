/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { set } from '@ember/object';
import { assert } from '@ember/debug';
import {
  TYPE_CREDENTIAL_DYNAMIC,
  TYPES_STORAGE_BUCKET_PLUGIN,
} from 'api/models/storage-bucket';
import awsFormComponent from './aws';
import minioFormComponent from './minio';

const modelCompositeTypeToComponent = {
  aws: awsFormComponent,
  minio: minioFormComponent,
};

export default class FormStorageBucketComponent extends Component {
  // =attributes
  @service intl;

  /**
   * returns an array of available storage bucket plugin types
   */
  get pluginTypes() {
    return TYPES_STORAGE_BUCKET_PLUGIN;
  }

  /**
   * returns the associated storage bucket form component for the model's composite type
   */
  get storageBucketFormComponent() {
    const component =
      modelCompositeTypeToComponent[this.args.model.compositeType];
    assert(
      `Mapped component must exist for storage bucket composite type: ${this.args.model.compositeType}`,
      component,
    );
    return component;
  }

  // =actions
  @action
  updateScope(event) {
    const selectedScopeId = event.target.value;
    const selectedScopeModel = this.args.scopes.find(
      (element) => element.model.id === selectedScopeId,
    ).model;
    this.args.model.scopeModel = selectedScopeModel;
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

  /**
   * Call passed cancel function.
   * Unset selected credentials.
   */
  @action
  cancel() {
    this.args.cancel();
    // Reset the tracked variable after rollback
    this.selectedCredentialType = this.args.model.credentialType;
    this.showDynamicCredentials =
      this.args.model.credentialType === TYPE_CREDENTIAL_DYNAMIC;
  }
}
