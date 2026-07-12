# 🚀 Week 1 Backend API

A simple Express.js backend application built as part of the **FlyRank Backend AI Engineering Internship**.

## 📌 Objective

Build the smallest possible backend server with two JSON API endpoints to understand the HTTP request-response cycle.

---

## 🛠️ Tech Stack

- Node.js
- Express.js

---

## 📁 Project Structure

```
Week 1 Backend Api/
│── index.js
│── package.json
│── package-lock.json
└── README.md
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to the project

```bash
cd "Week 1 Backend Api"
```

Install dependencies

```bash
npm install
```

Start the server

```bash
node index.js
```

The server will start on:

```
http://localhost:3000
```

---

## 📡 API Endpoints

### GET /

Returns a welcome message.

**Request**

```
GET /
```

**Response**

```json
{
    "message": "Backend server is running!"
}
```

---

### GET /hello

Returns basic information.

**Request**

```
GET /hello
```

**Response**

```json
{
    "name": "Nerain Prakash",
    "role": "Backend AI Engineering Intern"
}
```

---

## 🧪 Testing

### Browser

Open:

```
http://localhost:3000/
```

and

```
http://localhost:3000/hello
```

### Using curl

```bash
curl http://localhost:3000/
```

```bash
curl http://localhost:3000/hello
```

---

## 📚 Learning Outcomes

- Setting up an Express.js server
- Creating REST API endpoints
- Returning JSON responses
- Understanding HTTP GET requests
- Using npm packages
- Running a Node.js application locally

---

## 👨‍💻 Author

**Nerain Prakash**

Backend AI Engineering Intern – FlyRank