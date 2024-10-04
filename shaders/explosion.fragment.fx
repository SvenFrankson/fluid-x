#version 300 es
precision highp float;
precision mediump sampler3D;
 
uniform vec3 viewPositionW;
uniform vec3 viewDirectionW;
uniform int useVertexColor;
uniform int useLightFromPOV;
uniform float autoLight;
uniform float diffuseSharpness;
uniform vec3 diffuse;
uniform sampler3D noiseTexture;
uniform vec3 lightInvDirW;
uniform float alpha;
uniform float specularIntensity;
uniform vec3 specular;
uniform float specularCount;
uniform float specularPower;
uniform int useFlatSpecular;
uniform float time;
uniform vec3 origin;
uniform float radius;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
	float sunLightFactor = 0.;
	vec3 camDir = normalize(viewPositionW - vPositionW);

    vec3 normal = vNormalW;

	vec3 uvrNoise = vec3(vPositionW.x * 0.05, vPositionW.z * 0.05, vPositionW.y * 0.05);
   	float threshold = texture(noiseTexture, uvrNoise).r;
	float fY = length(vPositionW - origin) / radius;
	threshold += fY;

	if (useLightFromPOV == 1) {
		sunLightFactor = (max(dot(normal, camDir), diffuseSharpness) - diffuseSharpness) / (1. - diffuseSharpness);
	}
	else {
		sunLightFactor = (max(dot(normal, lightInvDirW), diffuseSharpness) - diffuseSharpness) / (1. - diffuseSharpness);
	}

	float lightFactor = 1.5;
	if (sunLightFactor < 0.99) {
		lightFactor = round(sunLightFactor * 4.) / 4. * 0.9 + 0.1;
	}

	vec3 color = diffuse;
	if (useVertexColor == 1) {
		color *= vColor.rgb;
	}

	float factor = 2. * specularCount - 1.;
	float specularValue = 0.;
	vec3 lightPos = vec3(1., 1., 1.);
	vec3 mirrorCamDir = - normalize(reflect(camDir, normal));
	if (useFlatSpecular == 1) {
		vec3 mirrorDirAxisPlaneN = normalize(cross(vPositionW - lightPos, lightInvDirW));
		specularValue = 1. - abs(dot(mirrorDirAxisPlaneN, mirrorCamDir));
	}
	else {
		specularValue = max(dot(lightInvDirW, mirrorCamDir), 0.);
	}
	specularValue = (cos((specularValue - 1.) * factor * 3.14 * 0.5) + 1.) * 0.5 * sqrt(specularValue);
	specularValue = pow(specularValue, specularPower);
	specularValue = round(specularValue * specularCount) / specularCount;
	specularValue = specularValue * specularIntensity;
	
	lightFactor = max(lightFactor, autoLight);

	float a = 1.;
	if (time > threshold) {
		a = 0.;
	}
	outColor = vec4(color * lightFactor + specular * specularValue, a);
}