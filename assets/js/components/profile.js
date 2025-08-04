class ProfileHandler {
    constructor(app) {
        this.app = app;
    }

    showProfile() {
        const { userData } = this.app.state;
        const config = this.app.config;

        document.getElementById('profileName').textContent = userData.name || 'Не указано';
        
        const ageCity = [];
        if (userData.age) ageCity.push(`${userData.age} лет`);
        if (userData.city) ageCity.push(userData.city);
        document.getElementById('profileAgeCity').textContent = ageCity.join(', ') || 'Возраст и город не указаны';
        
        document.getElementById('profileDescription').textContent = userData.description || 'Нет описания';

        // Отображаем интересы
        const interestsContainer = document.getElementById('profileInterests');
        interestsContainer.innerHTML = '';
        
        if (userData.interests && userData.interests.length > 0) {
            userData.interests.forEach(interestId => {
                const interest = config.interests.find(i => i.id === interestId);
                if (interest) {
                    const interestEl = document.createElement('div');
                    interestEl.className = 'interest-tag';
                    interestEl.innerHTML = `${interest.emoji} ${interest.name}`;
                    interestsContainer.appendChild(interestEl);
                }
            });
        } else {
            interestsContainer.textContent = 'Интересы не выбраны';
        }

        // Отображаем цвет настроения
        const moodEl = document.getElementById('profileMood');
        if (userData.moodColor) {
            moodEl.style.backgroundColor = userData.moodColor;
            moodEl.textContent = '';
        } else {
            moodEl.textContent = 'Не выбран';
        }

        // Отображаем аватар
        const avatarEl = document.getElementById('profileAvatar');
        if (userData.avatar) {
            avatarEl.style.backgroundImage = `url(${userData.avatar})`;
            avatarEl.innerHTML = '';
        } else {
            avatarEl.style.backgroundImage = '';
            avatarEl.innerHTML = '<div class="avatar-placeholder">👤</div>';
        }

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('editBtn').addEventListener('click', () => {
            this.app.switchScreen('registration');
            this.app.formHandler.renderForm();
        });

        document.getElementById('newProfileBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите создать новый профиль? Текущие данные будут удалены.')) {
                this.app.state = {
                    currentStep: 1,
                    totalSteps: 7,
                    userData: {
                        name: '',
                        age: '',
                        city: '',
                        description: '',
                        interests: [],
                        moodColor: '#10367D',
                        avatar: null,
                        createdAt: new Date().toISOString()
                    }
                };
                
                localStorage.removeItem('datingProfile');
                this.app.switchScreen('registration');
                this.app.formHandler.renderForm();
            }
        });
    }
}