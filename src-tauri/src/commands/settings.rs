use crate::database::connection::establish_connection;
use crate::models::settings::Settings;
use rusqlite::params;

#[tauri::command]
pub fn fetch_settings_command() -> Result<Settings, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    // Try fetching the settings
    let mut stmt = conn
        .prepare("SELECT id, barangay, municipality, province, phone_number, email, logo FROM settings WHERE id = 1")
        .map_err(|e| e.to_string())?;

    let result = stmt.query_row([], |row| {
        Ok(Settings {
            id: row.get(0)?,
            barangay: row.get(1)?,
            municipality: row.get(2)?,
            province: row.get(3)?,
            phone_number: row.get(4)?,
            email: row.get(5)?,
            logo: row.get(6)?,
        })
    });

    // If row is not found, insert default
    match result {
        Ok(settings) => Ok(settings),
        Err(_) => {
            conn.execute(
                "INSERT INTO settings (id, barangay, municipality, province, phone_number, email, logo) VALUES (1, '', '', '', '', '', '')",
                [],
            ).map_err(|e| e.to_string())?;

            Ok(Settings {
                id: Some(1),
                barangay: "".to_string(),
                municipality: "".to_string(),
                province: "".to_string(),
                phone_number: "".to_string(),
                email: "".to_string(),
                logo: Some("".to_string()),
            })
        }
    }
}

#[tauri::command]
pub fn save_settings_command(settings: Settings) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    if settings.id.is_some() {
        conn.execute(
            "UPDATE settings SET barangay = ?1, municipality = ?2, province = ?3, phone_number = ?4, email = ?5, logo = ?6 WHERE id = ?7",
            params![
                settings.barangay,
                settings.municipality,
                settings.province,
                settings.phone_number,
                settings.email,
                settings.logo,
                settings.id
            ],
        )
        .map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "INSERT INTO settings (barangay, municipality, province, phone_number, email, logo) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                settings.barangay,
                settings.municipality,
                settings.province,
                settings.phone_number,
                settings.email,
                settings.logo
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn fetch_logo_command() -> Result<Option<String>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT logo FROM settings WHERE id = 1")
        .map_err(|e| e.to_string())?;

    let logo_result: Result<Option<String>, _> = stmt.query_row([], |row| row.get(0));

    logo_result.map_err(|e| e.to_string())
}
