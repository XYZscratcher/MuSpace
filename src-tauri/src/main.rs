// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[tauri::command]
async fn start_static_server(path:String){
    // build our application with a single route
    let app = axum::Router::new().nest("/music", axum_static::static_router(path));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
#[tauri::command]
fn get_metadata(path:&str)
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet,start_static_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
