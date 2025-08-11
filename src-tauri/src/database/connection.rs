use dirs_next::data_local_dir;
use rusqlite::{Connection, Result};
use std::{fs, path::PathBuf};

pub fn establish_connection() -> Result<Connection> {
    let db_dir: PathBuf = data_local_dir()
        .expect("Failed to get app data dir")
        .join("BMS");
    fs::create_dir_all(&db_dir).expect("Failed to create db dir");

    let db_path = db_dir.join("bms.db");
    let conn = Connection::open(db_path)?;

    conn.pragma_update(None, "journal_mode", &"WAL")?;

    Ok(conn)
}
