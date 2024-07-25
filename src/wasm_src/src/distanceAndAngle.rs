use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Element {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl Element {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Element {
        Element { x, y }
    }

    #[wasm_bindgen]
    pub fn calculate_distance_and_angle(&self, click_x: f64, click_y: f64) -> JsValue {
        let dx = click_x - self.x;
        let dy = click_y - self.y;
        let distance = (dx * dx + dy * dy).sqrt();
        let angle = dy.atan2(dx);

        let result = js_sys::Object::new();
        js_sys::Reflect::set(&result, &"distance".into(), &distance.into()).unwrap();
        js_sys::Reflect::set(&result, &"angle".into(), &angle.into()).unwrap();

        result.into()
    }
}
