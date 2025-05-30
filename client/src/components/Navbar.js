import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(`.${styles.mobileNav}`) && !event.target.closest(`.${styles.menuButton}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>📚</span>
          <span className={styles.brandText}>EduTrack</span>
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link
            to="/upload"
            className={`${styles.navLink} ${isActive('/upload') ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>📁</span>
            Upload
          </Link>
          <Link
            to="/analytics"
            className={`${styles.navLink} ${isActive('/analytics') ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>📈</span>
            Analytics
          </Link>
        </nav>

        <button
          className={styles.menuButton}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileNavHeader}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandIcon}>📚</span>
            <span className={styles.brandText}>EduTrack</span>
          </Link>
          <button
            className={styles.closeButton}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className={styles.mobileNavLinks}>
          <Link
            to="/"
            className={`${styles.mobileNavLink} ${isActive('/') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link
            to="/upload"
            className={`${styles.mobileNavLink} ${isActive('/upload') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.navIcon}>📁</span>
            Upload
          </Link>
          <Link
            to="/analytics"
            className={`${styles.mobileNavLink} ${isActive('/analytics') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.navIcon}>📈</span>
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 