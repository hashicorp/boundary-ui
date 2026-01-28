import { createRequire } from 'node:module';
import it, { afterEach, beforeEach, describe, mock } from 'node:test';
import assert from 'node:assert';
import { MockChildProcess } from '../helpers/mock-child-process.js';
const require = createRequire(import.meta.url);

const testData = Object.freeze({
  addr: 'http://mock-cluster-url:9200',
  targetId: 't_testtarget',
  token: 'token',
  hostId: 'h_testhost',
  sessionMaxSeconds: 3600,
  sessionId: 's_sessionid',
});

describe('Session', () => {
  let Session;
  let mockChildProcess;

  // module mocks
  beforeEach(() => {
    mock.module('electron-is-dev', {
      defaultExport: false,
    });

    mockChildProcess = new MockChildProcess();
    mock.module('child_process', {
      namedExports: {
        spawn: mockChildProcess.spawn,
        spawnSync: mockChildProcess.spawnSync,
      },
    });

    // the global `process` in electron has an additional `resourcesPath` property
    // eslint-disable-next-line no-undef
    process.resourcesPath = 'mock/resources/path';
  });

  // module imports
  beforeEach(() => {
    Session = require('../../src/models/session.js');
  });

  afterEach(() => {
    mock.reset();
    Object.keys(require.cache).forEach(function (key) {
      delete require.cache[key];
    });
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

    const connectSpawn = mockChildProcess.spawnCalls.find(
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

    const connectSpawn = mockChildProcess.spawnCalls.find(
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

    const connectSpawn = mockChildProcess.spawnCalls.find(
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

    const cancelSpawn = mockChildProcess.spawnSyncCalls.find(
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
