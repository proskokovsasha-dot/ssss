class DatingApp {
    constructor() {
        this.config = {
            colors: ['#10367D', '#2D4D9E', '#4A64BF', '#677BDF', '#FF6B6B', '#FF8E8E', '#4ECDC4', '#7EDFD8', '#A05195', '#C27BB3', '#FDCB6E', '#FFEAA7'],
            maxInterests: 5,
            minAge: 18,
            maxAge: 100,
            maxPhotos: 6,
            interests: [
                { id: 'music', name: 'Музыка', emoji: '🎵' },
                { id: 'sports', name: 'Спорт', emoji: '⚽' },
                { id: 'books', name: 'Книги', emoji: '📚' },
                { id: 'travel', name: 'Путешествия', emoji: '✈️' },
                { id: 'art', name: 'Искусство', emoji: '🎨' },
                { id: 'games', name: 'Игры', emoji: '🎮' }
            ],
            relationshipStatuses: [
                { id: 'single', name: 'Холост/Не замужем' },
                { id: 'relationship', name: 'В отношениях' },
                { id: 'complicated', name: 'Всё сложно' }
            ]
        };

        this.state = {
            currentStep: 1,
            totalSteps: 10,
            userData: {
                name: '',
                gender: '',
                age: '',
                city: '',
                description: '',
                interests: [],
                profileColor: '#D7303B',
                avatar: null,
                photos: [],
                relationshipStatus: '',
                education: '',
                profession: '',
                height: '',
                location: { lat: null, lng: null },
                createdAt: new Date().toISOString()
            }
        };

        this.elements = {
            mainScreen: document.getElementById('mainScreen'),
            registrationForm: document.getElementById('registrationForm'),
            profileView: document.getElementById('profileView'),
            startBtn: document.getElementById('startBtn')
        };

        if (!this.elements.mainScreen || !this.elements.registrationForm || !this.elements.profileView || !this.elements.startBtn) {
            console.error('Не удалось найти необходимые элементы DOM');
            return;
        }

        this.formHandler = new FormHandler(this);
        this.profileHandler = new ProfileHandler(this);
        this.uiHandler = new UIHandler(this);

        this.bindEvents();
        this.checkSavedProfile();
        this.uiHandler.initLogoAnimation();
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startRegistration());
    }

    checkSavedProfile() {
        const savedProfile = localStorage.getItem('datingProfile');
        if (savedProfile) {
            try {
                this.state.userData = JSON.parse(savedProfile);
                this.showProfile();
            } catch (e) {
                console.error('Ошибка при загрузке профиля:', e);
                localStorage.removeItem('datingProfile');
            }
        }
    }

    startRegistration() {
        console.log('Начало регистрации'); // Добавьте это для отладки
        this.switchScreen('registration');
        this.formHandler.renderForm();
    }

    showProfile() {
        this.profileHandler.showProfile();
        this.switchScreen('profile');
    }

    switchScreen(screenName) {
        console.log('Переключение на экран:', screenName); // Добавьте это для отладки
        this.elements.mainScreen.classList.remove('active');
        this.elements.registrationForm.classList.remove('active');
        this.elements.profileView.classList.remove('active');

        if (screenName === 'main') {
            this.elements.mainScreen.classList.add('active');
        } else if (screenName === 'registration') {
            this.elements.registrationForm.classList.add('active');
        } else if (screenName === 'profile') {
            this.elements.profileView.classList.add('active');
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        
        const R = 6371;
        const dLat = this.deg2rad(lat2-lat1);
        const dLon = this.deg2rad(lon2-lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен'); // Добавьте это для отладки
    new DatingApp();
});