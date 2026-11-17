import React, { useContext, useEffect, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { SidebarContext } from '../context/SidebarContext'
import {
  SearchIcon,
  MoonIcon,
  SunIcon,
  MenuIcon,
  OutlinePersonIcon,
  OutlineCogIcon,
  OutlineLogoutIcon,
} from '../icons'
import { Avatar, Input, Dropdown, DropdownItem, WindmillContext } from '@windmill/react-ui'
import { useAuth } from '../context/AuthContext'
import schoolLogo from '../assets/img/school-logo.jpg'

function Header({ showSearch = true }) {
  const { mode, toggleMode } = useContext(WindmillContext)
  const { toggleSidebar } = useContext(SidebarContext)
  const { logout } = useAuth()
  const history = useHistory()
  const location = useLocation()

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('search') || '')
  }, [location.search])

  function handleSearch(event) {
    const value = event.target.value
    setSearchQuery(value)
    if (location.pathname === '/app/dashboard') {
      history.replace({
        pathname: '/app/dashboard',
        search: value ? `?search=${encodeURIComponent(value)}` : '',
      })
    }
  }

  function handleProfileClick() {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  function handleLogout() {
    logout()
    history.push('/login')
  }

  return (
    <>
      <header className="z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" role="banner">
      <div className="container flex min-h-16 items-center gap-4 px-4 py-3 mx-auto text-primary-700 dark:text-primary-300 sm:px-6">
        <button
          className="rounded-lg p-2 hover:bg-primary-50 lg:hidden focus:outline-none focus:shadow-outline-green dark:hover:bg-gray-700"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>
        <Link to="/app/dashboard" className="flex items-center gap-2 sm:gap-3" aria-label="DKUT Farm Management System home">
          <img src={schoolLogo} alt="DKUT Farm Management System" className="h-9 w-9 rounded-xl object-cover ring-2 ring-primary-100 dark:ring-gray-600" />
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-tight tracking-wide text-gray-900 dark:text-gray-100">DKUT FARM</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary-700 dark:text-primary-300">Management System</span>
          </span>
        </Link>
        {showSearch && (
          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-xl focus-within:text-primary-600">
              <div className="absolute inset-y-0 flex items-center pl-2">
                <SearchIcon className="w-4 h-4" aria-hidden="true" />
              </div>
              <Input
                className="pl-8 text-gray-700"
                placeholder="Search produce or jobs"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}
        <ul className="flex items-center flex-shrink-0 space-x-3 sm:space-x-5">
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-primary"
              onClick={toggleMode}
              aria-label="Toggle color mode"
            >
              {mode === 'dark' ? (
                <SunIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </li>
          {/* <!-- Profile menu --> */}
          <li className="relative">
            <button
              className="rounded-full focus:shadow-outline-primary focus:outline-none"
              onClick={handleProfileClick}
              aria-label="Account"
              aria-haspopup="true"
            >
              <Avatar
                className="align-middle"
                src="https://images.unsplash.com/photo-1502378735452-bc7d86632805?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=aa3a807e1bbdfd4364d1f449eaa96d82"
                alt=""
                aria-hidden="true"
              />
            </button>
            <Dropdown
              align="right"
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
            >
              <DropdownItem tag={Link} to="/app/profile">
                <OutlinePersonIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Profile</span>
              </DropdownItem>
              <DropdownItem tag={Link} to="/app/settings">
                <OutlineCogIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Settings</span>
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <OutlineLogoutIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Log out</span>
              </DropdownItem>
            </Dropdown>
          </li>
        </ul>
      </div>
    </header>
    </>
  )
}

export default Header
