#[tauri::command]
pub fn settings_get() -> Result<serde_json::Value, String> {
  Ok(serde_json::json!({}))
}

#[tauri::command]
pub fn settings_update(_payload: serde_json::Value) -> Result<bool, String> {
  Ok(true)
}
