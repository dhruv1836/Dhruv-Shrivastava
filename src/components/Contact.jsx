import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'

export default function Contact({ profile }) {
  const [form, setForm] = useState({ name: '', email: '', body: '', website: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'ok' | 'error'
  const [errorMessage, setErrorMessage] = useState('Message could not be sent. Please email me directly.')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    if (!isConfigured) {
      setErrorMessage('The contact service is not configured yet. Please email me directly.')
      setStatus('error')
      return
    }
    try {
      const { error } = await supabase.functions.invoke('contact-message', {
        body: { name: form.name, email: form.email, body: form.body, website: form.website },
      })
      if (error) {
        let message = 'Message could not be sent. Please email me directly.'
        if (error.context instanceof Response) {
          try {
            const responseBody = await error.context.clone().json()
            if (typeof responseBody.error === 'string') message = responseBody.error
          } catch {
            // Keep the generic message if the server response isn't JSON.
          }
        }
        setErrorMessage(message)
        setStatus('error')
        return
      }
      setStatus('ok')
      setForm({ name: '', email: '', body: '', website: '' })
    } catch (error) {
      console.error('Contact message failed:', error)
      setErrorMessage('Could not reach the contact service. Please email me directly.')
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section-shell section-shell--soft py-20">
      <div className="max-w-2xl mx-auto px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-black/10 dark:border-white/10 bg-white/35 dark:bg-white/[0.04] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 shadow-[0_0_10px_rgba(120,120,120,.6)]" />
          <span className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 dark:text-neutral-400">06</span>
          <span className="h-3 w-px bg-black/15 dark:bg-white/15" />
          <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-300">Get in touch</p>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4">Let's Talk</h2>
        <div className="mx-auto mt-4 h-[3px] w-12 rounded-full bg-gradient-to-r from-neutral-400/20 via-neutral-800/60 to-neutral-400/20 dark:from-white/10 dark:via-white/70 dark:to-white/10" />
        <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 mt-4 text-neutral-600 dark:text-neutral-300 hover:underline">
          <Mail size={16} /> {profile.email}
        </a>
      </div>

      <motion.form onSubmit={submit}
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} className="glass rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input required maxLength={100} autoComplete="name" aria-label="Your name" placeholder="Your name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 outline-none focus:ring-2 ring-black/20 dark:ring-white/20" />
          <input required maxLength={254} autoComplete="email" type="email" aria-label="Your email" placeholder="Your email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 outline-none focus:ring-2 ring-black/20 dark:ring-white/20" />
        </div>
        <textarea required maxLength={5000} rows={5} aria-label="Your message" placeholder="Your message" value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 outline-none focus:ring-2 ring-black/20 dark:ring-white/20" />
        <label aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </label>
        <button disabled={status === 'sending'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium hover:scale-105 transition disabled:opacity-50">
          {status === 'sending' ? 'Sending…' : <>Send Message <Send size={16} /></>}
        </button>
        {status === 'ok' && (
          <p role="status" className="flex items-center gap-2 text-green-600"><CheckCircle size={16} /> Thanks! Your message was sent.</p>
        )}
        {status === 'error' && (
          <p role="alert" className="flex items-center gap-2 text-red-600"><AlertCircle size={16} /> {errorMessage}</p>
        )}
      </motion.form>
      </div>
    </section>
  )
}
