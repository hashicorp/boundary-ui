/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src', 'terminal-view');
const outDir = path.join(projectRoot, 'terminal-view-dist');

const isProduction = process.env.NODE_ENV === 'production';

const buildTerminalView = () => {
  const entryPoint = path.join(srcDir, 'terminal.js');
  const inputHTMLPath = path.join(srcDir, 'terminal.html');
  const outputHTMLPath = path.join(outDir, 'terminal.html');
  const outputJSPath = path.join(outDir, 'terminal.js');

  fs.promises.mkdir(outDir, { recursive: true });

  esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: outputJSPath,
    platform: 'browser',
    format: 'esm',
    minify: isProduction,
    sourcemap: !isProduction,
    loader: {
      '.css': 'css',
    },
  });

  fs.promises.copyFile(inputHTMLPath, outputHTMLPath);
};

module.exports = {
  setup: () => {
    buildTerminalView();
  },
};
