# കർഷക സഹായി - AI-Based Farmer Query Support and Advisory System

## Project Overview

The **കർഷക സഹായി** (Farmer Assistant) is an AI-powered support system designed to address the critical gap in accessible agricultural expertise for farmers in Kerala. This system provides timely advice on pests, diseases, weather impacts, input management, subsidies, and market trends in Malayalam language.

## Key Features

- **Multilingual Support**: Primary support for Malayalam with English as an alternative
- **Multimodal Interaction**: Text, voice, and image-based queries
- **Context-Aware Responses**: Personalized advice based on location and crop type
- **Expert Escalation System**: Seamless handoff to agricultural officers for complex queries
- **Weather Integration**: Real-time weather data and forecasts
- **Government Scheme Information**: Access to subsidy and support program details

## Technical Implementation

### Frontend
- HTML5, CSS3, and JavaScript
- Responsive design for mobile and desktop access
- Voice input/output capabilities
- Image upload and processing

### Backend (Conceptual)
- LLM Integration: Gemini Pro/Flash or Llama 3.1 for Malayalam language support
- Speech Processing: OpenAI Whisper for voice input/output
- Computer Vision: YOLO v8/ResNet for crop disease detection from images
- Weather API Integration
- Kerala government scheme database

## Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Local Development Setup
1. Clone the repository
   ```
   git clone https://github.com/yourusername/farmer-support-system.git
   cd farmer-support-system
   ```

2. Open the project in a code editor

3. Launch with a local server
   - Using Python:
     ```
     python -m http.server
     ```
   - Using Node.js:
     ```
     npx serve
     ```

4. Access the application at `http://localhost:8000` or the port specified by your server

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── scripts.js          # JavaScript functionality
├── assets/             # Static assets
│   └── logo.svg        # Project logo
└── README.md           # Project documentation
```

## Future Enhancements

- Integration with real AI models for natural language processing
- Connection to actual weather APIs with geolocation
- Implementation of a proper backend server
- Mobile application development
- Integration with Kerala government agricultural databases
- Offline functionality for areas with limited connectivity

## Hackathon Information

This project was developed for the AI-Based Farmer Query Support and Advisory System hackathon (PS ID: 25076), addressing the needs of Kerala farmers by providing accessible expert advice through an AI-powered system.

## License

MIT License

## Contributors

- [Your Name/Team]