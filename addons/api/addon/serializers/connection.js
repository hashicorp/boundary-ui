import ApplicationSerializer from './application';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class ConnectionSerializer extends ApplicationSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    channels: { embedded: 'always' },
  };
}
