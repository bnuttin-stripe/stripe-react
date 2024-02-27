// Modules
import React from 'react';
import { useRecoilValue } from 'recoil';
import { customerAtom } from './data/atoms';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/index.css';

// Components
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Catalog from './pages/Catalog';
import Developer from './pages/Developer';

export default function App() {
    const customer = useRecoilValue(customerAtom);

    return (
        <div className="container">
            <BrowserRouter>
                <Header />
                {!customer.id &&
                    <Routes>
                        <Route path="/register/:attemptedEmail" element={
                            <Register />
                        }>
                        </Route>
                        <Route path="/register" element={
                            <Register />
                        }>
                        </Route>
                        <Route path="/*" element={
                            <Login />
                        }>
                        </Route>
                    </Routes>}
                {customer.id &&
                    <Routes>
                        <Route path="/catalog" element={
                            <Catalog />
                        }></Route>
                        <Route path="/profile" element={
                            <Profile />
                        }></Route>
                        <Route path="/developer" element={
                            <Developer />
                        }></Route>
                        <Route path="/*" element={
                            <Profile />
                        }>
                        </Route>
                    </Routes>}
            </BrowserRouter>
        </div>
    )
}
