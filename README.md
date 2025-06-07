# 🎓 Learnify

Learnify is my answer to making language learning accessible, engaging, and fun. It's a full-stack application that connects learners with expert tutors, providing all the tools needed to manage tutorials, book sessions, and interact with a global community.

### 🔗 **Live Site → [https://learnify009.web.app/](https://learnify009.web.app/)**

---

---

### ✨ Core Features & Highlights

- 🔐 **Secure JWT Authentication:** A complete authentication system built from the ground up, featuring email/password registration, Google Sign-in, and secure, stateless authorization using JSON Web Tokens (JWT) to protect user routes and data.

- 📚 **Full CRUD for Tutors:** Tutors have complete control over their content. The "My Tutorials" dashboard provides a full Create, Read, Update, and Delete interface for managing their listings.

- 🗓️ **Seamless Booking & Review System:** Students can easily book tutorials, and after a session, they can leave a review, which dynamically updates the tutor's review count using MongoDB's `$inc` operator for real-time feedback.

- 🎨 **Custom-Built Interactive Components:** To make the site unique and engaging, I built a custom feature from scratch or future integration:
  - **Interactive Facts Card:** A dynamic "Did You Know?" section with a custom algorithm to randomly serve interesting language facts without immediate repetition, also animated with Framer Motion.

- 📊 **Live Statistics & Data Aggregation:** The homepage features a real-time statistics section that uses a MongoDB aggregation pipeline (`$facet`) on the backend to efficiently calculate total users, tutors, languages, and reviews in a single database call.

- 💅 **Polished & Responsive UI/UX:**
  - A sleek, modern interface built with **Tailwind CSS** and **DaisyUI**, ensuring a consistent look and feel.
  - Persistent **Dark/Light theme** toggle that respects user preference.
  - **Fully responsive** design that works flawlessly on desktop, tablet, and mobile.
  - Meaningful animations from `Framer Motion` and `React Awesome Reveal` to guide the user and enhance the experience.

---

### 🛠️ Tech Stack

This project was built with a modern and powerful set of technologies, chosen for their efficiency and scalability.

| Category       | Technology                                                                                                   |
| :------------- | :----------------------------------------------------------------------------------------------------------- |
| **Frontend**   | `React`,`React Router`, `Tailwind CSS`, `DaisyUI`, `Framer Motion`, `Axios`, `Lottie`,`React Awesome Reveal` |
| **Backend**    | `Node.js`, `Express.js`, `MongoDB`                                                                           |
| **Auth**       | `Firebase Authentication`, `JSON Web Token (JWT)`, `Firebase Admin SDK`                                      |
| **Database**   | `MongoDB Atlas` (with MongoDB Node.js Driver)                                                                |
| **Deployment** | `Vercel` (Client & Server)                                                                                   |

---
