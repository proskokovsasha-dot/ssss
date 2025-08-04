// form.js
class FormHandler {
    constructor(app) {
        this.app = app;
    }
    
    applyProfileColor(color) {
        // Сохраняем цвет в state и localStorage
        this.app.state.userData.profileColor = color;
        localStorage.setItem('datingProfile', JSON.stringify(this.app.state.userData));
        
        // Обновляем CSS переменные
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-dark', this.darkenColor(color, 20));
        
        // Принудительно обновляем профиль, если он открыт
        if (this.app.elements.profileView.classList.contains('active')) {
            this.app.profileHandler.showProfile();
        }
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
    renderForm() {
        this.app.elements.registrationForm.innerHTML = `
            <div class="form-container">
                ${this.generateSteps()}
            </div>
        `;
        this.setupFormHandlers();
        this.focusCurrentField();
        this.initColorSelection();
    }

    generateSteps() {
        return Array.from({ length: this.app.state.totalSteps }, (_, i) => i + 1)
            .map(step => this.generateStep(step)).join('');
    }

    generateStep(step) {
        return `
            <div class="form-step ${step === this.app.state.currentStep ? 'active' : ''}" data-step="${step}">
                ${this.getStepContent(step)}
                ${this.getStepButtons(step)}
            </div>
        `;
    }

    getStepContent(step) {
        const stepContents = {
            1: this.getNameStep(),
            2: this.getAgeStep(),
            3: this.getCityStep(),
            4: this.getInterestsStep(),
            5: this.getColorStep(),
            6: this.getDescriptionStep(),
            7: this.getAvatarStep()
        };
        return stepContents[step] || '';
    }

    getNameStep() {
        return `
            <h2 class="section-title">Как вас зовут?</h2>
            <input type="text" class="input-field" id="userName" 
                   placeholder="Ваше имя" 
                   value="${this.app.state.userData.name || ''}" required>
        `;
    }

    getAgeStep() {
        return `
            <h2 class="section-title">Сколько вам лет?</h2>
            <input type="number" class="input-field" id="userAge" 
                   min="${this.app.config.minAge}" max="${this.app.config.maxAge}" 
                   placeholder="Ваш возраст" 
                   value="${this.app.state.userData.age || ''}" required>
        `;
    }

    getCityStep() {
        return `
            <h2 class="section-title">Ваш город</h2>
            <input type="text" class="input-field" id="userCity" 
                   placeholder="Где вы живете?" 
                   value="${this.app.state.userData.city || ''}" required>
        `;
    }

    getInterestsStep() {
        return `
            <h2 class="section-title">Что вам нравится?</h2>
            <p class="section-description">Выберите 1-3 варианта</p>
            <div class="tags-container">
                ${this.app.config.interests.map(interest => `
                    <div class="tag ${(this.app.state.userData.interests || []).includes(interest.id) ? 'selected' : ''}" 
                         data-interest="${interest.id}">
                        ${interest.emoji} ${interest.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    getColorStep() {
        return `
            <h2 class="section-title">Выберите цвет профиля</h2>
            <p class="section-description">Этот цвет будет использоваться в оформлении вашего профиля</p>
            
            <div class="color-palette">
                ${this.app.config.colors.map(color => `
                    <div class="color-option ${this.app.state.userData.profileColor === color ? 'selected' : ''}" 
                         style="background: ${color}" 
                         data-color="${color}"></div>
                `).join('')}
            </div>
            
            <div class="color-custom">
                <input type="color" id="customColor" value="${this.app.state.userData.profileColor || '#D7303B'}">
                <label>Или выберите свой цвет</label>
            </div>
        `;
    }

    getDescriptionStep() {
        return `
            <h2 class="section-title">О себе</h2>
            <p class="section-description">Расскажите что-то о себе (необязательно)</p>
            <textarea class="input-field" id="userDescription" 
                      placeholder="Я люблю путешествия, книги и..." rows="4">${this.app.state.userData.description || ''}</textarea>
        `;
    }

    getAvatarStep() {
        return `
            <h2 class="section-title">Ваше фото</h2>
            <p class="section-description">Добавьте фото для профиля (необязательно)</p>
            <div class="avatar-upload">
                <label class="btn">
                    📸 Выбрать фото
                    <input type="file" id="avatarUpload" accept="image/*" hidden>
                </label>
                <div class="avatar-preview" id="avatarPreview" 
                     style="${this.app.state.userData.avatar ? `background-image: url(${this.app.state.userData.avatar})` : ''}">
                    ${!this.app.state.userData.avatar ? '<span class="avatar-placeholder">👤</span>' : ''}
                </div>
            </div>
        `;
    }

    getStepButtons(step) {
        return `
            <div class="navigation">
                <button class="btn next-step" ${step === this.app.state.totalSteps ? 'id="saveProfileBtn"' : ''}>
                    ${step === this.app.state.totalSteps ? 'Сохранить профиль' : 'Далее'}
                </button>
                ${step > 1 ? `<button class="btn btn-secondary prev-step">Назад</button>` : ''}
            </div>
        `;
    }

    setupFormHandlers() {
        this.setupNavigationHandlers();
        this.setupInterestHandlers();
        this.setupColorHandlers();
        this.setupAvatarHandler();
        this.setupEnterKeyHandler();
    }

    setupNavigationHandlers() {
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.handleNextStep());
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
    }

    setupInterestHandlers() {
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleInterest(e));
        });
    }

    setupColorHandlers() {
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => {
                const selectedColor = e.currentTarget.dataset.color;
                this.updateColorSelection(selectedColor);
            });
        });

        const customColor = document.getElementById('customColor');
        if (customColor) {
            customColor.addEventListener('input', (e) => {
                const selectedColor = e.target.value;
                this.updateColorSelection(selectedColor);
            });
        }
    }

    setupAvatarHandler() {
        const upload = document.getElementById('avatarUpload');
        if (upload) {
            upload.addEventListener('change', (e) => this.handleAvatar(e));
        }
    }

    setupEnterKeyHandler() {
        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleNextStep();
                }
            });
        });
    }

    initColorSelection() {
        const savedColor = localStorage.getItem('profileColor') || 
                         this.app.state.userData.profileColor || 
                         '#D7303B';
        this.updateColorSelection(savedColor);
    }

    updateColorSelection(selectedColor) {
        this.app.state.userData.profileColor = selectedColor;
        localStorage.setItem('profileColor', selectedColor);
        
        const darkerColor = this.darkenColor(selectedColor, 20);
        
        document.documentElement.style.setProperty('--primary', selectedColor);
        document.documentElement.style.setProperty('--primary-dark', darkerColor);
        
        this.updateColorPalette(selectedColor);
        this.updateCustomColorInput(selectedColor);
    }

    updateColorPalette(color) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === color) {
                option.classList.add('selected');
            }
        });
    }

    updateCustomColorInput(color) {
        const customColorInput = document.getElementById('customColor');
        if (customColorInput) {
            customColorInput.value = color;
        }
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    toggleInterest(e) {
        const interest = e.currentTarget.dataset.interest;
        const isSelected = e.currentTarget.classList.contains('selected');
        
        if (isSelected) {
            e.currentTarget.classList.remove('selected');
            this.app.state.userData.interests = this.app.state.userData.interests.filter(i => i !== interest);
        } else if (this.app.state.userData.interests.length < this.app.config.maxInterests) {
            e.currentTarget.classList.add('selected');
            this.app.state.userData.interests.push(interest);
        } else {
            alert(`Можно выбрать не более ${this.app.config.maxInterests} интересов`);
        }
    }

    handleAvatar(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.app.state.userData.avatar = e.target.result;
                const preview = document.getElementById('avatarPreview');
                if (preview) {
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    preview.innerHTML = '';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    handleNextStep() {
        if (this.app.state.currentStep === this.app.state.totalSteps) {
            this.saveProfile();
        } else {
            this.nextStep();
        }
    }

    nextStep() {
        if (!this.validateStep()) return;
        this.saveStepData();
        this.goToStep(this.app.state.currentStep + 1);
    }

    prevStep() {
        this.goToStep(this.app.state.currentStep - 1);
    }

    goToStep(step) {
        if (step < 1 || step > this.app.state.totalSteps) return;
        
        const currentStepEl = document.querySelector('.form-step.active');
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }
        
        this.app.state.currentStep = step;
        const nextStepEl = document.querySelector(`[data-step="${step}"]`);
        
        if (nextStepEl) {
            nextStepEl.classList.add('active');
            nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.focusCurrentField();
        }
    }

    validateStep() {
        switch(this.app.state.currentStep) {
            case 1:
                if (!document.getElementById('userName').value.trim()) {
                    alert('Введите ваше имя');
                    return false;
                }
                return true;
            case 2:
                const age = parseInt(document.getElementById('userAge').value);
                if (isNaN(age) || age < this.app.config.minAge || age > this.app.config.maxAge) {
                    alert(`Введите корректный возраст (${this.app.config.minAge}-${this.app.config.maxAge} лет)`);
                    return false;
                }
                return true;
            case 3:
                if (!document.getElementById('userCity').value.trim()) {
                    alert('Укажите ваш город');
                    return false;
                }
                return true;
            case 4:
                if (this.app.state.userData.interests.length === 0) {
                    alert('Выберите хотя бы один интерес');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    saveStepData() {
        switch(this.app.state.currentStep) {
            case 1:
                this.app.state.userData.name = document.getElementById('userName').value.trim();
                break;
            case 2:
                this.app.state.userData.age = document.getElementById('userAge').value;
                break;
            case 3:
                this.app.state.userData.city = document.getElementById('userCity').value.trim();
                break;
            case 5:
                // Цвет сохраняется при выборе
                break;
            case 6:
                this.app.state.userData.description = document.getElementById('userDescription').value.trim();
                break;
            case 7:
                // Аватар сохраняется при загрузке
                break;
        }
    }

    focusCurrentField() {
        const activeStep = document.querySelector('.form-step.active');
        const input = activeStep?.querySelector('input, textarea');
        input?.focus();
    }

    saveProfile() {
        if (!this.validateStep()) return;
        this.saveStepData();
        
        localStorage.setItem('datingProfile', JSON.stringify(this.app.state.userData));
        this.app.showProfile();
    }
}