/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { options } from 'api/models/auth-method';
import { set } from '@ember/object';

export default class FormAuthMethodLdapComponent extends Component {
  // For fields with just a value property
  createEmptyValue = () => ({ value: '' });

  // For fields with key and value properties
  createEmptyKeyValue = () => ({ key: '', value: '' });

  // =attributes
  /**
   * @type {object}
   */
  toAttributes = options.ldap.account_attribute_maps.to;

  /**
   * @type {string}
   */
  newToAttribute = options.ldap.account_attribute_maps.to[0];

  dereferenceAliasesList = options.ldap.dereference_aliases;

  /**
   * @type {string}
   */
  @tracked newFromAttribute = '';

  /**
   * @type {string}
   */
  @tracked newCertificate = '';

  /**
   * @type {string}
   */
  @tracked urlsArrayString = this.parseUrlsArray();

  //actions

  /**
   * @param {object} event
   */
  @action
  toggleField(event) {
    const { name: field } = event.target;
    this.args.model[field] = !this.args.model[field];
  }

  @action
  addCertificate() {
    if (this.newCertificate) {
      this.args.addStringItem('certificates', this.newCertificate);
    }
    this.newCertificate = '';
  }

  @action
  addAttributeMap() {
    if (this.newFromAttribute) {
      this.args.addAccountMapItem(
        'account_attribute_maps',
        this.newFromAttribute,
        this.newToAttribute,
      );
    }
    this.newFromAttribute = '';
  }

  /**
   * @param {object} event
   */
  @action
  setUrls(event) {
    const { value } = event.target;
    this.urlsArrayString = value;
    const array = value.split(',').map((item) => ({ value: item }));
    this.args.model.set('urls', array);
  }

  /**
   * @returns {string}
   */
  parseUrlsArray() {
    return (this.args.model.urls || []).map((item) => item.value).toString();
  }

  /**
   * @param {string} currentAttr
   */
  @action
  rollbackSecretAttrs(currentAttr) {
    const changedAttrs = this.args.model.changedAttributes();
    if (currentAttr in changedAttrs) {
      const [oldVal] = changedAttrs[currentAttr];
      set(this.args.model, currentAttr, oldVal);
    }
  }
}
