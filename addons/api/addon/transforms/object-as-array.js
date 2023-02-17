import Transform from '@ember-data/serializer/transform';

export default class ObjectAsArrayTransform extends Transform {
  deserialize(serialized) {
    const obj = serialized || {};
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }
  serialize(deserialized) {
    const array = deserialized || [];

    if (!array.length) {
      return null;
    }

    return array.reduce((result, currentValue) => {
      const { key, value } = currentValue;
      result[key] = value;

      return result;
    }, {});
  }
}
