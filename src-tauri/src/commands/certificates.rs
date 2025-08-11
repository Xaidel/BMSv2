use rusqlite::params;
use crate::database::connection::establish_connection;
use crate::models::certificate::Certificate; 

#[tauri::command]
pub fn fetch_all_certificates_command() -> Result<Vec<Certificate>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, resident_name, type_, age, civil_status, ownership_text, amount, issued_date FROM certificates"
    ).map_err(|e| e.to_string())?;

    let certs_iter = stmt.query_map([], |row| {
        Ok(Certificate {
            id: row.get(0)?,
            resident_name: row.get(1)?,
            type_: row.get(2)?,
            age: row.get(3).ok(),
            civil_status: row.get(4)?,
            ownership_text: row.get(5)?,
            amount: row.get(6)?,
            issued_date: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut certs = Vec::new();
    for cert in certs_iter {
        certs.push(cert.map_err(|e| e.to_string())?);
    }

    Ok(certs)
}

#[tauri::command]
pub fn insert_certificate_command(cert: Certificate) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO certificates (
            resident_name, type_, age, civil_status, ownership_text, amount, issued_date
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            cert.resident_name,
            cert.type_,
            cert.age,
            cert.civil_status,
            cert.ownership_text,
            cert.amount,
            cert.issued_date
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_certificate_command(cert: Certificate) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE certificates SET
            resident_name = ?1,
            type_ = ?2,
            age = ?3,
            civil_status = ?4,
            ownership_text = ?5,
            amount = ?6,
            issued_date = ?7
        WHERE id = ?8",
        params![
            cert.resident_name,
            cert.type_,
            cert.age,
            cert.civil_status,
            cert.ownership_text,
            cert.amount,
            cert.issued_date,
            cert.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_certificate_command(cert: Certificate) -> Result<(), String> {
    if cert.id != 0 {
        update_certificate_command(cert)
    } else {
        insert_certificate_command(cert)
    }
}

#[tauri::command]
pub fn delete_certificate_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM certificates WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}