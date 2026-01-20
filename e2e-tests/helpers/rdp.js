/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

export async function isOSForRdpSupported() {
  return process.platform === 'win32' || process.platform === 'darwin';
}

export async function isRdpRunning() {
  try {
    let result;
    if (process.platform === 'win32') {
      result = execSync('tasklist /FI "IMAGENAME eq mstsc.exe" /FO CSV /NH', {
        encoding: 'utf-8',
      });
      return result && result.includes('mstsc.exe');
    } else if (process.platform === 'darwin') {
      result = execSync('pgrep -x "Windows App"', {
        encoding: 'utf-8',
      });
      return result && result.trim().length > 0;
    }
    return false;
  } catch {
    return false;
  }
}

export async function isRdpClientInstalled() {
  try {
    if (process.platform === 'win32') {
      execSync('where mstsc', { stdio: 'ignore' });
      return true;
    } else if (process.platform === 'darwin') {
      const result = execSync(
        'mdfind "kMDItemCFBundleIdentifier == \'com.microsoft.rdc.macos\'"',
        { encoding: 'utf-8' },
      );
      return result && result.trim().length > 0;
    }
    return false;
  } catch {
    return false;
  }
}

export function killRdpProcesses() {
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM mstsc.exe', { stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      execSync('pkill -x "Windows App"', { stdio: 'ignore' });
    }
  } catch {
    // no op
  }
}
