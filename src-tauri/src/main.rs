// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
//use audiotags::Picture;
use tauri::api::path::data_dir;

use lofty::prelude::*;
use lofty::probe::Probe;
//use lofty::picture::Picture;
// use base64::prelude::*;
// use base64::{engine::general_purpose::URL_SAFE, Engine as _};
// use chrono::prelude::*;
use lofty::picture::MimeType;
use serde_json::{Result, Value};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::prelude::*;
use std::path::Path;
use std::time::SystemTime;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

//有了 `convertFileSrc` ，就没必要搭服务器了😅

//#[tauri::command]
// async fn start_static_server(path:String){
//     // build our application with a single route
//     let app = axum::Router::new().nest("/music", axum_static::static_router(path));

//     // run our app with hyper, listening globally on port 3000
//     let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
//     axum::serve(listener, app).await.unwrap();
// }
fn time_to_string(time: SystemTime) -> String {
    time.duration_since(std::time::SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string()
}

fn save_last_read_time() {
    let f = File::create(data_dir().unwrap().join("last.txt"));
    //let time=Utc::now();
    let time = SystemTime::now();
    f.unwrap()
        .write_all(time_to_string(time).as_bytes())
        .unwrap();
}
#[tauri::command]
fn has_changed(path: &str) -> bool {
    //let time=Utc::now().to_string();
    let m = time_to_string(fs::metadata(path).unwrap().modified().unwrap());
    let f = fs::read_to_string(data_dir().unwrap().join("last.txt"));
    let mut r;
    match f {
        Ok(f) => {
            r = m > f;
        }
        Err(_) => {
            r = true;
        }
    };

    if r {
        //todo!();
    }
    r
}
#[tauri::command]
fn get_metadata_of_files(paths: Vec<&str>) -> Vec<HashMap<String, String>> {
    let mut r = Vec::new();
    for path in paths {
        r.push(get_metadata(path));
    }
    r
}
fn get_metadata(path: &str) -> HashMap<String, String> {
    let path = Path::new(&path);
    let tagged_file = Probe::open(path)
        .expect("ERROR: Bad path provided!")
        .read()
        .expect("ERROR: Failed to read file!");

    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        // If the "primary" tag doesn't exist, we just grab the
        // first tag we can find. Realistically, a tag reader would likely
        // iterate through the tags to find a suitable one.
        None => tagged_file.first_tag().expect("ERROR: No tags found!"),
    };
    let mut r = HashMap::new();
    let binding = tag.album();
    let a = binding.as_deref();
    r.insert(
        "title".into(),
        tag.title()
            .as_deref()
            .unwrap_or(
                path.file_name()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .rsplit_once('.')
                    .unwrap()
                    .0,
            )
            .into(),
    );
    r.insert(
        "file_name".into(),
        path.file_name().unwrap().to_str().unwrap().into(),
    );
    r.insert(
        "artist".into(),
        tag.artist().as_deref().unwrap_or("-").into(),
    );
    r.insert("album".into(), a.unwrap_or("-").into());
    //r.insert("lyrics".into(),tag.get_string(&ItemKey::Lyrics).unwrap_or("None").into());
    //let mut f=File::open(path).unwrap();
    let pic = tag.pictures();
    if pic.len() != 0 {
        let pic = pic[0].clone();
        let pic_type = match pic.mime_type() {
            Some(MimeType::Jpeg) => "jpg",
            Some(MimeType::Png) => "png",
            Some(MimeType::Bmp) => "bmp",
            Some(MimeType::Unknown(a)) => a,
            _ => unimplemented!(),
        };
        let mut tp = std::path::PathBuf::new();
        if a.is_some() {
            tp = data_dir()
                .unwrap()
                .join(a.unwrap().replace('?', "").to_string() + "." + pic_type);
            if !Path::exists(&tp) {
                let mut p = fs::File::create(&tp).unwrap_or_else(|_| panic!("{:?}", tp));
                p.write_all(pic.data()).unwrap();
            }
        }
        let t = format!("{:?}", tp)
            .replace('"', "")
            .replace(r"\'", "'")
            .replace(r#"\\"#, r#"\"#);
        //dbg!(&t);
        r.insert("cover".into(), t);
    } else {
        r.insert("cover".into(), "".into());
    }
    //println!("{}", r.get("cover").unwrap());

    //let base64=/*URL_SAFE*/BASE64_STANDARD.encode(pic.data());
    //r.insert("cover".into(),format!("data:{};base64,{}",mine_type,base64));//too long
    r
}
fn get_lyrics_by_tag(path: &Path) -> Option<String> {
    let tagged_file = Probe::open(path)
        .unwrap_or_else(|_| panic!("ERROR: Bad path provided: {:?}", path))
        .read()
        .expect("ERROR: Failed to read file!");

    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        // If the "primary" tag doesn't exist, we just grab the
        // first tag we can find. Realistically, a tag reader would likely
        // iterate through the tags to find a suitable one.
        None => tagged_file.first_tag().expect("ERROR: No tags found!"),
    };
    tag.get_string(&ItemKey::Lyrics).map(|x| x.to_owned())
}
fn get_lyrics_by_lrc_file(path: &Path) -> std::result::Result<String,std::io::Error> {
    let lrc_path = path
                .to_str()
                .unwrap()
                .rsplit_once('.')
                .unwrap()
                .0
                .to_owned()
                + ".lrc";
    fs::read_to_string(lrc_path)
}

fn get_lyrics_by_web(path:&Path)->String{
    let m=get_metadata(path.to_str().unwrap());
    let json=reqwest::blocking::get(
        format!(
            "https://lrclib.net/api/search?track_name={}&artist_name={}&album_name={}",
            m.get("title").unwrap(),
            m.get("artist").unwrap(),
            m.get("album").unwrap()
        )
    ).unwrap().text().unwrap();
    let v: Value = serde_json::from_str(json.as_str()).unwrap();
    v[0]["syncedLyrics"].to_string().replace("\\n", "\n").replace('"', "")
}
#[tauri::command]
fn get_lyrics(path: &str) -> std::result::Result<String,tauri::InvokeError> {
    let path = Path::new(&path);
    if path.exists() {
    /*TODO:可自定义歌词获取顺序 */
    Ok(get_lyrics_by_tag(path).unwrap_or_else(||{ 
        get_lyrics_by_lrc_file(path).unwrap_or_else(|_|{
            get_lyrics_by_web(path)
        })
    }))}else{
        Err("Path does not exist".into())
    }
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_metadata_of_files,
            has_changed,
            get_lyrics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
