# Dyvergent

**Dyvergent** is a full-stack, client-oriented web application built for real-time customer engagement and modern business inquiries. Designed with scalability and responsiveness in mind, it integrates Twilio messaging, MongoDB, Redis caching, and a TailwindCSS-powered UI — all within a Dockerized deployment pipeline.

---

## 🧩 Key Features

- ✉️ **Real-Time Business Alerts**: Sends instant SMS notifications using **Twilio** when a customer submits a business inquiry via the contact form.
- 🧠 **Persistent Data Storage**: Customer inquiries are saved securely in **MongoDB** for future access and follow-up.
- ⚡ **Smart Caching**: **Redis** caches frequent website requests to reduce server load and improve page load time.
- 🎨 **Modern UI**: Clean, mobile-responsive layout built with **Tailwind CSS** and **EJS** templating.
- 🍪 **Secure Sessions & Cookies**: Session management using **Express middleware** with secure cookie handling.
- 🌐 **Cross-Origin Support**: Configured **CORS** for seamless interaction across environments.
- 🐳 **Dockerized**: Ready-to-deploy via Docker with separate development and production Compose files.

---

## 🛠️ Tech Stack

| Purpose             | Technology             |
|---------------------|------------------------|
| Frontend Templating | EJS + Tailwind CSS     |
| Backend             | Express.js (Node.js)   |
| Database            | MongoDB                |
| Messaging Service   | Twilio SMS API         |
| Caching Layer       | Redis                  |
| Deployment          | Docker, Docker Compose |
| Session/Auth        | Express Session + Cookies |
| CORS Handling       | CORS middleware        |
| Web Server          | Nginx (Reverse Proxy)  |

---

## ⚙️ Project Structure

```
Dyvergent/
├── nginx/                      # Nginx reverse proxy config
├── src/
│   ├── views/                  # EJS templates
│   ├── routes/                 # Express routes (contact, index, etc.)
│   ├── controllers/            # Logic for Twilio, MongoDB, Redis
│   └── public/                 # Static assets (CSS, JS)
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── package.json
└── .env                        # Environment variables (Twilio, MongoDB, etc.)
```

---

## 🚀 Quick Start

### 1. Clone the Project

```bash
git clone https://github.com/jsvalentin/Dyvergent.git
cd Dyvergent
```

### 2. Configure Environment Variables

Create a `.env` file with the following:

```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
MONGODB_URI=mongodb://localhost:27017/dyvergent
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your_secret
```

### 3. Run the App

#### Development

```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

Then open your browser to: [http://localhost](http://localhost)

---

## 🧪 Functional Highlights

- **Contact Form**: Saves all customer inquiries to MongoDB.
- **SMS Alerts**: Automatically sends an SMS with customer info to the business owner.
- **Redis Caching**: Caches frequent routes to improve load performance.
- **Session Management**: Manages authenticated sessions using secure cookies.
- **Fully Responsive**: TailwindCSS ensures clean mobile and desktop layouts.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
