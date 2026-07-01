use crate::commands::engine::JobSummary;
use serde::{Serialize, Deserialize};
use tauri::Manager;

#[tauri::command]
pub fn queue_list(state: tauri::State<std::sync::Arc<parking_lot::RwLock<crate::commands::engine::EngineHandle>>>) -> Result<Vec<JobSummary>, String> {
  let guard = state.read();
  Ok(guard.list())
}

#[tauri::command]
pub fn queue_enqueue(state: tauri::State<std::sync::Arc<parking_lot::RwLock<crate::commands::engine::EngineHandle>>>, name: String, priority: Option<i32>) -> Result<JobSummary, String> {
  let mut guard = state.write();
  let p = priority.unwrap_or(0);
  let j = guard.enqueue(name, p);
  Ok(j)
}

#[tauri::command]
pub fn queue_cancel(_id: String) -> Result<bool, String> {
  Ok(true)
}

#[tauri::command]
pub fn queue_pause(_id: String) -> Result<bool, String> {
  Ok(true)
}

#[tauri::command]
pub fn queue_resume(_id: String) -> Result<bool, String> {
  Ok(true)
}
