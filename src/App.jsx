import { useState } from "react";
import { readDir, BaseDirectory } from "@tauri-apps/api/fs"
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
//import { parseStream } from "music-metadata"
//import {createReadStream}from"node:fs"
import "./App.css"
const PATH = "C:\\Users\\Admin\\Music";//暂时写死
const a = await readDir(PATH);
//invoke("start_static_server", { path: PATH });

const isMusic = (name) => {
  return ["mp3", "m4a", "flac", "wav", "ogg"].includes(name.split(".")[1])
}

function App() {
  const [nowPlay, setNowPlay] = useState("")
  return (
    <div className="container">
      <div className="column"></div>
      <div className="body">
        <div className="header"></div>
        <div className="content">
          {a.map((item) => {
            if (isMusic(item.name)) return <p onClick={() => setNowPlay(item.name)}>{item.name.split(".")[0]}</p>
          })
          }
        </div>
        <div className="footer"><audio src={nowPlay ? convertFileSrc(PATH + "/" + nowPlay) : ""} controls></audio></div>
      </div>
    </div>
  );
}

export default App;
