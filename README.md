# 📘 Learnify

<a href="https://learnify009.web.app/" target="_blank">
  <img src="https://raw.githubusercontent.com/better-call-vee/learnify/main/bnr.png" alt="Learnify Banner"/>
</a>

<p align="center">
  <a href="https://learnify009.web.app/" target="_blank">
    <strong>View Live Demo »</strong>
  </a>
</p>

<p align="center">
  Learnify is a modern, full-stack language learning platform connecting students with expert tutors worldwide. From booking tutorials to leaving reviews, everything is built with a focus on performance, simplicity, and great user experience.
</p>

---

## ✨ Key Features

Learnify is packed with functionality designed to create an intuitive and engaging experience for both students and tutors.

- **🔐 Secure Authentication:**

  - Email/password sign-up and login.
  - Google Sign-In powered by Firebase.
  - JWT-based route protection using secure, stateless tokens.

- **📚 Tutor Dashboard with Full CRUD:**

  - Tutors can create, edit, and manage their tutorials.
  - Real-time updates using MongoDB's operators like `$inc` for review counters.

- **🗓️ Seamless Booking & Reviews:**

  - Students can book sessions with tutors and leave ratings/reviews after sessions.

- **🎨 Interactive & Animated UI:**

  - Features animated fact cards and UI elements using Framer Motion and React Awesome Reveal.
  - Custom-built components like “Did You Know?” to enhance engagement.

- **🌗 Light/Dark Mode:**

  - Fully persistent theme toggle that adapts to user preference across sessions.

- **📊 Live Aggregated Statistics:**

  - Homepage shows real-time data like total tutors, languages, and reviews using MongoDB’s aggregation pipelines.

- **📱 Mobile-Responsive Design:**
  - Optimized for all devices using Tailwind CSS and DaisyUI.

---

## 🛠️ Tech Stack & Architecture

This project is built using a componentized MERN-like structure, optimized for serverless deployment and fast user interaction.

### Architecture

Learnify uses a classic **client-server** model.

- **Frontend:** Built with React + Vite and deployed to Firebase Hosting.
- **Backend:** Node.js/Express API deployed on Vercel as a serverless function.
- **Database:** MongoDB Atlas for storing tutorials, bookings, users, and reviews.

---

### Frontend

| Technology               | Version            | Description                                      |
| ------------------------ | ------------------ | ------------------------------------------------ |
| **React**                | `^19.1.0`          | Core UI framework                                |
| **Vite**                 | `^6.3.5`           | Fast, lightweight build tool                     |
| **React Router DOM**     | `^7.6.2`           | Client-side routing                              |
| **Tailwind CSS**         | `^4.1.8`           | Utility-first styling                            |
| **DaisyUI**              | `^5.0.43`          | UI component library built on Tailwind           |
| **Firebase**             | `^11.8.1`          | Auth service provider (Email/Google login)       |
| **Framer Motion**        | `^12.16.0`         | Smooth animations & transitions                  |
| **React Icons**          | `^5.5.0`           | SVG-based icon library                           |
| **Lottie + Dotlottie**   | `^2.4.1 / ^0.14.0` | For animated illustrations                       |
| **React Awesome Reveal** | `^4.3.1`           | Beautiful scroll-based animations                |
| **Axios**                | `^1.9.0`           | API requests                                     |
| **JWT Decode**           | `^4.0.0`           | Client-side JWT parsing                          |
| **React Modal**          | `^3.16.3`          | Accessible modals                                |
| **React Tooltip**        | `^5.28.1`          | Hover/click tooltips                             |
| **Swiper**               | `^11.2.8`          | Swipable carousel for featured content           |
| **SASS Embedded**        | `^1.89.1`          | Styling power when needed beyond utility classes |

---

### Backend

| Technology             | Version   | Description                                           |
| ---------------------- | --------- | ----------------------------------------------------- |
| **Node.js**            | `v20.x`   | JavaScript runtime                                    |
| **Express**            | `^5.1.0`  | Backend routing and logic                             |
| **MongoDB**            | `^6.17.0` | NoSQL database with Atlas cloud hosting               |
| **Firebase Admin SDK** | `^13.4.0` | Admin-level access for server-side auth checks        |
| **JWT**                | `^9.0.2`  | Secure, stateless user authorization                  |
| **dotenv**             | `^16.5.0` | Secure environment variable management                |
| **CORS**               | `^2.8.5`  | Handles cross-origin requests                         |
| **Serverless-http**    | `^3.2.0`  | Enables Express to run on Vercel serverless functions |
| **Cookie Parser**      | `^1.4.7`  | Middleware for handling cookies                       |

---

## 🚀 Getting Started

To get a local development copy running, follow these steps:

### 1. Clone and Set Up Backend (`server` directory)

```bash
git clone https://github.com/Programming-Hero-Web-Course4/b11a11-server-side-better-call-vee.git
cd b11a11-server-side-better-call-vee
npm install
touch .env
```

Add your MongoDB URI and Firebase admin credentials:

```env
DB_URI="mongodb+srv://<USER>:<PASSWORD>@cluster.mongodb.net/yourDbName?retryWrites=true&w=majority"
FIREBASE_TYPE="service_account"
FIREBASE_PROJECT_ID="your_project_id"
# ... Add all Firebase admin keys
```

---

### 2. Set Up Frontend (`client` directory)

```bash
cd client
npm install
touch .env.local
```

Add your Firebase config keys:

```env
VITE_APIKEY="YOUR_FIREBASE_API_KEY"
VITE_AUTHDOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_PROJECTID="YOUR_FIREBASE_PROJECT_ID"
VITE_STORAGEBUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_MESSAGINGSENDERID="YOUR_FIREBASE_SENDER_ID"
VITE_APPID="YOUR_FIREBASE_APP_ID"
```

✅ These keys are safe to expose in client environments.

---

### 3. Run Locally

**Backend:**

```bash
npm start
# or
node index.js
```

**Frontend:**

```bash
npm run dev
```

Visit:

```
http://localhost:5173
```

---

## 🧑‍💻 Developer

**Faiyaz Tanvee**  
🔗 [LinkedIn](https://www.linkedin.com/in/tanvee009/)  
📧 faiyaztanvee9@gmail.com

---

## 📂 Repository

🔗 [Frontend + Backend Repo](https://github.com/better-call-vee/Learnify)
