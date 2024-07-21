import { useCallback, useEffect, useState, useRef } from "react";

import { readDir } from "@tauri-apps/api/fs"
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog"
import { appWindow, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/api/clipboard';

import { Route, Switch, Link } from "wouter";

import { Lrc } from "react-lrc"
import ct from "colorthief/dist/color-thief.mjs";

import Player from "./Player"

import a from "./assets/album.svg"
import b from "./assets/artist.svg"
import c from "./assets/library_music.svg"
import d from "./assets/settings.svg"
import "./App.css"

const NOTHING = null;
let s = true;



const isMusic = (name) => {
  return ["mp3", "m4a", "flac", "wav", "ogg"].includes(name.split(".").at(-1))
}

async function loadMusic(path) {
  let a;
  let lst = [];
  try {
    a = await readDir(path);
  }
  catch (e) {
    s = false;
  }
  if (s) {
    let metadata = {};
    let i;
    let flag = await invoke("has_changed", { path });
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
          metadata[d.title] = d;
          let t = { ...d, fileName: d.file_name }
          lst.push(new Map(Object.entries(t)))
          console.log(d.cover)
        }
      }
    }
    console.log(lst)
    return [metadata, lst];
  }
}
const asRGBString = (color) => {
  return `rgb(${color[0]},${color[1]},${color[2]})`
}
const lighten = (color, value) => {
  return color.map((p) => {
    return p * value
  })
}
const distanceOfColors = (color1, color2) => {
  let r = color1[0] - color2[0];
  let g = color1[1] - color2[1];
  let b = color1[2] - color2[2];
  return Math.sqrt(r * r + g * g + b * b);
}
const SIZE = new LogicalSize(1100, 680);
await appWindow.setSize(SIZE);
await appWindow.setMinSize(SIZE);
const defaultFileFormat = new Map([["fileName", ""], ["title", ""]])
//alert(a)
function App() {
  const [nowPlay, setNowPlay] = useState(defaultFileFormat);
  const [path, setPath] = useState(localStorage.getItem("path") ?? NOTHING)
  const [metadata, setMetadata] = useState(null);
  const [list, setList] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [lrc, setLrc] = useState(null);
  const [time, setTime] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(null)
  const coverImage = useRef(null);

  const lineRenderer = useCallback(({ active, line: { content } }) => {
    return <div className={"lrc " + (active ? "active" : "")}>{content}</div>
  })

  useEffect(() => {
    if (path && !loaded) {
      loadMusic(path).then((m) => {
        setMetadata(m[0]); setList(m[1]); setLoaded(true)
      })
    }
  })
  useEffect(() => {
    if (path && (nowPlay.get("fileName") !== "")) {
      invoke("get_lyrics", { path: path + "/" + nowPlay.get("fileName") }).then((lyrics) => {
        setLrc(lyrics)
      })
    }
  }, [nowPlay])
  useEffect(() => {
    if ((nowPlay.get("fileName") !== "")) {
      let c = new ct()
      coverImage.current.onload = () => {
        let color = c.getColor(coverImage.current, 10)
        console.log("color: ", color)
        setBackgroundColor(asRGBString(lighten(color, 1)))
        let currentColor = getComputedStyle(document.documentElement).getPropertyValue(
          "--lrc-color"
        )
        console.log("currentColor: ", currentColor)
        const black = [0, 0, 0],
          white = [255, 255, 255];
        const lrc_black = "#111",
          lrc_dark = "#234",
          lrc_white = "#eee",
          lrc_light = "#dcb";
        const now=currentColor===lrc_dark?black:white;
        console.log("distance: ", distanceOfColors(color,now))
        if(distanceOfColors(color,now)<200){
          document.documentElement.style.setProperty("--lrc-color",now[0]?
            lrc_dark:lrc_light
          )
          document.documentElement.style.setProperty("--lrc-active-color", now[0] ?
            lrc_black : lrc_white
          )
        }
      }
    }
  }
    , [nowPlay])

  return (
    <div className="container">
      <div className="column">

        <Link className="icon albums" href="/albums"><img src={a}></img></Link>
        <Link className="icon artists" href="/artists"><img src={b}></img></Link>
        <Link className="icon songs" href="/"><img src={c}></img></Link>
        <Link className="icon settings" href="/settings"><img src={d}></img></Link>
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
                </div> : (metadata ?
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
                        //if (isMusic(item)) {
                        return <tr key={i}>
                          <td style={{ width: new CSSUnitValue(50, "px"), textAlign: "center" }} className="num">{i + 1}</td>
                          <td onClick={() => {
                            setNowPlay(item);
                            //player.current.play();
                            console.log(metadata[item.get("title")])
                          }}>{item.get("title")}</td>
                          <td>{metadata[item.get("title")].artist}</td>
                          <td>{metadata[item.get("title")].album}</td>
                        </tr>
                        //}
                      })
                      }
                    </tbody>
                  </table> :
                  <div>加载中...</div>/*,loadMusic(path).then(()=>{setReady(true)})*/)}
            </Route>
            <Route path="/albums">Albums</Route>
            <Route>Oops!</Route>
          </Switch>
        </div>
        <div className="footer">
          <Player nowPlay={nowPlay} path={path ?? ""} fn={setFullscreen} fn2={setTime} />
        </div>
      </div>
      <div className={fullscreen ? "fullscreen" : "hide"} style={{
        backgroundColor: backgroundColor ?? "#cde"
      }}>
        <button onClick={() => { setFullscreen(false) }}>退出全屏</button>
        <div style={{
          display: "flex",
          height: "100%",
        }}>
          <div style={{
            display: "flex",
            flex: 2,

            alignItems: "center",
            flexDirection: "column",
            paddingTop: "1rem",
            textAlign: "center",
          }}>
            <img src={nowPlay.get("cover") ? convertFileSrc(nowPlay.get("cover")) : ""} style={{
              display: "block",
              width: "min(80%,15rem)",
              borderRadius: "1rem",
            }} crossOrigin="anonymous" ref={coverImage} />
            <div style={{ flex: 1,color:"var(--lrc-color)" }}>
              <p>{nowPlay.get("title")}</p>
              <p>{nowPlay.get("artist")}</p>
            </div>
          </div>{/*TODO:布局*/}
          <div style={{
            flex: 3,
            height: "100%"
          }}>
            {lrc && <Lrc id="lrcs" lrc={lrc}
              lineRenderer={lineRenderer} verticalSpace currentMillisecond={(time * 1000).toFixed()}></Lrc>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
