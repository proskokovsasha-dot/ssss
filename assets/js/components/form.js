class FormHandler {
    constructor(app) {
        this.app = app;
    }

    renderForm() {
        this.app.elements.registrationForm.innerHTML = `
            <div class="form-container">
                ${this.generateSteps()}
            </div>
        `;
        this.setupFormHandlers();
        this.focusCurrentField();
    }

    generateSteps() {
        return Array.from({ length: this.app.state.totalSteps }, (_, i) => i + 1)
            .map(step => `
                <div class="form-step ${step === this.app.state.currentStep ? 'active' : ''}" data-step="${step}">
                    ${this.getStepContent(step)}
                    ${this.getStepButtons(step)}
                </div>
            `).join('');
    }

    getStepContent(step) {
        const steps = {
            1: `
                <h2 class="section-title">Как вас зовут?</h2>
                <input type="text" class="input-field" id="userName" placeholder="Ваше имя" required>
            `,
            2: `
                <h2 class="section-title">Сколько вам лет?</h2>
                <input type="number" class="input-field" id="userAge" 
                       min="${this.app.config.minAge}" max="${this.app.config.maxAge}" 
                       placeholder="Ваш возраст" required>
            `,
            3: `
                <h2 class="section-title">Ваш город</h2>
                <input type="text" class="input-field" id="userCity" placeholder="Где вы живете?" required>
            `,
            4: `
                <h2 class="section-title">Что вам нравится?</h2>
                <p class="section-description">Выберите 1-3 варианта</p>
                <div class="tags-container">
                    ${this.app.config.interests.map(interest => `
                        <div class="tag" data-interest="${interest.id}">
                            ${interest.emoji} ${interest.name}
                        </div>
                    `).join('')}
                </div>
            `,
            5: `
                <h2 class="section-title">Ваш любимый цвет</h2>
                <div class="colors-container">
                    ${this.app.config.colors.map(color => `
                        <div class="color-option" style="background: ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>
            `,
            6: `
                <h2 class="section-title">О себе</h2>
                <p class="section-description">Расскажите что-то о себе (необязательно)</p>
                <textarea class="input-field" id="userDescription" 
                          placeholder="Я люблю путешествия, книги и..." rows="4"></textarea>
            `,
            7: `
                <h2 class="section-title">Ваше фото</h2>
                <p class="section-description">Добавьте фото для профиля (необязательно)</p>
                <div class="avatar-upload">
                    <label class="btn">
                        📸 Выбрать фото
                        <input type="file" id="avatarUpload" accept="image/*" hidden>
                    </label>
                    <div class="avatar-preview" id="avatarPreview"></div>
                </div>
            `
        };
        return steps[step] || '';
    }

    getStepButtons(step) {
        return `
            <div class="navigation">
                ${step > 1 ? `<button class="btn btn-secondary prev-step">Назад</button>` : ''}
                <button class="btn next-step" ${step === this.app.state.totalSteps ? 'id="saveProfileBtn"' : ''}>
                    ${step === this.app.state.totalSteps ? 'Сохранить профиль' : 'Далее'}
                </button>
            </div>
        `;
    }

    setupFormHandlers() {
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.handleNextStep());
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleInterest(e));
        });

        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => this.selectColor(e));
        });

        const upload = document.getElementById('avatarUpload');
        if (upload) {
            upload.addEventListener('change', (e) => this.handleAvatar(e));
        }

        document.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleNextStep();
                }
            });
        });
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

    selectColor(e) {
        document.querySelectorAll('.color-option').forEach(c => {
            c.classList.remove('selected');
        });
        
        e.currentTarget.classList.add('selected');
        this.app.state.userData.moodColor = e.currentTarget.dataset.color;
    }

    handleAvatar(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.app.state.userData.avatar = e.target.result;
                const preview = document.getElementById('avatarPreview');
                preview.style.backgroundImage = `url(${e.target.result})`;
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
        
        document.querySelector('.form-step.active').classList.remove('active');
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
            case 6:
                this.app.state.userData.description = document.getElementById('userDescription').value.trim();
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