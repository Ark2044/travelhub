![github-submission-banner](https://github.com/user-attachments/assets/a1493b84-e4e2-456e-a791-ce35ee2bcf2f)

# 🌎 TravelHub

> AI-powered travel planning for personalized itineraries tailored to your preferences and travel style.

---

## 📌 Problem Statement

**Problem Statement 1 – Weave AI magic with Groq**

---

## 🎯 Objective

TravelHub solves the challenge of time-consuming travel planning by leveraging AI to create personalized travel itineraries tailored to users' preferences. It serves travelers of all kinds, from solo adventurers to family vacations.

Our application streamlines the travel planning process by asking users simple questions about their preferences, then generating comprehensive day-by-day itineraries with destinations, accommodations, dining options, and activities personalized to their interests and budget.

---

## 🧠 Team & Approach

### Team Name:

`NO_name`

### Team Members:

- Aarush Wasnik (GitHub: @Ark2044 / LinkedIn: /in/aarush-wasnik / Full-Stack Developer)
- Mahek Gupta (GitHub: @mac0702 / LinkedIn: /in/mahek-gupta-227787257 / AI Engineer)
- Krishna Soni (GitHub: @Krishnasoni9193 / LinkedIn: /in/krishnasoni9 / AI Engineer)

### Our Approach:

- We chose this problem because travel planning is still largely a manual, time-consuming process requiring hours of research across multiple sites
- Key challenges addressed include generating accurate, personalized itineraries that respect user preferences and constraints while providing valuable local insights
- Our biggest breakthrough was successfully implementing the Groq API with compound-beta model for real-time travel information and customizing itineraries with a fallback mechanism for reliability

---

## 🛠️ Tech Stack

### Core Technologies Used:

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **Database**: Appwrite
- **APIs**: Groq LLM APIs
- **Hosting**: Vercel

### Sponsor Technologies Used:

- ✅ **Groq:** Used Groq's compound-beta and llama3-70b-8192 models for generating personalized travel itineraries with real-time information
---

## ✨ Key Features

- ✅ **Personalized AI Travel Planning**: Generate custom itineraries based on your destination, budget, interests, and travel style
- ✅ **Voice Input Support**: Answer questions using your voice for a more natural interaction
- ✅ **PDF Download**: Save and download your itineraries as beautiful PDF documents
- ✅ **Trip History**: Save your generated itineraries to reference later
- ✅ **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices

---

## 📽️ Demo & Deliverables

- **Demo Video Link:** [Watch TravelHub Demo](https://drive.google.com/drive/folders/1DYfQhKvkBqwrlRrLUZXK54FgHopIYP2_?usp=drive_link)
- **Pitch Deck Link:** [View Presentation](https://drive.google.com/drive/folders/1DYfQhKvkBqwrlRrLUZXK54FgHopIYP2_?usp=drive_link)

---

## ✅ Tasks & Bonus Checklist

- ✅ **All members of the team completed the mandatory task - Followed at least 2 of our social channels and filled the form**
- ✅ **All members of the team completed Bonus Task 1 - Sharing of Badges and filled the form (2 points)**
- ✅ **All members of the team completed Bonus Task 2 - Signing up for Sprint.dev and filled the form (3 points)**

---

## 🧪 How to Run the Project

### Requirements:

- Node.js v18+
- Appwrite account
- Groq API key

### Environment Variables:

Create a `.env.local` file with:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_CONVERSATION_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_MESSAGE_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_PREFERENCE_COLLECTION_ID=
GROQ_API_KEY=
```

### Local Setup:

```bash
# Clone the repo
git clone https://github.com/your-team/travelhub

# Install dependencies
cd travelhub
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application in your browser.

---

## 🧬 Future Scope

- 📱 **Mobile App**: Develop native mobile applications for iOS and Android
- 🌐 **Multi-language Support**: Expand to more languages for international travelers
- 🧠 **Enhanced AI Recommendations**: Implement user feedback loop to improve recommendations
- 🌟 **AR Features**: Augmented reality guides at destinations
- 💰 **Booking Integration**: Direct booking of accommodations and activities

---

## 📎 Resources / Credits

- [Groq API](https://groq.com) for LLM capabilities
- [Appwrite](https://appwrite.io) for backend services
- [Unsplash](https://unsplash.com) for travel imagery
- [FontAwesome](https://fontawesome.com) for icons
- [TailwindCSS](https://tailwindcss.com) for styling

---

## 🏁 Final Words

Creating TravelHub has been an exciting journey for our team! We learned so much about working with the latest AI models and developing user-friendly interfaces that make travel planning truly enjoyable. The most challenging part was ensuring the reliability of AI-generated content, which we addressed with our multi-model fallback mechanism.

We hope TravelHub helps travelers spend less time planning and more time exploring the world's wonders!
