/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

// Importing 'Store' from 'ember-data/store' to get default configuration automatically.
import Store from 'ember-data/store';
import { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import SqliteHandler from 'api/handlers/sqlite-handler';
import { service } from '@ember/service';
import { TrackedObject } from 'tracked-built-ins';
import { dropTask, timeout } from 'ember-concurrency';

export default class extends Store {
  @service flashMessages;
  @service intl;
  @service router;

  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    const sqliteHandler = new SqliteHandler(this);

    this.requestManager.use([sqliteHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }

  /**
   * Overrides store.query to detect a rate-limit warning and surface a
   * flash notification to the user. The partial result is still returned
   * normally so the UI renders whatever data was fetched.
   * @override
   */
  async query(type, query, options) {
    const result = await super.query(type, query, options);

    if (result?.meta?.rateLimitWarning) {
      const { retryAfter } = result.meta.rateLimitWarning;
      this._countdownTask.perform(retryAfter);
    }

    return result;
  }

  /**
   * Creates a sticky flash notification and counts down each second until the
   * rate-limit window expires and drops any new ones that come in.
   */
  _countdownTask = dropTask(async (retryAfter) => {
    // Use a TrackedObject for `button` so that mutations to `button.disabled`
    // are tracked and the template re-renders when the countdown finishes.
    const button = new TrackedObject({
      label: this.intl.t('actions.retry'),
      disabled: true,
      action: (flash) => {
        flash.destroyMessage();
        this.router.refresh();
      },
    });

    const flash = this.flashMessages
      .warning(
        this.intl.t('errors.429.description-partial', { seconds: retryAfter }),
        {
          color: 'warning',
          title: this.intl.t('errors.429.title'),
          sticky: true,
          dismiss: (flash) => {
            this._countdownTask.cancelAll();
            flash.destroyMessage();
          },
          button,
        },
      )
      .getFlashObject();

    let remaining = retryAfter;

    while (remaining > 0) {
      await timeout(1000);
      remaining -= 1;

      flash.message =
        remaining > 0
          ? this.intl.t('errors.429.description-partial', {
              seconds: remaining,
            })
          : this.intl.t('errors.429.description-ready');
    }

    button.disabled = false;
  });
}
