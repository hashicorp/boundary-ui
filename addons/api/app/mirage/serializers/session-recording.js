/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import ConnectionRecordingSerializer from './connection-recording';
import ScopeSerializer from './scope';

export default ApplicationSerializer.extend({
  modelName: 'session-recording',
  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    const { connectionRecordings, scopes } = this.schema;

    // Manually map our models to the actual embedded json representation
    if (model.connectionRecordingIds) {
      json.connection_recordings = model.connectionRecordingIds.map((id) => {
        const connection = connectionRecordings.find(id);
        return ConnectionRecordingSerializer.prototype._hashForModel.apply(
          this,
          [connection],
        );
      });
    }
    const userScopeId = model.create_time_values?.user?.scopeId;
    if (userScopeId) {
      const scope = scopes.find(userScopeId);
      json.create_time_values.user.scope =
        ScopeSerializer.prototype._hashForModel.apply(this, [scope]);
    }
    const targetScopeId = model.create_time_values?.target?.scopeId;
    if (targetScopeId) {
      const scope = scopes.find(targetScopeId);
      json.create_time_values.target.scope =
        ScopeSerializer.prototype._hashForModel.apply(this, [scope]);
    }
    delete json.create_time_values?.target?.storage_bucket_id;

    json.session_id = model.sessionId;
    return json;
  },
});
