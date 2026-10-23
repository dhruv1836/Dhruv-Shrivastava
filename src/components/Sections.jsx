import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Award, Code2, BrainCircuit, Boxes, Server, Palette, Cloud, Layers, Github, Play, Globe2, X, Braces, Database, GitBranch, ShieldCheck, Smartphone, Terminal, PanelsTopLeft } from 'lucide-react'

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

function Heading({ kicker, title, number }) {
  return (
    <div className="mb-10 text-center">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-black/10 dark:border-white/10 bg-white/35 dark:bg-white/[0.04] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 shadow-[0_0_10px_rgba(120,120,120,.6)]" />
        <span className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 dark:text-neutral-400">{number}</span>
        <span className="h-3 w-px bg-black/15 dark:bg-white/15" />
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-300">{kicker}</p>
      </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4">{title}</h2>
      <div className="mx-auto mt-4 h-[3px] w-12 rounded-full bg-gradient-to-r from-neutral-400/20 via-neutral-800/60 to-neutral-400/20 dark:from-white/10 dark:via-white/70 dark:to-white/10" />
    </div>
  )
}

export function About({ about, profile }) {
  return (
    <section id="about" className="section-shell section-shell--soft py-20">
      <motion.div {...fade} className="max-w-5xl mx-auto px-6">
        <Heading number="01" kicker="Who I am" title="About Me" />
        <p className="text-lg sm:text-xl leading-relaxed text-neutral-700 dark:text-neutral-300 text-center max-w-3xl mx-auto">
          {about}
        </p>
      </motion.div>
    </section>
  )
}

export function Projects({ projects }) {
  return (
    <section id="projects" className="section-shell py-20">
      <div className="max-w-6xl mx-auto px-6">
        <Heading number="02" kicker="My Work" title="Featured Projects" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 [perspective:1400px]">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project, index }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [videoOpen, setVideoOpen] = useState(false)
  const liveUrl = safeUrl(project.live_url || project.link)
  const githubUrl = safeUrl(project.github_url)
  const videoUrl = safeUrl(project.video_url)
  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 8,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * -8,
    })
  }

  return (
    <div className="relative">
    <motion.article
      {...fade} transition={{ duration: 0.5, delay: index * 0.08 }}
      onPointerMove={onPointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.99 }}
      style={{ rotateX: tilt.y, rotateY: tilt.x, transformPerspective: 1100, transformStyle: 'preserve-3d' }}
      className="group relative glass rounded-3xl overflow-hidden transition-[box-shadow,border-color] duration-300 hover:shadow-2xl hover:border-black/20 dark:hover:border-white/30">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-white/70 via-neutral-200 to-neutral-400 dark:from-white/15 dark:via-neutral-800 dark:to-black">
        {project.image_url ? (
          <img src={project.image_url} alt={`${project.title} project preview`} loading="lazy"
            style={{ transform: `translate3d(${tilt.x * -0.45}px, ${tilt.y * -0.45}px, 18px) scale(1.06)` }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-black/70 dark:text-white/70">
            <div className="relative grid place-items-center w-28 h-28 rounded-[2rem] border border-black/10 dark:border-white/20 bg-white/30 dark:bg-white/5 shadow-2xl backdrop-blur-sm transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
              <Layers size={42} strokeWidth={1.2} />
              <span className="absolute -right-4 -top-4 w-10 h-10 rounded-xl glass grid place-items-center text-xs font-semibold">0{index + 1}</span>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/10 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        <span className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.22em] text-white/80">Project · {String(index + 1).padStart(2, '0')}</span>
        <span className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/70 text-black dark:bg-black/40 dark:text-white backdrop-blur-md grid place-items-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
          {videoUrl ? <Play size={17} className="ml-0.5" /> : <Layers size={17} />}
        </span>
      </div>
      <div className="relative p-5 sm:p-6" style={{ transform: 'translateZ(22px)' }}>
        <h3 className="text-xl font-bold tracking-tight group-hover:translate-x-0.5 transition-transform">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{project.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(project.tags || '').split(',').filter(Boolean).map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition">{tag.trim()}</span>
          ))}
        </div>
        {(liveUrl || githubUrl || videoUrl) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-black/10 dark:border-white/10 pt-4">
            {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-full bg-black px-3.5 py-2 text-xs font-medium text-white transition hover:scale-[1.04] dark:bg-white dark:text-black"><Globe2 size={14} /> Live demo <ExternalLink size={12} /></a>}
            {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-full glass px-3.5 py-2 text-xs font-medium transition hover:scale-[1.04]"><Github size={14} /> Source code <ExternalLink size={12} /></a>}
            {videoUrl && <button type="button" onClick={() => setVideoOpen(true)} className="inline-flex items-center gap-1.5 rounded-full glass px-3.5 py-2 text-xs font-medium transition hover:scale-[1.04]"><Play size={14} /> Watch demo</button>}
          </div>
        )}
      </div>
    </motion.article>
    {videoOpen && <ProjectVideo project={project} url={videoUrl} onClose={() => setVideoOpen(false)} />}
    </div>
  )
}

