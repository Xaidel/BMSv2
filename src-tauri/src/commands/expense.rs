use crate::database::connection::establish_connection;
use crate::models::expense::Expense;
use rusqlite::params;

#[tauri::command]
pub fn delete_expense_command(id: i32) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM expenses WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn fetch_all_expenses_command() -> Result<Vec<Expense>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, type_, amount, or_number, paid_to, paid_by, category, date FROM expenses")
        .map_err(|e| e.to_string())?;

    let expense_iter = stmt
        .query_map([], |row| {
            Ok(Expense {
                id: row.get(0)?,
                type_: row.get(1)?,
                amount: row.get(2)?,
                or_number: row.get(3)?,
                paid_to: row.get(4)?,
                paid_by: row.get(5)?,
                category: row.get(6)?,
                date: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut expenses = Vec::new();
    for expense in expense_iter {
        expenses.push(expense.map_err(|e| e.to_string())?);
    }

    Ok(expenses)
}

#[tauri::command]
pub fn insert_expense_command(expense: Expense) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO expenses (type_, amount, or_number, paid_to, paid_by, category, date)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            expense.type_,
            expense.amount,
            expense.or_number,
            expense.paid_to,
            expense.paid_by,
            expense.category,
            expense.date,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_expense_command(expense: Expense) -> Result<(), String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE expenses SET type_ = ?1, amount = ?2, or_number = ?3, paid_to = ?4, paid_by = ?5, date = ?6, category = ?7 WHERE id = ?8",
        params![
            expense.type_,
            expense.amount,
            expense.or_number,
            expense.paid_to,
            expense.paid_by,
            expense.date,
            expense.category,
            expense.id
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_expense_command(expense: Expense) -> Result<(), String> {
    if let Some(_) = expense.id {
        update_expense_command(expense)
    } else {
        insert_expense_command(expense)
    }
}