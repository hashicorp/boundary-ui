/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPE_TARGET_TCP,
  TYPE_TARGET_RDP,
  TYPE_TARGET_SSH,
} from 'api/models/target';
import { service } from '@ember/service';
import { action } from '@ember/object';

const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
  rdp: 'monitor',
};

export default class FormTargetComponent extends Component {
  // =services

  @service features;
  @service abilities;
  @service intl;
  @service store;

  /**
   * maps resource type with icon
   * @type {object}
   */
  get typeMetas() {
    const types = [TYPE_TARGET_TCP];
    if (this.isSSHEnabled) types.push(TYPE_TARGET_SSH);
    if (this.isRDPEnabled) types.push(TYPE_TARGET_RDP);

    return types.map((type) => ({
      type,
      icon: icons[type],
    }));
  }

  /**
   * returns icons based on the model type
   * unlike other resources, this is needed as we use generic details component for both tcp and ssh
   * @type {string}
   */
  get icon() {
    return icons[this.args.model.type];
  }

  get isRDPEnabled() {
    return this.features.isEnabled('rdp-target');
  }

  get isSSHEnabled() {
    return this.features.isEnabled('ssh-target');
  }

  /**
   * Checks if the injected application credential alert should be shown for SSH and RDP targets.
   * @type {boolean}
   */
  get showInjectedApplicationCredentialAlert() {
    return (
      !this.args.model.isNew &&
      this.args.model.injected_application_credential_source_ids.length === 0 &&
      this.args.model.type !== TYPE_TARGET_TCP
    );
  }

  /**
   * Checks if the target type radio group should be displayed.
   * This is true if either the 'rdp-target' or 'ssh-target' feature is enabled.
   * @returns {boolean}
   * @type {boolean}
   */
  get showTargetTypeRadioGroup() {
    return (this.isRDPEnabled || this.isSSHEnabled) && this.args.model.isNew;
  }

  /**
   * True when the current scope is a project with a configured suffix and
   * the user can create aliases on it.
   * @type {boolean}
   */
  get canCreateAliasOnProject() {
    return this.abilities.can(
      'createProjectAlias scope',
      this.args.model?.scopeModel,
    );
  }

  /**
   * Default scope id to seed onto a freshly-added alias row.
   * @type {string}
   */
  get defaultAliasScopeId() {
    return this.canCreateAliasOnProject
      ? this.args.model.scopeModel.id
      : this.args.globalScope.id;
  }

  /**
   * Normalizes a suffix value into dot-separated segments without a leading dot.
   * @param {string | null | undefined} suffix
   * @returns {string | null}
   */
  normalizeSuffixSegments(suffix) {
    if (!suffix) return null;
    const normalized = String(suffix).split('.').filter(Boolean).join('.');
    return normalized || null;
  }

  /**
   * Combined project+org suffix with a leading dot.
   * For project scopes: `.projectSuffix.orgSuffix`.
   * Empty string when no suffix is configured.
   * @type {string}
   */
  get normalizedProjectSuffix() {
    const scope = this.args.model?.scopeModel;
    const projectSuffix = this.normalizeSuffixSegments(scope?.alias_suffix);
    if (!projectSuffix) return '';

    const orgScope = scope?.scopeID
      ? this.store.peekRecord('scope', scope.scopeID)
      : null;
    const orgSuffix = this.normalizeSuffixSegments(orgScope?.alias_suffix);

    if (
      !orgSuffix ||
      projectSuffix === orgSuffix ||
      projectSuffix.endsWith(`.${orgSuffix}`)
    ) {
      return `.${projectSuffix}`;
    }
    return `.${projectSuffix}.${orgSuffix}`;
  }

  /**
   * Dropdown label for the Project scope option, e.g.
   * "Project name (suffix '.example')".
   * @type {string}
   */
  get projectOptionLabel() {
    const scope = this.args.model?.scopeModel;
    const name = scope?.displayName;
    return this.intl.t('resources.alias.form.alias.scope.options.project', {
      name,
      suffix: this.normalizedProjectSuffix,
    });
  }

  // =actions

  @action
  addAliasRow() {
    const existing = this.args.model.with_aliases ?? [];
    this.args.model.with_aliases = [
      ...existing,
      { value: '', scope_id: this.defaultAliasScopeId },
    ];
  }

  @action
  removeAliasRow(rowData) {
    const existing = this.args.model.with_aliases ?? [];
    this.args.model.with_aliases = existing.filter((r) => r !== rowData);
  }

  @action
  setRowScope(row, event) {
    row.scope_id = event.target.value;
    this.args.model.with_aliases = [...(this.args.model.with_aliases ?? [])];
  }

  @action
  setRowValue(row, event) {
    row.value = event.target.value;
    this.args.model.with_aliases = [...(this.args.model.with_aliases ?? [])];
  }
}
