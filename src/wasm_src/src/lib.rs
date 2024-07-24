use js_sys::Float64Array;
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

#[wasm_bindgen]
pub struct ParticleSystem {
    particles_x: Vec<f64>,
    particles_y: Vec<f64>,
    particles_vx: Vec<f64>,
    particles_vy: Vec<f64>,
    original_x: Vec<f64>,
    original_y: Vec<f64>,
    num_cols: usize,
    num_rows: usize,
    grid_size: f64,
    spacing: f64,
}

#[wasm_bindgen]
impl ParticleSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(num_cols: usize, num_rows: usize, grid_size: f64, spacing: f64) -> ParticleSystem {
        let num_particles = (num_cols + 1) * (num_rows + 1);
        let mut particles_x = Vec::with_capacity(num_particles);
        let mut particles_y = Vec::with_capacity(num_particles);
        let mut particles_vx = Vec::with_capacity(num_particles);
        let mut particles_vy = Vec::with_capacity(num_particles);
        let mut original_x = Vec::with_capacity(num_particles);
        let mut original_y = Vec::with_capacity(num_particles);

        for y in 0..=num_rows {
            for x in 0..=num_cols {
                let px = x as f64 * grid_size * spacing;
                let py = y as f64 * grid_size * spacing;
                particles_x.push(px);
                particles_y.push(py);
                particles_vx.push(0.0);
                particles_vy.push(0.0);
                original_x.push(px);
                original_y.push(py);
            }
        }

        ParticleSystem {
            particles_x,
            particles_y,
            particles_vx,
            particles_vy,
            original_x,
            original_y,
            num_cols,
            num_rows,
            grid_size,
            spacing,
        }
    }

    pub fn update_particles(&mut self, spring_constant: f64, damping: f64) {
        let grid_size_spacing = self.grid_size * self.spacing;

        for i in 0..self.particles_x.len() {
            let force_y = spring_constant * (self.original_y[i] - self.particles_y[i]);
            let force_x = spring_constant * (self.original_x[i] - self.particles_x[i]);
            self.particles_vy[i] += force_y;
            self.particles_vx[i] += force_x;
            self.particles_vy[i] *= 1.0 - damping;
            self.particles_vx[i] *= 1.0 - damping;
            self.particles_y[i] += self.particles_vy[i];
            self.particles_x[i] += self.particles_vx[i];
        }

        // Обновление горизонтальных пружин
        for y in 0..=self.num_rows {
            for x in 0..self.num_cols {
                let idx = y * (self.num_cols + 1) + x;
                let next_idx = idx + 1;
                if next_idx < self.particles_x.len() {
                    let dx = self.particles_x[next_idx] - self.particles_x[idx];
                    let dy = self.particles_y[next_idx] - self.particles_y[idx];
                    let distance = (dx * dx + dy * dy).sqrt();
                    let spring_force = (distance - grid_size_spacing) * spring_constant;
                    let angle = dy.atan2(dx);

                    self.particles_vx[idx] += spring_force * angle.cos();
                    self.particles_vx[next_idx] -= spring_force * angle.cos();
                    self.particles_vy[idx] += spring_force * angle.sin();
                    self.particles_vy[next_idx] -= spring_force * angle.sin();
                }
            }
        }

        // Обновление вертикальных пружин
        for y in 0..self.num_rows {
            for x in 0..=self.num_cols {
                let idx = y * (self.num_cols + 1) + x;
                let next_idx = idx + (self.num_cols + 1);
                if next_idx < self.particles_x.len() {
                    let dx = self.particles_x[next_idx] - self.particles_x[idx];
                    let dy = self.particles_y[next_idx] - self.particles_y[idx];
                    let distance = (dx * dx + dy * dy).sqrt();
                    let spring_force = (distance - grid_size_spacing) * spring_constant;
                    let angle = dy.atan2(dx);

                    self.particles_vx[idx] += spring_force * angle.cos();
                    self.particles_vx[next_idx] -= spring_force * angle.cos();
                    self.particles_vy[idx] += spring_force * angle.sin();
                    self.particles_vy[next_idx] -= spring_force * angle.sin();
                }
            }
        }

        // Обновление диагональных пружин
        for y in 0..self.num_rows {
            for x in 0..self.num_cols {
                let idx = y * (self.num_cols + 1) + x;
                let next_idx_diagonal1 = idx + (self.num_cols + 2);
                let next_idx_diagonal2 = idx + self.num_cols;

                // Пружины по диагонали вниз вправо
                if next_idx_diagonal1 < self.particles_x.len() {
                    let dx = self.particles_x[next_idx_diagonal1] - self.particles_x[idx];
                    let dy = self.particles_y[next_idx_diagonal1] - self.particles_y[idx];
                    let distance = (dx * dx + dy * dy).sqrt();
                    let spring_force =
                        (distance - grid_size_spacing * f64::consts::SQRT_2) * spring_constant;
                    let angle = dy.atan2(dx);

                    self.particles_vx[idx] += spring_force * angle.cos();
                    self.particles_vx[next_idx_diagonal1] -= spring_force * angle.cos();
                    self.particles_vy[idx] += spring_force * angle.sin();
                    self.particles_vy[next_idx_diagonal1] -= spring_force * angle.sin();
                }

                // Пружины по диагонали вниз влево
                if next_idx_diagonal2 < self.particles_x.len() && x > 0 {
                    let dx = self.particles_x[next_idx_diagonal2] - self.particles_x[idx];
                    let dy = self.particles_y[next_idx_diagonal2] - self.particles_y[idx];
                    let distance = (dx * dx + dy * dy).sqrt();
                    let spring_force =
                        (distance - grid_size_spacing * f64::consts::SQRT_2) * spring_constant;
                    let angle = dy.atan2(dx);

                    self.particles_vx[idx] += spring_force * angle.cos();
                    self.particles_vx[next_idx_diagonal2] -= spring_force * angle.cos();
                    self.particles_vy[idx] += spring_force * angle.sin();
                    self.particles_vy[next_idx_diagonal2] -= spring_force * angle.sin();
                }
            }
        }
    }

    pub fn get_particles(&self) -> Float64Array {
        let mut data = Vec::with_capacity(self.particles_x.len() * 6);
        for i in 0..self.particles_x.len() {
            data.push(self.particles_x[i]);
            data.push(self.particles_y[i]);
            data.push(self.particles_vx[i]);
            data.push(self.particles_vy[i]);
            data.push(self.original_x[i]);
            data.push(self.original_y[i]);
        }
        Float64Array::from(&data[..])
    }

    pub fn apply_effect(&mut self, mouse_x: f64, mouse_y: f64) {
        for i in 0..self.particles_x.len() {
            let dx = self.particles_x[i] - mouse_x;
            let dy = self.particles_y[i] - mouse_y;
            let distance = (dx * dx + dy * dy).sqrt();
            if distance < 100.0 {
                let effect = 5.0 * (100.0 - distance) / 100.0;
                self.particles_vx[i] += effect * (dx / distance);
                self.particles_vy[i] += effect * (dy / distance);
            }
        }
    }
}
