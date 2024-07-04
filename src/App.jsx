import { useEffect, useState } from "react";
import { Route,Switch,Link } from "wouter";
import { readDir } from "@tauri-apps/api/fs"
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog"

//import p from "./Player.jsx"

import "./App.css"
//import { useLocation } from "wouter";
//import album from "./assets/album.svg"

const NOTHING = null;
let s = true;
//let metadata = {};
//var a;
const isMusic = (name) => {
  return ["mp3", "m4a", "flac", "wav", "ogg"].includes(name.split(".")[1])
}
//const PATH = "C:\\Users\\Admin\\Music";//暂时写死
async function loadMusic(path){
let a;
try {
  a = await readDir(/*localStorage.getItem("path")*/path);
}
catch (e) {
  //invoke("start_static_server", { path: PATH });
  s = false;
}//}
if (s) {

  //async function getMetadata(path) {
  let metadata = {};
  let i;
  let flag = await invoke("has_changed", { path: /*localStorage.getItem("path")*/path });
  if (!flag) {
    metadata = new Proxy(localStorage, {
      get(t, p) {
        return JSON.parse(t[p])
      }
    })
  } else {
    for (i of a) {
      if (isMusic(i.name)) {
        let d = await invoke("get_metadata", { path: i.path });
        metadata[i.name] = d;
        //localStorage[i.name]=JSON.stringify(d);
      }
    }
  }
  return [metadata,a];
}
}

function App() {
  const [nowPlay, setNowPlay] = useState("");
  const [path, setPath] = useState(localStorage.getItem("path") ?? NOTHING)
  const [metadata, setMetadata] = useState(null);
  const [list,setList]=useState(null);
  //const [ready,setReady] = useState(false);
  useEffect(() => {
    if(path){loadMusic(path).then((m)=>{
      setMetadata(m[0]);setList(m[1])
    })}
  },[metadata])
  //let player = useRef(null);
  return (
    <div className="container">
      <div className="column">
        <Link className="icon albums" href="/albums">albums</Link>
        <Link className="icon artists" href="/artists">artists</Link>
        <Link className="icon songs" href="/">songs</Link>
        <Link className="icon settings" href="/settings">settings</Link>
      </div>
      <div className="body">
        <div className="header">
          <input className="search" placeholder="Search for something..." />
        </div>
        <div className="content">
          <Switch>
          <Route path="/">
          {path === NOTHING ?
            <div>
              <h1>选择文件夹</h1>
              <button onClick={() => {
                open({
                  directory: true,
                  multiple: false
                }).then((v) => {
                  setPath(v); localStorage.setItem('path', v);
                  //useLocation('/')
                  //location.reload()//It's hack, but it works
                  loadMusic(v).then((m) => {
                    setMetadata(m[0]); setList(m[1])
                  })
                })
              }}>选择</button>
            </div> :(metadata?
            /*显示歌曲列表*/
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", paddingRight: "0.7rem" }}>#</th>
                  <th>name</th>
                  <th>artist</th>
                  <th>album</th>

                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => {
                  if (isMusic(item.name)) {
                    return <tr key={i}>
                      <td style={{ width: new CSSUnitValue(50, "px"), textAlign: "center" }}>{i}</td>
                      <td onClick={() => {
                        setNowPlay(item.name);
                        //player.current.play();
                        console.log(metadata[item.name])
                      }}>{item.name.split(".")[0]}</td>
                      <td>{metadata[item.name].artist}</td>
                      <td>{metadata[item.name].album}</td>
                    </tr>
                  }
                })
                }
              </tbody>
            </table>:
            <div>加载中...</div>/*,loadMusic(path).then(()=>{setReady(true)})*/)}
          </Route>
          <Route path="/albums">Albums</Route>
          <Route>Oops!</Route>
          </Switch>
        </div>
        <div className="footer">
          <audio src={nowPlay ? convertFileSrc(path + "/" + nowPlay) : ""} controls autoPlay></audio>
        </div>
      </div>
    </div>
  );
}

export default App;
