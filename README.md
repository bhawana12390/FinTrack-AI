## Fintrack AI
Fintrack AI is an intelligent financial tracking application designed to simplify expense management. It provides powerful analytics, data visualization, and AI-driven insights into your income and expenses. With unique features like PhonePe statement parsing and voice-based transaction entry, managing your finances has never been easier.

## Features
1. Interactive Dashboard: Visualize your spending habits with clean, interactive graphs and charts.
2. AI-Powered Analytics: Get smart insights and predictions about your financial health.
3. PhonePe Statement Upload: Automatically parse and import all your transactions from a PhonePe statement.
4. Voice Input: Add transactions on the go simply by speaking. Just state the amount, category, date, and description.
5. Income & Expense Tracking: Log and categorize all your financial activities in one place.
6. Search & Filter: Easily find specific transactions with powerful search and filtering capabilities.

## Tech Stack
### Frontend: Next, Tailwind CSS

### Backend: Python, FastAPI

## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Make sure you have the following installed on your system:

```Node.js (v20.x or higher)```

```Python (v3.11 or higher)```

```pip (Python package installer)```

## Installation & Setup
Clone the repository:

```
git clone https://github.com/your-username/FinTrack-AI.git
cd FinTrack-AI
```

## Set up the Backend:

Navigate to the backend directory:

```cd backend```

Create and activate a virtual environment (recommended):

### For macOS/Linux
```
python3 -m venv venv
source venv/bin/activate
```
### For Windows
```
python -m venv venv
.\venv\Scripts\activate
```
Install the required Python packages:
```
pip install -r requirements.txt
```
Set up the Frontend:

Navigate back to the root project directory:
```
cd ..
```
Install the required npm packages:
```
npm install
```
Running the Application
Start the Backend Server:

Make sure you are in the backend directory with your virtual environment activated.

Run the server (the command may vary based on your setup):


# Example for FastAPI with Uvicorn
uvicorn main:app --reload

The backend server will start on http://127.0.0.1:8000.

Start the Frontend Development Server:

In a new terminal, navigate to the root project directory.

Run the development server:
```
npm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is busy).

## Building for Production
To create a production-ready build of the frontend, run the following command in the root directory:
```
npm run build
```
This will create a dist folder with the optimized static assets that you can deploy to any web server or hosting service.

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (```git checkout -b feature/AmazingFeature```)

Commit your Changes (```git commit -m 'Add some AmazingFeature'```)

Push to the Branch (```git push origin feature/AmazingFeature```)

Open a Pull Request

## License
Distributed under the MIT License. See LICENSE for more information.
