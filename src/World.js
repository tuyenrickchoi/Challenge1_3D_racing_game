// src/World.js
// Tạo thế giới game: đường đua, tường, đèn, checkpoint

import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';

export default class World {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.world = physicsWorld;
    }

    // Khởi tạo thế giới và trả về các checkpoint bodies
    init() {
        this.createLights();
        this.createTrack();
        this.createWalls();
        
        const checkpointBodies = this.createCheckpoints();
        return checkpointBodies;
    }

    // R1: Tạo đèn chiếu sáng
    createLights() {
        // Đèn hướng (Directional Light) - ánh sáng mặt trời
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(50, 100, 50);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;
        this.scene.add(this.directionalLight);

        // Đèn môi trường (Ambient Light) - ánh sáng tổng thể
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);
    }

    // R1: Tạo đường đua hình chữ nhật khép kín (loop)
    createTrack() {
        // Kích thước đường đua - giữ nguyên kích thước map
        const trackWidth = 8; // Chiều rộng đường đua
        const outerSize = 100; // Kích thước tổng thể (giữ nguyên)
        const innerIslandSize = 40; // Kích thước đảo ở giữa
        
        // Tính toán kích thước đường đua
        const trackOuterSize = outerSize;
        const trackInnerSize = innerIslandSize;
        const trackThickness = (trackOuterSize - trackInnerSize) / 2; // Độ dày của đường đua
        
        // Tải texture đường đua
        const textureLoader = new THREE.TextureLoader();
        const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // Tạo mặt đất lớn (giữ nguyên kích thước)
        const groundGeometry = new THREE.PlaneGeometry(trackOuterSize, trackOuterSize);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMesh = new THREE.Mesh(groundGeometry, defaultMaterial);
        groundMesh.position.set(0, 0, 0);
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);
        
        // Tạo physics body cho mặt đất
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        groundBody.position.set(0, 0, 0);
        this.world.addBody(groundBody);
        
        // Tạo đường đua (4 cạnh của hình chữ nhật)
        // Cạnh trên
        this.createTrackSegment(trackOuterSize, trackWidth, 0, -trackOuterSize / 2 + trackWidth / 2, textureLoader);
        // Cạnh dưới
        this.createTrackSegment(trackOuterSize, trackWidth, 0, trackOuterSize / 2 - trackWidth / 2, textureLoader);
        // Cạnh trái
        this.createTrackSegment(trackWidth, trackOuterSize - trackInnerSize, -trackOuterSize / 2 + trackWidth / 2, 0, textureLoader);
        // Cạnh phải
        this.createTrackSegment(trackWidth, trackOuterSize - trackInnerSize, trackOuterSize / 2 - trackWidth / 2, 0, textureLoader);
    }
    
    // Tạo một đoạn đường đua
    createTrackSegment(width, length, x, z, textureLoader) {
        const trackGeometry = new THREE.PlaneGeometry(width, length);
        trackGeometry.rotateX(-Math.PI / 2);
        
        const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const trackMesh = new THREE.Mesh(trackGeometry, defaultMaterial);
        trackMesh.position.set(x, 0.01, z); // 0.01 để nằm trên mặt đất
        trackMesh.receiveShadow = true;
        this.scene.add(trackMesh);
        
        // Tải texture
        textureLoader.load(
            './assets/textures/track.jpg',
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 2);
                trackMesh.material = new THREE.MeshLambertMaterial({ 
                    map: texture,
                    side: THREE.DoubleSide
                });
            },
            undefined,
            () => {
                // Giữ material mặc định nếu không tải được
            }
        );
        
        // Physics body cho đoạn đường đua
        const trackShape = new CANNON.Plane();
        const trackBody = new CANNON.Body({ mass: 0 });
        trackBody.addShape(trackShape);
        trackBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        trackBody.position.set(x, 0, z);
        this.world.addBody(trackBody);
    }

    // R1: Tạo tường ranh giới bên ngoài và đảo ở giữa
    createWalls() {
        const trackWidth = 8;
        const outerSize = 100;
        const innerIslandSize = 40;
        const wallHeight = 3;
        const wallThickness = 0.5;
        const trackThickness = (outerSize - innerIslandSize) / 2;

        // Vật liệu tường
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });

        // === TƯỜNG RANH GIỚI BÊN NGOÀI ===
        
        // Tường ngoài - Trên
        this.createWallSegment(outerSize + wallThickness * 2, wallThickness, wallHeight, 0, -outerSize / 2 - wallThickness / 2, wallMaterial);
        
        // Tường ngoài - Dưới
        this.createWallSegment(outerSize + wallThickness * 2, wallThickness, wallHeight, 0, outerSize / 2 + wallThickness / 2, wallMaterial);
        
        // Tường ngoài - Trái
        this.createWallSegment(wallThickness, outerSize + wallThickness * 2, wallHeight, -outerSize / 2 - wallThickness / 2, 0, wallMaterial);
        
        // Tường ngoài - Phải
        this.createWallSegment(wallThickness, outerSize + wallThickness * 2, wallHeight, outerSize / 2 + wallThickness / 2, 0, wallMaterial);

        // === ĐẢO Ở GIỮA (INNER ISLAND) ===
        
        // Tường đảo - Trên
        this.createWallSegment(innerIslandSize + wallThickness * 2, wallThickness, wallHeight, 0, -innerIslandSize / 2 - wallThickness / 2, wallMaterial);
        
        // Tường đảo - Dưới
        this.createWallSegment(innerIslandSize + wallThickness * 2, wallThickness, wallHeight, 0, innerIslandSize / 2 + wallThickness / 2, wallMaterial);
        
        // Tường đảo - Trái
        this.createWallSegment(wallThickness, innerIslandSize + wallThickness * 2, wallHeight, -innerIslandSize / 2 - wallThickness / 2, 0, wallMaterial);
        
        // Tường đảo - Phải
        this.createWallSegment(wallThickness, innerIslandSize + wallThickness * 2, wallHeight, innerIslandSize / 2 + wallThickness / 2, 0, wallMaterial);
    }
    
    // Tạo một đoạn tường
    createWallSegment(width, depth, height, x, z, material) {
        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const wallMesh = new THREE.Mesh(wallGeometry, material);
        wallMesh.position.set(x, height / 2, z);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        this.scene.add(wallMesh);

        const wallShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const wallBody = new CANNON.Body({ mass: 0 });
        wallBody.addShape(wallShape);
        wallBody.position.set(x, height / 2, z);
        this.world.addBody(wallBody);
    }

    // R3: Tạo checkpoint (checkpoint giữa và vạch đích) - nằm ngang đường đua
    createCheckpoints() {
        const checkpointBodies = {};
        const outerSize = 100;
        const trackWidth = 8;

        // Checkpoint - nằm trước xe (ở cạnh dưới), rộng bằng đường đua
        // Đặt ngay trước vị trí xe khởi đầu
        const midCheckpointShape = new CANNON.Box(new CANNON.Vec3(trackWidth, 2, 0.1));
        const midCheckpointBody = new CANNON.Body({ 
            mass: 0,
            isTrigger: true
        });
        midCheckpointBody.addShape(midCheckpointShape);
        // Đặt ở cạnh dưới, trước xe, nằm ngang (vuông góc với hướng di chuyển)
        // Vị trí: cạnh dưới, cách mép một khoảng (trước xe)
        midCheckpointBody.position.set(0, 1, outerSize / 2 - trackWidth / 2 - 2);
        this.world.addBody(midCheckpointBody);
        checkpointBodies.midCheckpoint = midCheckpointBody;

        // Vạch đích - kẻ ngang qua hết đường đua ở cạnh trên
        // Rộng bằng toàn bộ chiều rộng của đường đua (outerSize) để kẻ ngang qua hết
        const finishLineWidth = outerSize; // Kẻ ngang qua hết đường đua
        const finishLineShape = new CANNON.Box(new CANNON.Vec3(finishLineWidth, 2, 0.1));
        const finishLineBody = new CANNON.Body({ 
            mass: 0,
            isTrigger: true
        });
        finishLineBody.addShape(finishLineShape);
        // Đặt ở cạnh trên, nằm ngang (vuông góc với hướng di chuyển), kẻ ngang qua hết
        finishLineBody.position.set(0, 1, -outerSize / 2 + trackWidth / 2);
        this.world.addBody(finishLineBody);
        checkpointBodies.finishLine = finishLineBody;

        // Tạo visual cho checkpoint
        this.createCheckpointVisuals();

        return checkpointBodies;
    }

    // Tạo hình ảnh trực quan cho checkpoint - nằm ngang đường đua, rộng bằng đường đua
    createCheckpointVisuals() {
        const textureLoader = new THREE.TextureLoader();
        const outerSize = 100;
        const trackWidth = 8;
        
        // Checkpoint - màu vàng, nằm ngang ở cạnh dưới (trước xe), rộng bằng đường đua
        const midCheckpointGeometry = new THREE.BoxGeometry(trackWidth, 4, 0.2);
        
        textureLoader.load(
            './assets/textures/glass.jpg',
            (texture) => {
                const midCheckpointMaterial = new THREE.MeshLambertMaterial({ 
                    map: texture,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                });
                const midCheckpointMesh = new THREE.Mesh(midCheckpointGeometry, midCheckpointMaterial);
                // Đặt ở cạnh dưới, trước xe
                midCheckpointMesh.position.set(0, 2, outerSize / 2 - trackWidth / 2 - 2);
                this.scene.add(midCheckpointMesh);
            },
            undefined,
            () => {
                const midCheckpointMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xFFFF00,
                    transparent: true,
                    opacity: 0.5
                });
                const midCheckpointMesh = new THREE.Mesh(midCheckpointGeometry, midCheckpointMaterial);
                // Đặt ở cạnh dưới, trước xe
                midCheckpointMesh.position.set(0, 2, outerSize / 2 - trackWidth / 2 - 2);
                this.scene.add(midCheckpointMesh);
            }
        );

        // Vạch đích - màu đỏ, nằm ngang ở cạnh trên, kẻ ngang qua hết đường đua
        const finishLineWidth = outerSize; // Kẻ ngang qua hết đường đua
        const finishLineGeometry = new THREE.BoxGeometry(finishLineWidth, 4, 0.2);
        
        textureLoader.load(
            './assets/textures/glass.jpg',
            (texture) => {
                const finishLineMaterial = new THREE.MeshLambertMaterial({ 
                    map: texture,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                });
                const finishLineMesh = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
                finishLineMesh.position.set(0, 2, -outerSize / 2 + trackWidth / 2);
                this.scene.add(finishLineMesh);
            },
            undefined,
            () => {
                const finishLineMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xFF0000,
                    transparent: true,
                    opacity: 0.7
                });
                const finishLineMesh = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
                finishLineMesh.position.set(0, 2, -outerSize / 2 + trackWidth / 2);
                this.scene.add(finishLineMesh);
            }
        );
    }
}
