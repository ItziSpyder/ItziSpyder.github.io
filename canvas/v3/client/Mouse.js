export class Mouse {

    canvas

    static initEvents() {
        const canvas = document.getElementById('canvas')
        
        canvas.addEventListener('click', canvas.requestPointerLock)
        document.addEventListener('mousemove', e => {
            if (this.isFocused())
                this.onMouseMove(e.movementX, e.movementY)
        })
        this.canvas = canvas
    }

    static isFocused() {
        return document.pointerLockElement == canvas
    }

    static onMouseMove(dx, dy) {
        // console.log('x:', dx, 'y:', dy)
    }
}