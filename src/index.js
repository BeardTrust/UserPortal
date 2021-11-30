import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

import App from './App';

import {BrowserRouter} from "react-router-dom";
import {AuthContextProvider} from './store/auth-context';
import {ActionContextProvider} from "./store/action-context";

axios.interceptors.request.use((request) => {
    if(localStorage.getItem('token') !== null){
        request.headers.Authorization = localStorage.getItem('token');
    }

    return request;
});

ReactDOM.render(
    <AuthContextProvider>
        <ActionContextProvider>
            <React.StrictMode>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </React.StrictMode>
        </ActionContextProvider>
    </AuthContextProvider>,
    document.getElementById('root')
);
