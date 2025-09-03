// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceInputBtn = document.getElementById('voice-input-btn');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreviewModal = document.getElementById('image-preview-modal');
const imagePreview = document.getElementById('image-preview');
const confirmImageBtn = document.getElementById('confirm-image');
const cancelImageBtn = document.getElementById('cancel-image');
const expertModal = document.getElementById('expert-modal');
const confirmExpertBtn = document.getElementById('confirm-expert');
const cancelExpertBtn = document.getElementById('cancel-expert');
const malayalamBtn = document.getElementById('malayalam-btn');
const englishBtn = document.getElementById('english-btn');
const logoutBtn = document.getElementById('logout-btn');
const logoutText = document.getElementById('logout-text');
const weatherData = document.getElementById('weather-data');
const closeModalBtns = document.querySelectorAll('.close-modal');
const soilMonitorBtn = document.getElementById('soil-monitor-btn');
const cropCalendarBtn = document.getElementById('crop-calendar-btn');
const equipmentBtn = document.getElementById('equipment-btn');
const ergonomicsLink = document.getElementById('ergonomics-link');
const healthLink = document.getElementById('health-link');
const farmVisualizationLink = document.getElementById('farm-visualization-link');
const workRecommendation = document.getElementById('work-recommendation');
const safetyAlert = document.getElementById('safety-alert');

// Global variables
let currentLanguage = localStorage.getItem('language') || 'malayalam';
let uploadedImage = null;
let recognition = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    
    initSpeechRecognition();
    fetchWeatherData();
    setupEventListeners();
    // Apply saved language preference
    setLanguage(currentLanguage);
    displayUsername();
});

