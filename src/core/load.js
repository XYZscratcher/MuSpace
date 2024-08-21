import { readDir } from "@tauri-apps/api/fs"
import { invoke } from "@tauri-apps/api/tauri";

import { isMusic } from "../utils/file";
import { replacer } from "../utils/storageHelper";

async function loadMusic(path) {
    let tongji = {};
    let a;
    let cnt = 0;
    let lst = [];
    a = await readDir(path);
    let metadata = {};
    let i;
    let flag = await invoke("has_changed", { path });
    a = a.filter((v) => {
        return isMusic(v.name)
    }).map((v) => {
        return v.path
    })
    if (!flag) {
        metadata = new Proxy(localStorage, {
            get(t, p) {
                return JSON.parse(t[p])
            }
        })
    } else {
        let metadatas = await invoke("get_metadata_of_files", { paths: a });
        for (let d of metadatas) {
            d = { ...d, index: cnt++ }
            metadata[d.title] = d;//TODO:metadata是干什么的？
            d.artist in tongji ? tongji[d.artist] += 1 : tongji[d.artist] = 1
            d = { ...d, cover: d.cover.replaceAll('\\\\', "\\") }
            Object.setPrototypeOf(d, {
                get(v) {
                    return this[v]
                }//历史原因，替代 Map
            })
            lst.push(d)
            console.log(d.cover)
        }
        localStorage.setItem("musicList", JSON.stringify(lst));
    }
    console.log(lst)
    
    console.log("tongji", tongji)
    return new Promise((resolve, reject) => {
        resolve([metadata, lst])
    })
}
export default loadMusic;