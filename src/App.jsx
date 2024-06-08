import { useState } from "react";
import { readDir, BaseDirectory } from "@tauri-apps/api/fs"
import { invoke } from "@tauri-apps/api";
//import { parseStream } from "music-metadata"
//import {createReadStream}from"node:fs"
import "./App.css"
const PATH = "C:\\Users\\Admin\\Music";//暂时写死
const a = await readDir(PATH);
invoke("start_static_server", { path: PATH });
function App() {
  const [nowPlay,setNowPlay]=useState("")
  return (
    <div className="container">
      <div className="column"></div>
      <div className="body">
        <div className="header"></div>
        <div className="content">
          {a.map((item) => {
            return <p onClick={() => setNowPlay(item.name)}>{item.name}</p>
          })
          }
        </div>
        <div className="footer"><audio src={nowPlay?"http://127.0.0.1:3000/music/"+nowPlay:""} controls></audio></div>
      </div>
    </div>
  );
}

export default App;
