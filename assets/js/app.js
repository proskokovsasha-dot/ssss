class DatingApp {
    constructor() {
        this.config = {
            colors: ['#10367D', '#2D4D9E', '#4A64BF', '#677BDF', '#FF6B6B', '#FF8E8E', '#4ECDC4', '#7EDFD8', '#A05195', '#C27BB3', '#FDCB6E', '#FFEAA7'],
            maxInterests: 3,
            minAge: 18,
            maxAge: 100,
            interests: [
                { id: 'music', name: 'Музыка', emoji: '🎵' },
                { id: 'sports', name: 'Спорт', emoji: '⚽' },
                { id: 'books', name: 'Книги', emoji: '📚' },
                { id: 'travel', name: 'Путешествия', emoji: '✈️' },
                { id: 'art', name: 'Искусство', emoji: '🎨' },
                { id: 'games', name: 'Игры', emoji: '🎮' }
            ]
        };

        this.state = {
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

        this.initElements();
        this.formHandler = new FormHandler(this);
        this.profileHandler = new ProfileHandler(this);
        this.uiHandler = new UIHandler(this);

        this.bindEvents();
        this.checkSavedProfile();
        this.uiHandler.initLogoAnimation();
    }

    initElements() {
        this.elements = {
            mainScreen: document.getElementById('mainScreen'),
            registrationForm: document.getElementById('registrationForm'),
            profileView: document.getElementById('profileView'),
            startBtn: document.getElementById('startBtn')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startRegistration());
    }

    checkSavedProfile() {
        const savedProfile = localStorage.getItem('datingProfile');
        if (savedProfile) {
            this.state.userData = JSON.parse(savedProfile);
            this.showProfile();
        }
    }

    startRegistration() {
        this.switchScreen('registration');
        this.formHandler.renderForm();
    }

    showProfile() {
        this.profileHandler.showProfile();
        this.switchScreen('profile');
    }

    switchScreen(screenName) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    new DatingApp();
});