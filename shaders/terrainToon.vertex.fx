#version 300 es
precision highp float;

uniform vec3 terrainColors[17];

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec2 uv2;
in vec4 color;

uniform mat4 worldViewProjection;
uniform mat4 world;
uniform vec3 lightInvDirW;

out vec3 vPositionL;
out vec3 vPositionW;
out vec3 vNormalW;
out vec2 vUv;
out vec2 vUv2;
out vec4 vColor;

flat out int colorIndex1;
flat out int colorIndex2;
flat out int colorIndex3;

out vec3 color1;
out vec3 color2;
out vec3 color3;

void main()
{
  gl_Position = worldViewProjection * vec4(position, 1.);

  vPositionL = position;
  vPositionW = vec3(world * vec4(position, 1.0));
  vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
  vColor = color;

  vUv = uv;
  vUv2 = uv2;
  
  colorIndex1 = int(vUv.x * 32.);
  colorIndex2 = int(vUv.y * 32.);
  colorIndex3 = int(vUv2.x * 32.);
}