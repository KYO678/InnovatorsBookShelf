import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply custom styling for the entire app
const customStyles = document.createElement("style");
customStyles.textContent = `
  html.light body {
    background-color: #F8F8F8;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
  }

  html.dark body {
    background-color: #1a1a1a;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%233a3a3a' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  }

  .book-card {
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }

  .book-spine {
    background: linear-gradient(to right, #8B5A2B, #A67C52, #8B5A2B);
    height: 100%;
    width: 10px;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 2px 0 0 2px;
  }

  .recommender-avatar {
    background-size: cover;
    background-position: center;
    transition: all 0.3s ease;
  }

  .recommender-avatar:hover {
    transform: scale(1.05);
  }

  .tab-active {
    border-bottom: 3px solid #B22222;
    color: #333;
  }

  .search-input:focus {
    box-shadow: 0 0 0 3px rgba(178, 34, 34, 0.3);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #A67C52;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #8B5A2B;
  }

  :root {
    --primary: 32 42% 36%;
    --primary-light: 29 34% 49%;
    --primary-dark: 32 50% 28%;
    --secondary: 60 33% 92%;
    --secondary-light: 60 100% 97%;
    --secondary-dark: 60 33% 85%;
    --accent: 0 68% 42%;
    --accent-light: 0 58% 53%;
    --accent-dark: 0 68% 33%;
    --paper: 0 0% 97%;
    --paper-light: 0 0% 100%;
    --paper-dark: 0 0% 94%;
  }
  
  html.dark {
    --paper: 0 0% 10%;
    --paper-light: 0 0% 15%;
    --paper-dark: 0 0% 5%;
    
    /* ダークモード時のスクロールバー */
    & .custom-scrollbar::-webkit-scrollbar-track {
      background: #2a2a2a;
    }
    
    /* ダークモード時のタブ表示 */
    & .tab-active {
      color: #f0f0f0;
    }
  }
`;

document.head.appendChild(customStyles);

// Add Google Fonts for Japanese text
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;700&display=swap";
document.head.appendChild(fontLink);

// Add Remix Icons
const remixIconLink = document.createElement("link");
remixIconLink.rel = "stylesheet";
remixIconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css";
document.head.appendChild(remixIconLink);

createRoot(document.getElementById("root")!).render(<App />);
