use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct ApiRequest {
    pub endpoit: String,
    pub payload: Option<String>,
}

#[derive(Serialize)]
pub struct ApiResponse{
    pub status: u16,
    pub body: String, 
}
