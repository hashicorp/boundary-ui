const { shell, dialog } = require('electron');
const appUpdater = require('../helpers/app-updater.js');
const { isMac, isWindows } = require('../helpers/platform.js');
const config = require('../../config/config.js');
const { version } = require('../cli/index.js');

const generateMenuTemplate = () => {
  const aboutDialog = () => {
    const appVersion = `Version:  ${config.releaseVersion}`;
    const appCommit = `Commit: ${config.releaseCommit}`;
    const cliVersion = version().formatted;
    const copyright = config.copyright;

    const dialogOpts = {
      type: 'none',
      message: config.productName,
      detail: `${appVersion}\n${appCommit}\n\n${cliVersion}\n\n${copyright}`,
    };
    dialog.showMessageBox(dialogOpts);
  };

  return [
    // { role: 'appMenu' }
    ...(isMac()
      ? [
          {
            label: 'Boundary',
            submenu: [
              // { role: 'about' },
              {
                label: `About ${config.productName}`,
                click: aboutDialog,
              },
              {
                id: 'update',
                label: 'Check for Updates',
                click: async () => appUpdater.run(),
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [{ role: 'close' }],
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac()
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    },
    // { role: 'viewMenu' }
    {
      id: 'view',
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn', accelerator: 'CommandOrControl+=' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac()
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://www.boundaryproject.io'),
        },
        ...(isWindows()
          ? [
              // { role: 'about' },
              {
                label: `About ${config.productName}`,
                click: aboutDialog,
              },
            ]
          : []),
      ],
    },
  ];
};

module.exports = {
  generateMenuTemplate: generateMenuTemplate,
};
