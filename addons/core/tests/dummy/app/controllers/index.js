/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';

export default class IndexController extends Controller {
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