function safeUrl(value) {
  if (!value || typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch { return null }
}

function videoSource(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null
    const host = url.hostname.toLowerCase()
    let id = ''
    if (['youtu.be', 'www.youtu.be'].includes(host)) id = url.pathname.split('/').filter(Boolean)[0] || ''
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1] || ''
    }
    if (/^[\w-]{11}$/.test(id)) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
      id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part)) || ''
      if (id) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}?autoplay=1` }
    }
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: 'video', src: url.href }
  } catch { return null }
  return null
}

function ProjectVideo({ project, url, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  const source = videoSource(url)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center p-4 sm:p-8">
      <button type="button" aria-label="Close video" onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.92, rotateX: 8 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} role="dialog" aria-modal="true" aria-label={`${project.title} demo video`} className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl glass shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 px-5 py-4">
          <div><p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">Project walkthrough</p><h3 className="font-semibold mt-0.5">{project.title}</h3></div>
          <button type="button" onClick={onClose} aria-label="Close video" className="w-10 h-10 rounded-full glass grid place-items-center hover:rotate-90 transition-transform"><X size={18} /></button>
        </div>
        <div className="aspect-video bg-black">
          {source?.kind === 'iframe' && <iframe src={source.src} title={`${project.title} demo`} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
          {source?.kind === 'video' && <video src={source.src} controls autoPlay playsInline className="w-full h-full" />}
          {!source && <div className="h-full grid place-items-center p-6 text-center text-white"><div><Play className="mx-auto mb-3" /><p>This video host can’t be embedded here.</p><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black">Open video <ExternalLink size={14} /></a></div></div>}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Skills({ skills }) {
  // Match the current skill name so changes made in Admin automatically update its symbol.
  const skillIcon = (name = '') => {
    const value = name.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim()
    if (/\bpython\b/.test(value)) return 'python'
    if (/\bcss(?:3)?\b/.test(value)) return 'css'
    if (/\bhtml(?:5)?\b/.test(value)) return 'html'
    if (/\b(pytorch|tensorflow|machine learning|\bml\b|ai|artificial intelligence|data science)\b/.test(value)) return BrainCircuit
    if (/\b(three(?:\.js)?|3d|webgl|blender|unity|unreal)\b/.test(value)) return Boxes
    if (/\b(sql|database|postgres(?:ql)?|mysql|mongodb|supabase|firebase|redis)\b/.test(value)) return Database
    if (/\b(node(?:\.js)?|express|api|backend|back end|spring|django|flask)\b/.test(value)) return Server
    if (/\b(android|ios|mobile|flutter|react native)\b/.test(value)) return Smartphone
    if (/\b(react|next(?:\.js)?|vue|angular|svelte|frontend|front end)\b/.test(value)) return Code2
    if (/\b(tailwind|sass|scss|web design)\b/.test(value)) return PanelsTopLeft
    if (/\b(ui|ux|design|figma|photoshop|illustrator|canva)\b/.test(value)) return Palette
    if (/\b(cloud|devops|aws|azure|gcp|docker|kubernetes|vercel)\b/.test(value)) return Cloud
    if (/\b(git|github|gitlab|version control)\b/.test(value)) return GitBranch
    if (/\b(security|cybersecurity|penetration testing)\b/.test(value)) return ShieldCheck
    if (/\b(linux|bash|terminal|shell|powershell)\b/.test(value)) return Terminal
    if (/\b(javascript|typescript|java|programming|coding)\b/.test(value) || /(?:^|\s)c(?:\+\+|#)?(?:\s|$)/.test(value)) return Braces
    return Code2
  }
  return (
    <section id="skills" className="section-shell section-shell--soft py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Heading number="03" kicker="What I use" title="Skills" />
        <p className="text-center text-neutral-600 dark:text-neutral-400 -mt-5 mb-9">Tools and technologies I enjoy building with</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s, i) => <SkillCard key={s.id} skill={s} index={i} icon={skillIcon(s.name)} />)}
        </div>
      </div>
    </section>
  )
}

function SkillCard({ skill, index, icon: Icon }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((event.clientY - rect.top) / rect.height - 0.5) * -10,
      y: ((event.clientX - rect.left) / rect.width - 0.5) * 10,
    })
  }
  return (
    <motion.div {...fade} onPointerMove={onPointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25, delay: index * 0.04 }}
      style={{ rotateX: tilt.x, rotateY: tilt.y, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      className="group glass rounded-2xl p-5 flex items-center gap-4 transition-shadow hover:shadow-xl hover:border-black/20 dark:hover:border-white/30">
      <motion.div whileHover={{ rotate: 8 }} className="w-12 h-12 shrink-0 rounded-xl bg-black text-white dark:bg-white dark:text-black grid place-items-center" style={{ transform: 'translateZ(24px)' }}>
        {Icon === 'python' ? <PythonSkillMark /> : Icon === 'css' ? <CssSkillMark /> : Icon === 'html' ? <HtmlSkillMark /> : <Icon size={22} />}
      </motion.div>
      <div className="min-w-0" style={{ transform: 'translateZ(12px)' }}>
        <h3 className="font-semibold">{skill.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Explore what I can build <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></p>
      </div>
    </motion.div>
  )
}

function PythonSkillMark() {
  return <svg width="26" height="26" viewBox="0 0 32 32" role="img" aria-label="Python logo" fill="none">
    <path fill="#3776AB" d="M15.8 3.5c-6.5 0-6.1 2.8-6.1 2.8v4h6.2v1.2H7.2S3 11 3 17.2s3.7 6 3.7 6h2.2v-3.1s-.1-3.7 3.7-3.7h6.3s3.5.1 3.5-3.4V7.3s.5-3.8-6.6-3.8Zm-3.4 2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
    <path fill="#FFD343" d="M16.2 28.5c6.5 0 6.1-2.8 6.1-2.8v-4h-6.2v-1.2h8.7s4.2.5 4.2-5.7-3.7-6-3.7-6h-2.2v3.1s.1 3.7-3.7 3.7h-6.3s-3.5-.1-3.5 3.4v5.7s-.5 3.8 6.6 3.8Zm3.4-2.1a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
  </svg>
}

function CssSkillMark() {
  return <svg width="25" height="28" viewBox="0 0 24 28" role="img" aria-label="CSS3 logo">
    <path fill="#1572B6" d="M2 1h20l-1.8 22L12 27l-8.2-4L2 1Z" />
    <path fill="#33A9DC" d="M12 3v21.3l6.6-3.2L20.1 3H12Z" />
    <path fill="#fff" d="M6 6h12l-.3 3H9.3l.2 2h8l-.6 7.1-4.9 2.4-4.9-2.4-.3-3.6h3l.1 1.7 2.1 1 2.1-1 .2-2.4H7.2L6 6Z" />
  </svg>
}

function HtmlSkillMark() {
  return <svg width="25" height="28" viewBox="0 0 24 28" role="img" aria-label="HTML5 logo">
    <path fill="#E34F26" d="M2 1h20l-1.8 22L12 27l-8.2-4L2 1Z" />
    <path fill="#EF652A" d="M12 3v21.3l6.6-3.2L20.1 3H12Z" />
    <path fill="#fff" d="M6 6h12l-.3 3H9.3l.2 2h8l-.6 7.1-4.9 2.4-4.9-2.4-.3-3.6h3l.1 1.7 2.1 1 2.1-1 .2-2.4H7.2L6 6Z" />
  </svg>
}

export function Experience({ experience }) {
  return (
    <section id="experience" className="section-shell py-20">
      <div className="max-w-3xl mx-auto px-6">
        <Heading number="04" kicker="My journey" title="Experience" />
        <div className="relative border-l border-black/15 dark:border-white/15 pl-8 space-y-10">
          {experience.map((e) => (
          <motion.div key={e.id} {...fade} className="relative">
            <span className="absolute -left-[38px] top-1.5 w-3.5 h-3.5 rounded-full bg-black dark:bg-white ring-4 ring-[#e9eaec] dark:ring-[#0c0c0e]" />
            <div className="text-sm text-neutral-500">{e.period}</div>
            <h3 className="text-xl font-bold mt-1">{e.role}</h3>
            <div className="text-neutral-600 dark:text-neutral-300">{e.org}</div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">{e.desc}</p>
          </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Certificates({ certificates }) {
  return (
    <section id="certificates" className="section-shell section-shell--soft py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Heading number="05" kicker="Proof of work" title="Certificates & Achievements" />
        <div className="grid sm:grid-cols-2 gap-5">
          {certificates.map((c, i) => (
          <motion.div key={c.id} {...fade} transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-black/20 dark:hover:border-white/30">
            {c.image_url && (
              <a href={c.link || c.image_url} target="_blank" rel="noreferrer" className="block overflow-hidden">
                <img src={c.image_url} alt={c.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
              </a>
            )}
            <div className="p-5 flex items-start gap-4">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-black text-white dark:bg-white dark:text-black grid place-items-center group-hover:rotate-6 group-hover:scale-110 transition-transform">
                <Award size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{c.title}</h3>
                  {c.link && (
                    <a href={c.link} target="_blank" rel="noreferrer" aria-label="View credential">
                      <ExternalLink size={15} className="opacity-40 group-hover:opacity-100 transition" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">
                  {c.issuer}{c.issuer && c.year ? ' · ' : ''}{c.year}
                </p>
                {c.desc && <p className="text-sm text-neutral-500 mt-1">{c.desc}</p>}
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
