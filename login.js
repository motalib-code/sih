document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const loadingContainer = document.getElementById('loading-container');
    const welcomeContainer = document.getElementById('welcome-container');
    const welcomeText = document.getElementById('welcome-text');
    const userGreeting = document.getElementById('user-greeting');
    const redirectText = document.getElementById('redirect-text');
    const malayalamBtn = document.getElementById('malayalam-btn');
    const englishBtn = document.getElementById('english-btn');
    
    // Global variables
    let currentLanguage = 'malayalam';
    
    // Setup event listeners
    setupEventListeners();
    
    // Function to setup event listeners
    function setupEventListeners() {
        // Login form submission
        loginForm.addEventListener('submit', handleLogin);
        
        // Language toggle
        malayalamBtn.addEventListener('click', () => setLanguage('malayalam'));
        englishBtn.addEventListener('click', () => setLanguage('english'));
    }
    
    // Handle login form submission
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Basic validation
        if (!username || !password) {
            alert(currentLanguage === 'malayalam' ? 
                'ദയവായി എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക' : 
                'Please fill in all fields');
            return;
        }
        
        // Show loading animation
        showLoadingAnimation();
        
        // Simulate authentication process (3 seconds)
        setTimeout(() => {
            // Hide loading animation
            hideLoadingAnimation();
            
            // Set login status in local storage and session storage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            // Show welcome message with username
            showWelcomeMessage(username);
            
            // Redirect to main page after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }, 3000);
    }
    
    // Show loading animation
    function showLoadingAnimation() {
        loadingContainer.classList.add('active');
    }
    
    // Hide loading animation
    function hideLoadingAnimation() {
        loadingContainer.classList.remove('active');
    }
    
    // Show welcome message
    function showWelcomeMessage(username) {
        // Set welcome text based on language
        if (currentLanguage === 'malayalam') {
            welcomeText.textContent = `സ്വാഗതം, ${username}!`;
            userGreeting.textContent = 'കർഷക സഹായിയിലേക്ക് സ്വാഗതം';
            redirectText.textContent = 'നിങ്ങളെ ഉടൻ തന്നെ പ്രധാന പേജിലേക്ക് റീഡയറക്ട് ചെയ്യുന്നതാണ്';
        } else {
            welcomeText.textContent = `Welcome, ${username}!`;
            userGreeting.textContent = 'Welcome to Farmer Assistant';
            redirectText.textContent = 'You will be redirected to the main page shortly';
        }
        
        // Show welcome container
        welcomeContainer.classList.add('active');
    }
    
    // Set language
    function setLanguage(language) {
        currentLanguage = language;
        
        if (language === 'malayalam') {
            malayalamBtn.classList.add('active');
            englishBtn.classList.remove('active');
            document.querySelector('.login-form h2').textContent = 'ലോഗിൻ / Login';
            document.getElementById('username').placeholder = 'ഉപയോക്തൃനാമം / Username';
            document.getElementById('password').placeholder = 'പാസ്‌വേഡ് / Password';
            document.querySelector('.login-btn').textContent = 'പ്രവേശിക്കുക / Login';
        } else {
            englishBtn.classList.add('active');
            malayalamBtn.classList.remove('active');
            document.querySelector('.login-form h2').textContent = 'Login';
            document.getElementById('username').placeholder = 'Username';
            document.getElementById('password').placeholder = 'Password';
            document.querySelector('.login-btn').textContent = 'Login';
        }
    }
});