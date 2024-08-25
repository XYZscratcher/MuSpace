import { useEffect, useRef, useState } from 'react'

import { convertFileSrc } from '@tauri-apps/api/tauri'
import { appWindow, LogicalPosition, LogicalSize, PhysicalPosition, WebviewWindow } from '@tauri-apps/api/window'

import * as dayjs from "dayjs"
import d from "dayjs/plugin/duration"
import { Chance } from 'chance'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconVolume,
    IconVolume3,
    IconRepeat,
    IconRepeatOnce,
    IconRepeatOff,
    IconArrowsShuffle,
} from '@tabler/icons-react'
//import { unregister,register } from '@tauri-apps/api/globalShortcut'
import { replacer } from './utils/storageHelper'

// const w=new WebviewWindow("lyrics",{
//     url:'/lyrics',
//     //transparent: true,

//     x:960,
//     y:540,
// })
// w.setSize(new LogicalSize(500,500))

//w.setDecorations(false)
//w.setAlwaysOnTop(true)


//w.show()
//w.hide()
dayjs.extend(d)
const chance = new Chance();
const toFormattedDuration = (p) => {
    let min = dayjs.duration(p * 1000).minutes()
    let sec = dayjs.duration(p * 1000).seconds()
    let result = dayjs.duration({
        minutes: min,
        seconds: sec
    }).format("mm:ss")
    return result
}
const DEFAULT_TITLE = "The Echo of Echoes"
const ICON_SIZE = 36
//unregister("space")

export default function Player({ nowPlay, path, fn, fn2, list, setNowPlay, play, setPlay, fullscreen, isPlaying, setIsPlaying }) {
    const next = () => {
        console.log("mode: ", mode)
        if (!play) setPlay(true)
        setIsPlaying(true)
        switch (mode) {
            case "loop":
                player.current.load()
                setNowPlay(nowPlay)

                player.current.play()
                break;
            case "single":
                break;
            case "list":
                setNowPlay(list[(nowPlay.get("index") + 1) % list.length])
                break;
            case "random":
                try {
                    //FIXME:在列表改变时有一定可能播放之前播过的歌曲
                    let num = chance.natural({ min: 0, max: list.length - 1, exclude: played });
                    let newList = [...played, num]
                    setNowPlay(list[num])
                    setPlayed(newList)
                } catch (e) {
                    //setNowPlay
                }

                player.current.load()//https://developer.chrome.com/blog/play-request-was-interrupted?hl=zh-cn
                break;
        }
    }
    let player = useRef(null);
    const modes = ["loop", "random", "list", "single"]

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [mode, setMode] = useState(modes[1])
    const [played, setPlayed] = useState([])

    const [volume, setVolume] = useState(Number(localStorage.getItem("volume")));

    useEffect(() => {
        player.current.volume = Number(localStorage.getItem("volume")) ?? 1;//TODO:
    }, [nowPlay])
    useEffect(() => {
        setDuration(toFormattedDuration(player.current.duration.toFixed(0)))
    })
    useEffect(() => {
        const id = setInterval(() => {
            let t = player.current.currentTime;
            setCurrentTime(toFormattedDuration(t.toFixed(0)))
            fn2(t)
        }, 100);
        return () => clearInterval(id);
    })
    useEffect(() => {
        if (play) {
            player.current.play()
        }
    }, [nowPlay])
    useHotkeys("space", () => {
        player.current.paused ? player.current.play() : player.current.pause()
    })
    useHotkeys("ctrl+n", next)

    return (<div style={{


    }}>
        <audio id="player"
            src={nowPlay.file_name != "" ? convertFileSrc(path + "/" + nowPlay.file_name) : ""}
            ref={player}

            onEnded={next}
            onLoadStart={() => {
                //player.current.play()
                console.log("onLoadStart")
                console.log("nowPlay: ", nowPlay)
                localStorage.setItem("play", JSON.stringify(nowPlay, replacer))
                if(nowPlay.title)appWindow.setTitle("" + nowPlay.title + (nowPlay.artist!=="-"?(" - " + nowPlay.artist):""))
            }}></audio>
        <div className="player-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginInline: "1rem" }}>
            <div className="player-info" style={{ height: "80px",width:"15rem" }}>
                <h3 style={{ fontWeight: "400", 
                    marginBlock: "0.8rem", 
                    lineHeight: 1.15,
                    overflow:"hidden",
                    whiteSpace:"nowrap",
                    textOverflow:"ellipsis" }} onClick={() => fn(!fullscreen)}>{nowPlay.title ?? DEFAULT_TITLE}</h3>
                <p style={{ marginBlock: 0, fontSize: "0.9rem" }}>{nowPlay.artist}</p>
            </div>

            <div className='player-controls' style={{ textAlign: "center" }}>
                <IconPlayerSkipBack onClick={() => {
                    setNowPlay(list[(nowPlay.get("index") - 1) % list.length])
                    if (!play) setPlay(true)
                    //player.current.play()
                }} size={ICON_SIZE} />
                <span onClick={() => {
                    if (isPlaying) player.current.pause();
                    else player.current.play();
                    setIsPlaying(!isPlaying)
                }}>{isPlaying ? <IconPlayerPause size={ICON_SIZE} /> : <IconPlayerPlay size={ICON_SIZE} />}</span>
                <IconPlayerSkipForward onClick={() => {
                    //setNowPlay(list[(nowPlay.get("index") + 1) % list.length])
                    if (!play) setPlay(true)
                    next()

                    //player.current.play()
                }} size={ICON_SIZE} />
                <span style={{ verticalAlign: "auto" }}>
                    &nbsp;
                    <span>{currentTime}</span>/
                    <span>{duration}</span>
                    &nbsp;</span>
            </div>
            <div className="player-volume" style={{ textAlign: "right" }}>
                {volume == 0 ? <IconVolume3></IconVolume3> : <IconVolume></IconVolume>}<input type="range" min="0" max="1" step="0.01" defaultValue={volume} onChange={(e) => {
                    player.current.volume = e.target.value;
                    setVolume(e.target.value)
                    localStorage.setItem('volume', e.target.value);
                }} style={{ verticalAlign: "middle" }}></input>
                <span onClick={(e) => {
                    let newMode = modes[(modes.indexOf(mode) + 1) % modes.length];
                    setMode(newMode)
                    console.log('new mode', newMode)
                }}>{{
                    loop: <IconRepeatOnce />,
                    list: <IconRepeat />,
                    single: <IconRepeatOff />,
                    random: <IconArrowsShuffle />
                }[mode]}</span>
            </div>
        </div>
    </div>)
}