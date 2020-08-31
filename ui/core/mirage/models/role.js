import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({

  users: hasMany(),
  groups: hasMany()

});
