export class Vec2d {
    x
    y

    Vec2d(x, y) {
        this.x = x
        this.y = y
    }

    Vec2d(d) {
        this(d, d)
    }

    Vec2d() {
        this(0, 0)
    }

    len() {
        return Math.sqrt(x*x + y*y)
    }

    norm() {
        return new this.div(new Vec2d(this.len()))
    }

    add(v) {
        return new Vec2d(
            this.x + v.x,
            this.y + v.y
        )
    }

    sub(v) {
        return new Vec2d(
            this.x - v.x,
            this.y - v.y
        )
    }

    neg() {
        return new Vec2d(-this.x, -this.y)
    }

    mul(v) {
        return new Vec2d(
            this.x * v.x,
            this.y * v.y
        )
    }

    div(v) {
        return new Vec2d(
            this.x / v.x,
            this.y / v.y
        )
    }
}