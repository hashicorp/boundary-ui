import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getOwner } from '@ember/application';
import {
  metaTagName,
  metaTagEmtpyValue,
  findDefaultOrgMetaTag
} from '../../../services/default-org';

module('Unit | Service | default-org', function(hooks) {
  setupTest(hooks);

  let service;
  let document;
  let metaTagElement;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:default-org');
    document = getOwner(service).lookup('service:-document');
  });

  hooks.afterEach(function () {
    if (metaTagElement) metaTagElement.remove();
  });

  hooks.afterEach(function () {
    service = this.owner.lookup('service:default-org');
    document = getOwner(service).lookup('service:-document');
  });

  test('defaultOrgID is null if no default-org-id meta tag exists', function(assert) {
    assert.expect(2);
    const defaultOrgMetaTag = findDefaultOrgMetaTag(document);
    assert.notOk(defaultOrgMetaTag);
    assert.notOk(service.defaultOrgID);
  });

  test('defaultOrgID is undefined if default-org-id meta tag value is uninterpolated', function(assert) {
    assert.expect(2);
    metaTagElement = document.createElement('meta');
    metaTagElement.setAttribute('name', metaTagName);
    metaTagElement.setAttribute('value', metaTagEmtpyValue);
    document.getElementsByTagName('head')[0].append(metaTagElement);
    const defaultOrgMetaTag = findDefaultOrgMetaTag(document);
    assert.ok(defaultOrgMetaTag);
    assert.notOk(service.defaultOrgID);
  });

  test('defaultOrgID is the value of default-org-id meta tag value, if set', function(assert) {
    assert.expect(2);
    metaTagElement = document.createElement('meta');
    metaTagElement.setAttribute('name', metaTagName);
    metaTagElement.setAttribute('value', 'my_org_123');
    document.getElementsByTagName('head')[0].append(metaTagElement);
    const defaultOrgMetaTag = findDefaultOrgMetaTag(document);
    assert.ok(defaultOrgMetaTag);
    assert.equal(service.defaultOrgID, 'my_org_123');
  });

});
