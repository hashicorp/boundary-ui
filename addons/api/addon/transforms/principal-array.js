import Transform from '@ember-data/serializer/transform';

export default class PrincipalArrayTransform extends Transform {
  deserialize(serialized) {
    const stringValues = serialized || [];
    return stringValues.map(({ id: principal_id, scope_id, type }) => ({
      principal_id,
      scope_id,
      type,
    }));
  }

  serialize(deserialized) {
    const strings = deserialized || [];
    return strings.map(({ principal_id: id, scope_id, type }) => ({
      id,
      scope_id,
      type,
    }));
  }
}
