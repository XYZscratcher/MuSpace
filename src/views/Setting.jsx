//import { useState } from "react"
import { open } from "@tauri-apps/api/dialog"
import { getVersion,getName } from "@tauri-apps/api/app";

const version=await getVersion();
const name=await getName();
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
            <h2>关于</h2>
            <p>{name} 版本号 v{version}</p>
            <p>由 XYZscratcher 用❤编写</p>
            <p><a href="https://github.com/XYZscratcher/MuSpace.git">GitHub Repo</a></p>
        </div>
    )
}