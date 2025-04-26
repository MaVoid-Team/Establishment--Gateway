'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Search, Menu, X } from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './languageSwitcher'
import NotificationIcon from './notifications'
import BackButton from './backButton'
import Logo from "./Logo";
import { useTranslation } from 'react-i18next'


export default function Header() {
  const [time, setTime] = useState(new Date())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { i18n } = useTranslation()
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // const formatTime = (date) => {
  //   const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US' // Adjust locale as needed
  //   return date.toLocaleTimeString(locale, {
  //     hour: 'numeric',
  //     minute: '2-digit',
  //     hour12: true
  //   }).toLowerCase()
  // }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="text-[#222222] dark:text-[#ffffff] print:hidden">
      <div className="container mx-auto px-4 py-3  ">
        <div className="flex items-start justify-between">
          {/* Logo / Title */}
          <div className="text-3xl font-black">
            <Logo className=""/>
          </div>
          
          
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-start space-x-2">
            <ThemeSwitcher/>
            <LanguageSwitcher />
            <NotificationIcon />
            <BackButton />
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="search"
                placeholder="Find people, documents and more..."
                className="w-[300px] pl-10"
              />
            </div> */}
          </nav>

          {/* Hamburger Menu */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 space-y-4 md:hidden bg-[#ffffff23] dark:bg-[#ffffff21] p-4 rounded-sm">
            <div className="flex justify-center">
              <ThemeSwitcher/>
            </div>
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <div className="flex justify-center">
              <NotificationIcon />
            </div>
            <div className="flex justify-center">
              <BackButton />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="search"
                placeholder="Find people, documents and more..."
                className="w-full pl-10"
              />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

