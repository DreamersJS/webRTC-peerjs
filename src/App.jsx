import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { AppContextProvider } from './login/AppContext';
import './App.css'
import Home from './Home'
import { Register } from './login/Register';
import { Login } from './login/Login';

// Local dev: run PeerServer locally with
// npx peerjs --port 9000
function App() {
  let { userId } = useParams();

  return (
    <>
      <AppContextProvider>
        <Router>
          <Routes>
            <Route path="*" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </AppContextProvider>
    </>
  )
}

export default App
