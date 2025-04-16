import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get an icon library for icons
document.head.innerHTML += `<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">`;

// Set document title
document.title = "StudyHub - Virtual Co-working Space";

// Add meta description
const metaDesc = document.createElement('meta');
metaDesc.name = 'description';
metaDesc.content = 'A virtual co-working and study space platform with real-time chat, member tracking, and synchronized Pomodoro timer.';
document.head.appendChild(metaDesc);

createRoot(document.getElementById("root")!).render(<App />);
