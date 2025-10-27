# HNG Stage 2 Backend – Countries API

A simple Node.js + Express + MySQL API that fetches and stores information about countries, including their population, GDP, exchange rate, and flags.  
The API can refresh data, fetch single countries, and serve data for frontend use.

---

## Features

- Fetch country data and store it in MySQL
- Auto-create `countries` table if missing
- Refresh and update data from external APIs
- Caching mechanism for efficient lookups
- RESTful endpoints
- Ready for deployment on **Railway**

---

## Tech Stack

- **Node.js** (v18+)
- **Express.js**
- **MySQL 9.5+**
- **Axios**
- **dotenv**
- **Railway.app** for hosting

---

## Setup Instructions

### Clone the repository
```bash
git clone https://github.com/<your-username>/hng-be-stage-2.git
cd hng-be-stage-2
