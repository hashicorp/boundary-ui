import { Model } from 'ember-cli-mirage';

export default Model.extend({
  assignDefaults(defaultAttrs, attrs) {
    for (const [key, value] of Object.entries(defaultAttrs)) {
      if (!Object.prototype.hasOwnProperty.call(attrs, key)) {
        attrs[key] = value;
      }
    }
  },
  save() {
    this.assignDefaults(this.defaultAttrs(), this.attrs);
    return Model.prototype.save.apply(this, arguments);
  },
  defaultAttrs: () => ({
    version: 1,
    authorized_actions: ['no-op', 'read', 'update', 'delete'],
    created_time: new Date(),
  }),
});
