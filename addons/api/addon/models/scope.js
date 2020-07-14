import GeneratedScopeModel from '../generated/models/scope';
import { belongsTo, hasMany } from '@ember-data/model';

export default class ScopeModel extends GeneratedScopeModel {

  // =relationships

  /**
   * The parent scope, if any.
   * @type {ScopeModel}
   */
  @belongsTo('scope', {inverse: 'childrenScopes'}) parentScope;

  /**
   * The inverse of parent scope, children.
   * @type {ScopeModelp[]}
   */
  @hasMany('scope', {inverse: 'parentScope'}) childrenScopes;

}
