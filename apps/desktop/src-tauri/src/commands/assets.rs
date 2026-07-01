#[tauri::command]
pub fn assets_list() -> Result<Vec<serde_json::Value>, String> {
  Ok(vec![])
}
