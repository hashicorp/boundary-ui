import EventEmitter from 'node:events';

/**
 * A class that creates a minimum implementation of functions within the `child_process` module.
 * The goal is to be able to provide the interface needed for testing and to track calls and
 * other references created as part of the mocking process
 */
export class MockChildProcess {
  spawnCalls = [];
  spawnSyncCalls = [];

  mockChildProcess = class MockChildProcess extends EventEmitter {
    killed = false;
    stdout = new EventEmitter();
    stderr = new EventEmitter();
    removeAllListeners() {}
    kill = () => {
      this.killed = true;
    };
  };

  spawn = (...args) => {
    // mock process
    const mockProcess = new this.mockChildProcess();
    this.spawnCalls.push({ call: args, process: mockProcess });
    return mockProcess;
  };

  spawnSync = (...args) => {
    const mockProcess = new this.mockChildProcess();
    this.spawnSyncCalls.push({ call: args, process: mockProcess });

    // spawnSync does not return until the process is killed
    mockProcess.kill();
    return mockProcess;
  };
}
