import ApplicationAdapter from './application';
import { serializeIntoHash } from '@ember-data/adapter/-private';

export default class HostCatalogAdapter extends ApplicationAdapter {
  /**
    Called by the store when a newly created record is
    saved via the `save` method on a model record instance.

    The `createRecord` method serializes the record and makes an Ajax (HTTP POST) request
    to a URL computed by `buildURL`.

    See `serialize` for information on how to customize the serialized form
    of a record.

    @method createRecord
    @param {Store} store
    @param {Model} type
    @param {Snapshot} snapshot
    @return {Promise} promise
  */
  createRecord(store, type, snapshot) {
    let url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
    const pluginName = snapshot.attr('plugin')?.name;
    if (pluginName) url = `${url}?plugin_name=${pluginName}`;
    const data = serializeIntoHash(store, type, snapshot);
    return this.ajax(url, 'POST', { data });
  }
}
