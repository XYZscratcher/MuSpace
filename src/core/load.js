import { readDir } from "@tauri-apps/api/fs"
import { invoke } from "@tauri-apps/api/tauri";

import { isMusic } from "../utils/file";

async function loadMusic(path) {
    let tongji={};
    let a;
    let cnt=0;
    let lst = [];
    a = await readDir(path);
    let metadata = {};
    let i;
    let flag = await invoke("has_changed", { path });
    if (!flag) {
        metadata = new Proxy(localStorage, {
            get(t, p) {
                return JSON.parse(t[p])
            }
        })
    } else {
        for (i of a) {
            if (isMusic(i.name)) {
                let d = await invoke("get_metadata", { path: i.path });
                d={...d,index:cnt++}
                metadata[d.title] = d;//TODO:metadata是干什么的？
                //let t = { ...d, fileName: d.file_name }
                
                d.artist in tongji?tongji[d.artist]+=1:tongji[d.artist]=1
                lst.push(new Map(Object.entries(d)))
                //console.log(d.cover)
            }
        }
    }
    console.log(lst)
    console.log("tongji",tongji)
    return new Promise((resolve, reject) => {
        resolve([metadata, lst])
    })
}
export default loadMusic;