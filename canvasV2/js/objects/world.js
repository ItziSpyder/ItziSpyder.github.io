import { Voxel } from "./voxel.js"
import { Vector } from "../math/vector.js"
import { Faces } from "./faces.js"
import * as Buffer from "../render/buffer.js"
import * as math from "../math/math.js"

export class World {

    voxels = []
    camera = null
    frames = []
    frame = 0
    size = 0
    
    crosshair = null

    constructor(camera, size) {
        this.camera = camera
        this.size = size

        for (var i = 0; i < 60; i++) {
            this.frames.push(0)
        }

        var half = Math.floor(this.size * 0.5)
        for (var x = -half; x < half; x++) {
            for (var y = -half; y < half; y++) {
                for (var z = -half; z < half; z++) {
                    this.voxels.push(null)
                }
            }
        }

        this.generate()
    }

    generate() {
        this.fillVoxels(-10, 0, -10, 10, 0, 10)
        this.addVoxel(-1, 1, 5)
        this.addVoxel(0, 1, 5)
        this.addVoxel(1, 1, 5)
        this.addVoxel(0, 2, 5)
        this.addVoxel(0, 3, 5)
        this.addVoxel(0, 4, 5)

        for (var i = 1; i < 20; i += 2) {
            this.addVoxel(0, i, 0)
        }

        // staircase

        for (var step = 0; step < 10; step++) {
            this.fillVoxels(10 + step, step, -10, 10 + step, step, 10)
        }

        for (var deg = 0; deg <= 360; deg++) {
            var ang = math.toRadians(deg)
            var cos = math.cos(ang)
            var sin = math.sin(ang)

            for (var radius = 8; radius <= 13; radius++) {
                var vec = new Vector(cos * radius, 10, sin * radius).round()
                this.addVoxel(vec.x, vec.y, vec.z)
            }
        }
    }

    render(rotation, clientRotation, focalPoint, camera, buf) {
        var outlines = []
        for (var i = 0; i < this.voxels.length; i++) {
            var voxel = this.voxels[i]
            if (voxel == null) {
                continue
            }
            if (voxel.outline) {
                outlines.push(voxel)
                continue
            }
            voxel.render(this, rotation, focalPoint, camera, buf)
        }
        for (var i = 0; i < outlines.length; i++) {
            var voxel = outlines[i]
            voxel.render(this, rotation, focalPoint, camera, buf)
        }

        // target block raycast
        var dir = clientRotation.transform(new Vector(0, 0, -1))
        var test = []
        var target = this.raycast(camera, dir, 10, test)
        if (target != null) {
            var hit = target.hit
            this.crosshair = target
            this.highlight(rotation, focalPoint, camera, buf, hit.x, hit.y, hit.z)
        }

        // this.highlight(rotation, focalPoint, camera, buf, camera.x, camera.y - 2, camera.z)

        // for (var i = 0; i < test.length; i++) {
        //     target = test[i]
        //     this.highlight(rotation, focalPoint, camera, buf, -target.x, target.y, -target.z)
        // }
    }

    renderHud(context, focalPoint, camera, pitch, yaw) {
        // fps
        this.frames[this.frame++ % this.frames.length] = Date.now()

        // text hud
        context.beginPath()
        context.font = '30px serif'
        context.fillStyle = 'white'
        context.fillText('The Canvas Game', 10, 30)

        camera = camera.round()
        var rot = new Vector(pitch, yaw, 0).round()
        context.font = '20px serif'
        context.fillText('Pos [' + camera.x + ', ' + camera.y + ', ' + camera.z + ']', 10, 50)
        context.fillText('Rot [' + rot.x + ', ' + rot.y + ']', 10, 70)
        context.fillText('FPS [' + this.getFps() + ']', 10, 90)

        context.fillText('W - Forward', 300, 30)
        context.fillText('A - Left', 300, 50)
        context.fillText('S - Right', 300, 70)
        context.fillText('D - Backward', 300, 90)
        context.fillText('Space - Ascent', 300, 110)
        context.fillText('Shift+Space - Descent', 300, 130)
        context.fillText('Left Mouse - Break', 300, 150)
        context.fillText('Right Mouse - Place', 300, 170)
        context.fillText('Ctrl+R - Reset', 300, 190)
        context.fillText('Z - Toggle Flight', 300, 210)


        // crosshair 
        context.beginPath()
        var cx = focalPoint.x
        var cy = focalPoint.y
        context.strokeStyle = 'white'
        context.lineWidth = 2.5
        context.moveTo(cx - 15, cy)
        context.lineTo(cx + 15, cy)
        context.moveTo(cx, cy - 15)
        context.lineTo(cx, cy + 15)
        context.stroke()
    }

    getFps() {
        var samples = 10
        var end = Date.now()
        var start = this.frames[(this.frame - samples) % this.frames.length]
        var elapsed = (end - start) / samples
        var fps = 1000 / elapsed
        return Math.floor(fps)
    }

