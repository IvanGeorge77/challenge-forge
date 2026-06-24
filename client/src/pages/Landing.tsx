import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  ArrowRight,
  ExternalLink,
  Target,
  Grid3X3,
  Zap,
  BarChart3,
  FileText,
  Flag,
  ListChecks,
  CheckCircle2,
  TrendingUp,
  Clock,
  Link2,
  Star,
} from 'lucide-react'
import Button from '../components/ui/Button'

// ============ MOCK HEATMAP DATA ============
function generateHeatmapData() {
  const data: { day: number; week: number; value: number }[] = []
  for (let week = 0; week < 22; week++) {
    for (let day = 0; day < 7; day++) {
      const rand = Math.random()
      let value = 0
      if (rand > 0.15) {
        if (rand > 0.85) value = 4
        else if (rand > 0.6) value = 3
        else if (rand > 0.4) value = 2
        else value = 1
      }
      data.push({ week, day, value })
    }
  }
  return data
}

const heatmapData = generateHeatmapData()

function HeatmapCell({ value, delay }: { value: number; delay: number }) {
  const colors = ['#1a1a1a', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className="w-[14px] h-[14px] rounded-[3px] transition-all duration-500"
      style={{
        backgroundColor: show ? colors[value] : '#1a1a1a',
        opacity: show ? 1 : 0.3,
      }}
    />
  )
}

// ============ ANIMATED COUNTER ============
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1500
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          animate()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ============ SCROLL ANIMATION ============
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  )
}

// ============ MAIN COMPONENT ============
export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}

// ============ NAVBAR ============
function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Flame size={18} className="text-bg-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight">CHALLENGEFORGE</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Why It Works'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link to="/sign-in" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Log in
          </Link>
          <Link to="/sign-up">
            <Button variant="outline" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

