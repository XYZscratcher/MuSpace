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
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { useEffect, useRef, useState } from 'react'
export default function Player({ nowPlay, path, fn, fn2 }) {
    let player = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    useEffect(() => {
        setDuration(player.current.duration.toFixed(0))
    })
    useEffect(() => {
        const id = setInterval(() => {
            let t = player.current.currentTime;
            setCurrentTime(t.toFixed(0))
            fn2(t)
        }, 100);
        return () => clearInterval(id);
    })
    //if(nowPlay){

    return (<>
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
        <span>{currentTime}</span>/
        <span>{duration}</span>
    </>)//}
}