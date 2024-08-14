/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');

/**
 * Deletes the specified alias
 * @param {string} aliasValue Value of the alias to be deleted
 */
export async function deleteAliasCli(aliasValue) {
  try {
    const aliases = JSON.parse(execSync('boundary aliases list -format json'));
    const alias = aliases.items.filter((obj) => obj.value == aliasValue)[0];

    execSync('boundary aliases delete -id=' + alias.id);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}
