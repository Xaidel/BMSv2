use crate::database::connection::establish_connection;
use crate::models::official::Official;
use rusqlite::params;

#[tauri::command]
pub fn fetch_all_officials_command() -> Result<Vec<Official>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, role, image, section, age, contact, term_start, term_end, zone 
             FROM officials",
        )
        .map_err(|e| e.to_string())?;

    let official_iter = stmt
        .query_map([], |row| {
            Ok(Official {
                id: row.get(0)?,
                name: row.get(1)?,
                role: row.get(2)?,
                image: row.get(3)?,
                section: row.get(4)?,
                age: row.get(5)?,
                contact: row.get(6)?,
                term_start: row.get(7)?,
                term_end: row.get(8)?,
                zone: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut officials = Vec::new();
    for official in official_iter {
        officials.push(official.map_err(|e| e.to_string())?);
    }

    Ok(officials)
}

#[tauri::command]
pub fn insert_official_command(official: Official) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO officials (name, role, image, section, age, contact, term_start, term_end, zone)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            official.name,
            official.role,
            official.image,
            official.section,
            official.age,
            official.contact,
            official.term_start,
            official.term_end,
            official.zone
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_official_command(official: Official) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE officials SET name = ?1, role = ?2, image = ?3, section = ?4, age = ?5, contact = ?6, term_start = ?7, term_end = ?8, zone = ?9 WHERE id = ?10",
        params![
            official.name,
            official.role,
            official.image,
            official.section,
            official.age,
            official.contact,
            official.term_start,
            official.term_end,
            official.zone,
            official.id,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_official_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM officials WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}