use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Expense {
    pub id: Option<i32>,
    pub type_: String,
    pub amount: f64,
    pub or_number: i32,
    pub paid_to: String,
    pub paid_by: String,
    pub date: String,
    pub category: String,
}