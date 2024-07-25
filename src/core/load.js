import { readDir } from "@tauri-apps/api/fs"
import { invoke } from "@tauri-apps/api/tauri";

import { isMusic } from "../utils/file";

async function loadMusic(path) {
    let a;
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
                metadata[d.title] = d;
                let t = { ...d, fileName: d.file_name }
                lst.push(new Map(Object.entries(t)))
                console.log(d.cover)
            }
        }
    }
    console.log(lst)
    return new Promise((resolve, reject) => {
        resolve([metadata, lst])
    })
}
export default loadMusic;