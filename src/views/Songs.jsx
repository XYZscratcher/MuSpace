import loadMusic from "../core/load";
import { useEffect } from "react";
export default function({path,setMetadata,setList,list,setNowPlay,setPlay,setPath}){    
    useEffect(() => {
        if (path) {
            loadMusic(path).then((m) => {
                setMetadata(m[0]); setList(m[1]);
            })
        }
    },[path])
    return (<>{
        path === null ?
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
            <div>加载中...</div>)
    }</>)
}