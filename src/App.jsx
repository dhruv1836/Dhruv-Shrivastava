import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { About, Projects, Skills, Experience, Certificates } from './components/Sections'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Admin from './pages/Admin'
import { useContent } from './lib/useContent'
import { useTheme } from './lib/useTheme'
import { isConfigured } from './lib/supabase'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

// Thin progress bar showing how far down the page you are.
function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0)
    }
    window.addEventListener('scroll', on, { passive: true })
    on()
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <div className="fixed top-0 inset-x-0 z-50 h-1 bg-transparent">
      <div className="h-full bg-black dark:bg-white transition-[width] duration-100" style={{ width: `${pct}%` }} />
    </div>
  )
}

// Floating "back to top" button, appears after scrolling down.
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black grid place-items-center shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  )
}

function LoadingScreen({ brand }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      role="status"
      aria-label="Loading portfolio"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#e9eaec] dark:bg-[#0c0c0e]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.75),transparent_58%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.08),transparent_58%)]" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center">
          <motion.div
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={reduceMotion ? undefined : { duration: 5, ease: 'linear', repeat: Infinity }}
            className="absolute inset-1 rounded-full border border-black/10 border-t-black/70 dark:border-white/10 dark:border-t-white/80"
          />
          <motion.div
            animate={reduceMotion ? undefined : { rotate: -360 }}
            transition={reduceMotion ? undefined : { duration: 8, ease: 'linear', repeat: Infinity }}
            className="absolute inset-4 rounded-full border border-dashed border-black/10 dark:border-white/15"
          />
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.55, ease: 'easeOut' }}
            className="grid h-16 w-16 place-items-center rounded-2xl bg-black text-xl font-black tracking-tight text-white shadow-xl dark:bg-white dark:text-black"
          >
            {brand || 'DS.'}
          </motion.div>
          {!reduceMotion && <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute right-3 top-4 h-2 w-2 rounded-full bg-neutral-800 dark:bg-neutral-100" />}
        </div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 0.15 }} className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-700 dark:text-neutral-300">
          Dhruv Shrivastava
        </motion.p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">Building something thoughtful</p>
        <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <motion.div
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.85, ease: 'easeInOut' }}
            className="h-full w-full rounded-full bg-black dark:bg-white"
          />
        </div>
        <span className="sr-only">Loading portfolio content</span>
      </div>
    </motion.div>
  )
}

export default function App() {
  const route = useHashRoute()
  const { dark, toggle } = useTheme()
  const { content, loading } = useContent()
  const [introTimeComplete, setIntroTimeComplete] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroTimeComplete(true), 900)
    return () => window.clearTimeout(timer)
  }, [])

  if (route.startsWith('#/admin')) return <Admin />
  const showLoader = loading || !introTimeComplete

  return (
    <div className="relative">
      <AnimatePresence>{showLoader && <LoadingScreen key="portfolio-loader" brand={content.profile.brand} />}</AnimatePresence>
      <ScrollProgress />
      <BackToTop />
      {!isConfigured && (
        <div className="fixed bottom-4 left-4 z-50 glass rounded-full px-4 py-2 text-xs shadow-lg">
          Demo mode — connect Supabase to enable admin editing
        </div>
      )}
      <Navbar brand={content.profile.brand} dark={dark} toggleTheme={toggle} resumeUrl={content.profile.resume_url} />
      {!loading && (
        <main>
          <Hero profile={content.profile} stats={content.stats} />
          <About about={content.about} profile={content.profile} />
          <Projects projects={content.projects} />
          <Skills skills={content.skills} />
          <Experience experience={content.experience} />
          <Certificates certificates={content.certificates} />
          <Contact profile={content.profile} />
        </main>
      )}
      <Footer profile={content.profile} />
    </div>
  )
}
