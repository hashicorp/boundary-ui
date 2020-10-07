import Application from 'core/app';
import config from 'core/config/environment';
import { setApplication } from '@ember/test-helpers';
//import { start } from 'ember-qunit';
import start from 'ember-exam/test-support/start';

setApplication(Application.create(config.APP));

start();
