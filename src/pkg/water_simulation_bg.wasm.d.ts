/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_particle_free(a: number): void;
export function __wbg_get_particle_x(a: number): number;
export function __wbg_set_particle_x(a: number, b: number): void;
export function __wbg_get_particle_y(a: number): number;
export function __wbg_set_particle_y(a: number, b: number): void;
export function particle_new(a: number, b: number): number;
export function particle_update(a: number, b: number, c: number): void;
export function particle_apply_effect(a: number, b: number, c: number): void;
export function __wbg_particlesystem_free(a: number): void;
export function particlesystem_new(a: number, b: number, c: number, d: number): number;
export function particlesystem_update_particles(a: number, b: number, c: number): void;
export function particlesystem_get_particles(a: number): number;
export function particlesystem_apply_effect(a: number, b: number, c: number): void;
