import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Articles from './components/Articles'
import CreateArticle from './components/CreateArticle'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Articles />} />
        <Route path="/create" element={<CreateArticle />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
