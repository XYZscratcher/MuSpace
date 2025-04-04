import loadMusic from "../core/load";
import { open } from "@tauri-apps/api/dialog"
import { audioDir } from '@tauri-apps/api/path';
import { Link } from "wouter";
import { nameOfAllSongs } from "../utils/constants";
const audioDirPath = await audioDir();
import { useEffect } from "react";

export default function ({ setPath,
    setMetadata,
    setList,
    setNowPlay,
    setPlay,
    list,
    path,
    setIsPlaying, }){    
    const load = () => {//TODO:about list
        if (path && (!list||(list.name !== nameOfAllSongs))) {
            loadMusic(path).then((m) => {
                setMetadata(m[0]); setList(m[1]);
            }).catch((err) => { console.error(err); })
        }
    }
    useEffect(() => {
        load()
    },[])
    //console.log(list)
    //if(list.name!==nameOfAllSongs)load()
    return (<>{
        path === null ?
        <div>
            <h1>选择文件夹，开启你的音乐之旅...</h1>
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
            }} className="btn pri">选择</button>
            <button onClick={()=>{
                    setPath(audioDirPath); localStorage.setItem('path', audioDirPath);
                    loadMusic(audioDirPath).then((m) => {
                        setMetadata(m[0]); setList(m[1])
                    })
            }} className="btn">自动导入</button>
        </div> : (list&&list.name === nameOfAllSongs ?
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
                                setIsPlaying(true)
                                setPlay(true);
                            }}>{item.title}</td>
                            <td>{item.artist}</td>
                            <td><Link href={`/album/${item.album}`}>{item.album}</Link></td>
                        </tr>
                    })
                    }
                </tbody>
            </table> :
            <div>{/*加载中...*/}</div>)
    }</>)
}