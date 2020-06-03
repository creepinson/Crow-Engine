#version 300 es

precision highp float;
precision highp sampler2DArray;

struct Material {
    bool isThereBaseColorMap;
    sampler2D baseColorMap;
    vec2 baseColorMapTile;
    vec2 baseColorMapOffset;
    vec3 baseColor;
    int baseColorTextureCoordinate;

    bool isThereRoughnessMetalnessMap;
    sampler2D roughnessMetalnessMap;
    vec2 roughnessMetalnessMapTile;
    vec2 roughnessMetalnessMapOffset;
    vec3 roughnessMetalness;
    int roughnessMetalnessTextureCoordinate;

    bool isThereNormalMap;
    sampler2D normalMap;
    vec2 normalMapTile;
    vec2 normalMapOffset;
    int normalMapTextureCoordinate;
    float normalScale;

    bool isTherePOM;
    float POMScale;
    float POMMinLayers;
    float POMMaxLayers;

    bool isThereOcclusionMap;
    sampler2D occlusionMap;
    vec2 occlusionMapTile;
    vec2 occlusionMapOffset;
    float occlusionStrength;
    int occlusionTextureCoordinate;

    bool isThereEmissiveMap;
    sampler2D emissiveMap;
    vec2 emissiveMapTile;
    vec2 emissiveMapOffset;
    vec3 emissiveColor;
    int emissiveTextureCoordinate;
};

struct DotInfo{
    float NdotL;
    float NdotV;
    float NdotH;
    float VdotH;
};

struct MaterialInfo{
    vec3 baseColor;
    vec3 emissiveColor;
    vec3 F0;
    float alpha;
    float occlusion;
    float roughness;
    float metalness;
};

struct Light {              //base alignment        alignment offset
    vec3 color;             //16                    0
    vec3 direction;         //16                    16
    vec3 position;          //16                    32
    vec2 cutOff;            //8                     48
    float intensity;        //4                     56
    float range;            //4                     60
    int type;               //4                     64
    bool lightActive;       //4                     68
};                          //12 padding            80

const int SPLIT_COUNT = 3;
const int DIRECTIONAL_LIGHT = 0;
const int POINT_LIGHT = 1;
const int SPOT_LIGHT = 2;
const int LIGHT_COUNT = 16;
const int ALPHA_MODE_OPAQUE = 0;
const int ALPHA_MODE_MASK = 1;
const int ALPHA_MODE_BLEND = 2;
const float PI = 3.14159265359;

in vec3 io_fragmentPosition;
in vec3 io_normal;
flat in int io_isThereNormal;
flat in int io_isThereTangent;
in vec2 io_textureCoordinates_0;
in vec2 io_textureCoordinates_1;
in vec3 io_vertex_color;
in vec3 io_viewPosition;
in mat3 io_TBN;
in vec4[SPLIT_COUNT] io_fragmentPositionLightSpace;

uniform Material material;
uniform sampler2DArray shadowMap;
uniform int shadowLightIndex;
uniform bool receiveShadow;
uniform float[SPLIT_COUNT + 1] splits;
uniform bool areThereIblMaps;
uniform samplerCube diffuseIblMap;
uniform samplerCube specularIblMap;
uniform float specularIblLodCount;
uniform sampler2D brdfLutMap;
uniform bool isThereVertexColor;
uniform int alphaMode;
uniform float alphaCutoff;

layout(std140) uniform Lights {             //binding point: 2
    Light[LIGHT_COUNT] lights;              //1024
};

out vec4 o_color;

vec3 calculateLight(int lightIndex, MaterialInfo materialInfo, vec3 fragmentPosition, vec3 V, vec3 N, float shadow);
vec3 calculateShading(MaterialInfo materialInfo, vec3 L, vec3 N, vec3 V);
float calculateDistributionGGX(DotInfo dotInfo, float roughness);
float calculateGeometrySchlickGGX(DotInfo dotInfo, float roughness);
float calculateGeometrySmith(DotInfo dotInfo, float roughness);
vec3 calculateFresnelSchlick(DotInfo dotInfo, vec3 F0);
float calculatePointAttenuation(float range, float distance);
float calculateSpotAttenuation(vec3 pointToLight, vec3 spotDirection, float outerConeCos, float innerConeCos);

vec3 calculateIbl(MaterialInfo materialInfo, vec3 V, vec3 N);
vec3 calculateFresnelSchlickRoughness(MaterialInfo materialInfo, float NdotV);

