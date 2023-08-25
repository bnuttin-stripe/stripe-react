import React from 'react';
import { RecoilRoot } from 'recoil';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RecoilRoot><App /></RecoilRoot>);