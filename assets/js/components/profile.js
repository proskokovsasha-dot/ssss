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
            profileZodiac: document.getElementById('profileZodiac'),
            profileCity: document.getElementById('profileCity'),
            profileDistance: document.getElementById('profileDistance'),
            profileDescription: document.getElementById('profileDescription'),
            profileDetails: document.getElementById('profileDetails'),
            profileLookingFor: document.getElementById('profileLookingFor'),
            profileInterests: document.getElementById('profileInterests'),
            profilePhotos: document.getElementById('profilePhotos'),
            profileAvatar: document.getElementById('profileAvatar'),
            editBtn: document.getElementById('editBtn'),
            newProfileBtn: document.getElementById('newProfileBtn')
        };
    }

    showProfile() {
        const { userData } = this.app.state;
        const profileColor = userData.profileColor || '#D7303B';
        
        this.applyProfileColor(profileColor);
        this.updateAvatar(userData.avatar);
        this.updateProfileInfo(userData);
        this.updateDetails(userData);
        this.updateLookingFor(userData.lookingFor, this.app.config.lookingForOptions);
        this.updateInterests(userData.interests, this.app.config.interests);
        this.updatePhotos(userData.photos);
        this.bindEvents();
    }

    applyProfileColor(color) {
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-dark', this.darkenColor(color, 20));
        
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

    updateProfileInfo(userData) {
        this.elements.profileName.textContent = userData.name || 'Аноним';
        
        if (userData.gender) {
            const genderEmoji = userData.gender === 'male' ? '👨' : '👩';
            this.elements.profileName.textContent += ` ${genderEmoji}`;
        }
        
        this.elements.profileAge.textContent = userData.age ? `${userData.age} лет` : '';
        
        if (userData.zodiacSign) {
            const zodiac = this.app.config.zodiacSigns.find(z => z.id === userData.zodiacSign);
            this.elements.profileZodiac.textContent = zodiac ? `, ${zodiac.name}` : '';
        }
        
        this.elements.profileCity.textContent = userData.city ? `, ${userData.city}` : '';
        
        if (userData.location?.lat && this.app.state.userData.location?.lat) {
            const distance = this.app.calculateDistance(
                userData.location.lat,
                userData.location.lng,
                this.app.state.userData.location.lat,
                this.app.state.userData.location.lng
            );
            if (distance) {
                this.elements.profileDistance.textContent = `, ~${distance} км от вас`;
            }
        }
        
        this.elements.profileDescription.textContent = userData.description || 'Пользователь пока ничего о себе не рассказал';
    }

    updateDetails(userData) {
        let detailsHTML = '';
        
        if (userData.relationshipStatus) {
            const status = this.app.config.relationshipStatuses.find(s => s.id === userData.relationshipStatus);
            if (status) detailsHTML += `<div>${status.emoji} ${status.name}</div>`;
        }
        
        if (userData.education) {
            const edu = this.app.config.educationLevels.find(e => e.id === userData.education);
            if (edu) detailsHTML += `<div>🎓 ${edu.name}</div>`;
        }
        
        if (userData.profession) detailsHTML += `<div>💼 ${userData.profession}</div>`;
        if (userData.height) detailsHTML += `<div>📏 ${userData.height} см</div>`;
        if (userData.weight) detailsHTML += `<div>⚖️ ${userData.weight} кг</div>`;
        
        if (userData.personalityType) {
            const type = this.app.config.personalityTypes.find(t => t.id === userData.personalityType);
            if (type) detailsHTML += `<div>🧠 ${type.name}</div>`;
        }
        
        if (userData.smoking) {
            const smokingText = {
                'never': '🚭 Не курю',
                'sometimes': '🚬 Иногда курю',
                'regularly': '🚬 Регулярно курю'
            }[userData.smoking];
            if (smokingText) detailsHTML += `<div>${smokingText}</div>`;
        }
        
        if (userData.alcohol) {
            const alcoholText = {
                'never': '🚱 Не пью',
                'sometimes': '🍷 Иногда пью',
                'regularly': '🍺 Регулярно пью'
            }[userData.alcohol];
            if (alcoholText) detailsHTML += `<div>${alcoholText}</div>`;
        }
        
        if (userData.children) {
            const childrenText = {
                'none': '👶 Нет детей',
                'have': '👨‍👩‍👧‍👦 Есть дети',
                'want': '👶 Хочу детей'
            }[userData.children];
            if (childrenText) detailsHTML += `<div>${childrenText}</div>`;
        }
        
        if (userData.pets) detailsHTML += `<div>🐾 ${userData.pets}</div>`;
        if (userData.languages?.length > 0) detailsHTML += `<div>🗣️ ${userData.languages.join(', ')}</div>`;
        
        this.elements.profileDetails.innerHTML = detailsHTML || '<div>Дополнительная информация не указана</div>';
    }

    updateLookingFor(lookingFor, options) {
        const container = this.elements.profileLookingFor;
        if (!container) return;

        container.innerHTML = '';
        
        if (lookingFor && lookingFor.length > 0) {
            lookingFor.forEach(optionId => {
                const option = options.find(o => o.id === optionId);
                if (option) {
                    const el = document.createElement('div');
                    el.className = 'interest-tag';
                    el.innerHTML = `${option.emoji} ${option.name}`;
                    container.appendChild(el);
                }
            });
        } else {
            container.innerHTML = '<div class="no-interests">Не указано, что ищет</div>';
        }
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

    updatePhotos(photos) {
        const photosContainer = this.elements.profilePhotos;
        if (!photosContainer) return;

        if (photos && photos.length > 0) {
            photosContainer.innerHTML = `
                <div class="photos-grid">
                    ${photos.map(photo => `
                        <div class="photo-preview" style="background-image: url(${photo})"></div>
                    `).join('')}
                </div>
            `;
        } else {
            photosContainer.innerHTML = '<div class="no-photos">Фотографии не добавлены</div>';
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
            gender: '',
            age: '',
            birthDate: '',
            zodiacSign: '',
            city: '',
            description: '',
            interests: [],
            lookingFor: [],
            profileColor: '#D7303B',
            avatar: null,
            photos: [],
            relationshipStatus: '',
            education: '',
            profession: '',
            height: '',
            weight: '',
            personalityType: '',
            smoking: '',
            alcohol: '',
            children: '',
            pets: '',
            languages: [],
            location: { lat: null, lng: null },
            createdAt: new Date().toISOString()
        };
        
        localStorage.removeItem('datingProfile');
        this.app.switchScreen('registration');
        this.app.formHandler.renderForm();
    }
}