vec2 parallaxMapping(vec3 tangentViewDirection, vec2 textureCoordinates);
float calculateShadow(vec3 N, vec3 L);
float calculateShadowInCascade(vec3 normalVector, vec3 lightDirection, int cascade);

vec3 getNormalVector(vec2 textureCoordinates);
void getBaseColorAndAlpha(vec2 textureCoordinates, out vec3 baseColor, out float alpha);
void getRoughnessMetalness(vec2 textureCoordinates, out float roughness, out float metalness);
float getOcclusion(vec2 textureCoordinates);
vec3 getEmissiveColor(vec2 textureCoordinates);
void getTextureCoordinates(out vec2 textureCoordinates_0, out vec2 textureCoordinates_1);
vec2 transformTextureCoordinates(vec2 textureCoordinates);
DotInfo createDotInfo(vec3 L, vec3 N, vec3 V);
MaterialInfo createMaterialInfo(vec2 textureCoordinates_0, vec2 textureCoordinates_1);

void main(){
    vec2 textureCoordinates_0, textureCoordinates_1;
    getTextureCoordinates(textureCoordinates_0, textureCoordinates_1);
    vec3 fragmentPosition = io_fragmentPosition;
    vec3 V = normalize(io_viewPosition - io_fragmentPosition);
    vec3 N = getNormalVector(mix(textureCoordinates_0, textureCoordinates_1, bvec2(material.normalMapTextureCoordinate != 0)));
    MaterialInfo materialInfo = createMaterialInfo(textureCoordinates_0, textureCoordinates_1);
    float shadow = calculateShadow(N, lights[shadowLightIndex].direction);

    vec3 result = vec3(0.0f);
    for(int i=0; i<LIGHT_COUNT; i++){
        if(lights[i].lightActive){
            result += calculateLight(i, materialInfo, fragmentPosition, V, N, shadow);
        }
    }

    if(areThereIblMaps){
        result += calculateIbl(materialInfo, V, N);
    }
    
    result = mix(result, result * vec3(materialInfo.occlusion), material.occlusionStrength);
    result += materialInfo.emissiveColor;
    o_color = vec4(result, materialInfo.alpha);

    /*shadow cascade debug
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    o_color = vec4(mix(o_color.rgb, o_color.rgb * vec3(1, 0.2, 0.2), vec3(depth <= splits[3] && depth >= splits[2])), 1);
    o_color = vec4(mix(o_color.rgb, o_color.rgb * vec3(0.2, 1, 0.2), vec3(depth <= splits[2] && depth >= splits[1])), 1);
    o_color = vec4(mix(o_color.rgb, o_color.rgb * vec3(0.2, 0.2, 1), vec3(depth <= splits[1] && depth >= splits[0])), 1);
    */
    
    //o_color = vec4(vec3(materialInfo.alpha).rgb, 1);
    //o_color = vec4(result.xyz * vec3(0) + vec3(1) * vec3(shadow), 1);
}

vec3 calculateLight(int lightIndex, MaterialInfo materialInfo, vec3 fragmentPosition, vec3 V, vec3 N, float shadow){
    Light light = lights[lightIndex];
    shadow = mix(1.0, shadow, lightIndex == shadowLightIndex);
    vec3 fragmentToLightVector = light.type == DIRECTIONAL_LIGHT ? -light.direction : light.position - fragmentPosition;
    vec3 L = normalize(fragmentToLightVector);
    float lightDistance = length(fragmentToLightVector);
    float pointAttenuation = light.type == DIRECTIONAL_LIGHT ? 1.0f : calculatePointAttenuation(light.range, lightDistance);
    float spotAttenuation = light.type != SPOT_LIGHT ? 1.0f : calculateSpotAttenuation(light.direction, L, light.cutOff.x, light.cutOff.y);
    vec3 shade = calculateShading(materialInfo, L, N, V);
    return pointAttenuation * spotAttenuation * light.intensity * light.color * shade * shadow;
}

vec3 calculateShading(MaterialInfo materialInfo, vec3 L, vec3 N, vec3 V){
    DotInfo dotInfo = createDotInfo(L, N, V);

    vec3 F = calculateFresnelSchlick(dotInfo, materialInfo.F0);
    float D = calculateDistributionGGX(dotInfo, materialInfo.roughness);
    float G = calculateGeometrySmith(dotInfo, materialInfo.roughness);

    vec3 nominator = D * G * F;
    float denominator = 4.0f * dotInfo.NdotV * dotInfo.NdotL;
    vec3 specular = nominator / max(denominator, 0.001f);

    vec3 diffuseFactor = (vec3(1.0f) - F) * (1.0f - materialInfo.metalness);
    vec3 diffuse = diffuseFactor * materialInfo.baseColor / PI;

    return (diffuse + specular) * dotInfo.NdotL;
}

