#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct Income {
    pub id: Option<i32>,
    pub type_: String,
    pub amount: f64,
    pub or_number: i32,
    pub received_from: String,
    pub received_by: String,
    pub category: String,
    pub date: String, // Stored as ISO 8601 string (e.g., "2025-07-21")
}