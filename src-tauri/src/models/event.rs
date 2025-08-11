use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: Option<i32>,
    pub name: String,
    pub type_: String,
    pub status: String,
    pub date: String, // use String to receive from frontend
    pub venue: String,
    pub attendee: String,
    pub notes: String,
}