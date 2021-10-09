import React, { useState } from 'react';
import ReactDom from 'react-dom';
import './app.css';
import Store from 'electron-store';
import { SteamApiService } from '../shared/steam_api.service';
import { ipcRenderer, remote } from 'electron';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

let store = new Store();

const App = () => {
  const [userId, setUserId] = useStickyState("", "user");
  const [userName, setUserName] = useStickyState('', 'userName');
  const [lastInvite, setLastInvite] = useState('');
  const [streamerMode, setStreamerMode] = useState(false);

  ipcRenderer.on('newInvite', (event, args) => {
    setLastInvite(args);
  })

  function getInvite() {
    SteamApiService.TryGetInviteLink(userId)
    .then((res: any) => {
      console.log(res.data)
      var data = res.data.response.players[0];
      
      if (!data.gameid) {
        alert("Player is not playing a game!");
        return;
      }

      if (data.gameid != '1372280') {
        alert("That user is not playing Melty Blood: Type Lumina!");
        return;
      }

      if (!data.lobbysteamid) {
        alert("That user is not in a public lobby!");
        return;
      }
      setLastInvite(`steam://joinlobby/${data.gameid}/${data.lobbysteamid}/${data.steamid}`);
      navigator.clipboard.writeText(lastInvite);
    })
  }

  function getUserId() {
    SteamApiService.TryGetUserId(userName)
    .then((res: any) => {
      if (res.data.response && res.data.response.success == 1) {
        setUserId(res.data.response.steamid);
        alert('Steam account found and UserId set!');
      } else {
        alert('Steam account not found!');
      }
    });
  }

  function onKey(event: any) {
    if (event.key == "Enter") {
      getUserId();
    }
  }

  function closeApp() {
    remote.BrowserWindow.getFocusedWindow()?.close();
  }

  function minimizeApp() {
    remote.BrowserWindow.getFocusedWindow()?.minimize();
  }

  return (
    <div className="parent">
      <div
        className="customFrame">
        {/* <div className="title">
          Bloody Melting
        </div> */}
        <div
          className="close"
          aria-label="Close" tabindex="-1" role="button"><svg aria-hidden="false" width="12" height="12"
            viewBox="0 0 12 12" onClick={closeApp}>
            <polygon fill="currentColor" fill-rule="evenodd"
              points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1">
            </polygon>
          </svg></div>
        <div
          className="minimize"
          aria-label="Minimize" tabindex="-1" role="button"><svg aria-hidden="false" width="12" height="12"
            viewBox="0 0 12 12" onClick={minimizeApp}>
            <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
          </svg></div>
      </div>

      <h1>
        Bloody Melting
      </h1>
      
      <div className="userName">
        <div className="userId user-name-tooltip">
          <input type="text" title="" placeholder="Your Steam login username" required  value={userName} onKeyUp={onKey} onChange={e => setUserName(e.target.value)}/>
        </div>

        <div className="user-id">
          <button disabled={!userName} onClick={getUserId} >Get UserId</button>
        </div>
      </div>

      <span className={'steamUserId'}>
        {userId && 'Your UserId: '}
        {userId && <span className={(streamerMode ? 'blur' : '')}>{userId}</span>}
      </span>

      <div className="generate">
        <button disabled={!userId} onClick={getInvite} >Get Invite Link</button>
      </div>

      <div className="inviteLink" disabled={!lastInvite}>
        <input type="text" value={lastInvite ? lastInvite : 'No invite link generated yet.'} disabled/>
        <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="copy" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z" ></path></svg>
      </div>

      <a className="removeData remove-data-tooltip">
        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
      </a>
      
      <label htmlFor="">Streamer Mode</label>
      <input type="checkbox" defaultChecked={streamerMode} onChange={e => setStreamerMode(e.target.checked)}/>
    </div>
  )
}

ReactDom.render(<App />, mainElement);

function useStickyState(defaultValue: any, key: string) {
  const [value, setValue] = React.useState(() => {
    const stickyValue = store.get(key);
    return stickyValue !== null && stickyValue != undefined
      ? JSON.parse(stickyValue as string)
      : defaultValue;
  });
  React.useEffect(() => {
    store.set(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}