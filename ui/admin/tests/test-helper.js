import Application from 'admin/app';
import config from 'admin/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
//import { start } from 'ember-qunit';
import start from 'ember-exam/test-support/start';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
