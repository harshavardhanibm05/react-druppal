import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Articles from './components/Articles'
import Navbar from './components/Navbar'
import SingleArticle from './components/SingleArticle'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Articles />} />
        <Route path="/articles/:id" element={<SingleArticle />} />
        <Route path="/article/:id" element={<SingleArticle />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
