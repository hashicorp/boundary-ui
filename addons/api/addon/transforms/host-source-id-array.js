import Transform from '@ember-data/serializer/transform';

export default class HostSourceIdArrayTransform extends Transform {
  deserialize(serialized) {
    const stringValues = serialized || [];
    return stringValues.map(({ id: host_source_id, ...obj }) => ({
      host_source_id,
      ...obj,
    }));
  }

  serialize(deserialized) {
    const strings = deserialized || [];
    return strings.map(({ host_source_id: id, ...obj }) => ({ id, ...obj }));
  }
}
