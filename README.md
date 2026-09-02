# 🌾 AgriSaarthi AI — Agricultural Advisory & Intermediary Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-localhost%3A3000-green?style=for-the-badge)](http://localhost:3000)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge)](https://www.typescriptlang.org/)

**One Conversation. All Agricultural Services.**

An integrated digital agricultural platform connecting Indian farmers with real-time AI crop advisory, plant health scanning, warehouse discovery, government schemes, and direct market access.

[**🚀 Access Live Demo**](http://localhost:3000) • [**📱 Mobile Friendly**](#features) • [**🤖 AI Powered**](#features)

</div>

---

## 🎯 Features

### 🌱 **AI-Powered Agricultural Advisory**
- Real-time crop health recommendations using Gemini AI
- Multi-turn conversational AI chatbot with role-based expertise
- 60-day yield prediction forecasts
- Pest risk assessment with organic management strategies

### 📸 **Plant Health Scanner**
- Computer vision-based plant disease diagnosis
- Multi-step image analysis with confidence scoring
- Real-time pest identification and treatment recommendations

### 🏭 **Warehouse & Storage Finder**
- Nearby CWC/TNWC cold storage discovery
- Real-time capacity and pricing information
- Direct warehouse booking and management

### 💼 **Government Schemes & Support**
- Integrated government subsidy scheme matching
- Application tracking and management
- Village Administrative Officer (VAO) integration

### 📊 **Market Intelligence**
- Live commodity price tracking (APMC data)
- Price alert subscriptions
- Direct buyer connections
- Crop listing and marketplace

### 🌾 **Crop Rotation & Soil Management**
- AI-powered crop rotation planning
- Soil test lab integration (Tamil Nadu Soil Testing Centers)
- Nutrient analysis and recommendations

### 👥 **Farmer Community**
- Peer-to-peer knowledge sharing
- Interactive community mapping
- Equipment sharing and collaboration

### 🌐 **Multilingual Support**
- English, Tamil, Telugu, Kannada support
- Localized agricultural terminology

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite 6.2 (fast build)
- Tailwind CSS + Motion animations
- Leaflet Maps for location services

**Backend:**
- Node.js + Express
- TypeScript
- FastAPI integration for Python AI services

**AI & ML:**
- Google Gemini 3.7 Flash API
- PlantCV for plant disease analysis
- TensorFlow-based pest detection

**Database & Services:**
- Supabase (PostgreSQL)
- Firebase (real-time sync)
- Service Workers (offline support)

---

## 📋 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- `.env.local` file with API keys

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jerry-A-coder/Agri-Saarthi-AI.git
   cd Agri-Saarthi-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your `GEMINI_API_KEY`
   - Configure Firebase and Supabase credentials

4. **Run locally:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy with Docker
```bash
docker build -t agrisaarthi-ai .
docker run -p 3000:3000 agrisaarthi-ai
```

### Deploy to Cloud Providers
- **Vercel:** `vercel deploy`
- **Railway:** Connect GitHub repo via Railway dashboard
- **Azure App Service:** Use GitHub Actions for CI/CD

---

## 📱 User Roles

### 👨‍🌾 **Farmer Portal**
- Access AI advisory and crop recommendations
- Plant health scanning and diagnosis
- Government scheme applications
- Warehouse booking and market listings
- Crop rotation planning

### 🏢 **Provider Dashboard**
- Warehouse management and listing
- Booking management and inventory
- Revenue analytics

### 👨‍💼 **Admin Hub**
- System health monitoring
- Database management (farmers, warehouses, schemes)
- Audit logs and user management
- Agricultural data analytics

---

## 📖 API Endpoints

### Core Routes
- `POST /api/ai/chat` - Multi-turn AI advisory chatbot
- `POST /api/ai/plant-scan` - Plant disease diagnosis
- `POST /api/ai/predict-yield` - 60-day yield forecast
- `POST /api/ai/predict-pest-risk` - Pest risk assessment
- `GET /api/warehouses` - Find nearby storage facilities
- `GET /api/markets/prices` - Live commodity prices
- `GET /api/schemes` - Government subsidy schemes

See [server.ts](server.ts) for complete API documentation.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Apache 2.0 License** - see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Jerry A. Coder**  
GitHub: [@Jerry-A-coder](https://github.com/Jerry-A-coder)

---

## 🙏 Acknowledgments

- Google AI Studio for infrastructure
- Tamil Nadu Agricultural Department
- Farmer community feedback and testing
- Open-source community (React, Vite, Tailwind, Leaflet)

---

## 📞 Support

For issues, questions, or feedback:
- Open an [Issue](https://github.com/Jerry-A-coder/Agri-Saarthi-AI/issues)
- Check [Discussions](https://github.com/Jerry-A-coder/Agri-Saarthi-AI/discussions)

---

<div align="center">

**Made with ❤️ for Indian Agriculture** 🌾

[GitHub](https://github.com/Jerry-A-coder/Agri-Saarthi-AI) • [Live Demo](http://localhost:3000)

</div>
