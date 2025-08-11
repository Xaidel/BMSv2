use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Household {
    pub id: Option<i32>,
    pub household_number: i32,
    pub type_: String,
    pub members: i32,
    pub head: String,
    pub zone: String,
    pub date: String,
    pub status: String,
    pub selected_residents: Vec<String>,
}