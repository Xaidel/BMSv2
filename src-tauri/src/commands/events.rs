use rusqlite::params;
use crate::database::connection::establish_connection;
use crate::models::event::Event;

#[tauri::command]
pub fn fetch_all_events_command() -> Result<Vec<Event>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, name, type_, status, date, venue, attendee, notes FROM events"
    ).map_err(|e| e.to_string())?;

    let events_iter = stmt
        .query_map([], |row| {
            Ok(Event {
                id: row.get(0)?,
                name: row.get(1)?,
                type_: row.get(2)?,
                status: row.get(3)?,
                date: row.get(4)?,
                venue: row.get(5)?,
                attendee: row.get(6)?,
                notes: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut events = Vec::new();
    for event in events_iter {
        events.push(event.map_err(|e| e.to_string())?);
    }

    Ok(events)
}

#[tauri::command]
pub fn insert_event_command(event: Event) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO events (
            name,
            type_,
            status,
            date,
            venue,
            attendee,
            notes
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            event.name,
            event.type_,
            event.status,
            event.date,
            event.venue,
            event.attendee,
            event.notes
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_event_command(event: Event) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE events SET
            name = ?1,
            type_ = ?2,
            status = ?3,
            date = ?4,
            venue = ?5,
            attendee = ?6,
            notes = ?7
         WHERE id = ?8",
        params![
            event.name,
            event.type_,
            event.status,
            event.date,
            event.venue,
            event.attendee,
            event.notes,
            event.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_event_command(event: Event) -> Result<(), String> {
    if event.id.is_some() {
        update_event_command(event)
    } else {
        insert_event_command(event)
    }
}

#[tauri::command]
pub fn delete_event_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM events WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}