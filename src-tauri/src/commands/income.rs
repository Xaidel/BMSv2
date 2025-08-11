use crate::database::connection::establish_connection;
use rusqlite::params;
use crate::models::income::Income;

#[tauri::command]
pub fn delete_income_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM incomes WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}


#[tauri::command]
pub fn fetch_all_incomes_command() -> Result<Vec<Income>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, type_, amount, or_number, received_from, received_by, category, date FROM incomes")
        .map_err(|e| e.to_string())?;

    let income_iter = stmt
        .query_map([], |row| {
            Ok(Income {
                id: row.get(0)?,
                type_: row.get(1)?,
                amount: row.get(2)?,
                or_number: row.get(3)?,
                received_from: row.get(4)?,
                received_by: row.get(5)?,
                category: row.get(6)?,
                date: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut incomes = Vec::new();
    for income in income_iter {
        incomes.push(income.map_err(|e| e.to_string())?);
    }

    Ok(incomes)
}

#[tauri::command]
pub fn insert_income_command(income: Income) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO incomes (type_, amount, or_number, received_from, received_by, category, date)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            income.type_,
            income.amount,
            income.or_number,
            income.received_from,
            income.received_by,
            income.category,
            income.date,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_income_command(income: Income) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE incomes SET type_ = ?1, amount = ?2, or_number = ?3, received_from = ?4, received_by = ?5, date = ?6, category = ?7 WHERE id = ?8",
        rusqlite::params![
            income.type_,
            income.amount,
            income.or_number,
            income.received_from,
            income.received_by,
            income.date,
            income.category,
            income.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_income_command(income: Income) -> Result<(), String> {
    if let Some(_) = income.id {
        update_income_command(income)
    } else {
        insert_income_command(income)
    }
}