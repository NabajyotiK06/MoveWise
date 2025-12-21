# MoveWise - Smart Traffic Management System

MoveWise is a comprehensive traffic management solution designed to monitor, analyze, and optimize urban traffic flow. It features a real-time dashboard for traffic signals, incident reporting, and data visualization.

## 🚀 Features

- **Real-time Traffic Monitoring**: Visualize traffic congestion levels on an interactive map.
- **Incident Reporting**: Users can report accidents, road blocks, and other incidents.
- **Admin Dashboard**: sophisticated control panel for traffic authorities to manage signals and view analytics.
- **Heatmaps**: Visual representation of traffic density.
- **Live Feed placeholders**: Interface for viewing traffic camera feeds.
- **"Locate Me"**: Quickly center the map on your current location.

## 🛠️ Tech Stack

### Client
- **Framework**: React (Vite)
- **Maps**: Leaflet (react-leaflet), Mapbox GL
- **Styling**: CSS, Lucide React (icons)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Chart.js

### Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Bcrypt.js
- **Environment**: Dotenv

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## ⚙️ Installation & Running

Clone the repository to your local machine.

### 1. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables (adjust as needed):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movewise
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm run dev
```

The server should run on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal, navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The application will typically run on `http://localhost:5173`.

## 🚦 Usage

1. **Register/Login**: Create an account to access the dashboard.
2. **Dashboard**: View the map, check signal status, and toggle heatmaps.
3. **Report Incident**: Use the interface to report traffic issues.
4. **Admin**: (If authorized) Manage signals and view system-wide alerts.

## 📄 License

This project is for educational and development purposes.