// ============ HERO ============
function HeroSection() {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-8">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-card text-xs text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Challenge-based productivity platform
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Build Consistency.
              <br />
              One Day at a Time.
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
              ChallengeForge helps you turn goals into time-bound challenges, track daily progress, maintain streaks,
              and visualize your consistency to achieve extraordinary results.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" icon={<ArrowRight size={18} />}>
                  Start Your First Challenge
                </Button>
              </Link>
              <Button variant="secondary" size="lg" icon={<ExternalLink size={18} />}>
                View Demo
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-bg-primary"
                    style={{
                      background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 50%), hsl(${i * 60 + 40}, 70%, 40%))`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="text-warning fill-warning" />
                ))}
              </div>
              <span className="text-sm text-text-muted">Loved by 1,000+ users</span>
            </div>
          </FadeIn>
        </div>

        {/* Right — Hero Card */}
        <FadeIn delay={200}>
          <div className="glass-card p-6 space-y-5">
            {/* Challenge Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">30-Day DSA Challenge</h3>
                <p className="text-xs text-text-muted mt-0.5">1 May – 30 May 2024</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-xs text-text-muted">Current Streak</p>
                  <p className="text-2xl font-bold">12 <span className="text-xs font-normal text-text-muted">days</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Longest Streak</p>
                  <p className="text-2xl font-bold">28 <span className="text-xs font-normal text-text-muted">days</span></p>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div>
              <p className="text-xs text-text-muted mb-2">May 2024</p>
              <div className="flex gap-0.5">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1 text-[10px] text-text-muted justify-around">
                  {dayLabels.map((d) => (
                    <span key={d} className="h-[14px] flex items-center">{d}</span>
                  ))}
                </div>
                {/* Grid */}
                <div className="flex gap-[3px] overflow-hidden">
                  {Array.from({ length: 22 }, (_, week) => (
                    <div key={week} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }, (_, day) => {
                        const cell = heatmapData.find(
                          (d) => d.week === week && d.day === day
                        )
                        return (
                          <HeatmapCell
                            key={`${week}-${day}`}
                            value={cell?.value ?? 0}
                            delay={(week * 7 + day) * 8}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
                {[
                  { color: '#1a1a1a', label: '0%' },
                  { color: '#ef4444', label: '1-25%' },
                  { color: '#f97316', label: '26-50%' },
                  { color: '#eab308', label: '51-75%' },
                  { color: '#22c55e', label: '76-100%' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 pt-3 border-t border-border">
              {[
                { label: 'Completion Rate', value: '82%' },
                { label: 'Total Score', value: '1,642' },
                { label: 'Tasks Completed', value: '128/156' },
                { label: 'Days Completed', value: '24/30' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-text-muted">{label}</p>
                  <p className="text-xl font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ============ FEATURES ============
function FeaturesSection() {
  const features = [
    {
      icon: <Target size={22} />,
      title: 'Challenge-Based Productivity',
      desc: 'Create 15, 30, 60 or 90-day challenges and break them down into actionable daily tasks.',
      color: '#84cc16',
    },
    {
      icon: <Grid3X3 size={22} />,
      title: 'GitHub-Style Heatmaps',
      desc: 'Visualize your daily progress and consistency with beautiful heatmaps that keep you motivated.',
      color: '#22c55e',
    },
    {
      icon: <Zap size={22} />,
      title: 'Streak Tracking',
      desc: 'Build momentum with current and longest streaks. Stay accountable and don\'t break the chain.',
      color: '#eab308',
    },
    {
      icon: <BarChart3 size={22} />,
      title: 'Powerful Analytics',
      desc: 'Get insights into your performance, track progress by category, difficulty, and much more.',
      color: '#3b82f6',
    },
    {
      icon: <FileText size={22} />,
      title: 'Detailed Reports',
      desc: 'At the end of every challenge, get a comprehensive report of your journey and achievements.',
      color: '#a855f7',
    },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">FEATURES</p>
            <h2 className="text-4xl font-bold">Everything you need to build better habits</h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 80}>
              <div className="glass-card p-6 h-full group">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${f.color}15`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ HOW IT WORKS ============
function HowItWorksSection() {
  const steps = [
    { icon: <Flag size={22} />, title: 'Create Challenge', desc: 'Choose a duration, set your goal and create a challenge that keeps you focused.', color: '#84cc16' },
    { icon: <ListChecks size={22} />, title: 'Add Tasks', desc: 'Add mandatory and optional tasks with categories and difficulty levels.', color: '#3b82f6' },
    { icon: <CheckCircle2 size={22} />, title: 'Track Daily Progress', desc: 'Complete your tasks every day and watch your streaks and scores grow.', color: '#22c55e' },
    { icon: <TrendingUp size={22} />, title: 'Review & Improve', desc: 'Analyze your performance, learn from patterns and improve in the next challenge.', color: '#a855f7' },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">HOW IT WORKS</p>
            <h2 className="text-4xl font-bold">A simple process that drives results</h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] border-t-2 border-dashed border-border" />

          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 120}>
              <div className="text-center relative">
                <div className="flex flex-col items-center mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative z-10"
                    style={{ backgroundColor: `${step.color}15`, color: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-bg-card border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ WHY IT WORKS ============
function WhyItWorksSection() {
  const pillars = [
    { icon: <Clock size={20} />, title: 'Small Daily Actions', desc: 'Focus on what matters each day.' },
    { icon: <Link2 size={20} />, title: 'Build Consistency', desc: 'Consistency creates unstoppable momentum.' },
    { icon: <TrendingUp size={20} />, title: 'Achieve Big Results', desc: 'Long-term progress comes naturally.' },
  ]

  // Mock chart bars
  const categories = [
    { name: 'Learning', value: 92, color: '#84cc16' },
    { name: 'Fitness', value: 78, color: '#22c55e' },
    { name: 'Health', value: 71, color: '#3b82f6' },
    { name: 'Personal', value: 85, color: '#a855f7' },
  ]

  return (
    <section id="why-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">WHY IT WORKS</p>
            <h2 className="text-4xl font-bold leading-tight mb-6">
              It's not about motivation.
              <br />
              It's about consistency.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Small actions repeated daily lead to big changes over time. ChallengeForge is built around a simple idea:
              focus on showing up every day and let the progress compound.
            </p>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="grid grid-cols-3 gap-6">
              {pillars.map((p) => (
                <div key={p.title}>
                  <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center text-accent mb-3">
                    {p.icon}
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{p.title}</h4>
                  <p className="text-xs text-text-muted">{p.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Right — Charts */}
        <FadeIn delay={100}>
          <div className="space-y-4">
            {/* Progress Overview Chart */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold mb-4">Progress Overview</p>
              <div className="flex items-end gap-1 h-32">
                {/* Y axis labels */}
                <div className="flex flex-col justify-between h-full text-[10px] text-text-muted pr-2">
                  <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
                </div>
                {/* Bars simulating a line chart */}
                {Array.from({ length: 30 }, (_, i) => {
                  const base = 50 + Math.sin(i * 0.3) * 20 + Math.random() * 15
                  const h = Math.min(Math.max(base, 10), 100)
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full">
                      <div
                        className="w-full rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: h > 75 ? '#22c55e' : h > 50 ? '#84cc16' : h > 25 ? '#eab308' : '#ef4444',
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-text-muted mt-2 pl-8">
                <span>Day 1</span><span>Day 7</span><span>Day 14</span><span>Day 21</span><span>Day 30</span>
              </div>
            </div>

            {/* Category Performance */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold mb-4">Category Performance</p>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-16 flex-shrink-0">{cat.name}</span>
                    <div className="flex-1 h-5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ============ CTA ============
function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                <Flame size={24} className="text-bg-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Your future self is built
                  <br />
                  one completed task at a time.
                </h3>
              </div>
            </div>
            <Link to="/dashboard" className="flex-shrink-0">
              <Button size="lg" variant="outline" icon={<ArrowRight size={18} />}>
                Start Your First Challenge
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ============ FOOTER ============
function Footer() {
  const columns = [
    { title: 'Product', links: ['Features', 'How It Works', 'Pricing', 'Roadmap'] },
    { title: 'Company', links: ['About Us', 'Blog', 'Privacy Policy', 'Terms of Service'] },
    { title: 'Resources', links: ['Help Center', 'Guides', 'Contact Us'] },
  ]

  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md gradient-accent flex items-center justify-center">
              <Flame size={14} className="text-bg-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">CHALLENGEFORGE</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed max-w-xs">
            Challenge-based productivity platform to help you build habits, track progress, and achieve your goals.
          </p>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold text-text-primary mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex items-center justify-between">
        <p className="text-xs text-text-muted">© 2024 ChallengeForge. All rights reserved.</p>
        <div className="flex gap-4">
          {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
            <a key={social} href="#" className="text-xs text-text-muted hover:text-text-primary transition-colors">
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
