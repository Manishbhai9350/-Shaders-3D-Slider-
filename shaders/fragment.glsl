varying vec2 vUv;
varying float Z;

uniform sampler2D T1;
uniform sampler2D T2;

uniform float UPosition;


void main(){    
    float NormalPos = fract(UPosition);
    vec2 CurrentUV = vec2(vUv.x,mod(vUv.y - NormalPos,1.0));
    vec2 NextUV = vec2(vUv.x,mod(vUv.y - NormalPos + 1.0,1.0));
    if(vUv.y < NormalPos){
    gl_FragColor = texture2D(T1,vec2(1.0)-CurrentUV);
    } else {
    gl_FragColor = texture2D(T2,vec2(1.0)-NextUV);
    }
}