    clear() {
        voxels.splice(0, voxels.length)
    }

    getIndex(x, y, z) {
        var size = this.size
        var half = Math.floor(size * 0.5)
        return (x + half) * size * size + (y + half) * size + (z + half)
    }

    addVoxel(x, y, z) {
        var index = this.getIndex(x, y, z)
        if (index < 0 || index >= this.voxels.length) {
            return
        }
        this.voxels[index] = new Voxel(x, y, z)
    }

    setVoxel(x, y, z, voxelTessellator) {
        var index = this.getIndex(x, y, z)
        if (index < 0 || index >= this.voxels.length) {
            return
        }
        this.voxels[index] = voxelTessellator(x, y, z)
    }

    getVoxel(x, y, z) {
        var index = this.getIndex(x, y, z)
        if (index < 0 || index >= this.voxels.length) {
            return null
        }
        return this.voxels[index]
    }

    removeVoxel(x, y, z) {
        var index = this.getIndex(x, y, z)
        if (index < 0 || index >= this.voxels.length) {
            return
        }
        this.voxels[index] = null
    }

    fillVoxels(x1, y1, z1, x2, y2, z2) {
        var minX = Math.min(x1, x2)
        var minY = Math.min(y1, y2)
        var minZ = Math.min(z1, z2)
        var maxX = Math.max(x1, x2)
        var maxY = Math.max(y1, y2)
        var maxZ = Math.max(z1, z2)

        for (var x = minX; x <= maxX; x++) {
            for (var y = minY; y <= maxY; y++) {
                for (var z = minZ; z <= maxZ; z++) {
                    this.addVoxel(x, y, z)
                }
            }
        }
    }

    getCullFaces(x, y, z) {
        return new Faces(
            this.getVoxel(x, y, z + 1) != null, // north
            this.getVoxel(x, y, z - 1) != null, // sourth
            this.getVoxel(x + 1, y, z) != null, // east
            this.getVoxel(x - 1, y, z) != null, // west
            this.getVoxel(x, y - 1, z) != null, // top
            this.getVoxel(x, y + 1, z) != null, // bottom
        )
    }

    raycast(vecStart, vecDir, distance, test) {
        for (var dist = 0; dist <= distance; dist += 0.2) {
            var point = vecStart.addVec(vecDir.mul(dist, dist, dist)).round()
            var voxel = this.getVoxel(point.x, point.y, point.z)
            test[dist] = point

            if (voxel != null) {
                var face = vecStart.addVec(vecDir.mul(dist - 0.2, dist - 0.2, dist - 0.2)).round()
                return { hit: point, face: face }
            }
        }
        return null
    }

    highlight(rotation, focalPoint, camera, vertexConsumer, x, y, z) {
        var i0 = Math.floor(x)
        var j0 = Math.floor(y)
        var k0 = Math.floor(z)
        var i1 = i0 + 1
        var j1 = j0 + 1
        var k1 = k0 + 1

        vertexConsumer.begin(Buffer.MODE_LINES, 5)

        vertexConsumer.vertex(i0, j0, k0).color('white') // bottom
        vertexConsumer.vertex(i1, j0, k0).color('white')
        vertexConsumer.vertex(i1, j0, k0).color('white')
        vertexConsumer.vertex(i1, j0, k1).color('white')
        vertexConsumer.vertex(i1, j0, k1).color('white')
        vertexConsumer.vertex(i0, j0, k1).color('white')
        vertexConsumer.vertex(i0, j0, k1).color('white')
        vertexConsumer.vertex(i0, j0, k0).color('white')

        vertexConsumer.vertex(i0, j1, k0).color('white') // top
        vertexConsumer.vertex(i1, j1, k0).color('white')
        vertexConsumer.vertex(i1, j1, k0).color('white')
        vertexConsumer.vertex(i1, j1, k1).color('white')
        vertexConsumer.vertex(i1, j1, k1).color('white')
        vertexConsumer.vertex(i0, j1, k1).color('white')
        vertexConsumer.vertex(i0, j1, k1).color('white')
        vertexConsumer.vertex(i0, j1, k0).color('white')

        vertexConsumer.vertex(i0, j0, k0).color('white') // pillars
        vertexConsumer.vertex(i0, j1, k0).color('white')
        vertexConsumer.vertex(i1, j0, k0).color('white')
        vertexConsumer.vertex(i1, j1, k0).color('white')
        vertexConsumer.vertex(i1, j0, k1).color('white')
        vertexConsumer.vertex(i1, j1, k1).color('white')
        vertexConsumer.vertex(i0, j0, k1).color('white')
        vertexConsumer.vertex(i0, j1, k1).color('white')

        vertexConsumer.draw(rotation, focalPoint, camera)
    }
}


