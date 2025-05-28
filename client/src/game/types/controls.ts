
export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  place: boolean;
  cancel: boolean;
  up: boolean;
  down: boolean;
}

// Controls enum for keyboard mapping
export enum ControlsEnum {
  forward = "forward",
  backward = "backward", 
  leftward = "leftward",
  rightward = "rightward",
  zoomIn = "zoomIn",
  zoomOut = "zoomOut",
  rotateCW = "rotateCW",
  rotateCCW = "rotateCCW",
  place = "place",
  cancel = "cancel",
  pauseTime = "pauseTime",
  increaseTimeSpeed = "increaseTimeSpeed",
  decreaseTimeSpeed = "decreaseTimeSpeed"
}
