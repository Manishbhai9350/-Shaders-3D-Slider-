import "./style.css";
import { Data } from "./data.js";
import * as Three from "three";
import { circularLerp,lerp, SceneBounds } from "./util.js";
import { TextureLoader } from "three";
import { GUI } from "lil-gui";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";

console.clear();

const canvas = document.querySelector("canvas");

const Images = [];
let Loaded = 0;

let w = innerWidth;
let h = innerHeight;

canvas.width = w;
canvas.height = h;

const scene = new Three.Scene();

const camera = new Three.PerspectiveCamera(75, w / h, 1, 1000);
camera.position.z = 5;
scene.add(camera);

const renderer = new Three.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(w, h);

// ?? Lights

const Light1 = new Three.AmbientLight(0xffffff, 0.3);
const Light2 = new Three.DirectionalLight(0xffffff, 2);
Light2.position.set(0, 0, 5);

scene.add(Light1, Light2);

// ?? Light Setup Complete

const Loader = new TextureLoader();

let Textures = Data.map((t) => Loader.load(t));


let Position = 0;
let TargetPosition = 0;
let PositionEase = 0.1;
let MaxPosition = Textures.length
let PositionIncreamentFactor = .003

let Intensity = 0;
let TargetIntensity = 0;
let IntensityEase = 0.07;
let MaxInstensity = 1;
let IntensityIncreamentFactor = .03
let TouchIntensityIncreamentFactor = .08


let CurrentTexture = 0;
let NextTexture = 1;

let ScaleEase = 0.1;
let TargetScale = 1;
let Scale = 1;
let SMin = 0.97;
let SMax = 1.03;

const PlaneMaterial = new Three.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: Loader.load(Data[0].img) },
    uIntensity: { value: 0 },
    UIX: { value: 0.4 },
    UIY: { value: 0.6 },
    UFlip: { check: false, value: 1.0 },
    T1: { value: Textures[NextTexture] },
    T2: { value: Textures[CurrentTexture] },
    UPosition: { value: 0 },
  },
});

const { width } = SceneBounds(scene, camera, renderer, Three);
let PlaneWidth = innerWidth > 750 ? width * 2 : width * 3;
let PlaneHeight = PlaneWidth * (9 / 16);
const Plane = new Three.Mesh(
  new Three.PlaneGeometry(PlaneWidth, PlaneHeight, 40, 40),
  PlaneMaterial
);

scene.add(Plane);

const CalculatedEases = () => {
  Plane.geometry.scale.x = Plane.geometry.scale.y = Plane.geometry.scale.z = Scale = lerp(Scale,TargetScale,ScaleEase) 
  PlaneMaterial.uniforms.uIntensity.value = Intensity = lerp(Intensity,TargetIntensity,IntensityEase);
  PlaneMaterial.uniforms.UPosition.value = Position = circularLerp(
    Position,
    TargetPosition,
    PositionEase,
    Textures.length
  );
  [CurrentTexture,NextTexture] = GetTextureIndices(Position)
  PlaneMaterial.uniforms.T2.value = Textures[CurrentTexture];
  PlaneMaterial.uniforms.T1.value = Textures[NextTexture];
};

function Render() {
  CalculatedEases();
  Plane.scale.x = Plane.scale.y = Plane.scale.z = Scale;
  renderer.render(scene, camera);
  requestAnimationFrame(Render);
}
requestAnimationFrame(Render);



function GetTextureIndices(position){
  const BaseIdx = Math.floor(position) % Textures.length
  const NextIdx = (BaseIdx + 1) % Textures.length
  return [BaseIdx,NextIdx]
}


let WheelId = null;
let SnapId = null;

const Wheel = (e) => {
  PositionEase = 0.2;
  IntensityEase = .07
  clearTimeout(WheelId);
  clearTimeout(SnapId);
  e.preventDefault();
  TargetIntensity = e.deltaY * IntensityIncreamentFactor;
  TargetIntensity = Math.max(-MaxInstensity,Math.min(TargetIntensity,MaxInstensity))
  TargetPosition -= e.deltaY * PositionIncreamentFactor
  TargetPosition = Math.max(0,Math.min(TargetPosition,MaxPosition))
  TargetScale = 1 + (e.deltaY * .01)
  TargetScale = Math.max(SMin,Math.min(TargetScale,SMax))
  if(TargetPosition <= 0) {
    TargetPosition = MaxPosition
  } else if(TargetPosition >= MaxPosition) {
    TargetPosition = 0
  }

  
  WheelId = setTimeout(() => {
    TargetIntensity = 0
    IntensityEase = .05
    TargetScale = 1
  }, 30);
  SnapId = setTimeout(() => {
    PositionEase = 0.07;
    TargetPosition = Math.round(Position);
  }, 1000);
};

let touchStartY = 0;

const onTouchStart = (e) => {
  if (e.touches.length === 1) {
    touchStartY = e.touches[0].clientY;
  }
};

const onTouchMove = (e) => {
  if (e.touches.length !== 1) return;

  const touchEndY = e.touches[0].clientY;
  const deltaY = touchStartY - touchEndY;

  // Call similar logic to Wheel
  PositionEase = 0.2;
  IntensityEase = .07;

  clearTimeout(WheelId);
  clearTimeout(SnapId);

  TargetIntensity = deltaY * TouchIntensityIncreamentFactor;
  TargetIntensity = Math.max(-MaxInstensity, Math.min(TargetIntensity, MaxInstensity));
  TargetPosition -= deltaY * PositionIncreamentFactor;

  // Wrap-around behavior (circular scroll)
  if (TargetPosition <= 0) {
    TargetPosition = MaxPosition;
  } else if (TargetPosition >= MaxPosition) {
    TargetPosition = 0;
  }

  WheelId = setTimeout(() => {
    TargetIntensity = 0;
    IntensityEase = .05;
    TargetScale = 1
  }, 30);

  SnapId = setTimeout(() => {
    PositionEase = 0.07;
    TargetPosition = Math.round(Position);
  }, 1000);

  // Update touch start for smooth consecutive movement
  touchStartY = touchEndY;
};


const Resize = () => {
  w = innerWidth;
  h = innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  Plane.geometry.dispose();
  const { width } = SceneBounds(scene, camera, renderer, Three);
  let PlaneWidth = innerWidth > 750 ? width * 2 : width * 3;
  let PlaneHeight = PlaneWidth * (9 / 16);
  Plane.geometry = new Three.PlaneGeometry(PlaneWidth,PlaneHeight,40,40);
};

window.addEventListener('touchstart', onTouchStart, { passive: false });
window.addEventListener('touchmove', onTouchMove, { passive: false });
window.addEventListener("resize", Resize);
window.addEventListener("wheel", Wheel, { passive: false });
