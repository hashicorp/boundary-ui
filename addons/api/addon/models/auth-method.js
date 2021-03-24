import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { equal } from '@ember/object/computed';

export default class AuthMethodModel extends GeneratedAuthMethodModel {
  @equal('primary', true) isPrimary;
}
