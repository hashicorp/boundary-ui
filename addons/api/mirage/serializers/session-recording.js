/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import ConnectionRecordingSerializer from './connection-recording';
import UserSerializer from './user';
import TargetSerializer from './target';

export default ApplicationSerializer.extend({
  modelName: 'session-recording',
  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    const { connectionRecordings, users, targets } = this.schema;

    // Manually map our models to the actual embedded json representation
    if (model.connectionRecordingIds) {
      json.connection_recordings = model.connectionRecordingIds.map((id) => {
        const connection = connectionRecordings.find(id);
        return ConnectionRecordingSerializer.prototype._hashForModel.apply(
          this,
          [connection]
        );
      });
    }
    if (model.userId) {
      const user = users.find(model.userId);
      json.user = UserSerializer.prototype._hashForModel.apply(this, [user]);
    }
    if (model.targetId) {
      const target = targets.find(model.targetId);
      json.target = TargetSerializer.prototype._hashForModel.apply(this, [
        target,
      ]);
    }

    json.session_id = model.sessionId;
    return json;
  },
});
