// src/Car.js
import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';
import { CAR_PHYSICS } from './Constants.js';

export default class Car {
    constructor(scene, world, startPosition) {
        this.scene = scene;
        this.world = world;

        // Khởi tạo đồ họa và vật lý
        this.initGraphics();
        this.initPhysics(startPosition);

        // Thêm vào scene và world
        this.scene.add(this.mesh);
        
        // Thêm bánh xe vào scene (không qua mesh group)
        this.wheelMeshes.forEach(wheel => {
            this.scene.add(wheel);
        });
        
        this.vehicle.addToWorld(this.world);
    }

    // R2: Tạo mô hình xe bằng hình học cơ bản
    initGraphics() {
        this.mesh = new THREE.Group();
        const chassisWidth = 1.8;
        const chassisHeight = 0.6;
        const chassisLength = 4;

        // Thân xe
        const chassisGeometry = new THREE.BoxGeometry(chassisLength, chassisHeight, chassisWidth);
        const chassisMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassisMesh.castShadow = true;
        chassisMesh.receiveShadow = true;
        this.mesh.add(chassisMesh);

        // Bánh xe
        this.wheelMeshes = [];
        const wheelRadius = 0.5;
        const wheelWidth = 0.4;
        // Tạo bánh xe dọc (đứng thẳng) - xoay quanh trục X để bánh xe nằm dọc
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
        wheelGeometry.rotateX(Math.PI / 2); // Xoay quanh trục X để bánh xe nằm dọc
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A });

        // Vị trí bánh xe - đồng bộ với physics
        // Thứ tự: Trước trái, Trước phải, Sau trái, Sau phải
        const wheelOffset = 0.5; // Khoảng cách từ đầu/cuối thân xe
        // Vị trí Y: dưới thân xe một khoảng bằng wheelRadius
        // Physics sẽ xử lý suspension, nên đặt bánh xe ở vị trí ban đầu gần với vị trí kết nối
        const wheelY = -chassisHeight / 2 - wheelRadius;
        
        const wheelPositions = [
            { x: -chassisLength / 2 + wheelOffset, y: wheelY, z: chassisWidth / 2 },   // Trước trái
            { x: -chassisLength / 2 + wheelOffset, y: wheelY, z: -chassisWidth / 2 }, // Trước phải
            { x: chassisLength / 2 - wheelOffset, y: wheelY, z: chassisWidth / 2 },    // Sau trái
            { x: chassisLength / 2 - wheelOffset, y: wheelY, z: -chassisWidth / 2 }   // Sau phải
        ];

        wheelPositions.forEach(pos => {
            const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheelMesh.position.set(pos.x, pos.y, pos.z);
            wheelMesh.castShadow = true;
            this.wheelMeshes.push(wheelMesh);
            // Không thêm vào mesh group để tránh bị xoay theo thân xe
            // Sẽ thêm vào scene sau trong syncGraphics
        });
    }

    // R2: Thêm thân xe vật lý (mass, friction, restitution)
    initPhysics(startPosition) {
        const chassisLength = 4;
        const chassisHeight = 0.6;
        const chassisWidth = 1.8;
        const wheelRadius = 0.5;
        const wheelOffset = 0.5;
        
        const chassisShape = new CANNON.Box(new CANNON.Vec3(chassisLength * 0.5, chassisHeight * 0.5, chassisWidth * 0.5));
        this.chassisBody = new CANNON.Body({ mass: CAR_PHYSICS.MASS });
        
        // Điều chỉnh center of mass xuống thấp hơn để tránh bốc đầu và lật
        // Thêm shape với offset để center of mass thấp hơn
        this.chassisBody.addShape(chassisShape, new CANNON.Vec3(0, -0.15, 0));
        
        // Thiết lập material cho thân xe
        this.chassisBody.material = new CANNON.Material('chassisMaterial');
        this.chassisBody.material.friction = 0.4;
        this.chassisBody.material.restitution = 0.1;
        
        this.chassisBody.position.copy(startPosition);
        
        // Xoay xe để nằm dọc với đường đua (hướng lên trên - về phía z âm)
        // RaycastVehicle dùng trục X làm forward, nên cần xoay để trục X trở thành trục Z
        // Xe sẽ hướng từ dưới lên trên (từ z dương về z âm)
        this.chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        
        // Đảm bảo xe luôn ổn định khi rơi - thêm angular damping
        this.chassisBody.angularDamping = 0.4; // Giảm xoay khi rơi
        this.chassisBody.linearDamping = 0.01; // Giảm tốc độ rơi nhẹ

        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexRightAxis: 2,
            indexUpAxis: 1,
            indexForwardAxis: 0,
        });

        // Cài đặt bánh xe
        const wheelOptions = {
            radius: wheelRadius,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: wheelRadius, // Độ dài suspension = bán kính bánh xe
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.3, // Tăng rollInfluence để xe ổn định hơn, tránh lật
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
            material: new CANNON.Material('wheelMaterial')
        };

        // Vị trí kết nối của bánh xe - đồng bộ với vị trí đồ họa
        // Y = -chassisHeight/2 để kết nối ở dưới thân xe, suspension sẽ đẩy bánh xuống
        const wheelY = -chassisHeight / 2;
        
        // Thứ tự: Trước trái, Trước phải, Sau trái, Sau phải
        wheelOptions.chassisConnectionPointLocal.set(-chassisLength / 2 + wheelOffset, wheelY, chassisWidth / 2);
        this.vehicle.addWheel(wheelOptions); // Trước trái
        
        wheelOptions.chassisConnectionPointLocal.set(-chassisLength / 2 + wheelOffset, wheelY, -chassisWidth / 2);
        this.vehicle.addWheel(wheelOptions); // Trước phải
        
        wheelOptions.chassisConnectionPointLocal.set(chassisLength / 2 - wheelOffset, wheelY, chassisWidth / 2);
        this.vehicle.addWheel(wheelOptions); // Sau trái
        
        wheelOptions.chassisConnectionPointLocal.set(chassisLength / 2 - wheelOffset, wheelY, -chassisWidth / 2);
        this.vehicle.addWheel(wheelOptions); // Sau phải
    }

    // R2: Áp dụng điều khiển bàn phím
    applyControls(controls) {
        let engineForce = 0;
        let steerValue = 0;

        if (controls.forward) {
            // Giảm lực để tránh bốc đầu, và phân bố lực đều hơn
            engineForce = -CAR_PHYSICS.MAX_FORCE * 0.7; // Giảm lực xuống 70%
        }
        if (controls.backward) {
            engineForce = CAR_PHYSICS.MAX_FORCE * 0.5;
        }
        
        // Giảm góc lái và điều chỉnh theo tốc độ để tránh lật xe
        const currentSpeed = Math.abs(this.chassisBody.velocity.length());
        const maxSteerReduction = 0.6; // Giảm góc lái tối đa 40%
        const speedFactor = Math.min(1, currentSpeed / 10); // Tốc độ càng cao, góc lái càng nhỏ
        
        if (controls.left) {
            // Giảm góc lái khi tốc độ cao để tránh lật
            steerValue = CAR_PHYSICS.MAX_STEER_VAL * (1 - maxSteerReduction * speedFactor);
        }
        if (controls.right) {
            // Giảm góc lái khi tốc độ cao để tránh lật
            steerValue = -CAR_PHYSICS.MAX_STEER_VAL * (1 - maxSteerReduction * speedFactor);
        }

        // Phân bố lực đều cho cả 4 bánh để tránh bốc đầu
        // Tác động bánh sau (lái) - 60% lực
        this.vehicle.applyEngineForce(engineForce * 0.6, 2);
        this.vehicle.applyEngineForce(engineForce * 0.6, 3);
        // Tác động bánh trước - 40% lực để giữ xe ổn định
        this.vehicle.applyEngineForce(engineForce * 0.4, 0);
        this.vehicle.applyEngineForce(engineForce * 0.4, 1);
        
        // Tác động bánh trước (bẻ lái) - giảm góc lái để tránh lật
        this.vehicle.setSteeringValue(steerValue, 0);
        this.vehicle.setSteeringValue(steerValue, 1);
    }

    // R2: Đồng bộ hóa đồ họa và vật lý
    syncGraphics() {
        // Đồng bộ vị trí và hướng của thân xe
        this.mesh.position.copy(this.chassisBody.position);
        this.mesh.quaternion.copy(this.chassisBody.quaternion);

        // Đồng bộ bánh xe (bánh xe được thêm trực tiếp vào scene, không qua mesh group)
        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            this.vehicle.updateWheelTransform(i);
            const transform = this.vehicle.wheelInfos[i].worldTransform;
            
            // Cập nhật trực tiếp từ world transform vì bánh xe không nằm trong mesh group
            this.wheelMeshes[i].position.copy(transform.position);
            this.wheelMeshes[i].quaternion.copy(transform.quaternion);
        }
    }

    // Các hàm trợ giúp để lớp Game lấy thông tin
    getPosition() {
        return this.mesh.position;
    }
    getQuaternion() {
        return this.mesh.quaternion;
    }
    getVelocity() {
        return this.chassisBody.velocity.length();
    }
}