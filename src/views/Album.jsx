import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "wouter";
export default function ({ name, setNowPlay, setIsPlaying, setPlay,setList }){//TODO:App传入albumList
    //console.log(name)
    let album = decodeURIComponent(name);
    //let [l,setl]=useLocation();
    //console.log(album)
    const songsList = JSON.parse(localStorage.musicList).filter((v) => v.album === album).toSorted((a, b) => {
        if (!(a.track === 0 || b.track === 0)) return a.track - b.track
        else if (a.track === 0 || b.track === 0) return b.track - a.track
        else return +(a.title > b.title) - 0.5
    }).map((v,i)=>{
        return {...v,index:i}
    });
    //setList(songsList);//TODO:
    return (<>
        <IconArrowLeft onClick={()=>history.back()}></IconArrowLeft>
    <h1>{album}</h1>
    <ul style={{listStyle:"none",paddingLeft:"1rem"}}>{
        songsList.map((v) => (
            <li onClick={()=>{setNowPlay(v)
                setIsPlaying(true)
                setPlay(true);
            }}><span style={{marginRight:"1.5rem"}}>{v.track||'-'}</span>{v.title}</li>
        ))
    }</ul></>)
}