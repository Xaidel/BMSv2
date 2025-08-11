use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::database::connection::establish_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct Resident {
    pub id: Option<i32>,
    pub prefix: String,
    pub first_name: String,
    pub middle_name: Option<String>,
    pub last_name: String,
    pub suffix: Option<String>,
    pub civil_status: String,
    pub gender: String,
    pub nationality: String,
    pub mobile_number: String,
    pub date_of_birth: String,
    pub town_of_birth: String,
    pub province_of_birth: String,
    pub zone: String,
    pub barangay: String,
    pub town: String,
    pub province: String,
    pub father_prefix: String,
    pub father_first_name: String,
    pub father_middle_name: String,
    pub father_last_name: String,
    pub father_suffix: String,
    pub mother_prefix: String,
    pub mother_first_name: String,
    pub mother_middle_name: String,
    pub mother_last_name: String,
    pub status: String,
    pub photo: Option<String>,
    pub is_registered_voter: bool,
    pub is_pwd: bool,
    pub is_senior: bool,
}

#[tauri::command]
pub fn fetch_all_residents_command() -> Result<Vec<Resident>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, prefix, first_name, middle_name, last_name, suffix, civil_status, gender, nationality,
       mobile_number, date_of_birth, town_of_birth, province_of_birth, zone, barangay, town, province,
       father_prefix, father_first_name, father_middle_name, father_last_name, father_suffix,
       mother_prefix, mother_first_name, mother_middle_name, mother_last_name, status, photo,
       is_registered_voter, is_pwd, is_senior
FROM residents"
    ).map_err(|e| e.to_string())?;

    let resident_iter = stmt
        .query_map([], |row| {
            Ok(Resident {
                id: row.get(0)?,
                prefix: row.get(1)?,
                first_name: row.get(2)?,
                middle_name: row.get(3)?,
                last_name: row.get(4)?,
                suffix: row.get(5)?,
                civil_status: row.get(6)?,
                gender: row.get(7)?,
                nationality: row.get(8)?,
                mobile_number: row.get(9)?,
                date_of_birth: row.get(10)?,
                town_of_birth: row.get(11)?,
                province_of_birth: row.get(12)?,
                zone: row.get(13)?,
                barangay: row.get(14)?,
                town: row.get(15)?,
                province: row.get(16)?,
                father_prefix: row.get(17)?,
                father_first_name: row.get(18)?,
                father_middle_name: row.get(19)?,
                father_last_name: row.get(20)?,
                father_suffix: row.get(21)?,
                mother_prefix: row.get(22)?,
                mother_first_name: row.get(23)?,
                mother_middle_name: row.get(24)?,
                mother_last_name: row.get(25)?,
                status: row.get(26)?,
                photo: row.get(27)?,
                is_registered_voter: row.get(28)?,
                is_pwd: row.get(29)?,
                is_senior: row.get(30)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut residents = Vec::new();
    for resident in resident_iter {
        residents.push(resident.map_err(|e| e.to_string())?);
    }

    Ok(residents)
}

#[tauri::command]
pub fn insert_resident_command(resident: Resident) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
    "INSERT INTO residents (
        prefix, first_name, middle_name, last_name, suffix, civil_status, gender, nationality,
        mobile_number, date_of_birth, town_of_birth, province_of_birth, zone, barangay, town, province,
        father_prefix, father_first_name, father_middle_name, father_last_name, father_suffix,
        mother_prefix, mother_first_name, mother_middle_name, mother_last_name, status, photo,
        is_registered_voter, is_pwd, is_senior
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
              ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30)",
    params![
        resident.prefix,
        resident.first_name,
        resident.middle_name,
        resident.last_name,
        resident.suffix,
        resident.civil_status,
        resident.gender,
        resident.nationality,
        resident.mobile_number,
        resident.date_of_birth,
        resident.town_of_birth,
        resident.province_of_birth,
        resident.zone,
        resident.barangay,
        resident.town,
        resident.province,
        resident.father_prefix,
        resident.father_first_name,
        resident.father_middle_name,
        resident.father_last_name,
        resident.father_suffix,
        resident.mother_prefix,
        resident.mother_first_name,
        resident.mother_middle_name,
        resident.mother_last_name,
        resident.status,
        resident.photo,
        resident.is_registered_voter,
        resident.is_pwd,
        resident.is_senior,
    ],
).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_resident_command(resident: Resident) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
    "UPDATE residents SET
        prefix = ?1, first_name = ?2, middle_name = ?3, last_name = ?4, suffix = ?5, civil_status = ?6,
        gender = ?7, nationality = ?8, mobile_number = ?9, date_of_birth = ?10, town_of_birth = ?11,
        province_of_birth = ?12, zone = ?13, barangay = ?14, town = ?15, province = ?16,
        father_prefix = ?17, father_first_name = ?18, father_middle_name = ?19, father_last_name = ?20, father_suffix = ?21,
        mother_prefix = ?22, mother_first_name = ?23, mother_middle_name = ?24, mother_last_name = ?25,
        status = ?26, photo = ?27, is_registered_voter = ?28, is_pwd = ?29, is_senior = ?30
     WHERE id = ?31",
    params![
        resident.prefix,
        resident.first_name,
        resident.middle_name,
        resident.last_name,
        resident.suffix,
        resident.civil_status,
        resident.gender,
        resident.nationality,
        resident.mobile_number,
        resident.date_of_birth,
        resident.town_of_birth,
        resident.province_of_birth,
        resident.zone,
        resident.barangay,
        resident.town,
        resident.province,
        resident.father_prefix,
        resident.father_first_name,
        resident.father_middle_name,
        resident.father_last_name,
        resident.father_suffix,
        resident.mother_prefix,
        resident.mother_first_name,
        resident.mother_middle_name,
        resident.mother_last_name,
        resident.status,
        resident.photo,
        resident.is_registered_voter,
        resident.is_pwd,
        resident.is_senior,
        resident.id
    ],
).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_resident_command(resident: Resident) -> Result<(), String> {
    if resident.id.is_some() {
        update_resident_command(resident)
    } else {
        insert_resident_command(resident)
    }
}

#[tauri::command]
pub fn delete_resident_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM residents WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
