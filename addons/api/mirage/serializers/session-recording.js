/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import ConnectionRecordingSerializer from './connection-recording';
import ScopeSerializer from './scope';

export default ApplicationSerializer.extend({
  modelName: 'session-recording',
  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments
    );
    const { connectionRecordings, scopes } = this.schema;

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
    if (model.user?.scopeId) {
      const scope = scopes.find(model.user.scopeId);
      json.user.scope = ScopeSerializer.prototype._hashForModel.apply(this, [
        scope,
      ]);
    }
    if (model.target?.scopeId) {
      const scope = scopes.find(model.target.scopeId);
      json.target.scope = ScopeSerializer.prototype._hashForModel.apply(this, [
        scope,
      ]);
    }

    json.session_id = model.sessionId;
    return json;
  },
});
