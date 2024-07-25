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
export default function Player({ nowPlay, path, fn, fn2 }) {
    let player = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    // useEffect(() => {
    //     player.current.volume=0.5;//TODO:
    // },[nowPlay])
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
    //if(nowPlay){

    return (<div style={{
        padding:"1rem"
    }}>
        <audio id="player"
            src={nowPlay.get("fileName") !== "" ? convertFileSrc(path + "/" + nowPlay.get("fileName")) : ""}
            ref={player}
            autoPlay></audio>
        <span onClick={fn}>{nowPlay.get("title")}</span>
        <button onClick={() => {
            player.current.play();
        }}>Play</button>
        <button onClick={() => {
            player.current.pause();
        }}>Pause</button>
        &nbsp;
        <span>{currentTime}</span>/
        <span>{duration}</span>
        &nbsp;
        volume:<input type="range" min="0" max="1" step="0.01" onChange={(e) => {
            player.current.volume = e.target.value;
        }} style={{verticalAlign:"middle"}}></input>
    </div>)//}
}