import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';

import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from './store/auth-context';
import {ActionContextProvider} from "./store/action-context";


ReactDOM.render(
    <AuthContextProvider>
<<<<<<< HEAD
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
=======
        <ActionContextProvider>
            <React.StrictMode>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </React.StrictMode>
        </ActionContextProvider>
>>>>>>> origin/dev
    </AuthContextProvider>,
    document.getElementById('root')
);
