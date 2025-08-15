import React, { useState } from 'react';
import Auth from './auth';
import Admin from './admin';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handler to be called when authentication is successful
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Admin />
      )}
    </div>
  );
}

export default App;
