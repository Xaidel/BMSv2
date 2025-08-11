use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct User {
    pub id: u16,
    pub username: String,
    pub password: String,
}
