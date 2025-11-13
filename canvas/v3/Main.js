import { Mouse } from "./client/Mouse.js"
import { Mat3d } from "./math/Mat3d.js"
import { Rotations } from "./render/Rotations.js"

const canvas = document.getElementById('canvas')

Mouse.initEvents()

setInterval(() => {
    
}, 1000 / 60)

// Rotations.RY(90 * Math.PI / 180).print()