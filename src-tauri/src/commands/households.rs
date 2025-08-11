#[tauri::command]
pub fn fetch_members_by_household_command(household_id: i32) -> Result<Vec<String>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT selected_residents FROM households WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let selected_residents_json: String = stmt
        .query_row(params![household_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let selected_residents: Vec<String> =
        serde_json::from_str(&selected_residents_json).map_err(|e| e.to_string())?;

    Ok(selected_residents)
}
use rusqlite::params;
use crate::database::connection::establish_connection;
use crate::models::household::Household;

#[tauri::command]
pub fn fetch_all_households_command() -> Result<Vec<Household>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, household_number, type_, members, head, zone, date, status, selected_residents FROM households"
    ).map_err(|e| e.to_string())?;

    let household_iter = stmt
        .query_map([], |row| {
            let residents_json: String = row.get(8)?;
            let selected_residents: Vec<String> = serde_json::from_str(&residents_json).unwrap_or_default();

            Ok(Household {
                id: row.get(0)?,
                household_number: row.get(1)?,
                type_: row.get(2)?,
                members: row.get(3)?,
                head: row.get(4)?,
                zone: row.get(5)?,
                date: row.get(6)?,
                status: row.get(7)?,
                selected_residents,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut households = Vec::new();
    for household in household_iter {
        households.push(household.map_err(|e| e.to_string())?);
    }

    Ok(households)
}

#[tauri::command]
pub fn insert_household_command(household: Household) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;
    let residents_json = serde_json::to_string(&household.selected_residents).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO households (
            household_number, type_, members, head, zone, date, status, selected_residents
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            household.household_number,
            household.type_,
            household.members,
            household.head,
            household.zone,
            household.date,
            household.status,
            residents_json,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_household_command(household: Household) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;
    let residents_json = serde_json::to_string(&household.selected_residents).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE households SET
            household_number = ?1,
            type_ = ?2,
            members = ?3,
            head = ?4,
            zone = ?5,
            date = ?6,
            status = ?7,
            selected_residents = ?8
         WHERE id = ?9",
        params![
            household.household_number,
            household.type_,
            household.members,
            household.head,
            household.zone,
            household.date,
            household.status,
            residents_json,
            household.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_household_command(household: Household) -> Result<(), String> {
    if household.id.is_some() {
        update_household_command(household)
    } else {
        insert_household_command(household)
    }
}

#[tauri::command]
pub fn delete_household_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM households WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}