import { Mat3d } from "../math/Mat3d.js"

export class Rotations {
    
    static RX = angle => new Mat3d(
        1, 0,                0,
        0, -Math.sin(angle), Math.cos(angle),
        0, Math.cos(angle),  Math.sin(angle)
    )

    static RY = angle => new Mat3d(
        Math.cos(angle), 0, -Math.sin(angle),
        0,               1, 0,
        Math.sin(angle), 0, Math.cos(angle)
    )
}