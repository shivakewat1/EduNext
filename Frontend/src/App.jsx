import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/HomePage'
import Navbar from './Components/NavBar'
const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          
          <Route path="/" element={<Home />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
