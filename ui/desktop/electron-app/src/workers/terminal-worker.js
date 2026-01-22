
const pty = require('node-pty');

// maintain a map of active terminals and their pty processes
const terminals = new Map();

// Listen for messages from main process
process.parentPort.on('message', (message) => {
const { action, id, data } = message.data;

  try {
    switch (action) {
      case 'create':
        handleCreate(id, data);
        break;
      case 'write':
        handleWrite(id, data);
        break;
      case 'resize':
        handleResize(id, data);
        break;
      case 'remove':
        handleRemove(id);
        break;
    }
  } catch (error) {
    process.parentPort.postMessage({
      type: 'error',
      id,
      error: error.message
    });
  }
});


function cleanupAllTerminals() {
  for (const [, proc] of terminals) {
    try {
      proc.kill();
    } catch (e) {
      // ignore errors during cleanup
    }
  }
  terminals.clear();
}

process.parentPort.on('close', () => {
  cleanupAllTerminals();
});


function handleCreate(id, { cols, rows, shell }) {
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols,
    rows,
    cwd: process.env.HOME,
    env: process.env,
  });

  terminals.set(id, ptyProcess);

  // Forward PTY data to main process
  ptyProcess.on('data', (data) => {
    process.parentPort.postMessage({
      type: 'data',
      id,
      data
    });
  });

  // Handle PTY exit to main process
  ptyProcess.on('exit', ( exitCode, signal ) => {
    process.parentPort.postMessage({
      type: 'exit',
      id,
      data: { code: exitCode, signal }
    });
    terminals.delete(id);
  });

}

function handleWrite(id, data) {
  const pty = terminals.get(id);
  if (!pty) {
    throw new Error('Terminal not found');
  }
  pty.write(data);
}

function handleResize(id, { cols, rows }) {
  const pty = terminals.get(id);
  if (!pty) {
    throw new Error('Terminal not found');
  }
  pty.resize(cols, rows);
}

function handleRemove(id) {
  const pty = terminals.get(id);
  if (pty) {
    pty.kill();
    terminals.delete(id);
  }
}