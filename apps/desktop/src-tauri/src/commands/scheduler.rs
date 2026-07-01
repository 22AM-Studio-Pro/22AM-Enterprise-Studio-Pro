#[tauri::command]
pub fn scheduler_list() -> Result<Vec<serde_json::Value>, String> {
  Ok(vec![])
}
