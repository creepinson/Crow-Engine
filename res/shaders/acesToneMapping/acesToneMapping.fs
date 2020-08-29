#version 300 es

precision highp float;

in vec2 io_textureCoordinates;

uniform sampler2D image;

out vec4 o_color;

void main(){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;

    vec3 color = texture(image, io_textureCoordinates).rgb;
    color = clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
    o_color = vec4(color, 1.0);
}