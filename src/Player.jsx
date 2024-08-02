/*import 'APlayer/dist/APlayer.min.css';
import APlayer from 'APlayer';

export default (name,artist,
            url,
            cover,
            lrc,)=>new APlayer({
    audio:[
        {
            name,
            artist,
            url,
            cover,
            lrc,
            theme: '#ebd0c2'
        },
    ]
});*/
import { useEffect, useRef, useState } from 'react'

import { convertFileSrc } from '@tauri-apps/api/tauri'
import {appWindow} from '@tauri-apps/api/window'

import * as dayjs from "dayjs"
import d from "dayjs/plugin/duration"
dayjs.extend(d)
const toFormattedDuration=(p)=>{    
    let min=dayjs.duration(p*1000).minutes()
    let sec=dayjs.duration(p*1000).seconds()
    let result=dayjs.duration({
        minutes: min,
        seconds: sec
    }).format("mm:ss")
    return result
}
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}
export default function Player({ nowPlay, path, fn, fn2,list,setNowPlay,play }) {
    let player = useRef(null);
    const modes=["loop"/*,"random"*/,"list","single"]

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [mode,setMode]=useState(modes[1])
    //const [loop,setLoop]=useState(mode==="loop");
    
     useEffect(() => {
         player.current.volume=Number(localStorage.getItem("volume"))??1;//TODO:
     },[nowPlay])
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
    useEffect(()=>{
        if(play){
            player.current.play()
        }
    })
    //if(nowPlay){
//console.log("nowPlay: ", nowPlay)
    return (<div style={{
        padding:"1rem",
       
    }}>
        <audio id="player"
            src={nowPlay.get("file_name") != "" ? convertFileSrc(path + "/" + nowPlay.get("file_name")) : ""}
            ref={player}
            
            onEnded={()=>{
                console.log("mode: ",mode)
                switch (mode) {
                    case "loop":
                        //setLoop(true);
                        //player.current.removeEventListener("ended")
                        setNowPlay(nowPlay)//FIXME:?不知道需不需要
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
                            player.current.play()
                        //})
                        break;
                }
            }}
            onLoadStart={()=>{
                console.log("onLoadStart")
                console.log("nowPlay: ", nowPlay)
                localStorage.setItem("play", JSON.stringify(nowPlay,replacer))
                appWindow.setTitle("" + nowPlay.get("title") + " - " + nowPlay.get("artist"))
            }}></audio>
        <span onClick={fn}>{nowPlay.get("title")}</span>
        <button onClick={() => {
            player.current.play();
        }}>Play</button>
        <button onClick={() => {
            player.current.pause();
        }}>Pause</button>
        <button onClick={() => {
            setNowPlay(list[(nowPlay.get("index") - 1) % list.length])
            player.current.play()
        }}>
            Previous
        </button>
        <button onClick={() => {
            setNowPlay(list[(nowPlay.get("index") + 1) % list.length])
            player.current.play()
        }}>
            Next
        </button>
        &nbsp;
        <span>{currentTime}</span>/
        <span>{duration}</span>
        &nbsp;
        volume:<input type="range" min="0" max="1" step="0.01" defaultValue={Number(localStorage.getItem("volume"))}onChange={(e) => {
            player.current.volume = e.target.value;
            localStorage.setItem('volume', e.target.value);
        }} style={{verticalAlign:"middle"}}></input>
        <button onClick={(e)=>{
            let newMode = modes[(modes.indexOf(mode) + 1) % modes.length];
            setMode(newMode)
            console.log('new mode', newMode)           
        }}>{mode}</button>
    </div>)//}
}