// Display logged in username
function displayUsername() {
    const username = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (username) {
        const headerTitle = document.querySelector('header h1');
        headerTitle.innerHTML = `
            <span class="malayalam-text">കർഷക സഹായി - സ്വാഗതം, ${username}</span>
            <span class="english-text">Farmer Support System - Welcome, ${username}</span>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Send message on button click or Enter key
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // Voice input
    voiceInputBtn.addEventListener('click', toggleVoiceInput);

    // Image upload
    imageUploadBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);

    // Image preview modal
    confirmImageBtn.addEventListener('click', () => {
        imagePreviewModal.style.display = 'none';
        if (uploadedImage) {
            processImageQuery(uploadedImage);
        }
    });
    cancelImageBtn.addEventListener('click', () => {
        imagePreviewModal.style.display = 'none';
        uploadedImage = null;
    });

    // Expert modal
    confirmExpertBtn.addEventListener('click', connectWithExpert);
    cancelExpertBtn.addEventListener('click', () => {
        expertModal.style.display = 'none';
    });

    // Language toggle
    malayalamBtn.addEventListener('click', () => setLanguage('malayalam'));
    englishBtn.addEventListener('click', () => setLanguage('english'));

    // Working conditions features
    soilMonitorBtn.addEventListener('click', () => showFeature('soil-monitoring'));
    cropCalendarBtn.addEventListener('click', () => showFeature('crop-calendar'));
    
    // 3D Farm Visualization
    farmVisualizationLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'farm-visualization.html';
    });
    equipmentBtn.addEventListener('click', () => showFeature('equipment-maintenance'));
    ergonomicsLink.addEventListener('click', () => showFeature('ergonomic-farming'));
    healthLink.addEventListener('click', () => showFeature('worker-health'));

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            imagePreviewModal.style.display = 'none';
            expertModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === imagePreviewModal) {
            imagePreviewModal.style.display = 'none';
        }
        if (e.target === expertModal) {
            expertModal.style.display = 'none';
        }
    });
}

// Initialize speech recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        // Set language based on current selection
        recognition.lang = currentLanguage === 'malayalam' ? 'ml-IN' : 'en-IN';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };
        
        recognition.onend = () => {
            voiceInputBtn.classList.remove('active');
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            voiceInputBtn.classList.remove('active');
        };
    } else {
        voiceInputBtn.style.display = 'none';
        console.log('Speech recognition not supported');
    }
}

// Toggle voice input
function toggleVoiceInput() {
    if (recognition) {
        if (voiceInputBtn.classList.contains('active')) {
            recognition.stop();
            voiceInputBtn.classList.remove('active');
        } else {
            recognition.lang = currentLanguage === 'malayalam' ? 'ml-IN' : 'en-IN';
            recognition.start();
            voiceInputBtn.classList.add('active');
            userInput.placeholder = currentLanguage === 'malayalam' ? 
                'സംസാരിക്കുക...' : 'Speaking...';
        }
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadedImage = e.target.result;
            imagePreviewModal.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

// Send message
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        userInput.value = '';
        showTypingIndicator();
        
        // Process the query with AI
        processTextQuery(message);
    }
}

// Process text query with AI
async function processTextQuery(text) {
    try {
        // In a real implementation, this would call your AI backend
        // For demo purposes, we'll simulate a response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if query needs escalation (for demo purposes)
        if (text.toLowerCase().includes('subsidy') || 
            text.toLowerCase().includes('സബ്സിഡി') || 
            text.length > 100) {
            showExpertModal();
            removeTypingIndicator();
            return;
        }
        
        // Generate a response based on the query
        let response = '';
        
        if (currentLanguage === 'malayalam') {
            if (text.toLowerCase().includes('കീടം') || text.toLowerCase().includes('pest')) {
                response = 'കീടങ്ങളെ നിയന്ത്രിക്കാൻ ജൈവ കീടനാശിനികൾ ഉപയോഗിക്കാൻ ഞാൻ നിർദ്ദേശിക്കുന്നു. വേപ്പിൻ എണ്ണ സ്പ്രേ 5ml/L വെള്ളത്തിൽ ചേർത്ത് ഉപയോഗിക്കാം. കൂടുതൽ വിവരങ്ങൾക്ക് അടുത്തുള്ള കൃഷിഭവനുമായി ബന്ധപ്പെടുക.';
            } else if (text.toLowerCase().includes('രോഗം') || text.toLowerCase().includes('disease')) {
                response = 'വിളകളിലെ രോഗങ്ങൾ തിരിച്ചറിയാൻ, ദയവായി രോഗബാധിതമായ ഭാഗത്തിന്റെ ചിത്രം അപ്ലോഡ് ചെയ്യുക. കൂടുതൽ കൃത്യമായ നിർദ്ദേശങ്ങൾ നൽകാൻ എനിക്ക് സാധിക്കും.';
            } else if (text.toLowerCase().includes('കാലാവസ്ഥ') || text.toLowerCase().includes('weather')) {
                response = 'നിങ്ങളുടെ പ്രദേശത്തെ കാലാവസ്ഥ വിവരങ്ങൾ സ്ക്രീനിന്റെ വലതുവശത്ത് കാണാം. അടുത്ത 3 ദിവസത്തേക്ക് മിതമായ മഴയ്ക്ക് സാധ്യതയുണ്ട്. കൃഷിപ്പണികൾ അതനുസരിച്ച് ആസൂത്രണം ചെയ്യുക.';
            } else {
                response = 'നിങ്ങളുടെ ചോദ്യത്തിന് നന്ദി. കൂടുതൽ വിവരങ്ങൾക്ക്, ദയവായി കൃത്യമായ ചോദ്യം ചോദിക്കുക അല്ലെങ്കിൽ കൃഷി, കീടങ്ങൾ, രോഗങ്ങൾ, കാലാവസ്ഥ, അല്ലെങ്കിൽ സബ്സിഡികളെക്കുറിച്ച് ചോദിക്കുക.';
            }
        } else {
            if (text.toLowerCase().includes('pest')) {
                response = 'For pest control, I recommend using organic pesticides. You can use neem oil spray mixed at 5ml/L of water. For more severe infestations, please contact your nearest Krishibhavan.';
            } else if (text.toLowerCase().includes('disease')) {
                response = 'To identify crop diseases, please upload a picture of the affected part. This will help me provide more accurate recommendations for treatment.';
            } else if (text.toLowerCase().includes('weather')) {
                response = 'You can see the weather information for your area on the right side of the screen. There is a possibility of moderate rain for the next 3 days. Plan your farming activities accordingly.';
            } else {
                response = 'Thank you for your question. For more information, please ask a specific question about farming, pests, diseases, weather, or subsidies.';
            }
        }
        
        removeTypingIndicator();
        addMessageToChat('system', response);
        
    } catch (error) {
        console.error('Error processing query:', error);
        removeTypingIndicator();
        addMessageToChat('system', currentLanguage === 'malayalam' ? 
            'ക്ഷമിക്കണം, എന്തോ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' : 
            'Sorry, something went wrong. Please try again.');
    }
}

// Process image query with AI
async function processImageQuery(imageData) {
    try {
        addMessageToChat('user', '', imageData);
        showTypingIndicator();
        
        // In a real implementation, this would call your AI vision model
        // For demo purposes, we'll simulate a response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const response = currentLanguage === 'malayalam' ? 
            'ചിത്രത്തിൽ നിന്ന് ഞാൻ കാണുന്നത് നെല്ലിന്റെ ഇലകളിൽ ബ്ലാസ്റ്റ് രോഗത്തിന്റെ ലക്ഷണങ്ങളാണ്. ഇത് പൈരിക്കുലേറിയ ഒറൈസേ എന്ന കുമിളാണ് ഉണ്ടാക്കുന്നത്. നിയന്ത്രിക്കാൻ, ട്രൈസൈക്ലസോൾ 0.6 ഗ്രാം/ലിറ്റർ വെള്ളത്തിൽ തളിക്കാൻ ശുപാർശ ചെയ്യുന്നു. കൂടുതൽ വിവരങ്ങൾക്ക് അടുത്തുള്ള കൃഷിഭവനുമായി ബന്ധപ്പെടുക.' : 
            'From the image, I can identify symptoms of rice blast disease on the leaves, caused by the fungus Pyricularia oryzae. For control, I recommend spraying Tricyclazole at 0.6 g/liter of water. For more information, please contact your nearest Krishibhavan.';
        
        removeTypingIndicator();
        addMessageToChat('system', response);
        
    } catch (error) {
        console.error('Error processing image:', error);
        removeTypingIndicator();
        addMessageToChat('system', currentLanguage === 'malayalam' ? 
            'ക്ഷമിക്കണം, ചിത്രം വിശകലനം ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' : 
            'Sorry, there was an error analyzing the image. Please try again.');
    }
}

// Add message to chat
function addMessageToChat(sender, text, imageUrl = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    if (text) {
        const textParagraph = document.createElement('p');
        textParagraph.textContent = text;
        contentDiv.appendChild(textParagraph);
    }
    
    messageDiv.appendChild(contentDiv);
    
    if (imageUrl) {
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.alt = 'Uploaded image';
        imageElement.classList.add('message-image');
        contentDiv.appendChild(imageElement);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'system', 'typing-indicator-container');
    
    const typingContent = document.createElement('div');
    typingContent.classList.add('message-content', 'typing-indicator');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingContent.appendChild(dot);
    }
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator-container');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Show expert modal
function showExpertModal() {
    expertModal.style.display = 'flex';
}

// Connect with expert
function connectWithExpert() {
    expertModal.style.display = 'none';
    addMessageToChat('system', currentLanguage === 'malayalam' ? 
        'നിങ്ങളെ ഒരു കൃഷി ഓഫീസറുമായി ബന്ധിപ്പിക്കുന്നു. അവർ ഉടൻ തന്നെ നിങ്ങളുമായി ബന്ധപ്പെടും. നിങ്ങളുടെ ഫോൺ നമ്പർ ദയവായി +91 *** *** **** എന്ന നമ്പറിലേക്ക് SMS ആയി അയക്കുക.' : 
        'Connecting you with an agricultural officer. They will contact you shortly. Please send your phone number via SMS to +91 *** *** ****.');
}

// Set language
function setLanguage(language) {
    currentLanguage = language;
    
    if (language === 'malayalam') {
        // Update body class for language-specific styling
        document.body.classList.remove('english');
        
        malayalamBtn.classList.add('active');
        englishBtn.classList.remove('active');
        userInput.placeholder = 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...';
        logoutText.textContent = 'ലോഗൗട്ട്';
        
        // Update 3D farm visualization link text
        if (farmVisualizationLink) {
            farmVisualizationLink.innerHTML = '<i class="fas fa-cube"></i> 3D കൃഷിയിടം കാഴ്ച';
        }
        
        // Update key features section headings
        const keyFeaturesHeadings = document.querySelectorAll('.key-features-container h2');
        if (keyFeaturesHeadings.length >= 1) {
            keyFeaturesHeadings[0].innerHTML = '🌱 പ്രധാന സവിശേഷതകൾ';
        }
        if (keyFeaturesHeadings.length >= 2) {
            keyFeaturesHeadings[1].innerHTML = '🚜 ഇത് പ്രധാനമായിരിക്കുന്നത് എന്തുകൊണ്ട്';
        }
        
        // Update feature card headings
        const featureCardHeadings = document.querySelectorAll('.feature-card h3');
        if (featureCardHeadings.length >= 1) {
            featureCardHeadings[0].textContent = 'എല്ലാം-ഒരു കൃഷി സഹായി';
        }
        if (featureCardHeadings.length >= 2) {
            featureCardHeadings[1].textContent = 'AI സംയോജനം';
        }
        if (featureCardHeadings.length >= 3) {
            featureCardHeadings[2].textContent = 'ഉപയോക്തൃ സൗഹൃദ ഇന്റർഫേസ്';
        }
        if (featureCardHeadings.length >= 4) {
            featureCardHeadings[3].textContent = 'സ്കേലബിൾ ഇമ്പാക്ട്';
        }
    } else {
        // Update body class for language-specific styling
        document.body.classList.add('english');
        
        englishBtn.classList.add('active');
        malayalamBtn.classList.remove('active');
        userInput.placeholder = 'Type your question here...';
        logoutText.textContent = 'Logout';
        
        // Update 3D farm visualization link text
        if (farmVisualizationLink) {
            farmVisualizationLink.innerHTML = '<i class="fas fa-cube"></i> 3D Farm Visualization';
        }
        
        // Update key features section headings
        const keyFeaturesHeadings = document.querySelectorAll('.key-features-container h2');
        if (keyFeaturesHeadings.length >= 1) {
            keyFeaturesHeadings[0].innerHTML = '🌱 Key Features';
        }
        if (keyFeaturesHeadings.length >= 2) {
            keyFeaturesHeadings[1].innerHTML = '🚜 Why It Matters';
        }
        
        // Update feature card headings
        const featureCardHeadings = document.querySelectorAll('.feature-card h3');
        if (featureCardHeadings.length >= 1) {
            featureCardHeadings[0].textContent = 'All-in-One Farming Assistant';
        }
        if (featureCardHeadings.length >= 2) {
            featureCardHeadings[1].textContent = 'AI Integration';
        }
        if (featureCardHeadings.length >= 3) {
            featureCardHeadings[2].textContent = 'User-Friendly Interface';
        }
        if (featureCardHeadings.length >= 4) {
            featureCardHeadings[3].textContent = 'Scalable Impact';
        }
    }
    
    // Update speech recognition language if initialized
    if (recognition) {
        recognition.lang = language === 'malayalam' ? 'ml-IN' : 'en-IN';
    }
    
    // Update username display with new language
    displayUsername();
    
    // Save language preference
    localStorage.setItem('language', language);
}

// Handle logout
function handleLogout() {
    // Clear session storage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Fetch weather data
async function fetchWeatherData() {
    try {
        // In a real implementation, this would call a weather API with geolocation
        // For demo purposes, we'll use hardcoded data for Kerala
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const weatherHTML = `
            <div class="weather-info">
                <div class="weather-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>തിരുവനന്തപുരം, കേരളം</span>
                </div>
                <div class="weather-temp">
                    <i class="fas fa-temperature-high"></i>
                    <span>28°C</span>
                </div>
                <div class="weather-condition">
                    <i class="fas fa-cloud-rain"></i>
                    <span>മിതമായ മഴ</span>
                </div>
                <div class="weather-humidity">
                    <i class="fas fa-tint"></i>
                    <span>ആർദ്രത: 85%</span>
                </div>
            </div>
        `;
        
        weatherData.innerHTML = weatherHTML;
        
        // Update work recommendations based on weather
        updateWorkRecommendations({
            temperature: '28°C',
            condition: 'മിതമായ മഴ',
            humidity: '85%'
        });
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherData.innerHTML = '<p>Weather data unavailable</p>';
    }
}

// Show feature based on selection
function showFeature(feature) {
    let featureContent = '';
    
    switch(feature) {
        case 'soil-monitoring':
            featureContent = currentLanguage === 'malayalam' ? 
                '<h3>മണ്ണ് നിരീക്ഷണം</h3><p>നിങ്ങളുടെ മണ്ണിന്റെ pH മൂല്യം: 6.5</p><p>നൈട്രജൻ: മിതമായത്</p><p>ഫോസ്ഫറസ്: ഉയർന്നത്</p><p>പൊട്ടാസ്യം: മിതമായത്</p>' : 
                '<h3>Soil Monitoring</h3><p>Your soil pH level: 6.5</p><p>Nitrogen: Medium</p><p>Phosphorus: High</p><p>Potassium: Medium</p>';
            break;
        case 'crop-calendar':
            featureContent = currentLanguage === 'malayalam' ? 
                '<h3>വിള കലണ്ടർ</h3><p>നെല്ല്: ജൂൺ-സെപ്റ്റംബർ</p><p>തെങ്ങ്: വർഷം മുഴുവൻ</p><p>റബ്ബർ: ഏപ്രിൽ-മെയ്</p><p>കുരുമുളക്: നവംബർ-ഫെബ്രുവരി</p>' : 
                '<h3>Crop Calendar</h3><p>Rice: June-September</p><p>Coconut: Year-round</p><p>Rubber: April-May</p><p>Pepper: November-February</p>';
            break;
        case 'equipment-maintenance':
            featureContent = currentLanguage === 'malayalam' ? 
                '<h3>ഉപകരണ പരിപാലനം</h3><p>നിങ്ങളുടെ ട്രാക്ടറിന് അടുത്ത സർവീസ് ആവശ്യമാണ്</p><p>സ്പ്രേയർ: നല്ല കണ്ടീഷൻ</p><p>പമ്പ്: പരിശോധന ആവശ്യമാണ്</p>' : 
                '<h3>Equipment Maintenance</h3><p>Your tractor is due for service</p><p>Sprayer: Good condition</p><p>Pump: Needs inspection</p>';
            break;
        case 'ergonomic-farming':
            featureContent = currentLanguage === 'malayalam' ? 
                '<h3>എർഗണോമിക് കൃഷി</h3><p>ശരിയായ ഉപകരണങ്ങൾ ഉപയോഗിക്കുക</p><p>ഭാരം ഉയർത്തുമ്പോൾ കാലുകൾ വളയ്ക്കുക, നടുവ് അല്ല</p><p>ദീർഘനേരം ഒരേ സ്ഥാനത്ത് നിൽക്കുന്നത് ഒഴിവാക്കുക</p>' : 
                '<h3>Ergonomic Farming</h3><p>Use proper tools</p><p>Bend knees, not back when lifting</p><p>Avoid standing in one position for too long</p>';
            break;
        case 'worker-health':
            featureContent = currentLanguage === 'malayalam' ? 
                '<h3>തൊഴിലാളി ആരോഗ്യം</h3><p>ധാരാളം വെള്ളം കുടിക്കുക</p><p>സൂര്യപ്രകാശത്തിൽ നിന്ന് സംരക്ഷണം തേടുക</p><p>ശരിയായ സുരക്ഷാ ഉപകരണങ്ങൾ ധരിക്കുക</p>' : 
                '<h3>Worker Health</h3><p>Drink plenty of water</p><p>Seek shade from direct sunlight</p><p>Wear proper protective equipment</p>';
            break;
        default:
            featureContent = currentLanguage === 'malayalam' ? 
                '<p>സവിശേഷത ലഭ്യമല്ല</p>' : 
                '<p>Feature not available</p>';
    }
    
    // Display the feature content in a modal or dedicated area
    const featureModal = document.createElement('div');
    featureModal.classList.add('feature-modal');
    featureModal.innerHTML = `
        <div class="feature-content">
            <span class="close-feature">&times;</span>
            <div class="feature-body">
                ${featureContent}
            </div>
        </div>
    `;
    
    document.body.appendChild(featureModal);
    
    // Add event listener to close button
    const closeFeature = featureModal.querySelector('.close-feature');
    closeFeature.addEventListener('click', () => {
        featureModal.remove();
    });
    
    // Close when clicking outside the content
    featureModal.addEventListener('click', (e) => {
        if (e.target === featureModal) {
            featureModal.remove();
        }
    });
}