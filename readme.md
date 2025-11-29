# 🏎️ 3D Racing Game – Three.js + Cannon.js

Một trò chơi đua xe 3D đơn giản nhưng đầy đủ tính năng, được xây dựng hoàn toàn bằng Three.js (đồ họa) và cannon (vật lý).  
Dự án tập trung vào việc refactor từ một file HTML/JS duy nhất thành kiến trúc ES Modules hiện đại, dễ bảo trì và mở rộng.

Tính năng chính

- Đua xe 3D với mô phỏng vật lý thực tế (Cannon.RaycastVehicle)
- Đường đua khép kín hình chữ nhật có tường trong/ngoài
- Hệ thống checkpoint + tính vòng đua hợp lệ (anti-cheat đơn giản)
- Camera góc thứ ba mượt mà (lerp)
- HUD hiển thị tốc độ, vòng đua, thời gian
- Âm thanh động cơ + tiếng va chạm
- Hoàn toàn modular (ESM) – mỗi chức năng nằm trong file riêng

🏗️ Cấu trúc thư mục
3d-racing-game/
├── index.html              # Trang chính (canvas + HUD)
├── style.css               # Style HUD
├── /assets/
│   ├── /textures/          # grass.jpg, track.png
│   └── /audio/             # engine.mp3, crash.mp3
└── /src/
├── main.js             # Entry point
├── Game.js             # Game loop & core logic
├── World.js            # Đường đua, ánh sáng, checkpoint
├── Car.js              # Xe (Three.js mesh + Cannon vehicle)
├── InputController.js  # Xử lý phím W/A/S/D + mũi tên
├── UI.js               # HUD & thông báo
└── Constants.js        # Hằng số game

🛠️ Công nghệ sử dụng

| Công nghệ          | Phiên bản   | Vai trò                          |
|--------------------|-------------|----------------------------------|
| Three.js           | r164        | Rendering 3D, camera, lights     |
| cannon-es          | 0.20.0      | Vật lý, va chạm, RaycastVehicle  |
| ES Modules         | Native      | Kiến trúc modular sạch           |
| HTML5 Audio API    | —           | Âm thanh động cơ & va chạm       |

 Yêu cầu đã hoàn thành (100%)

- [x] Scene + Cannon World + Gravity
- [x] Mặt đất cỏ + đường đua texture
- [x] Tường rào bao quanh toàn map
- [x] Ánh sáng + đổ bóng
- [x] Xe vật lý chính xác với 4 bánh (RaycastVehicle)
- [x] Điều khiển mượt (ga, phanh, lùi, lái)
- [x] Camera bám theo xe góc thứ ba
- [x] Hệ thống checkpoint + finish line (3 vòng)
- [x] HUD: tốc độ (km/h), lap, thời gian
- [x] Âm thanh động cơ + tiếng crash
- [x] Refactor hoàn toàn thành ES Modules

 🎮 Điều khiển

| Phím            | Chức năng                  |
|-----------------|----------------------------|
| `W` hoặc `↑`    | Tăng tốc                   |
| `S` hoặc `↓`    | Phanh / Lùi                |
| `A` hoặc `←`    | Rẽ trái                    |
| `D` hoặc `→`    | Rẽ phải                    |

Lưu ý âm thanh: Nhấn chuột trái 1 lần vào màn hình để unlock audio, sau đó nhấn `W` để nghe tiếng động cơ.

🚀 Hướng dẫn chạy dự án

Dự án dùng ES Modules + tải tài nguyên → bắt buộc chạy qua local server.

Cách nhanh nhất (khuyên dùng)

1. Cài extension **Live Server** trong VS Code
2. Mở thư mục dự án
3. Chuột phải `index.html` → *Open with Live Server*

→ Game sẽ chạy tại: `http://127.0.0.1:5500`


📁 Chuẩn bị Assets (bắt buộc)
Tạo các file placeholder
/assets/textures/grass.jpg
/assets/textures/track.png
/assets/audio/engine.mp3
/assets/audio/crash.mp3
Nếu thiếu file sẽ bị lỗi 404, game vẫn chạy nhưng không có texture/âm thanh.
🎉 Hoàn thành!
Bạn đã có một trò chơi đua xe 3D hoàn chỉnh, sạch sẽ, dễ mở rộng (thêm xe AI, nhiều map, drift meter, v.v.).
