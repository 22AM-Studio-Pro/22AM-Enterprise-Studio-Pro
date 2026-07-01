#[tauri::command]
pub fn plugins_list() -> Result<Vec<serde_json::Value>, String> {
  Ok(vec![])
}
