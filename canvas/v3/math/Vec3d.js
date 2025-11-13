export class Vec3d {
    
    x
    y
    z

    Vec3d(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    Vec3d(d) {
        this(d, d, d)
    }

    Vec3d() {
        this(0, 0, 0)
    }

    len() {
        return Math.sqrt(x*x + y*y + z*z)
    }

    norm() {
        return new this.div(new Vec3d(this.len()))
    }

    add(v) {
        return new Vec3d(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        )
    }

    sub(v) {
        return new Vec3d(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        )
    }

    neg() {
        return new Vec3d(-this.x, -this.y, -this.z)
    }

    mul(v) {
        return new Vec3d(
            this.x * v.x,
            this.y * v.y,
            this.z * v.z
        )
    }

    div(v) {
        return new Vec3d(
            this.x / v.x,
            this.y / v.y,
            this.z / v.z
        )
    }
}