// src/SettingsMenu.js
// Menu cài đặt ở góc trên bên phải

export default class SettingsMenu {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.settings = {
            lightIntensity: 0.8,
            ambientIntensity: 0.4,
            shadowEnabled: true,
            shadowType: 'PCF', // PCF, Basic, PCFSoft
            cameraOffsetX: 0,
            cameraOffsetY: 5,
            cameraOffsetZ: 10,
            cameraLerp: 0.1,
            cameraMode: 'follow' // 'follow' hoặc 'thirdPerson'
        };
        
        this.createMenu();
        this.setupEventListeners();
    }

    createMenu() {
        // Container chính
        this.container = document.createElement('div');
        this.container.id = 'settingsMenu';
        this.container.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: 'Arial', sans-serif;
            font-size: 0.9rem;
            min-width: 250px;
            max-width: 300px;
            z-index: 1000;
            display: none;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // Nút mở/đóng menu
        this.toggleButton = document.createElement('button');
        this.toggleButton.textContent = '⚙️ Cài đặt';
        this.toggleButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 0.5rem 1rem;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            z-index: 1001;
            transition: all 0.3s;
        `;
        this.toggleButton.addEventListener('mouseenter', () => {
            this.toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        });
        this.toggleButton.addEventListener('mouseleave', () => {
            this.toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });

        // Tiêu đề
        const title = document.createElement('h3');
        title.textContent = 'Cài đặt';
        title.style.cssText = 'margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 0.5rem;';
        this.container.appendChild(title);

        // Ánh sáng
        this.createLightSection();
        
        // Shadow
        this.createShadowSection();
        
        // Camera
        this.createCameraSection();

        document.body.appendChild(this.container);
        document.body.appendChild(this.toggleButton);
    }

    createLightSection() {
        const section = document.createElement('div');
        section.style.marginBottom = '1rem';
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = '💡 Ánh sáng';
        sectionTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        section.appendChild(sectionTitle);

        // Cường độ đèn hướng
        const dirLightDiv = this.createSlider(
            'Cường độ đèn chính:',
            this.settings.lightIntensity,
            0,
            2,
            0.1,
            (value) => {
                this.settings.lightIntensity = value;
                if (this.game.worldManager && this.game.worldManager.directionalLight) {
                    this.game.worldManager.directionalLight.intensity = value;
                }
            }
        );
        section.appendChild(dirLightDiv);

        // Cường độ đèn môi trường
        const ambLightDiv = this.createSlider(
            'Cường độ đèn môi trường:',
            this.settings.ambientIntensity,
            0,
            1,
            0.1,
            (value) => {
                this.settings.ambientIntensity = value;
                if (this.game.worldManager && this.game.worldManager.ambientLight) {
                    this.game.worldManager.ambientLight.intensity = value;
                }
            }
        );
        section.appendChild(ambLightDiv);

        this.container.appendChild(section);
    }

    createShadowSection() {
        const section = document.createElement('div');
        section.style.marginBottom = '1rem';
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = '🌑 Shadow';
        sectionTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        section.appendChild(sectionTitle);

        // Bật/tắt shadow
        const shadowToggle = this.createToggle(
            'Bật Shadow:',
            this.settings.shadowEnabled,
            (enabled) => {
                this.settings.shadowEnabled = enabled;
                if (this.game.renderer) {
                    this.game.renderer.shadowMap.enabled = enabled;
                }
            }
        );
        section.appendChild(shadowToggle);

        // Loại shadow
        const shadowTypeDiv = document.createElement('div');
        shadowTypeDiv.style.marginTop = '0.5rem';
        const label = document.createElement('label');
        label.textContent = 'Loại Shadow: ';
        label.style.marginRight = '0.5rem';
        const select = document.createElement('select');
        select.style.cssText = 'padding: 0.25rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.25rem;';
        ['Basic', 'PCF', 'PCFSoft'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            if (type === this.settings.shadowType) option.selected = true;
            select.appendChild(option);
        });
        select.addEventListener('change', (e) => {
            this.settings.shadowType = e.target.value;
            if (this.game.renderer) {
                const shadowTypes = {
                    'Basic': THREE.BasicShadowMap,
                    'PCF': THREE.PCFShadowMap,
                    'PCFSoft': THREE.PCFSoftShadowMap
                };
                this.game.renderer.shadowMap.type = shadowTypes[e.target.value];
            }
        });
        shadowTypeDiv.appendChild(label);
        shadowTypeDiv.appendChild(select);
        section.appendChild(shadowTypeDiv);

        this.container.appendChild(section);
    }

    createCameraSection() {
        const section = document.createElement('div');
        section.style.marginBottom = '1rem';
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = '📷 Camera';
        sectionTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        section.appendChild(sectionTitle);

        // Chế độ camera
        const cameraModeDiv = document.createElement('div');
        cameraModeDiv.style.marginBottom = '0.75rem';
        const label = document.createElement('label');
        label.textContent = 'Chế độ Camera: ';
        label.style.marginRight = '0.5rem';
        const select = document.createElement('select');
        select.style.cssText = 'padding: 0.25rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.25rem;';
        ['follow', 'thirdPerson'].forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.textContent = mode === 'follow' ? 'Theo dõi' : 'Góc nhìn thứ 3';
            if (mode === this.settings.cameraMode) option.selected = true;
            select.appendChild(option);
        });
        select.addEventListener('change', (e) => {
            this.settings.cameraMode = e.target.value;
        });
        cameraModeDiv.appendChild(label);
        cameraModeDiv.appendChild(select);
        section.appendChild(cameraModeDiv);

        // Offset X
        const offsetXDiv = this.createSlider(
            'Offset X:',
            this.settings.cameraOffsetX,
            -10,
            10,
            0.5,
            (value) => {
                this.settings.cameraOffsetX = value;
            }
        );
        section.appendChild(offsetXDiv);

        // Offset Y
        const offsetYDiv = this.createSlider(
            'Offset Y:',
            this.settings.cameraOffsetY,
            0,
            20,
            0.5,
            (value) => {
                this.settings.cameraOffsetY = value;
            }
        );
        section.appendChild(offsetYDiv);

        // Offset Z
        const offsetZDiv = this.createSlider(
            'Offset Z:',
            this.settings.cameraOffsetZ,
            0,
            30,
            0.5,
            (value) => {
                this.settings.cameraOffsetZ = value;
            }
        );
        section.appendChild(offsetZDiv);

        // Camera Lerp
        const lerpDiv = this.createSlider(
            'Độ mượt (Lerp):',
            this.settings.cameraLerp,
            0.01,
            1,
            0.01,
            (value) => {
                this.settings.cameraLerp = value;
            }
        );
        section.appendChild(lerpDiv);

        this.container.appendChild(section);
    }

    createSlider(labelText, value, min, max, step, onChange) {
        const div = document.createElement('div');
        div.style.marginBottom = '0.75rem';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.display = 'block';
        label.style.marginBottom = '0.25rem';
        div.appendChild(label);
        
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '0.5rem';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;
        slider.style.flex = '1';
        slider.style.cursor = 'pointer';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = value.toFixed(2);
        valueDisplay.style.minWidth = '50px';
        valueDisplay.style.textAlign = 'right';
        
        slider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            valueDisplay.textContent = newValue.toFixed(2);
            onChange(newValue);
        });
        
        container.appendChild(slider);
        container.appendChild(valueDisplay);
        div.appendChild(container);
        
        return div;
    }

    createToggle(labelText, value, onChange) {
        const div = document.createElement('div');
        div.style.marginBottom = '0.75rem';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.cursor = 'pointer';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = value;
        toggle.style.cursor = 'pointer';
        toggle.addEventListener('change', (e) => {
            onChange(e.target.checked);
        });
        
        div.appendChild(label);
        div.appendChild(toggle);
        
        return div;
    }

    setupEventListeners() {
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'block' : 'none';
    }

    getCameraOffset() {
        return {
            x: this.settings.cameraOffsetX,
            y: this.settings.cameraOffsetY,
            z: this.settings.cameraOffsetZ
        };
    }

    getCameraLerp() {
        return this.settings.cameraLerp;
    }
}

