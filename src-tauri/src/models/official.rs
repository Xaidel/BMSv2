use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Official {
    pub id: Option<i32>,
    pub name: String,
    pub role: String,
    pub age: Option<i32>,
    pub contact: String,
    pub term_start: String,
    pub term_end: String,
    pub zone: String,
    pub image: Option<String>,
    pub section: String,
}