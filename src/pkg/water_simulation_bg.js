let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const ParticleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_particle_free(ptr >>> 0));
/**
*/
export class Particle {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Particle.prototype);
        obj.__wbg_ptr = ptr;
        ParticleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParticleFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_particle_free(ptr);
    }
    /**
    * @returns {number}
    */
    get x() {
        const ret = wasm.__wbg_get_particle_x(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_particle_x(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get y() {
        const ret = wasm.__wbg_get_particle_y(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_particle_y(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @returns {Particle}
    */
    static new(x, y) {
        const ret = wasm.particle_new(x, y);
        return Particle.__wrap(ret);
    }
    /**
    * @param {number} spring_constant
    * @param {number} damping
    */
    update(spring_constant, damping) {
        wasm.particle_update(this.__wbg_ptr, spring_constant, damping);
    }
    /**
    * @param {number} mouse_x
    * @param {number} mouse_y
    */
    apply_effect(mouse_x, mouse_y) {
        wasm.particle_apply_effect(this.__wbg_ptr, mouse_x, mouse_y);
    }
}

const ParticleSystemFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_particlesystem_free(ptr >>> 0));
/**
*/
export class ParticleSystem {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParticleSystemFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_particlesystem_free(ptr);
    }
    /**
    * @param {number} num_cols
    * @param {number} num_rows
    * @param {number} grid_size
    * @param {number} spacing
    */
    constructor(num_cols, num_rows, grid_size, spacing) {
        const ret = wasm.particlesystem_new(num_cols, num_rows, grid_size, spacing);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {number} spring_constant
    * @param {number} damping
    */
    update_particles(spring_constant, damping) {
        wasm.particlesystem_update_particles(this.__wbg_ptr, spring_constant, damping);
    }
    /**
    * @returns {Float64Array}
    */
    get_particles() {
        const ret = wasm.particlesystem_get_particles(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {number} mouse_x
    * @param {number} mouse_y
    */
    apply_effect(mouse_x, mouse_y) {
        wasm.particlesystem_apply_effect(this.__wbg_ptr, mouse_x, mouse_y);
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_buffer_12d079cc21e14bdb(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_f884af06774ef276(arg0, arg1, arg2) {
    const ret = new Float64Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_5e4931c0e7b0d773(arg0) {
    const ret = new Float64Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

