import {Mouse} from "./client/Mouse.js"
import {Mat3d} from "./math/Mat3d.js"

const canvas = document.getElementById('canvas')

Mouse.initEvents()

setInterval(() => {
    
}, 1000 / 60)

var mat1 = new Mat3d(
    1, 2, 3,
    4, 5, 6,
    7, 8, 9
)

var mat2 = new Mat3d(
    10, 11, 12,
    13, 14, 15,
    16, 17, 18
)

mat1.mul(mat2).print()