float calculateDistributionGGX(DotInfo dotInfo, float roughness){
    float roughnessAlpha = roughness * roughness;
    float roughnessAlpha_2 = roughnessAlpha * roughnessAlpha;
    float NdotH_2 = dotInfo.NdotH * dotInfo.NdotH;

    float nominator = roughnessAlpha_2;
    float denominator = (NdotH_2 * (roughnessAlpha_2 - 1.0f) + 1.0f);
    denominator = PI * denominator * denominator;

    return nominator / max(denominator, 0.001f);
}

float calculateGeometrySchlickGGX(DotInfo dotInfo, float roughness){
    float r = (roughness + 1.0f);
    float k = (r * r) / 8.0f;

    float nominator   = dotInfo.NdotV;
    float denominator = dotInfo.NdotV * (1.0f - k) + k;

    return nominator / denominator;
}

float calculateGeometrySmith(DotInfo dotInfo, float roughness){
    float ggx2 = calculateGeometrySchlickGGX(dotInfo, roughness);
    float ggx1 = calculateGeometrySchlickGGX(dotInfo, roughness);
    return ggx1 * ggx2;
}

vec3 calculateFresnelSchlick(DotInfo dotInfo, vec3 F0){
    return F0 + (1.0f - F0) * pow(1.0f - dotInfo.VdotH, 5.0f);
}

float calculatePointAttenuation(float range, float distance){
    return max(min(1.0 - pow(distance / range, 4.0f), 1.0f), 0.0f) / pow(distance, 2.0f);
}

float calculateSpotAttenuation(vec3 lightDirection, vec3 L, float cutoffAngleCos, float outerCutOffAngleCos){
    float realAngleCos = dot(lightDirection, -L);
    if (realAngleCos > outerCutOffAngleCos)
    {
        if (realAngleCos < cutoffAngleCos)
        {
            return smoothstep(outerCutOffAngleCos, cutoffAngleCos, realAngleCos);
        }
        return 1.0f;
    }
    return 0.0f;
}

vec3 calculateIbl(MaterialInfo materialInfo, vec3 V, vec3 N){
    float NdotV = max(dot(N, V), 0.0f);
    vec3 R = reflect(-V, N);

    vec3 F = calculateFresnelSchlickRoughness(materialInfo, NdotV);
    vec3 diffuseFactor = (1.0f - F) * (1.0f - materialInfo.metalness); 
    vec3 irradiance = texture(diffuseIblMap, N).rgb;
    vec3 diffuse = diffuseFactor * irradiance * materialInfo.baseColor;

    vec3 prefilteredColor = textureLod(specularIblMap, R,  materialInfo.roughness * specularIblLodCount).rgb;   
    vec2 envBRDF = texture(brdfLutMap, vec2(NdotV), materialInfo.roughness).rg;
    vec3 specular = prefilteredColor * (F * envBRDF.x + envBRDF.y);

    return diffuse + specular; 
}

vec3 calculateFresnelSchlickRoughness(MaterialInfo materialInfo, float NdotV){
    return materialInfo.F0 + (max(vec3(1.0f - materialInfo.roughness), materialInfo.F0) - materialInfo.F0) * pow(1.0f - NdotV, 5.0f);
}

float calculateShadowOld(vec3 N, vec3 L) {
    if(!receiveShadow){
        return 1.0f;
    }
    vec2 texelSize = vec2(1.0f / vec2(textureSize(shadowMap, 0)));
    vec3 projectionCoordinates = io_fragmentPositionLightSpace[0].xyz / io_fragmentPositionLightSpace[0].w;
    projectionCoordinates = projectionCoordinates * 0.5f + 0.5f;
    float currentDepth = projectionCoordinates.z;

    float maxOffset = 0.0002f;
    float minOffset = 0.000001;
    float offsetMod = 1.0f - clamp(dot(N, L), 0.0f, 1.0f);
    float bias = minOffset + maxOffset * offsetMod;

    return currentDepth - bias > texture(shadowMap, vec3(projectionCoordinates.xy, 0)).r ? 0.0f : 1.0f;
    float shadow = 0.0f;
    for(int x = -1; x <= 1; ++x){
        for(int y = -1; y <= 1; ++y){
            float pcfDepth = texture(shadowMap, vec3(projectionCoordinates.xy + vec2(x, y) * texelSize, 0)).r; 
            shadow += currentDepth - bias > pcfDepth  ? 0.3f : 1.0f;        
        }    
    }
    shadow /= 9.0f;
    return shadow;
}

