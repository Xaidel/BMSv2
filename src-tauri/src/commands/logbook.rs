use rusqlite::params;
use crate::database::connection::establish_connection;
use crate::models::logbook::Logbook;

#[tauri::command]
pub fn fetch_all_logbook_entries_command() -> Result<Vec<Logbook>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, official_name, date, time_in_am, time_out_am, time_in_pm, time_out_pm, remarks, status, total_hours, created_at, updated_at FROM logbook"
    ).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Logbook {
                id: row.get(0)?,
                official_name: row.get(1)?,
                date: row.get(2)?,
                time_in_am: row.get(3)?,
                time_out_am: row.get(4)?,
                time_in_pm: row.get(5)?,
                time_out_pm: row.get(6)?,
                remarks: row.get(7)?,
                status: row.get(8)?,
                total_hours: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry in rows {
        entries.push(entry.map_err(|e| e.to_string())?);
    }

    Ok(entries)
}

#[tauri::command]
pub fn insert_logbook_entry_command(entry: Logbook) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO logbook (
            official_name,
            date,
            time_in_am,
            time_out_am,
            time_in_pm,
            time_out_pm,
            remarks,
            status,
            total_hours
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            entry.official_name,
            entry.date,
            entry.time_in_am,
            entry.time_out_am,
            entry.time_in_pm,
            entry.time_out_pm,
            entry.remarks,
            entry.status,
            entry.total_hours
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_logbook_entry_command(entry: Logbook) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE logbook SET
            official_name = ?1,
            date = ?2,
            time_in_am = ?3,
            time_out_am = ?4,
            time_in_pm = ?5,
            time_out_pm = ?6,
            remarks = ?7,
            status = ?8,
            total_hours = ?9
         WHERE id = ?10",
        params![
            entry.official_name,
            entry.date,
            entry.time_in_am,
            entry.time_out_am,
            entry.time_in_pm,
            entry.time_out_pm,
            entry.remarks,
            entry.status,
            entry.total_hours,
            entry.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_logbook_entry_command(entry: Logbook) -> Result<(), String> {
    if let Some(id) = entry.id {
        if id > 0 {
            return update_logbook_entry_command(entry);
        }
    }
    insert_logbook_entry_command(entry)
}

#[tauri::command]
pub fn delete_logbook_entry_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM logbook WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
