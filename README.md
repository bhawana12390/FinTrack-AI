# FinTrack AI: Your Personal Finance Co-Pilot

## 1. Problem Definition

In today's fast-paced digital economy, managing personal finances effectively has become increasingly complex. Many individuals struggle with:
- **Lack of Visibility**: Difficulty in tracking numerous income streams and expenses from various sources, leading to a poor understanding of their financial health.
- **Reactive vs. Proactive Management**: Most financial tools are reactive, showing historical data but offering little predictive insight or actionable advice to prevent overspending.
- **Time-Consuming Data Entry**: Manually logging every transaction is tedious and prone to error, discouraging consistent use of tracking applications.
- **Information Overload**: Raw transaction data and simple charts often fail to provide clear, personalized guidance on how to improve financial habits.

FinTrack AI was developed to address these challenges by creating an intelligent, proactive financial co-pilot that not only tracks finances but also provides personalized, AI-driven insights to help users achieve their financial goals.

## 2. Methodology

FinTrack AI is a full-stack web application built with a modern, scalable, and AI-integrated technology stack.

- **Frontend**: The user interface is a responsive single-page application built with **Next.js** and **React**. Styling is handled by **Tailwind CSS** and a professional component library from **ShadCN UI**, ensuring a modern and accessible user experience across all devices. Dynamic charts are rendered using **Recharts**.

- **Backend & Database**: User authentication and data persistence are managed by **Firebase**. **Firebase Authentication** provides secure email/password and Google OAuth sign-in, while **Cloud Firestore** serves as the NoSQL database for storing user transactions and budgets in real-time.

- **Generative AI**: The application's intelligence is powered by **Google's Generative AI models** (Gemini) accessed via the **Genkit** framework. This enables features such as:
    - **Voice Command Transcription**: Transcribing spoken commands into structured transaction data.
    - **AI Financial Advisor**: Analyzing spending patterns to generate personalized financial tips.
    - **Spending Forecasts**: Predicting future spending against user-defined budgets.

- **PDF Statement Processing**: To handle the complex task of parsing PDF bank statements, a dedicated microservice was built using **Python** with the **FastAPI** framework. This backend service uses **PyMuPDF** to extract text and a custom parsing engine to identify and structure transactions, which are then sent to the Next.js frontend for user review.

- **Deployment**: The application is designed for cloud-native deployment using **Firebase App Hosting**.

## 3. Results

FinTrack AI successfully provides a comprehensive and intelligent solution for personal finance management. The key results and features include:

- **Secure, Centralized Platform**: Users can securely sign up and access their financial data from any device, synced in real-time with the cloud.

- **Interactive Financial Dashboard**: An at-a-glance overview of total income, expenses, and current balance, supplemented by dynamic charts visualizing spending by category and financial trends over time.

- **Effortless Transaction Management**:
    - **Manual Entry**: A clean, intuitive form for adding transactions.
    - **Voice Commands**: Users can simply speak commands like *"Expense 500 for Food"* to log transactions hands-free.
    - **Automatic PDF Import**: Uploading a bank statement triggers the backend to parse, categorize, and prepare transactions for one-click import.

- **Proactive AI-Powered Insights**:
    - **AI Financial Advisor**: Generates personalized, actionable tips based on an analysis of the user's actual spending history.
    - **Smart Budgeting**: Allows users to set monthly budgets and uses AI to forecast if they are on track, helping prevent overspending before it happens.

- **Data Portability**: Users can download a professional PDF summary of their transaction history at any time.

<img src="FinTrack AI.jpeg" alt="FinTrack AI Dashboard" width="800" style="max-width: 100%; height: auto;">

## 4. How to Run the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- `npm` or `yarn`

### Local Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   In your new project, go to **Project Settings** (click the gear icon ⚙️ next to "Project Overview").
    *   Under the "General" tab, in the "Your apps" section, click the web icon (`</>`) to create a new web app.
    *   Give your app a nickname and click "Register app".
    *   You will now see your Firebase configuration details (`apiKey`, `authDomain`, etc.). You will need these for the next step.

4.  **Configure Environment Variables:**
    *   In the project's root directory, create a new file named `.env.local`.
    *   Copy the contents of `.env.local.example` into your new `.env.local` file.
    *   Replace the placeholder values with the actual values from your Firebase project settings.
    *   You will also need a **Gemini API Key** for the AI features. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). Add this key to your `.env.local` file as `GEMINI_API_KEY`.

5.  **Enable Authentication Methods in Firebase:**
    *   In the Firebase Console, go to **Build > Authentication**.
    *   Click the **Sign-in method** tab.
    *   Enable the **Email/Password** and **Google** providers. You will need to provide a project support email for the Google provider.

6.  **Authorize Your Local Domain:**
    *   While still in the Authentication section, click the **Settings** tab.
    *   Under **Authorized domains**, click **Add domain** and enter `localhost`.

7.  **Run the development server:**
    ```bash
    npm run dev
    ```
    **Important**: You must restart your development server after creating or modifying the `.env.local` file for the changes to apply.

    Open [http://localhost:9002](http://localhost:9002) (or your configured port) to see the application.

### Viewing Your Data in Firestore

Once you've added some transactions and budgets through the app, you can view and manage the raw data directly in the Firebase Console:

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2.  In the main navigation menu on the left, click **Build > Firestore Database**.
3.  You will see a `users` collection. Click on it.
4.  Each user is a "document" in this collection, identified by their unique user ID from Firebase Authentication. Click on a user ID to see their data.
5.  Inside each user document, you will find the `transactions` and `budgets` sub-collections, where the individual records are stored.

## 5. License

This project is open-source and available under the MIT License.
