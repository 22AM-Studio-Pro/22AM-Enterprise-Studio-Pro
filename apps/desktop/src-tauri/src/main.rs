use tauri::generate_handler;
mod commands;

fn main() {
  tauri::Builder::default()
    .invoke_handler(generate_handler![
      commands::plugins::plugins_list,
      commands::plugins::plugin_details,
      commands::plugins::plugin_install,
      commands::plugins::plugin_remove,
      commands::plugins::plugin_enable,
      commands::plugins::plugin_disable,
      commands::plugins::plugin_reload,
      commands::plugins::plugin_logs
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
