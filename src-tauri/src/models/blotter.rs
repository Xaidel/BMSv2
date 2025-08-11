use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Blotter {
    pub id: Option<i32>,
    pub type_: String,
    pub reported_by: String,
    pub involved: String,
    pub incident_date: String,
    pub location: String,
    pub zone: String,
    pub status: String,
    pub narrative: String,
    pub action: String,
    pub witnesses: String,
    pub evidence: String,
    pub resolution: String,
    pub hearing_date: String,
}
