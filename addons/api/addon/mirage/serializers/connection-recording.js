/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import ChannelSerializer from './channel-recording';

export default ApplicationSerializer.extend({
  modelName: 'connection-recording',
  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    const { channelRecordings } = this.schema;
    if (model.channelRecordingIds) {
      json.channel_recordings = model.channelRecordingIds.map((id) => {
        const channel = channelRecordings.find(id);
        return ChannelSerializer.prototype._hashForModel.apply(this, [channel]);
      });
    }
    return json;
  },
});