float calculateShadow(vec3 N, vec3 L) {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float shadow;
    shadow = mix(shadow, calculateShadowInCascade(N, L, 2), depth <= splits[3] && depth >= splits[2]);
    shadow = mix(shadow, calculateShadowInCascade(N, L, 1), depth <= splits[2] && depth >= splits[1]);
    shadow = mix(shadow, calculateShadowInCascade(N, L, 0), depth <= splits[1] && depth >= splits[0]);
    return shadow;
}

float calculateShadowInCascade(vec3 N, vec3 L, int cascade){
    if(!receiveShadow){
        return 1.0f;
    }
    vec3 projectionCoordinates = io_fragmentPositionLightSpace[cascade].xyz / io_fragmentPositionLightSpace[cascade].w;
    projectionCoordinates = projectionCoordinates * 0.5 + 0.5;
    float currentDepth = projectionCoordinates.z;
    vec2 moments = texture(shadowMap, vec3(projectionCoordinates.xy, cascade)).xy;
    if (currentDepth <= moments.x) {
		return 1.0;
    }
	float variance = moments.y - (moments.x * moments.x);
	variance = max(variance, 0.00002);
	float d = currentDepth - moments.x;
	float pMax = variance / (variance + d * d);
    return smoothstep(0.1f, 1.0f, pMax);
}

vec2 parallaxMapping(vec3 tangentViewDirection, vec2 textureCoordinates){
    float numLayers = mix(material.POMMaxLayers, material.POMMinLayers, abs(dot(vec3(0, 0, 1), tangentViewDirection)));
    float layerHeight = 1.0f / numLayers;
    float curLayerHeight = 0.0f;
    vec2 dtex = material.POMScale * tangentViewDirection.xy / numLayers;
    vec2 currentTextureCoords = textureCoordinates;
    float heightFromTexture = texture(material.normalMap, currentTextureCoords).a;
    while(heightFromTexture > curLayerHeight){
        curLayerHeight += layerHeight; 
        currentTextureCoords -= dtex;
        heightFromTexture = texture(material.normalMap, currentTextureCoords).a;
    }

    vec2 prevTCoords = currentTextureCoords + dtex;
    float nextH	= heightFromTexture - curLayerHeight;
    float prevH	= texture(material.normalMap, prevTCoords).a - curLayerHeight + layerHeight;
    float weight = nextH / (nextH - prevH);
    vec2 finalTexCoords = prevTCoords * weight + currentTextureCoords * (1.0f - weight);
    if(finalTexCoords.x > 1.0 || finalTexCoords.y > 1.0f || finalTexCoords.x < 0.0f || finalTexCoords.y < 0.0f){
        discard;
    }
    return finalTexCoords;
}

//
// collecting info-------------------------------------------------------------------------------------------------
//

vec3 getNormalVector(vec2 textureCoordinates){
    if(material.isThereNormalMap){
        mat3 tbn;
        if(!bool(io_isThereTangent)) {
            vec3 pos_dx = dFdx(io_fragmentPosition);
            vec3 pos_dy = dFdy(io_fragmentPosition);
            vec3 tex_dx = dFdx(vec3(textureCoordinates, 0.0f));
            vec3 tex_dy = dFdy(vec3(textureCoordinates, 0.0f));
            vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);

            vec3 ng;
            if(bool(io_isThereNormal)) {
                ng = normalize(io_normal);
            }else{
                ng = cross(pos_dx, pos_dy);
            }

            t = normalize(t - ng * dot(ng, t));
            vec3 b = normalize(cross(ng, t));
            tbn = mat3(t, b, ng);
        }else{
            tbn = io_TBN;
        }

        vec3 normal = texture(material.normalMap, textureCoordinates * material.normalMapTile + material.normalMapOffset).rgb;
        normal = normal * 2.0f - 1.0f;
        normal *= vec3(material.normalScale, material.normalScale, 1.0f);
        normal = normalize(tbn * normal);
        return normal;
    }else{
        return normalize(io_normal);
    }
}

