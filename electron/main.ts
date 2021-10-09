import { app, BrowserWindow, clipboard, dialog, Menu, nativeImage, Notification, Tray } from "electron";
import * as path from "path";
import * as url from "url";
import Store from 'electron-store';
import { SteamApiService } from '../shared/steam_api.service';

let store = new Store();
let mainWindow: Electron.BrowserWindow | null;
let tray: Tray | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    darkTheme: true,
    resizable: false,
    frame: false,
    webPreferences: {
      // devTools: false,
      webSecurity: false,
      nodeIntegration: true
    },
    title: 'Bloody Melting',
  });

  mainWindow.setTitle("Bloody Melting");
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:4000`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    tray = null;
  });
}

function createTray() {
  let imgPath = process.env.NODE_ENV === "development" ? path.join(__dirname, '..', 'build', 'icon.ico') : path.join(process.resourcesPath, "icon.ico");
  // let icon = nativeImage.createFromPath()
  tray = new Tray(imgPath);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Get Invite Link', type: 'normal'}
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    let userId = store.get('user');
    if (userId == undefined) {
      dialog.showErrorBox('No steam user set!', 'Please open the main window and set the user information, to do so type your steam login username and click "Get UserId". You can then get the invite links.')
      return;
    }

    SteamApiService.TryGetInviteLink(userId as string)
    .then((res: any) => {
      console.log(res.data)
      var data = res.data.response.players[0];
      
      if (!data.gameid) {
        dialog.showErrorBox('No game detected running!', 'The player is no playing any game.');
        return;
      }

      if (data.gameid != '1372280') {
        dialog.showErrorBox('Wrong game!', 'That user is not playing Melty Blood: Type Lumina!');
        return;
      }

      if (!data.lobbysteamid) {
        dialog.showErrorBox('No lobby found!', 'That user is not in a public lobby currently.')
        return;
      }

      new Notification({title: 'Invite link generated!', body: ''}).show();
      let invite = (`steam://joinlobby/${data.gameid}/${data.lobbysteamid}/${data.steamid}`);
      clipboard.writeText(invite);
      mainWindow?.webContents.send('newInvite', invite);
    });
  });
}

app.on("ready", () => {
  createWindow();
  createTray();
});
app.allowRendererProcessReuse = true;
