import { useState, useEffect } from 'react'
import { Moon, Sun, Menu, X } from 'lucide-react'

const LINKS = ['Home', 'About', 'Projects', 'Skills', 'Experience', 'Certificates', 'Contact']

export default function Navbar({ brand, dark, toggleTheme, resumeUrl }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.toLowerCase())).filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.2, 0.5] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? 'border-b border-black/10 bg-[#e9eaec]/75 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c0c0e]/75' : 'bg-transparent'}`}
    >
      <nav className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
        <a href="#home" className="text-2xl font-extrabold tracking-tight">{brand || 'DS.'}</a>

        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          {LINKS.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className={`group relative transition-colors ${active === l.toLowerCase() ? 'text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'}`}>
                {l}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-current transition-all duration-300 ${active === l.toLowerCase() ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen}
            className="md:hidden w-10 h-10 rounded-full glass grid place-items-center hover:scale-105 transition">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-10 h-10 rounded-full glass grid place-items-center hover:scale-105 transition"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href={resumeUrl || '#'} target="_blank" rel="noreferrer"
             className="hidden sm:inline-flex px-4 py-2 rounded-full glass text-sm font-medium hover:scale-105 transition">
            Resume
          </a>
          <a href="#contact"
             className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:scale-105 transition">
            Let's Talk
          </a>
        </div>
      </nav>
      <div className={`md:hidden absolute top-full inset-x-4 glass rounded-2xl p-3 shadow-xl transition-all duration-200 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <ul className="grid grid-cols-2 gap-1">
          {LINKS.map((l) => <li key={l}><a onClick={() => setMenuOpen(false)} href={`#${l.toLowerCase()}`} className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${active === l.toLowerCase() ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>{l}</a></li>)}
          <li><a onClick={() => setMenuOpen(false)} href={resumeUrl || '#'} target="_blank" rel="noreferrer" className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">Resume ↗</a></li>
        </ul>
      </div>
    </header>
  )
}
