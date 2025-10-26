# Examify - AI-Powered Exam Platform

## 1. Overview

Examify is a modern, AI-driven web application designed for creating, administering, and analyzing online exams. It provides a secure, proctored environment for examinees and powerful analytical tools for educators and organizations. The platform is built with a focus on user experience, security, and deep integration of AI to streamline the entire assessment lifecycle.

## 2. Core Technologies

- **Frontend:** React 18 with TypeScript
- **Styling:** Tailwind CSS for a utility-first design system.
- **AI Integration:** Google Gemini API (`@google/genai`) for various features including:
  - Natural Language Processing for parsing exams from text.
  - Generative AI for creating questions and entire exams.
  - Conversational AI for the "AI Study Buddy" and oral exam practice.
  - Real-time analysis for AI proctoring (`live.connect`).
- **Routing:** `react-router-dom` (HashRouter) for client-side navigation.
- **Data Visualization:** Recharts for analytics dashboards.
- **PDF Generation:** jsPDF & html2canvas for exporting reports and certificates.

## 3. Project Structure

The project is organized into a modular structure to ensure scalability and maintainability.

```
/
├── public/                  # Static assets (not present, but standard)
├── components/              # Reusable React components (modals, icons, layouts)
├── contexts/                # Global state management using React Context API
├── data/                    # Mock data source for the API
├── pages/                   # Top-level page components for each route
├── services/                # API layer (mocked) and AI service integrations
├── types.ts                 # Centralized TypeScript type definitions
├── App.tsx                  # Main application component with routing logic
├── index.tsx                # Entry point of the React application
└── index.html               # Main HTML file
```

- **`components/`**: Contains shared UI elements like `DashboardLayout`, `LoadingSpinner`, and various modals.
- **`contexts/`**: Manages global state such as authentication (`AuthContext`), theme (`ThemeContext`), language (`LanguageContext`), and dark mode.
- **`data/`**: `mock.ts` file that simulates a backend database. All API calls in `services/` interact with this data.
- **`pages/`**: Each file corresponds to a specific view or route in the application (e.g., `TeacherDashboard.tsx`, `ExamTaker.tsx`).
- **`services/`**:
    - `api.ts`: Simulates a backend REST API. It contains functions for fetching and manipulating data from `data/mock.ts`.
    - `ai.ts`: Contains all functions that would interact with the Google Gemini API. These are currently mocked to return sample data.
- **`types.ts`**: Defines all shared TypeScript interfaces and enums (`UserRole`, `Question`, `Exam`, etc.) for type safety across the application.

## 4. How It Works

1.  **Entry Point:** `index.html` is the main page which includes the necessary scripts and imports `index.tsx`.
2.  **React Root:** `index.tsx` renders the main `<App />` component into the DOM.
3.  **Providers:** `<App />` wraps the entire application in several context providers (`ThemeProvider`, `AuthProvider`, etc.) to make global state available to all components.
4.  **Routing:** `<AppContent />` uses `HashRouter` to manage client-side routes. It lazy-loads page components for better performance.
5.  **Authentication:** A simple mock authentication is handled by `AuthContext`. A `DevRoleSwitcher` component is available in the bottom-right corner to simulate logging in as different user types (`Teacher`, `Examinee`, `Admin`, etc.).
6.  **Data Flow:**
    - UI components (in `pages/` and `components/`) call functions from the `services/api.ts` or `services/ai.ts`.
    - These service functions currently interact with the mock data in `data/mock.ts` and return promises to simulate asynchronous API calls.
    - Components use `useState` and `useEffect` hooks to manage the data fetching, loading, and error states.

## 5. Key Features Implemented

- **Multi-Role Dashboards:** Separate, tailored dashboards for Teachers, Examinees, Corporates, Training Companies, and Admins.
- **AI-Powered Proctoring:** The `ExamTaker` page uses a mocked `live.connect` session to simulate real-time video/audio analysis for flagging suspicious activities.
- **AI Content Generation:** Modals for generating questions (`AIQuestionGeneratorModal`) or entire exams (`AIGenerateExamModal`) from text prompts.
- **AI-Powered Review & Analysis:**
  - AI-assisted grading for essay questions.
  - AI-generated explanations for incorrect answers.
  - AI-generated personalized learning paths for students.
- **Question Bank & Marketplace:** A comprehensive system for creating personal question banks and submitting/acquiring banks from a shared marketplace.
- **Dynamic Theming & Localization:** The UI supports dark mode, customizable primary colors (via `ThemeContext`), and language switching between English and Arabic (via `LanguageContext`).
