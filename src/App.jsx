import { useCallback, useEffect, useState, useRef } from "react";

import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog"
import { appWindow, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';

import { Route, Switch, Link } from "wouter";

import { Lrc } from "react-lrc"
import ct from "colorthief/dist/color-thief.mjs";

import Player from "./Player"
import Setting from "./views/Setting";

import loadMusic from "./core/load";
import {asRGBString, lighten, distanceOfColors} from "./utils/color"

import a from "./assets/album.svg"
import b from "./assets/artist.svg"
import c from "./assets/library_music.svg"
import d from "./assets/settings.svg"
import "./App.css"

const NOTHING = null;

const SIZE = new LogicalSize(1100, 680);
await appWindow.setSize(SIZE);
await appWindow.setMinSize(SIZE);
const defaultFileFormat = new Map([["file_name", ""], ["title", ""]])
function reviver(key, value) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}
//alert(a)
function App() {
  const [nowPlay, setNowPlay] = useState(JSON.parse(localStorage.getItem("play"),reviver)??defaultFileFormat);
  const [path, setPath] = useState(localStorage.getItem("path") ?? NOTHING)
  const [metadata, setMetadata] = useState(null);
  const [list, setList] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [lrc, setLrc] = useState(null);
  const [time, setTime] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(null)
  const [play,setPlay]=useState(false);

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
    if (path && (nowPlay.get("file_name") !== "")) {
      invoke("get_lyrics", { path: path + "/" + nowPlay.get("file_name") }).then((lyrics) => {
        setLrc(lyrics)
      })
    }
  }, [nowPlay])
  useEffect(() => {
    if ((nowPlay.get("file_name") !== "")) {
      let c = new ct()
      coverImage.current.onload = () => {
        let color = c.getColor(coverImage.current, 10)
        console.log("color: ", color)
        const colorA = lighten(color, 0.8),colorB = lighten(color,1),colorC=lighten(color,1.2);
        setBackgroundColor(`linear-gradient(45deg, ${asRGBString(colorA)},20%,${asRGBString(colorB)},60%,${asRGBString(colorC)})`)
        let currentColor = getComputedStyle(document.documentElement).getPropertyValue(
          "--lrc-color"
        )
        console.log("currentColor: ", currentColor)
        const black = [0, 0, 0],
          white = [255, 255, 255];
        const lrc_black = "#000",
          lrc_dark = "#111",
          lrc_white = "#fff",
          lrc_light = "#eee";
        const now=currentColor===lrc_dark?black:white;
        const _else = currentColor !== lrc_dark ? black : white;
        console.log("distance: ", distanceOfColors(color,now))
        if(distanceOfColors(color,now)<distanceOfColors(color,_else)){
          document.documentElement.style.setProperty("--lrc-color",now[0]?
            lrc_dark:lrc_light
          )
          document.documentElement.style.setProperty("--lrc-active-color", now[0] ?
            lrc_black : lrc_white
          )
        }
      }
    }
  }, [nowPlay])

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
                      loadMusic(v).then((m) => {
                        setMetadata(m[0]); setList(m[1])
                      })
                    })
                  }}>选择</button>
                </div> : (list ?
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
                        //console.log("item: ", item)
                        //console.log("metadata: ", metadata[item.get("title")])                    
                        return <tr key={i}>
                          <td style={{ width: new CSSUnitValue(50, "px"), textAlign: "center" }} className="num">{i + 1}</td>
                          <td onClick={() => {
                            setNowPlay(item);                            
                            setPlay(true);
                          }}>{item.get("title")}</td>
                          <td>{item.get("artist")}</td>
                          <td>{item.get("album")}</td>
                        </tr>
                      })
                      }
                    </tbody>
                  </table> :
                  <div>加载中...</div>)}
            </Route>
            <Route path="/settings"><Setting /></Route>
            <Route>Coming Soon!</Route>
          </Switch>
        </div>
        <div className="footer">
          <Player nowPlay={nowPlay} 
          setNowPlay={setNowPlay} 
          path={path ?? ""} 
          fn={setFullscreen} 
          fn2={setTime} 
          list={list}
          play={play}
          setPlay={setPlay} />
        </div>
      </div>
      <div className={fullscreen ? "fullscreen" : "hide"} style={{
        background: backgroundColor ?? "#cde"
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
            paddingTop: "4rem",
            textAlign: "center",
          }}>
            <img src={nowPlay.get("cover") ? convertFileSrc(nowPlay.get("cover")) : ""} style={{
              display: "block",
              width: "min(80%,18rem)",
              borderRadius: "1rem",
            }} crossOrigin="anonymous" ref={coverImage} />
            <div style={{ flex: 1,color:"var(--lrc-active-color)",paddingBlockStart:"0.8rem",fontSize:"1.1rem" }}>
              <p>{nowPlay.get("title")}</p>
              <p>{nowPlay.get("artist")}</p>
            </div>
          </div>{/*TODO:布局*/}
          <div style={{
            flex: 3,
            height: "100%"
          }}>
            {lrc && <Lrc id="lrcs" lrc={lrc}
              lineRenderer={lineRenderer} 
              verticalSpace 
              currentMillisecond={(time * 1000).toFixed()}
              recoverAutoScrollInterval={0}
              ></Lrc>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
