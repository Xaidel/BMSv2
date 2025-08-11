use crate::database::connection::establish_connection;
use crate::models::user::User;
use rusqlite::params;

#[tauri::command]
pub fn insert_user_command(user: User) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO users (username, password) VALUES (?1, ?2)",
        params![user.username, user.password],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn verify_user_credentials_command(username: String, password: String) -> Result<bool, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT COUNT(*) FROM users WHERE username = ?1 AND password = ?2")
        .map_err(|e| e.to_string())?;

    let count: i64 = stmt
        .query_row(params![username, password], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    Ok(count > 0)
}