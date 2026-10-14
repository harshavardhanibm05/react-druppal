import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        📰 Drupal Articles
      </Link>
      <div className="navbar__links">
        <Link
          to="/"
          className={`navbar__link${pathname === '/' ? ' navbar__link--active' : ''}`}
        >
          Articles
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
