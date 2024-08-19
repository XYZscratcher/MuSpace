import { useEffect, useRef, useState } from 'react'

import { convertFileSrc } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

import * as dayjs from "dayjs"
import d from "dayjs/plugin/duration"
import { Chance } from 'chance'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerSkipBack,
    IconPlayerSkipForward
} from '@tabler/icons-react'
//import { unregister,register } from '@tauri-apps/api/globalShortcut'
import { replacer } from './utils/storageHelper'
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
const DEFAULT_TITLE = "The Echo of Undefined"
//unregister("space")

export default function Player({ nowPlay, path, fn, fn2, list, setNowPlay, play, setPlay, fullscreen }) {
    const next = () => {
        console.log("mode: ", mode)
        if (!play) setPlay(true)
        switch (mode) {
            case "loop":
                //setLoop(true);
                //player.current.removeEventListener("ended")
                player.current.load()
                setNowPlay(nowPlay)

                player.current.play()
                break;
            case "single":
                //setLoop(false);
                //player.current.removeEventListener("ended")
                break;
            case "list":
                //setLoop(false);
                //player.current.addEventListener("ended", (e) => {
                setNowPlay(list[(nowPlay.get("index") + 1) % list.length])
                //player.current.play()
                //})
                break;
            case "random":
                //setLoop(false);
                try {
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
    const [isPlaying, setIsPlaying] = useState(false);
    //const [loop,setLoop]=useState(mode==="loop");

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
    // register("space", () => {
    //     player.current.paused ? player.current.play() : player.current.pause()
    // })
    //if(nowPlay){
    //console.log("nowPlay: ", nowPlay)
    return (<div style={{
        padding: "1rem",

    }}>
        <audio id="player"
            src={nowPlay.file_name != "" ? convertFileSrc(path + "/" + nowPlay.file_name) : ""}
            ref={player}

            onEnded={next}
            onLoadStart={() => {
                //player.current.play()
                console.log("onLoadStart")
                console.log("nowPlay: ", nowPlay)
                //console.log("test:", chance.natural({ min: 0, max: 1, exclude: [0, 1] }))
                localStorage.setItem("play", JSON.stringify(nowPlay, replacer))
                appWindow.setTitle("" + nowPlay.title + " - " + nowPlay.artist)
            }}></audio>
        <div className="player-main" style={{ display: "flex", justifyContent: "center",alignItems:"center" }}>
            <div className="player-info">
                <p onClick={() => fn(!fullscreen)}>{nowPlay.title ?? DEFAULT_TITLE}</p>
            </div>

            <div className='player-controls'>
                <IconPlayerSkipBack onClick={() => {
                setNowPlay(list[(nowPlay.get("index") - 1) % list.length])
                if (!play) setPlay(true)
                //player.current.play()
                }} />
                <span onClick={() => {
                    if (isPlaying) player.current.pause();
                    else player.current.play();
                    setIsPlaying(!isPlaying)
                }}>{isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}</span>
                <IconPlayerSkipForward onClick={() => {
                    //setNowPlay(list[(nowPlay.get("index") + 1) % list.length])
                    if (!play) setPlay(true)
                    next()

                    //player.current.play()
                }} />
                <span style={{verticalAlign:"text-top"}}>
                &nbsp;
                <span>{currentTime}</span>/
                <span>{duration}</span>
                    &nbsp;</span>
            </div>
            <div className="player-volume">
            volume:<input type="range" min="0" max="1" step="0.01" defaultValue={Number(localStorage.getItem("volume"))} onChange={(e) => {
                player.current.volume = e.target.value;
                localStorage.setItem('volume', e.target.value);
            }} style={{ verticalAlign: "middle" }}></input>
            <button onClick={(e) => {
                let newMode = modes[(modes.indexOf(mode) + 1) % modes.length];
                setMode(newMode)
                console.log('new mode', newMode)
            }}>{mode}</button>
            </div>
        </div>
    </div>)
}