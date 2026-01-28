import it, { afterEach, before, beforeEach, describe, mock } from 'node:test';
import assert from 'node:assert';
import EventEmitter from 'node:events';
import {
  spawn as originalSpawn,
  spawnSync as originalSpawnSync,
} from 'child_process';

const testData = Object.freeze({
  addr: 'http://mock-cluster-url:9200',
  targetId: 't_testtarget',
  token: 'token',
  hostId: 'h_testhost',
  sessionMaxSeconds: 3600,
  sessionId: 's_sessionid',
});

class MockSpawn {
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

describe('Session', () => {
  let Session;
  let mockSpawn;

  // module mocks
  before(() => {
    mock.module('electron-is-dev', {
      defaultExport: false,
    });

    mock.module('child_process', {
      cache: false,
      namedExports: {
        spawn: (...args) =>
          // if mockSpawn is set up, use that, otherwise use original
          mockSpawn
            ? mockSpawn.spawn.call(null, ...args)
            : originalSpawn.call(null, ...args),

        spawnSync: (...args) =>
          // if mockSpawn is set up, use that, otherwise use original
          mockSpawn
            ? mockSpawn.spawnSync.call(null, ...args)
            : originalSpawnSync.call(null, ...args),
      },
    });

    // the global `process` in electron has an additional `resourcesPath` property
    // eslint-disable-next-line no-undef
    process.resourcesPath = 'mock/resources/path';
  });

  // module imports
  before(async () => {
    Session = (await import('../../src/models/session.js')).default;
  });

  beforeEach(async () => {
    mockSpawn = new MockSpawn();
  });

  afterEach(() => {
    mock.reset();
    mockSpawn = undefined;
  });

  it('can start a session', async () => {
    const session = new Session(
      testData.addr,
      testData.targetId,
      testData.token,
      testData.hostId,
      testData.sessionMaxSeconds,
    );

    assert.strictEqual(session.id, undefined, 'initial id is unset');
    assert.strictEqual(
      session.proxyDetails,
      undefined,
      'initial proxyDetails is unset',
    );

    const startPromise = session.start();

    const connectSpawn = mockSpawn.spawnCalls.find(
      ({ call: [process, args] }) =>
        process === 'boundary' && args[0] === 'connect',
    );

    assert.partialDeepStrictEqual(connectSpawn.call, [
      'boundary',
      [
        'connect',
        `-target-id=${testData.targetId}`,
        '-token=env://BOUNDARY_TOKEN',
        `-addr=${testData.addr}`,
        '-format=json',

        // includes host id
        `-host-id=${testData.hostId}`,
      ],
    ]);

    const proxyDetails = {
      session_id: testData.sessionId,
      address: '127.0.0.1',
      port: '54321',
    };

    connectSpawn.process.stdout.emit('data', JSON.stringify(proxyDetails));

    // with the `data` emitted on stdout this promise should now resolve
    await startPromise;

    assert.strictEqual(session.id, session.id);
    assert.deepEqual(session.proxyDetails, proxyDetails);
    assert.strictEqual(session.isRunning, true);
  });

  it('can start a session, omitting host-id when not specified', async () => {
    const session = new Session(
      testData.addr,
      testData.targetId,
      testData.token,
      undefined, // host-id is excluded
      testData.sessionMaxSeconds,
    );

    session.start();

    const connectSpawn = mockSpawn.spawnCalls.find(
      ({ call: [process, args] }) =>
        process === 'boundary' && args[0] === 'connect',
    );

    assert.deepStrictEqual(connectSpawn.call[1], [
      'connect',
      `-target-id=${testData.targetId}`,
      '-token=env://BOUNDARY_TOKEN',
      `-addr=${testData.addr}`,
      '-format=json',
      // host-id is excluded
    ]);
  });

  it('can stop a session', async () => {
    const session = new Session(
      testData.addr,
      testData.targetId,
      testData.token,
      undefined, // host-id is excluded
      testData.sessionMaxSeconds,
    );

    const startPromise = session.start();

    const proxyDetails = {
      session_id: testData.sessionId,
      address: '127.0.0.1',
      port: '54321',
    };

    const connectSpawn = mockSpawn.spawnCalls.find(
      ({ call: [process, args] }) =>
        process === 'boundary' && args[0] === 'connect',
    );

    connectSpawn.process.stdout.emit('data', JSON.stringify(proxyDetails));

    // with the `data` emitted on stdout this promise should now resolve
    await startPromise;

    assert.strictEqual(session.isRunning, true);
    const stopPromise = session.stop();

    // simulate sending a close event on the process
    connectSpawn.process.emit('close');

    // with the process closed the stopPromise should be resolved
    await stopPromise;

    assert.strictEqual(connectSpawn.process.killed, true);
    assert.strictEqual(session.isRunning, false);

    const cancelSpawn = mockSpawn.spawnSyncCalls.find(
      ({ call: [process, [arg0, arg1]] }) =>
        process === 'boundary' && arg0 === 'sessions' && arg1 == 'cancel',
    );

    assert.deepEqual(cancelSpawn.call[1], [
      'sessions',
      'cancel',
      `-id=${testData.sessionId}`,
      `-addr=${testData.addr}`,
      '-token=env://BOUNDARY_TOKEN',
    ]);
  });
});
