const { app, shell, dialog } = require('electron');
const appUpdater = require('../helpers/app-updater.js');
const electronConfig = require('../../config/forge.config.js');
const { version } = require('../cli/index.js');

const generateMenuTemplate = () => {
  return [
    // { role: 'appMenu' }
    {
      label: 'Boundary',
      submenu: [
        // { role: 'about' },
        {
          label: `About ${app.getName()}`,
          click: () => {
            const appVersion = `Version:  ${electronConfig.releaseVersion}`;
            const appCommit = `Commit: ${electronConfig.releaseCommit}`;
            const cliVersion = version().formatted;
            const copyright = electronConfig.packagerConfig.appCopyright;

            const dialogOpts = {
              type: 'none',
              message: app.getName(),
              detail: `${appVersion}\n${appCommit}\n\n${cliVersion}\n\n${copyright}`,
            };
            dialog.showMessageBox(dialogOpts);
          },
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
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
        },
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
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://www.boundaryproject.io'),
        },
      ],
    },
  ];
};

module.exports = {
  generateMenuTemplate: generateMenuTemplate,
};
