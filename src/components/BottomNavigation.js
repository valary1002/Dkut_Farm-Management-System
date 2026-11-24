import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10.5V20h13v-9.5l-6.5-5-6.5 5Z" fill="#fff" stroke="#1f2937" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
      <path d="M5 7h14l-1 12H6L5 7Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="#1e3a8a" strokeWidth="1.8" />
      <path d="M8 12h8M8 15h6" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ApplicationsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="3" fill="#14b8a6" stroke="#115e59" strokeWidth="1.2" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.2" />
      <path d="M4.5 20c1-4 3.5-6 7.5-6s6.5 2 7.5 6" fill="#ec4899" stroke="#831843" strokeWidth="1.2" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="#fde68a" />
      <path d="M19 13.5v-3l-2-.7-.8-1.8.9-2-2.1-2-1.7 1.2-2-.1-1-1.9H7.1l-.4 2.1-1.7 1-.1 2.1-1.9 1v3l2 .7.8 1.8-.9 2 2.1 2 1.7-1.2 2 .1 1 1.9h3.2l.4-2.1 1.7-1 .1-2.1 1.9-1Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
    </svg>
  )
}

const navigationByRole = {
  Administrator: [
    { path: '/app/dashboard', label: 'Home', icon: HomeIcon },
    { path: '/app/orders', label: 'Orders', icon: OrdersIcon },
    { path: '/app/job-applications', label: 'Applications', icon: ApplicationsIcon },
    { path: '/app/profile', label: 'Profile', icon: ProfileIcon },
    { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
  ],
  Customer: [
    { path: '/app/dashboard', label: 'Home', icon: HomeIcon },
    { path: '/app/orders', label: 'Orders', icon: OrdersIcon },
    { path: '/app/job-applications', label: 'Applications', icon: ApplicationsIcon },
    { path: '/app/profile', label: 'Profile', icon: ProfileIcon },
    { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
  ],
}

function BottomNavigation() {
  const { user } = useAuth()
  const items = navigationByRole[user?.role] || []

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              exact
              to={path}
              className="bottom-nav-item"
              activeClassName="bottom-nav-item-active"
              aria-label={label}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNavigation
