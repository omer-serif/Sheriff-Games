import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Sayfalar
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import CreateGame from './CreateGame';
import CreateAsset from './CreateAsset';
import GamePage from './GamePage';
import AssetPage from './AssetPage';
import Assets from './Assets';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-game" element={<CreateGame />} />
          <Route path="/create-asset" element={<CreateAsset />} />
          <Route path='/game-page' element={<GamePage/>}/>
          <Route path='/asset-page' element={<AssetPage/>}/>
          <Route path='/assets'element={<Assets/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;