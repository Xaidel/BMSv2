use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Logbook {
    pub id: Option<i32>,
    pub official_name: String,
    pub date: String,
    pub time_in_am: Option<String>,
    pub time_out_am: Option<String>,
    pub time_in_pm: Option<String>,
    pub time_out_pm: Option<String>,
    pub remarks: Option<String>,
    pub status: Option<String>,
    pub total_hours: Option<f64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}