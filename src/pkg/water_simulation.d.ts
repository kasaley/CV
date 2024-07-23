/* tslint:disable */
/* eslint-disable */
/**
*/
export class Particle {
  free(): void;
/**
* @param {number} x
* @param {number} y
* @returns {Particle}
*/
  static new(x: number, y: number): Particle;
/**
* @param {number} spring_constant
* @param {number} damping
*/
  update(spring_constant: number, damping: number): void;
/**
* @param {number} mouse_x
* @param {number} mouse_y
*/
  apply_effect(mouse_x: number, mouse_y: number): void;
/**
*/
  x: number;
/**
*/
  y: number;
}
/**
*/
export class ParticleSystem {
  free(): void;
/**
* @param {number} num_cols
* @param {number} num_rows
* @param {number} grid_size
* @param {number} spacing
*/
  constructor(num_cols: number, num_rows: number, grid_size: number, spacing: number);
/**
* @param {number} spring_constant
* @param {number} damping
*/
  update_particles(spring_constant: number, damping: number): void;
/**
* @returns {Float64Array}
*/
  get_particles(): Float64Array;
/**
* @param {number} mouse_x
* @param {number} mouse_y
*/
  apply_effect(mouse_x: number, mouse_y: number): void;
}
