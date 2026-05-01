import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ChatProvider } from '../context/ChatContext.jsx';
import { Buffer } from "buffer";
import process from "process";


window.global = window;
window.Buffer = Buffer;
window.process = process;

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
   <AuthProvider>
    <ChatProvider>
      <App/>
    </ChatProvider>
   </AuthProvider>
 </BrowserRouter>,
)
