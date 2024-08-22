//import { useState } from "react"
import { open } from "@tauri-apps/api/dialog"

export default function({path,setPath}){
    //const [path,setPath] = useState(localStorage.getItem('path'))
    return (
        <div>
            <h1>设置</h1>
            <h2>当前目录</h2>
            <p>{path}</p>
            <button onClick={() => {
                open({
                    directory: true,
                    multiple: false
                }).then((v) => {
                    setPath(v); localStorage.setItem('path', v);
                })
            }}>修改</button>
        </div>
    )
}