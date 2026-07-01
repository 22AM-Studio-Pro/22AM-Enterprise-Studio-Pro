use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::Utc;
use parking_lot::RwLock;
use std::collections::VecDeque;
use tauri::Manager;

#[derive(Clone, Serialize, Deserialize)]
pub struct JobSummary {
  pub id: String,
  pub name: String,
  pub status: String,
  pub priority: i32,
  pub retries: i32,
  pub started_at: Option<String>,
  pub finished_at: Option<String>,
}

#[derive(Clone)]
struct JobInternal {
  id: String,
  name: String,
  status: String,
  priority: i32,
  retries: i32,
  started_at: Option<String>,
  finished_at: Option<String>,
}

pub struct EngineHandle {
  queue: VecDeque<JobInternal>,
  running: Vec<JobInternal>,
  workers: usize,
}

impl EngineHandle {
  pub fn new() -> Self {
    Self {
      queue: VecDeque::new(),
      running: Vec::new(),
      workers: 0,
    }
  }

  pub fn enqueue(&mut self, name: String, priority: i32) -> JobSummary {
    let id = Uuid::new_v4().to_string();
    let job = JobInternal { id: id.clone(), name: name.clone(), status: "queued".to_string(), priority, retries: 0, started_at: None, finished_at: None };
    // insert by priority
    if priority <= 0 {
      self.queue.push_back(job);
    } else {
      let mut insert_idx = self.queue.len();
      for (i, j) in self.queue.iter().enumerate() {
        if j.priority < priority {
          insert_idx = i;
          break;
        }
      }
      self.queue.insert(insert_idx, job);
    }

    JobSummary { id, name, status: "queued".to_string(), priority, retries: 0, started_at: None, finished_at: None }
  }

  pub fn list(&self) -> Vec<JobSummary> {
    let mut out = Vec::new();
    for j in self.queue.iter() {
      out.push(JobSummary { id: j.id.clone(), name: j.name.clone(), status: j.status.clone(), priority: j.priority, retries: j.retries, started_at: j.started_at.clone(), finished_at: j.finished_at.clone() });
    }
    for j in self.running.iter() {
      out.push(JobSummary { id: j.id.clone(), name: j.name.clone(), status: j.status.clone(), priority: j.priority, retries: j.retries, started_at: j.started_at.clone(), finished_at: j.finished_at.clone() });
    }
    out
  }

  pub fn start_processing(&mut self, app_handle: &tauri::AppHandle) {
    // spawn a background thread to simulate workers
    if self.workers > 0 {
      return;
    }
    self.workers = 2;
    let queue_ptr = std::sync::Arc::new(std::sync::Mutex::new(self));
    // Note: to keep things simple and avoid complex ownership we'll emit status but not move the actual EngineHandle here.
    // In practice, a dedicated background task owning engine state would be used.
    let handle = app_handle.clone();
    std::thread::spawn(move || {
      // background loop emitting status updates
      loop {
        std::thread::sleep(std::time::Duration::from_millis(1000));
        let _ = handle.emit_all("engine:status", serde_json::json!({ "status": "running", "workers": 2, "queue_size": 0 }));
        // emit a sample log
        let _ = handle.emit_all("engine:log", serde_json::json!({ "id": uuid::Uuid::new_v4().to_string(), "timestamp": chrono::Utc::now().to_rfc3339(), "level": "info", "message": "engine heartbeat" }));
      }
    });
  }
}

#[tauri::command]
pub fn engine_status(state: tauri::State<std::sync::Arc<RwLock<EngineHandle>>>) -> Result<serde_json::Value, String> {
  let guard = state.read();
  let queue_len = guard.queue.len();
  let workers = guard.workers;
  let status = if workers > 0 { "running" } else { "stopped" };
  Ok(serde_json::json!({"status": status, "workers": workers, "queue_size": queue_len}))
}

#[tauri::command]
pub fn engine_start(state: tauri::State<std::sync::Arc<RwLock<EngineHandle>>>, app: tauri::AppHandle) -> Result<bool, String> {
  let mut guard = state.write();
  guard.start_processing(&app);
  Ok(true)
}

#[tauri::command]
pub fn engine_stop(state: tauri::State<std::sync::Arc<RwLock<EngineHandle>>>) -> Result<bool, String> {
  let mut guard = state.write();
  guard.workers = 0;
  Ok(true)
}

#[tauri::command]
pub fn engine_restart(state: tauri::State<std::sync::Arc<RwLock<EngineHandle>>>, app: tauri::AppHandle) -> Result<bool, String> {
  engine_stop(state.clone())?;
  engine_start(state, app)?;
  Ok(true)
}
