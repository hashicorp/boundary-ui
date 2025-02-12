#!/usr/bin/env node
/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */


/* eslint-env node */

const { join } = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const colorize = (color) => (str) => `${color}${str}`;
const yellow = colorize('\x1b[33m');
const green = colorize('\x1b[32m');
const blue = colorize('\x1b[34m');

const apiClientsDirectory = join(__dirname, '..', 'api-client');

function echoInfo(message) {
  console.log(blue(`===> ${message}`));
}

const genClient = async function (swaggerUrl) {
  echoInfo(`Removing existing folder: api-clients`);
  await exec(`rm -rf ${apiClientsDirectory}`);

  echoInfo(`Generating TypeScript client from swagger doc in ${swaggerUrl}`);


  let generateCommand = `
    ../node_modules/.bin/openapi-generator-cli generate -g \\
    typescript-fetch \\
    -o ${apiClientsDirectory} \\
    -i ${swaggerUrl}
  `;

  console.log(yellow(`Running generate command: \n ${generateCommand}`));
  await exec(generateCommand);
};

const main = async function () {
  let swaggerUrl = `https://raw.githubusercontent.com/hashicorp/boundary/refs/heads/main/internal/gen/controller.swagger.json`;
  await genClient(swaggerUrl);
  console.log(green('\nAll done! :D'));
};

main();