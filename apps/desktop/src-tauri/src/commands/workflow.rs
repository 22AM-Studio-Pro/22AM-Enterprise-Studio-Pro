#[tauri::command]
pub fn workflow_list() -> Result<Vec<serde_json::Value>, String> {
  Ok(vec![])
}
