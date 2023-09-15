/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'desktop/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | target/host-modal', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  let store;
  let target;
  let hostA;
  let hostB;
  let connect;
  let toggle;

  hooks.beforeEach(function () {
    connect = () => {
      this.set('called', true);
    };
    toggle = () => {
      this.set('called', true);
    };
    store = this.owner.lookup('service:store');
    target = store.createRecord('target', {
      name: 'User',
    });
    hostA = store.createRecord('host', {
      name: 'Host A',
      compositeType: 'static',
      address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
    });
    hostB = store.createRecord('host', {
      name: 'Host B',
      compositeType: 'static',
      description: 'Description of host B',
      address: '188e:68a9:b342:c05c:2595:499c:759f:2f46',
    });
  });

  test('it renders', async function (assert) {
    assert.expect(1);
    this.set('connect', connect);
    this.set('toggle', toggle);
    this.set('hosts', [hostA, hostB]);
    this.set('target', target);

    await render(hbs`<Target::HostModal
      @showModal={{true}}
      @toggle={{this.toggle}}
      @connect={{this.connect}}
      @hosts={{this.hosts}}
      @target={{this.target}} />`);

    assert.dom('.hds-modal__tagline').hasText(target.displayName);
  });

  test('it closes model when dismissed', async function (assert) {
    assert.expect(2);
    const toggleModal = () => {
      this.set('showModal', false);
    };
    this.set('connect', connect);
    this.set('toggle', toggleModal);
    this.set('showModal', true);
    this.set('hosts', [hostA, hostB]);
    this.set('target', target);

    await render(hbs`<Target::HostModal
      @showModal={{this.showModal}}
      @toggle={{this.toggle}}
      @connect={{this.connect}}
      @hosts={{this.hosts}}
      @target={{this.target}} />`);

    assert.dom('.hds-modal__tagline').hasText(target.displayName);

    await click('.hds-dismiss-button');

    assert.dom('.hds-modal__tagline').doesNotExist();
  });

  test('it calls connect when Quick Connect button clicked', async function (assert) {
    assert.expect(1);
    this.set('connect', connect);
    this.set('toggle', toggle);
    this.set('hosts', [hostA, hostB]);
    this.set('target', target);

    await render(hbs`<Target::HostModal
      @showModal={{true}}
      @toggle={{this.toggle}}
      @connect={{this.connect}}
      @hosts={{this.hosts}}
      @target={{this.target}} />`);

    await click('[data-test-host-quick-connect]');

    assert.true(this.called);
  });

  test('it calls connect when host item is clicked', async function (assert) {
    assert.expect(1);
    this.set('connect', connect);
    this.set('toggle', toggle);
    this.set('hosts', [hostA, hostB]);
    this.set('target', target);

    await render(hbs`<Target::HostModal
      @showModal={{true}}
      @toggle={{this.toggle}}
      @connect={{this.connect}}
      @hosts={{this.hosts}}
      @target={{this.target}} />`);

    await click('[data-test-host-connect]');

    assert.true(this.called);
  });
});
