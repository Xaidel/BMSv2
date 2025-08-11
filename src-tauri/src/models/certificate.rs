use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Certificate {
    pub id: i32,
    pub resident_name: String,
    pub type_: String,
    pub age: Option<i32>,
    pub civil_status: Option<String>,
    pub ownership_text: Option<String>,
    pub amount: Option<String>,
    pub issued_date: Option<String>,
}