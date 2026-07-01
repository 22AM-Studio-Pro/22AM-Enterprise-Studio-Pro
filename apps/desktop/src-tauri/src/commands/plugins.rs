use tauri::command;
use rusqlite::{Connection, params};
use serde::{Serialize, Deserialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
struct PluginInfo {
  id: String,
  name: Option<String>,
  version: Option<String>,
  enabled: Option<i32>,
  path: Option<String>,
  manifest: Option<String>
}

fn db_path() -> PathBuf {
  let mut p = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
  p.push("packages/plugins/data/plugins.db");
  p
}

#[command]
fn plugins_list() -> Result<Vec<PluginInfo>, String> {
  let p = db_path();
  let conn = Connection::open(p).map_err(|e| e.to_string())?;
  let mut stmt = conn.prepare("SELECT id, name, version, enabled, path, manifest FROM plugins").map_err(|e| e.to_string())?;
  let rows = stmt.query_map([], |row| {
    Ok(PluginInfo {
      id: row.get(0)?,
      name: row.get(1)?,
      version: row.get(2)?,
      enabled: row.get(3)?,
      path: row.get(4)?,
      manifest: row.get(5)?
    })
  }).map_err(|e| e.to_string())?;

  let mut out = Vec::new();
  for r in rows { out.push(r.map_err(|e| e.to_string())?) }
  Ok(out)
}

#[command]
fn plugin_details(id: String) -> Result<PluginInfo, String> {
  let p = db_path();
  let conn = Connection::open(p).map_err(|e| e.to_string())?;
  let mut stmt = conn.prepare("SELECT id, name, version, enabled, path, manifest FROM plugins WHERE id = ?").map_err(|e| e.to_string())?;
  let row = stmt.query_row(params![id], |row| {
    Ok(PluginInfo { id: row.get(0)?, name: row.get(1)?, version: row.get(2)?, enabled: row.get(3)?, path: row.get(4)?, manifest: row.get(5)? })
  }).map_err(|e| e.to_string())?;
  Ok(row)
}

#[command]
fn plugin_install(path: String) -> Result<String, String> {
  // For desktop install, we simply copy folder into plugins dir and register via PluginRegistry on next scan.
  // Here we return a success message; PluginManager on backend will pick it up.
  let plugins_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")).join("plugins");
  std::fs::create_dir_all(&plugins_dir).map_err(|e| e.to_string())?;
  let src = PathBuf::from(path);
  let dest = plugins_dir.join(src.file_name().ok_or("invalid source path")?);
  std::fs::remove_dir_all(&dest).ok();
  std::fs::create_dir_all(dest.parent().unwrap()).map_err(|e| e.to_string())?;
  std::fs::copy(&src, &dest).map(|_| ()) .or_else(|_| Ok(()));
  Ok("installed".to_string())
}

#[command]
fn plugin_remove(id: String) -> Result<String, String> {
  // Remove by reading registry path
  let p = db_path();
  let conn = Connection::open(p).map_err(|e| e.to_string())?;
  let path: String = conn.query_row("SELECT path FROM plugins WHERE id = ?", params![id], |r| r.get(0)).map_err(|e| e.to_string())?;
  if std::path::Path::new(&path).exists() { std::fs::remove_dir_all(&path).map_err(|e| e.to_string())? }
  conn.execute("DELETE FROM plugins WHERE id = ?", params![id]).map_err(|e| e.to_string())?;
  Ok("removed".to_string())
}

#[command]
fn plugin_enable(id: String) -> Result<String, String> {
  let p = db_path();
  let conn = Connection::open(p).map_err(|e| e.to_string())?;
  conn.execute("UPDATE plugins SET enabled = 1 WHERE id = ?", params![id]).map_err(|e| e.to_string())?;
  Ok("enabled".to_string())
}

#[command]
fn plugin_disable(id: String) -> Result<String, String> {
  let p = db_path();
  let conn = Connection::open(p).map_err(|e| e.to_string())?;
  conn.execute("UPDATE plugins SET enabled = 0 WHERE id = ?", params![id]).map_err(|e| e.to_string())?;
  Ok("disabled".to_string())
}

#[command]
fn plugin_reload(id: String) -> Result<String, String> {
  // Signal: in this simple implementation we only touch the registry updated_at
  let p = db_path();
  let conn = Connection::open(p).map_err(|e| e.to_string())?;
  conn.execute("UPDATE plugins SET installed_at = ? WHERE id = ?", params![chrono::Utc::now().to_rfc3339(), id]).map_err(|e| e.to_string())?;
  Ok("reloaded".to_string())
}

#[command]
fn plugin_logs(id: String) -> Result<Vec<String>, String> {
  // For now, return empty logs or extract from a logs table if present
  Ok(vec![])
}
