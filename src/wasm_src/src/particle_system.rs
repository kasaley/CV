use js_sys::Float64Array;
use std::f64;
use wasm_bindgen::prelude::*;

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
            self.update_particle(i, spring_constant, damping);
        }

        self.update_springs(spring_constant, grid_size_spacing);
    }

    fn update_particle(&mut self, i: usize, spring_constant: f64, damping: f64) {
        let force_y = spring_constant * (self.original_y[i] - self.particles_y[i]);
        let force_x = spring_constant * (self.original_x[i] - self.particles_x[i]);
        self.particles_vy[i] += force_y;
        self.particles_vx[i] += force_x;
        self.particles_vy[i] *= 1.0 - damping;
        self.particles_vx[i] *= 1.0 - damping;
        self.particles_y[i] += self.particles_vy[i];
        self.particles_x[i] += self.particles_vx[i];
    }

    fn update_springs(&mut self, spring_constant: f64, grid_size_spacing: f64) {
        self.update_horizontal_springs(spring_constant, grid_size_spacing);
        self.update_vertical_springs(spring_constant, grid_size_spacing);
        self.update_diagonal_springs(spring_constant, grid_size_spacing);
    }

    fn update_spring(&mut self, idx1: usize, idx2: usize, spring_constant: f64, distance: f64) {
        let dx = self.particles_x[idx2] - self.particles_x[idx1];
        let dy = self.particles_y[idx2] - self.particles_y[idx1];
        let dist = (dx * dx + dy * dy).sqrt();
        let spring_force = (dist - distance) * spring_constant;
        let angle = dy.atan2(dx);

        self.particles_vx[idx1] += spring_force * angle.cos();
        self.particles_vx[idx2] -= spring_force * angle.cos();
        self.particles_vy[idx1] += spring_force * angle.sin();
        self.particles_vy[idx2] -= spring_force * angle.sin();
    }

    fn update_horizontal_springs(&mut self, spring_constant: f64, grid_size_spacing: f64) {
        for y in 0..=self.num_rows {
            for x in 0..self.num_cols {
                let idx = y * (self.num_cols + 1) + x;
                let next_idx = idx + 1;
                if next_idx < self.particles_x.len() {
                    self.update_spring(idx, next_idx, spring_constant, grid_size_spacing);
                }
            }
        }
    }

    fn update_vertical_springs(&mut self, spring_constant: f64, grid_size_spacing: f64) {
        for y in 0..self.num_rows {
            for x in 0..=self.num_cols {
                let idx = y * (self.num_cols + 1) + x;
                let next_idx = idx + (self.num_cols + 1);
                if next_idx < self.particles_x.len() {
                    self.update_spring(idx, next_idx, spring_constant, grid_size_spacing);
                }
            }
        }
    }

    fn update_diagonal_springs(&mut self, spring_constant: f64, grid_size_spacing: f64) {
        for y in 0..self.num_rows {
            for x in 0..self.num_cols {
                let idx = y * (self.num_cols + 1) + x;
                let next_idx_diagonal1 = idx + (self.num_cols + 2);
                let next_idx_diagonal2 = idx + self.num_cols;

                if next_idx_diagonal1 < self.particles_x.len() {
                    self.update_spring(
                        idx,
                        next_idx_diagonal1,
                        spring_constant,
                        grid_size_spacing * f64::consts::SQRT_2,
                    );
                }

                if next_idx_diagonal2 < self.particles_x.len() && x > 0 {
                    self.update_spring(
                        idx,
                        next_idx_diagonal2,
                        spring_constant,
                        grid_size_spacing * f64::consts::SQRT_2,
                    );
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
