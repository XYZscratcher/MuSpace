const asRGBString = (color) => {
    return `rgb(${color[0]},${color[1]},${color[2]})`
}
const lightenOrDarken = (color, value) => {
    //if value<1, it's darken
    return color.map((p) => {
        return p * value
    })
}
const lighten= (color, value) => {
    return lightenOrDarken(color, 1 + value/10)
}
const darken = (color, value) => {
    return lightenOrDarken(color, 1 - value/10)
}
const distanceOfColors = (color1, color2) => {
    let r = color1[0] - color2[0];
    let g = color1[1] - color2[1];
    let b = color1[2] - color2[2];
    return Math.sqrt(r * r + g * g + b * b);
}
export {asRGBString, lighten,darken, distanceOfColors}