void getBaseColorAndAlpha(vec2 textureCoordinates, out vec3 baseColor, out float alpha){
    vec4 result = vec4(material.baseColor, 1.0f);
    if(material.isThereBaseColorMap){
        result *= texture(material.baseColorMap, textureCoordinates * material.baseColorMapTile + material.baseColorMapOffset);
    }
    if(isThereVertexColor) {
        result *= vec4(io_vertex_color, 1.0);
    }
    baseColor = pow(result.rgb, vec3(2.2f));
    if(alphaMode == ALPHA_MODE_OPAQUE) {
        alpha = 1.0;
    }else if(alphaMode == ALPHA_MODE_MASK) {
        if(result.a < alphaCutoff) {
            discard;
        }
    }else {
        alpha = result.a;
    }
}

void getRoughnessMetalness(vec2 textureCoordinates, out float roughness, out float metalness){
    vec3 result = vec3(material.roughnessMetalness);
    if(material.isThereRoughnessMetalnessMap){
        result *= texture(material.roughnessMetalnessMap, textureCoordinates * material.roughnessMetalnessMapTile + material.roughnessMetalnessMapOffset).rgb;
    }
    roughness = result.g;
    metalness = result.b;
}

float getOcclusion(vec2 textureCoordinates){
    if(material.isThereOcclusionMap){
        return texture(material.occlusionMap, textureCoordinates * material.occlusionMapTile + material.occlusionMapOffset).r;
    }else{
        return 1.0f;
    }
}

vec3 getEmissiveColor(vec2 textureCoordinates){
    vec3 color = material.emissiveColor;
    if(material.isThereEmissiveMap){
        color *= texture(material.emissiveMap, textureCoordinates * material.emissiveMapTile + material.emissiveMapOffset).rgb;
    }
    return pow(color, vec3(2.2f));
}

void getTextureCoordinates(out vec2 textureCoordinates_0, out vec2 textureCoordinates_1) {
    textureCoordinates_0 = transformTextureCoordinates(io_textureCoordinates_0);
    if(material.baseColorTextureCoordinate + material.roughnessMetalnessTextureCoordinate + material.occlusionTextureCoordinate + 
        material.emissiveTextureCoordinate  + material.normalMapTextureCoordinate> 0) {
        textureCoordinates_1 = transformTextureCoordinates(io_textureCoordinates_1);
    }
}

vec2 transformTextureCoordinates(vec2 textureCoordinates) {
    if(material.isThereNormalMap && material.isTherePOM){
        vec3 tangentViewPosition = io_viewPosition * io_TBN;
        vec3 tangentFragmentPosition = io_fragmentPosition * io_TBN;
        vec3 tangentViewDirection = normalize(tangentViewPosition - tangentFragmentPosition);
        return parallaxMapping(tangentViewDirection, textureCoordinates * material.normalMapTile + material.normalMapOffset);
    }else{
        return textureCoordinates;
    }
}

DotInfo createDotInfo(vec3 L, vec3 N, vec3 V){
    vec3 H = normalize(L + V);
    float NdotL = clamp(dot(N, L), 0.0, 1.0);
    float NdotV = clamp(dot(N, V), 0.0, 1.0);
    float NdotH = clamp(dot(N, H), 0.0, 1.0);
    float VdotH = clamp(dot(V, H), 0.0, 1.0);
    return DotInfo(NdotL, NdotV, NdotH, VdotH);
}

MaterialInfo createMaterialInfo(vec2 textureCoordinates_0, vec2 textureCoordinates_1){
    vec3 emissiveColor = getEmissiveColor(mix(textureCoordinates_0, textureCoordinates_1, bvec2(material.emissiveTextureCoordinate != 0)));
    vec3 baseColor;
    float alpha, occlusion, roughness, metalness;
    getBaseColorAndAlpha(mix(textureCoordinates_0, textureCoordinates_1, bvec2(material.baseColorTextureCoordinate != 0)), baseColor, alpha);
    getRoughnessMetalness(mix(textureCoordinates_0, textureCoordinates_1, bvec2(material.roughnessMetalnessTextureCoordinate != 0)), roughness, metalness);
    occlusion = getOcclusion(mix(textureCoordinates_0, textureCoordinates_1, bvec2(material.occlusionTextureCoordinate != 0)));
    vec3 F0 = mix(vec3(0.04), baseColor, metalness);
    return MaterialInfo(baseColor, emissiveColor, F0, alpha, occlusion, roughness, metalness);
}