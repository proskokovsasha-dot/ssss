class ProfileHandler {
    constructor(app) {
        this.app = app;
        this.profileEl = document.getElementById('profileView');
    }

    showProfile() {
        const { userData } = this.app.state;
        const config = this.app.config;

        // Основная информация
        document.getElementById('profileName').textContent = userData.name || 'Аноним';
        document.getElementById('profileAge').textContent = userData.age ? `${userData.age} лет` : 'Возраст не указан';
        document.getElementById('profileCity').textContent = userData.city || 'Город не указан';
        
        // Описание
        const descriptionEl = document.getElementById('profileDescription');
        descriptionEl.textContent = userData.description || 'Пользователь пока ничего о себе не рассказал';
        if (!userData.description) {
            descriptionEl.style.opacity = '0.7';
            descriptionEl.style.fontStyle = 'italic';
        }

        // Интересы
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
            interestsContainer.innerHTML = '<div class="interest-tag">Интересы не выбраны</div>';
        }

        // Цвет настроения
        const moodEl = document.getElementById('profileMood');
        if (userData.moodColor) {
            moodEl.style.backgroundColor = userData.moodColor;
            moodEl.title = 'Ваш цвет настроения';
        } else {
            moodEl.style.backgroundColor = '#e0e0e0';
        }

        // Аватар
        const avatarEl = document.getElementById('profileAvatar');
        if (userData.avatar) {
            avatarEl.style.backgroundImage = `url(${userData.avatar})`;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.style.backgroundPosition = 'center';
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
                this.resetProfile();
            }
        });
    }

    resetProfile() {
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
}