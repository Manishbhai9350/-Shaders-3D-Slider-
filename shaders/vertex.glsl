varying vec2 vUv;
varying float Z;

uniform float uIntensity;
uniform float UIX;
uniform float UIY;
uniform float UFlip;

void main(){
    vUv = uv;
    vec3 pos = position;
    Z = sin(uv.x * 3.14159) * UIX  * uIntensity * UFlip;
    Z += sin(uv.y * 3.14159) * UIY * uIntensity;
    pos.z = Z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}