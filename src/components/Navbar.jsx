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
        <Link
          to="/create"
          className={`navbar__link navbar__link--cta${pathname === '/create' ? ' navbar__link--active' : ''}`}
        >
          + New Article
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
