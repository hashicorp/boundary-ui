import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const pythonScriptPath = path.resolve(
  import.meta.dirname,
  '../pyautogui/launch.py',
);

test.afterEach(async () => {
  execSync(`pkill "Windows App"`);
});

// If you're not using a python virtual environment, you can remove the source line
test.describe('Example PyAutoGUI tests', () => {
  test('Use PyAutoGUI to connect to RDP', async () => {
    const result = execSync(
      `source ~/.virtualenvs/bin/activate && python3 ${pythonScriptPath} $RDP_HOST $RDP_USER $RDP_PASSWORD`,
    );

    expect(result.toString()).toBeFalsy();
  });

  test('Use PyAutoGUI with an expected error trying to connect', async () => {
    const result = execSync(
      `source ~/.virtualenvs/bin/activate && python3 ${pythonScriptPath} $RDP_HOST $RDP_USER "wrong pass"`,
    );

    expect(result.toString()).toEqual('Could not connect to RDP target');
  });
});
