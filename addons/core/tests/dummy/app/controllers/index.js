/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class IndexController extends Controller {
  // =services

  @service clockTick;

  // =properties

  now = new Date();

  list = [
    { key: 1, value: 'boundary' },
    { key: 2, value: 'consul' },
    { key: 3, value: 'vault' },
    { key: 4, value: 'hcp' },
    { key: 5, value: 'packer' },
  ];

  listTwo = [
    { key: 1, value: 'boundary' },
    { key: 2, value: 'consul' },
  ];

  listThree = [{ key: 1, value: 'boundary' }];

  listFour = [
    { key: 1, value: 'boundary' },
    { key: 2, value: 'consul' },
    { key: 3, value: 'vault' },
    { key: 4, value: 'hcp' },
    { key: 5, value: 'packer' },
    { key: 6, value: 'new' },
    { key: 7, value: 'newA' },
  ];
}
