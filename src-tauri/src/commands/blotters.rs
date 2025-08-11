use rusqlite::params;
use crate::database::connection::establish_connection;
use crate::models::blotter::Blotter;

#[tauri::command]
pub fn fetch_all_blotters_command() -> Result<Vec<Blotter>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, type_, reported_by, involved, incident_date, location, zone, status, narrative, action, witnesses, evidence, resolution, hearing_date FROM blotters"
    ).map_err(|e| e.to_string())?;

    let blotters_iter = stmt
        .query_map([], |row| {
            Ok(Blotter {
                id: row.get(0)?,
                type_: row.get(1)?,
                reported_by: row.get(2)?,
                involved: row.get(3)?,
                incident_date: row.get(4)?,
                location: row.get(5)?,
                zone: row.get(6)?,
                status: row.get(7)?,
                narrative: row.get(8)?,
                action: row.get(9)?,
                witnesses: row.get(10)?,
                evidence: row.get(11)?,
                resolution: row.get(12)?,
                hearing_date: row.get(13)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut blotters = Vec::new();
    for blotter in blotters_iter {
        blotters.push(blotter.map_err(|e| e.to_string())?);
    }

    Ok(blotters)
}

#[tauri::command]
pub fn insert_blotter_command(blotter: Blotter) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO blotters (
            type_,
            reported_by,
            involved,
            incident_date,
            location,
            zone,
            status,
            narrative,
            action,
            witnesses,
            evidence,
            resolution,
            hearing_date
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
        params![
            blotter.type_,
            blotter.reported_by,
            blotter.involved,
            blotter.incident_date,
            blotter.location,
            blotter.zone,
            blotter.status,
            blotter.narrative,
            blotter.action,
            blotter.witnesses,
            blotter.evidence,
            blotter.resolution,
            blotter.hearing_date
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_blotter_command(blotter: Blotter) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE blotters SET
            type_ = ?1,
            reported_by = ?2,
            involved = ?3,
            incident_date = ?4,
            location = ?5,
            zone = ?6,
            status = ?7,
            narrative = ?8,
            action = ?9,
            witnesses = ?10,
            evidence = ?11,
            resolution = ?12,
            hearing_date = ?13
         WHERE id = ?14",
        params![
            blotter.type_,
            blotter.reported_by,
            blotter.involved,
            blotter.incident_date,
            blotter.location,
            blotter.zone,
            blotter.status,
            blotter.narrative,
            blotter.action,
            blotter.witnesses,
            blotter.evidence,
            blotter.resolution,
            blotter.hearing_date,
            blotter.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_blotter_command(blotter: Blotter) -> Result<(), String> {
    if blotter.id.is_some() {
        update_blotter_command(blotter)
    } else {
        insert_blotter_command(blotter)
    }
}

#[tauri::command]
pub fn delete_blotter_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM blotters WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
