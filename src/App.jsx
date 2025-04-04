import { useCallback, useEffect, useState, useRef,cloneElement } from "react";

import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";

import { appWindow, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';

import { Route, Switch, Link, useRoute } from "wouter";

import { Lrc } from "react-lrc"
import { useHotkeys } from 'react-hotkeys-hook'
import ct from "colorthief/dist/color-thief.mjs";
import chroma from "chroma-js";
import { Toaster, toast } from "react-hot-toast"
//import "simpledotcss/simple.min.css"
//import "layui/dist/css/layui.css"
//import "jian.css/main.css"

import Player from "./Player"
import Setting from "./views/Setting";
import Songs from "./views/Songs";
import Albums from "./views/Albums";
import Artists from "./views/Artists";
import UserData from "./views/UserData";
import Album from "./views/Album";


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
  //IconUsers,
  IconMusic,
  IconVinyl,
  IconSettings,
  IconArrowLeft,
} from "@tabler/icons-react";
import "./App.css"
import "./reset.css"
import t from "./utils/i18n"
import icon from "../assets/app-icon.png"
import { useRouter } from "wouter";
//const t=i.t;
const NOTHING = null;

const SIZE = new LogicalSize(1100, 680);
console.log("appWindow.label: ", appWindow.label); // appWindow.label
await appWindow.setSize(SIZE);
await appWindow.setMinSize(SIZE);
await appWindow.center()

const defaultFileFormat = new Map([["file_name", ""], ["title", ""]])
//console.log(getFP().hash)
//localStorage.clear()
const ICON_SIZE = 36
//TODO:motion
const useRoutes = (routes) => {
  // save the length of the `routes` array that we receive on the first render
  const [routesLen] = useState(() => routes.length);

  // because we call `useRoute` inside a loop the number of routes can't be changed!
  // otherwise, it breaks the rule of hooks and will cause React to break
  if (routesLen !== routes.length) {
    throw new Error(
      "The length of `routes` array provided to `useRoutes` must be constant!"
    );
  }

  const matches = routes.map((def) => {
    return useRoute(def.path);
  });

  for (let [index, match] of matches.entries()) {
    const [isMatch, params] = match;

    if (isMatch) {
      return cloneElement(routes[index].element, { params });
    }
  }

  return null;
};
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
  const [isPlaying, setIsPlaying] = useState(false);

  const coverImage = useRef(null);

  const lineRenderer = useCallback(({ active, line: { content } }) => {
    return <div className={"lrc " + (active ? "active" : "")}>{content/*.match(/[\w\s"'?!.(),:\-]+/)*/}</div>
    //fake "pure English" mode
  })
  const albumList = [...new Set(
    JSON.parse(localStorage.getItem('musicList') || '[]')
      .map((item) => {let {album,cover}=item;return JSON.stringify({album,cover})})
  )]
  useHotkeys("F5", e => {
    if (!isDev) e.preventDefault()
  })
  /*统计使用时间 */
  useEffect(() => {
    let minutes = parseInt(localStorage.getItem('minutes') ?? '0')
    const id = setInterval(() => {
      minutes++;
      localStorage.setItem('minutes', minutes)
    }, 1000 * 60)
    return () => clearInterval(id)
  })
  useEffect(() => {
    if (path && nowPlay.file_name) {
      invoke("get_lyrics", { path: path + "/" + nowPlay.file_name }).then((lyrics) => {
        setLrc(lyrics)
        //console.log("lyrics: ", lyrics)
      }).catch((err) => { toast.error("Error: " + err) });//TODO:Show error in another way
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

  // let match,params;
  // ["/","/setting","/albums","/songs","/artists","/user_data"].forEach((path) => {
  //   const [isMatch, p] = useRoute(path);
  //   if (isMatch)match=path;params=p;throw new Error("break")//TODO:
  // });

  return (
    <div className="container" onContextMenu={(e)=>{if(!isDev)e.preventDefault()}}>
      <Toaster></Toaster>
      <div className="column">
        <Link className="icon" href="/user_data">
          {//<IconUserSquareRounded size={ICON_SIZE + 12} color="#5a5a5a" />
          }<img src={icon} height={ICON_SIZE + 14 + "px"}></img>
        </Link>
        <Link className="icon albums" href="/albums">
          <IconVinyl size={ICON_SIZE} color="#5a5a5a" />
        </Link>
        {/*<Link className="icon artists" href="/artists"><IconUsers size={ICON_SIZE} color="#5a5a5a"></IconUsers></Link>*/}
        <Link className="icon songs" href="/">
          <IconMusic size={ICON_SIZE} color="#5a5a5a" />
        </Link>
        <Link className="icon settings" href="/settings">
          <IconSettings size={ICON_SIZE} color="#5a5a5a" />
        </Link>
      </div>
      {//<div className="body">
      }
      <div className="header">
        <input className="search"
          placeholder={t("search_placeholder")}
          disabled
          style={{ cursor: "not-allowed" }} title="正在施工..." />
      </div>
      <div className="content">
        <Switch>
          <Route path="/">
            <Songs 
              {...{setPath,
              setMetadata,
              setList,
              setNowPlay,
              setPlay,
              list,
              path,
              setIsPlaying,}}
            />
          </Route>
          <Route path="/settings"><Setting path={path} setPath={setPath} /></Route>
          <Route path="/artists"><Artists /></Route>
          <Route path="/albums"><Albums list={albumList} /></Route>
          <Route path="/album/:name">{
            ({name})=><Album name={name} {...{setNowPlay,setIsPlaying,setPlay,setList,list}}></Album>/*TODO:传一个函数，让专辑页面可以控制“正在播放” */
          }</Route>
          <Route path="/user_data"><UserData lengthOfSongs={list?.length ?? 0} lengthOfAlbums={albumList.length} /></Route>
        </Switch>
      </div>
      <div className="footer">
        <Player 
          fn={setFullscreen}
          fn2={setTime}
          path={path ?? ""}
          {...{nowPlay,
          setNowPlay,
          fullscreen,          
          list,
          play,
          setPlay,
          setIsPlaying,
          isPlaying,}} />
      </div>
      {//</div>
      }
      <div className={fullscreen ? "fullscreen" : "hide"} style={{
        background: backgroundColor ?? "#123"
      }}>
        <IconArrowLeft onClick={() => { setFullscreen(false) }}
          color="#FFF"
          size={ICON_SIZE - 12}
          style={{ position: "absolute", top: "1rem", left: "1rem", cursor: "grab" }}></IconArrowLeft>
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
              //borderRadius: "1rem",
            }} crossOrigin="anonymous" ref={coverImage} />
            <div style={{
              flex: 1,
              color: "var(--lrc-active-color)",
              paddingBlockStart: "0.8rem",
              fontSize: "1.1rem",
              marginInline: "1rem"
            }}>
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
