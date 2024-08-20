import { useCallback, useEffect, useState, useRef } from "react";

import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog"
import { appWindow, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';

import { Route, Switch, Link } from "wouter";

import { Lrc } from "react-lrc"
import { useHotkeys } from 'react-hotkeys-hook'
import ct from "colorthief/dist/color-thief.mjs";
import chroma from "chroma-js";

import Player from "./Player"
import Setting from "./views/Setting";
import Songs from "./views/Songs";
import Albums from "./views/Albums";
import Artists from "./views/Artists";
import UserData from "./views/UserData";


//import getFP from "./core/canvasFP"
import { asRGBString, lighten, distanceOfColors, darken } from "./utils/color"
import { isDev } from "./utils/misc";
//import { reviver } from "./utils/storageHelper";

/*import a from "./assets/album.svg"
import b from "./assets/artist.svg"
import c from "./assets/library_music.svg"
import d from "./assets/settings.svg"*/
import {
  IconUserSquareRounded,
  IconUsers,
  IconMusic,
  IconVinyl,
  IconSettings
} from "@tabler/icons-react";
import "./App.css"

const NOTHING = null;

const SIZE = new LogicalSize(1100, 680);
await appWindow.setSize(SIZE);
await appWindow.setMinSize(SIZE);
const defaultFileFormat = new Map([["file_name", ""], ["title", ""]])
//console.log(getFP().hash)

const ICON_SIZE = 36

//alert(a)
function App() {
  const [nowPlay, setNowPlay] = useState(JSON.parse(localStorage.getItem("play")) ?? defaultFileFormat);
  const [path, setPath] = useState(localStorage.getItem("path") ?? NOTHING)
  const [metadata, setMetadata] = useState(null);
  const [list, setList] = useState(null);
  //const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [lrc, setLrc] = useState(null);
  const [time, setTime] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(null)
  const [play, setPlay] = useState(false);

  const coverImage = useRef(null);

  const lineRenderer = useCallback(({ active, line: { content } }) => {
    return <div className={"lrc " + (active ? "active" : "")}>{content/*.match(/[\w\s"'?!.(),:\-]+/)*/}</div>
    //fake "pure English" mode
  })

  useHotkeys("F5", e => {
    if(!isDev)e.preventDefault()
  })
  useEffect(() => {
    if (path && nowPlay.file_name) {
      invoke("get_lyrics", { path: path + "/" + nowPlay.file_name }).then((lyrics) => {
        setLrc(lyrics)
      })
    }
  }, [nowPlay])
  useEffect(() => {
    if ((nowPlay.file_name !== "")) {
      let c = new ct()
      coverImage.current.onload = () => {

        let color = chroma(c.getColor(coverImage.current, 10))
        console.log("color: ", color)
        const colorA = color.shade(0.5), colorB = color.shade(0.4), colorC = color.shade(0.3);
        //const colorA = darken(color, 2), colorB = lighten(color, 0), colorC = lighten(color, 2);
        setBackgroundColor(`linear-gradient(45deg, ${colorA},20%,${colorB},60%,${colorC})`)

        // let [color1,color2]=c.getPalette(coverImage.current, 2, 10)
        // console.log("color1: ", color1)
        // console.log("color2: ", color2)
        // setBackgroundColor(`linear-gradient(40deg, ${asRGBString(darken(color1,5))},50%,${asRGBString(darken(color2,3))})`)
        // let color=darken(color2,3);

        let currentColor = getComputedStyle(document.documentElement).getPropertyValue(
          "--lrc-color"
        )
        console.log("currentColor: ", currentColor)
        // const black = [0, 0, 0],
        //   white = [255, 255, 255];
        // const lrc_black = "#000",
        //   lrc_dark = "#111",
        //   lrc_white = "#fff",
        //   lrc_light = "#eee";
        // const now = currentColor === lrc_dark ? black : white;
        // const _else = currentColor !== lrc_dark ? black : white;
        // console.log("distance: ", distanceOfColors(color, now))
        // if (distanceOfColors(color, now) < distanceOfColors(color, _else)) {
        //   document.documentElement.style.setProperty("--lrc-color", now[0] ?
        //     lrc_dark : lrc_light
        //   )
        //   document.documentElement.style.setProperty("--lrc-active-color", now[0] ?
        //     lrc_black : lrc_white
        //   )
        // }
      }
    }
  }, [nowPlay])

  return (
    <div className="container">
      <div className="column">
        <Link className="icon" href="/user_data"><IconUserSquareRounded size={ICON_SIZE + 12} color="#5a5a5a"></IconUserSquareRounded></Link>
        <Link className="icon albums" href="/albums"><IconVinyl size={ICON_SIZE} color="#5a5a5a"></IconVinyl></Link>
        <Link className="icon artists" href="/artists"><IconUsers size={ICON_SIZE} color="#5a5a5a"></IconUsers></Link>
        <Link className="icon songs" href="/"><IconMusic size={ICON_SIZE} color="#5a5a5a"></IconMusic></Link>
        <Link className="icon settings" href="/settings"><IconSettings size={ICON_SIZE} color="#5a5a5a"></IconSettings></Link>
      </div>
      {//<div className="body">
      }
      <div className="header">
        <input className="search" placeholder="Search for something..." />
      </div>
      <div className="content">
        <Switch>
          <Route path="/">
            <Songs path={path} setPath={setPath} setMetadata={setMetadata} setList={setList} setNowPlay={setNowPlay} setPlay={setPlay} list={list} />
          </Route>
          <Route path="/settings"><Setting /></Route>
          <Route path="/artists"><Artists /></Route>
          <Route path="/albums"><Albums /></Route>
          <Route path="/user_data"><UserData lengthOfSongs={list?.length ?? 0} /></Route>
        </Switch>
      </div>
      <div className="footer">
        <Player nowPlay={nowPlay}
          setNowPlay={setNowPlay}
          fullscreen={fullscreen}
          path={path ?? ""}
          fn={setFullscreen}
          fn2={setTime}
          list={list}
          play={play}
          setPlay={setPlay} />
      </div>
      {//</div>
      }
      <div className={fullscreen ? "fullscreen" : "hide"} style={{
        background: backgroundColor ?? "#cde"
      }}>
        {/*<button onClick={() => { setFullscreen(false) }}>退出全屏</button>*/}
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
            <img src={nowPlay.cover ? convertFileSrc(nowPlay.cover) : ""} style={{
              display: "block",
              width: "min(80%,18rem)",
              borderRadius: "1rem",
            }} crossOrigin="anonymous" ref={coverImage} />
            <div style={{ flex: 1, color: "var(--lrc-active-color)", paddingBlockStart: "0.8rem", fontSize: "1.1rem" }}>
              <p>{nowPlay.title}</p>
              <p>{nowPlay.artist}</p>
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
