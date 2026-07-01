use tauri::Manager;

#[tauri::command]
pub fn logs_tail() -> Result<Vec<serde_json::Value>, String> {
  Ok(vec![])
}
