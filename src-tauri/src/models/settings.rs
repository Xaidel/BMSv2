

use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub id: Option<i32>,
    pub barangay: String,
    pub municipality: String,
    pub province: String,
    pub phone_number: String,
    pub email: String,
    pub logo: Option<String>,
}