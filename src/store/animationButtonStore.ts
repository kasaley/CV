import { makeAutoObservable } from "mobx";

class AnimationButtonStore {
  constructor() {
    makeAutoObservable(this);
  }

  static G = 9.8; //  m/s^2
  static METR = 100; // m
  static ACCELATION_Y = 2000; // m/s
  static ACCELATION_X = 500; // m/s

  static WINDAGE = 1.12;



  startTime = 0; // ms
  v_initial_y = AnimationButtonStore.ACCELATION_Y; // m/s
  v_initial_x = AnimationButtonStore.ACCELATION_X;
  dt = 1000 / 60; // ms

  vertical = 0; // meters
  horizontal = 0; // meters

  isAnimation = false;

  jump = (vector = false) => {
    this.v_initial_y = this.v_initial_y - (AnimationButtonStore.WINDAGE * this.dt) - (AnimationButtonStore.G * this.dt);
    this.vertical += this.v_initial_y;

    this.v_initial_x = this.v_initial_x - (AnimationButtonStore.WINDAGE * this.dt);
    if (vector) {
      this.horizontal -= this.v_initial_x;
    } else  {
      this.horizontal += this.v_initial_x;
    }
  }

  tick = ({ vector = false }) => {
    if(!this.isAnimation) {
      this.startAnimation();
    }

    this.jump(vector);

    if (this.vertical <= 0) {
      this.stopAnimation();
    }
  }

  get normalizedVertical() {
    return this.vertical / AnimationButtonStore.METR;
  }

  get normalizedHorizontal() {
    return this.horizontal / AnimationButtonStore.METR;
  }

  startAnimation = () => {
    this.startTime = new Date().getTime();
    this.vertical = 0.0000000000001;
    this.isAnimation = true;
  }

  stopAnimation = () => {
    this.startTime = 0;
    this.vertical = 0;
    this.v_initial_y = AnimationButtonStore.ACCELATION_Y;
    this.v_initial_x = AnimationButtonStore.ACCELATION_X;
    this.isAnimation = false;
  }
}

const animationButtonStore = new AnimationButtonStore();
export default animationButtonStore;
