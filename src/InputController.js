// src/InputController.js

export default class InputController {
    constructor() {
        this.keys = {}; // Lưu trạng thái của tất cả các phím
        this.initListeners();
    }

    // Khởi tạo các trình lắng nghe sự kiện
    initListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    // Một hàm trợ giúp để kiểm tra xem phím có được nhấn không
    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    // Trả về trạng thái điều khiển cho xe
    getControls() {
        return {
            forward: this.isKeyPressed('w') || this.isKeyPressed('arrowup'),
            backward: this.isKeyPressed('s') || this.isKeyPressed('arrowdown'),
            left: this.isKeyPressed('a') || this.isKeyPressed('arrowleft'),
            right: this.isKeyPressed('d') || this.isKeyPressed('arrowright'),
        };
    }
}