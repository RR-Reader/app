// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn test_command() -> String {
    format!("This is my test command.")
}

#[tauri::command]
fn multiple_inputs_command(input1: &str, input2: &str, input3: &str) -> String {
    format!(
        "This is my test command with multiple inputs. 1: {}, 2: {}, 3: {}",
        input1, input2, input3
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            test_command,
            multiple_inputs_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
