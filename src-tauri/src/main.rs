// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
//use audiotags::Picture;
use tauri::api::path::data_dir;

use lofty::prelude::*;
use lofty::probe::Probe;
//use lofty::picture::Picture;
use base64::prelude::*;
use base64::{engine::general_purpose::URL_SAFE, Engine as _};
use chrono::prelude::*;
use lofty::picture::MimeType;

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
                path
                    .file_name()
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
    let pic = pic[0].clone();
    let pic_type = match pic.mime_type() {
        Some(MimeType::Jpeg) => "jpg",
        Some(MimeType::Png) => "png",
        Some(MimeType::Bmp) => "bmp",
        Some(MimeType::Unknown(a)) => a,
        _ => unimplemented!(),
    };
    let mut tp =std::path::PathBuf::new();
    if a.is_some() {
        tp=data_dir().unwrap().join(a.unwrap().replace('?', "").to_string()+"."+pic_type);
        let mut p=fs::File::create(&tp).unwrap_or_else(|_|panic!("{:?}",tp));
        p.write_all(pic.data()).unwrap();
    }
    r.insert("cover".into(), format!("{:?}",tp).replace('"', ""));
    //let base64=/*URL_SAFE*/BASE64_STANDARD.encode(pic.data());
    //r.insert("cover".into(),format!("data:{};base64,{}",mine_type,base64));//too long
    r
}
#[tauri::command]
fn get_lyrics(path: &str) -> String {
    let path = Path::new(&path);
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
    tag.get_string(&ItemKey::Lyrics).unwrap_or("None").into()
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_metadata,
            has_changed,
            get_lyrics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
