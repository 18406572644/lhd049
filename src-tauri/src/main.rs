#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::api::dialog;

#[derive(Debug, Serialize, Deserialize)]
struct Project {
    id: String,
    name: String,
    category: String,
    created_at: String,
    updated_at: String,
    data: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
struct TapeAsset {
    id: String,
    name: String,
    data: String,
    width: u32,
    height: u32,
}

#[tauri::command]
fn save_project(path: String, project: Project) -> Result<String, String> {
    let json = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(path)
}

#[tauri::command]
fn load_project(path: String) -> Result<Project, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let project: Project = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(project)
}

#[tauri::command]
fn list_projects(dir_path: String) -> Result<Vec<Project>, String> {
    let mut projects = Vec::new();
    let entries = fs::read_dir(&dir_path).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(project) = serde_json::from_str::<Project>(&content) {
                    projects.push(project);
                }
            }
        }
    }
    
    projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(projects)
}

#[tauri::command]
fn save_tape(dir_path: String, tape: TapeAsset) -> Result<String, String> {
    let filename = format!("{}.json", tape.id);
    let full_path = PathBuf::from(&dir_path).join(filename);
    let json = serde_json::to_string_pretty(&tape).map_err(|e| e.to_string())?;
    fs::write(&full_path, json).map_err(|e| e.to_string())?;
    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
fn list_tapes(dir_path: String) -> Result<Vec<TapeAsset>, String> {
    let mut tapes = Vec::new();
    let entries = fs::read_dir(&dir_path).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(tape) = serde_json::from_str::<TapeAsset>(&content) {
                    tapes.push(tape);
                }
            }
        }
    }
    
    Ok(tapes)
}

#[tauri::command]
fn delete_tape(path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn export_image(path: String, data: String) -> Result<String, String> {
    let data = data.strip_prefix("data:image/png;base64,").unwrap_or(&data);
    let bytes = base64::decode(data).map_err(|e| e.to_string())?;
    fs::write(&path, bytes).map_err(|e| e.to_string())?;
    Ok(path)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_project,
            load_project,
            list_projects,
            save_tape,
            list_tapes,
            delete_tape,
            export_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
