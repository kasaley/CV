use std::f64;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Particle {
    pub x: f64,
    pub y: f64,
    vx: f64,
    vy: f64,
    original_x: f64,
    original_y: f64,
}

#[wasm_bindgen]
impl Particle {
    pub fn new(x: f64, y: f64) -> Particle {
        Particle {
            x,
            y,
            vx: 0.0,
            vy: 0.0,
            original_x: x,
            original_y: y,
        }
    }

    pub fn update(&mut self, spring_constant: f64, damping: f64) {
        let force_y = spring_constant * (self.original_y - self.y);
        let force_x = spring_constant * (self.original_x - self.x);
        self.vy += force_y;
        self.vx += force_x;
        self.vy *= 1.0 - damping;
        self.vx *= 1.0 - damping;
        self.y += self.vy;
        self.x += self.vx;
    }

    pub fn apply_effect(&mut self, mouse_x: f64, mouse_y: f64) {
        let dx = self.x - mouse_x;
        let dy = self.y - mouse_y;
        let distance = (dx * dx + dy * dy).sqrt();
        if distance < 100.0 {
            let effect = 5.0 * (100.0 - distance) / 100.0;
            self.vx += effect * (dx / distance);
            self.vy += effect * (dy / distance);
        }
    }
}
