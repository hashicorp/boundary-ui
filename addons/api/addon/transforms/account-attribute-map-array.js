import Transform from '@ember-data/serializer/transform';

export default class AccountAttributeMapArrayTransform extends Transform {
  deserialize(serialized) {
    const accountAttributes = serialized || [];
    return accountAttributes.map((accountAttributeString) => ({
      from: accountAttributeString.split('=')[0],
      to: accountAttributeString.split('=')[1],
    }));
  }

  serialize(deserialized) {
    const accountAttributes = deserialized || [];
    return accountAttributes.map(({ from, to }) => `${from}=${to}`);
  }
}
