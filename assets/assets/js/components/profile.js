class ProfileHandler {
    constructor(app) {
        this.app = app;
        this.profileView = document.getElementById('profileView');
        this.initElements();
    }

    initElements() {
        this.elements = {
            profileCard: document.querySelector('.profile-card'),
            profileName: document.getElementById('profileName'),
            profileAge: document.getElementById('profileAge'),
            profileCity: document.getElementById('profileCity'),
            profileDescription: document.getElementById('profileDescription'),
            profileInterests: document.getElementById('profileInterests'),
            profileAvatar: document.getElementById('profileAvatar'),
            editBtn: document.getElementById('editBtn'),
            newProfileBtn: document.getElementById('newProfileBtn')
        };
    }

    showProfile() {
        const { userData } = this.app.state;
        const profileColor = userData.profileColor || '#D7303B';
        
        // Применяем цвет темы
        this.applyProfileColor(profileColor);

        // Обновляем аватар
        this.updateAvatar(userData.avatar);

        // Заполняем данные профиля
        this.elements.profileName.textContent = userData.name || 'Аноним';
        this.elements.profileAge.textContent = userData.age ? `${userData.age} лет` : '';
        this.elements.profileCity.textContent = userData.city ? `, ${userData.city}` : '';
        this.elements.profileDescription.textContent = userData.description || 'Пользователь пока ничего о себе не рассказал';

        // Обновляем интересы
        this.updateInterests(userData.interests, this.app.config.interests);

        // Привязываем обработчики событий
        this.bindEvents();
    }

    applyProfileColor(color) {
        // Устанавливаем CSS переменные
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-dark', this.darkenColor(color, 20));
        
        // Обновляем элементы, которые не используют CSS переменные
        if (this.elements.profileCard) {
            this.elements.profileCard.style.borderColor = color;
        }
        if (this.elements.profileAvatar) {
            this.elements.profileAvatar.style.borderColor = color;
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

    updateAvatar(avatar) {
        const avatarElement = this.elements.profileAvatar;
        if (!avatarElement) return;

        if (avatar) {
            avatarElement.style.backgroundImage = `url(${avatar})`;
            avatarElement.innerHTML = '';
        } else {
            avatarElement.style.backgroundImage = '';
            avatarElement.innerHTML = '<span class="avatar-placeholder">👤</span>';
        }
    }

    updateInterests(userInterests, configInterests) {
        const interestsContainer = this.elements.profileInterests;
        if (!interestsContainer) return;

        interestsContainer.innerHTML = '';
        
        if (userInterests && userInterests.length > 0) {
            userInterests.forEach(interestId => {
                const interest = configInterests.find(i => i.id === interestId);
                if (interest) {
                    const interestEl = document.createElement('div');
                    interestEl.className = 'interest-tag';
                    interestEl.innerHTML = `${interest.emoji} ${interest.name}`;
                    interestsContainer.appendChild(interestEl);
                }
            });
        } else {
            interestsContainer.innerHTML = '<div class="no-interests">Интересы не выбраны</div>';
        }
    }

    bindEvents() {
        if (!this.elements.editBtn.dataset.listenerAdded) {
            this.elements.editBtn.addEventListener('click', () => {
                this.app.switchScreen('registration');
                this.app.formHandler.renderForm();
            });
            this.elements.editBtn.dataset.listenerAdded = true;
        }

        if (!this.elements.newProfileBtn.dataset.listenerAdded) {
            this.elements.newProfileBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите создать новый профиль? Текущие данные будут удалены.')) {
                    this.resetProfile();
                }
            });
            this.elements.newProfileBtn.dataset.listenerAdded = true;
        }
    }

    resetProfile() {
        this.app.state.userData = {
            name: '',
            age: '',
            city: '',
            description: '',
            interests: [],
            profileColor: '#D7303B',
            avatar: null,
            createdAt: new Date().toISOString()
        };
        
        localStorage.removeItem('datingProfile');
        this.app.switchScreen('registration');
        this.app.formHandler.renderForm();
    }
}