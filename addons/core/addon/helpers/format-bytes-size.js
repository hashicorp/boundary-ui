/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { filesize } from 'filesize';

/**
 * Takes a int expressing file size in bytes and returns a conversion
 * into a human-readable string.
 * "e.g. {{format-bytes-size 164730000}} // 164,73 MB"
 */
export default helper(function formatBytesSize([sizeInBytes]) {
  const numberOfBytes = Number(sizeInBytes);
  return filesize(numberOfBytes);
});
