#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::engine::EngineHandle;
use std::sync::Arc;
use parking_lot::RwLock;

fn main() {
  env_logger::init();

  let engine = Arc::new(RwLock::new(EngineHandle::new()));

  tauri::Builder::default()
    .manage(engine)
    .invoke_handler(tauri::generate_handler![
      commands::engine::engine_status,
      commands::engine::engine_start,
      commands::engine::engine_stop,
      commands::engine::engine_restart,
      commands::queue::queue_list,
      commands::queue::queue_enqueue,
      commands::queue::queue_cancel,
      commands::queue::queue_pause,
      commands::queue::queue_resume,
      commands::logs::logs_tail,
      commands::scheduler::scheduler_list,
      commands::workflow::workflow_list,
      commands::plugins::plugins_list,
      commands::assets::assets_list,
      commands::settings::settings_get,
      commands::settings::settings_update
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
