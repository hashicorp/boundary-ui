/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import ChannelSerializer from './channel';

export default ApplicationSerializer.extend({
  modelName: 'connection',
  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    const { channels } = this.schema;
    if (model.channelIds) {
      json.channels = model.channelIds.map((id) => {
        const channel = channels.find(id);
        return ChannelSerializer.prototype._hashForModel.apply(this, [channel]);
      });
    }
    return json;
  },
});
