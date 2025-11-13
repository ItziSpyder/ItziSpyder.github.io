export class Mat3d {
    m00
    m10
    m20

    m01
    m11
    m21

    m02
    m12
    m22

    constructor(m00, m10, m20, m01, m11, m21, m02, m12, m22) {
        this.m00 = m00
        this.m10 = m10
        this.m20 = m20

        this.m01 = m01
        this.m11 = m11
        this.m21 = m21

        this.m02 = m02
        this.m12 = m12
        this.m22 = m22
    }

    mul(m) {
        return new Mat3d(
            this.m00*m.m00 + this.m01*m.m10 + this.m02*m.m20,   
            this.m10*m.m00 + this.m11*m.m10 + this.m12*m.m20,   
            this.m20*m.m00 + this.m21*m.m10 + this.m22*m.m20,   

            this.m00*m.m01 + this.m01*m.m11 + this.m02*m.m21,   
            this.m10*m.m01 + this.m11*m.m11 + this.m12*m.m21,   
            this.m20*m.m01 + this.m21*m.m11 + this.m22*m.m21,   

            this.m00*m.m02 + this.m01*m.m12 + this.m02*m.m22,   
            this.m10*m.m02 + this.m11*m.m12 + this.m12*m.m22,   
            this.m20*m.m02 + this.m21*m.m12 + this.m22*m.m22 
        )
    }

    print() {
        console.log(this.m00, this.m01, this.m02)
        console.log(this.m10, this.m11, this.m12)
        console.log(this.m20, this.m21, this.m22)
    }
}