"use client"

import { useState, useEffect, useRef } from "react"
import { X, Calendar, Users, Clock, Check, ChevronDown, CreditCard, User, MapPin, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GodRays, MeshGradient } from "@paper-design/shaders-react"
import Image from "next/image"
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

interface ReservaFormData {
  nome: string
  email: string
  telefone: string
  numeroPessoas: number
  data: string
  horario: string
}

// Calendário inline simplificado
function CalendarioInline({
  selectedDate,
  onSelectDate
}: {
  selectedDate: string | null
  onSelectDate: (date: string) => void
}) {
  const [today, setToday] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<number>(11)
  const [currentYear, setCurrentYear] = useState<number>(2024)

  useEffect(() => {
    const now = new Date()
    setToday(now)
    setCurrentMonth(now.getMonth())
    setCurrentYear(now.getFullYear())
  }, [])

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  // Datas fechadas (natal e ano novo)
  const closedDates = [
    `${currentYear}-12-24`, `${currentYear}-12-25`, `${currentYear}-12-31`,
    `${currentYear + 1}-01-01`
  ]

  const getDaysInMonth = () => {
    if (!today) return []
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: null, available: false })
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dateObj = new Date(currentYear, currentMonth, day)
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isClosed = closedDates.includes(dateStr)
      // Permite reservas até 60 dias no futuro
      const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60)
      days.push({ date: day, dateStr, available: !isPast && !isClosed && dateObj <= maxDate })
    }

    return days
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const prevMonth = () => {
    if (!today) return
    const minMonth = today.getMonth()
    const minYear = today.getFullYear()

    if (currentYear === minYear && currentMonth === minMonth) return

    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  if (!today) return null

  const days = getDaysInMonth()
  const canGoPrev = !(currentYear === today.getFullYear() && currentMonth === today.getMonth())
  const maxFutureDate = new Date(today.getFullYear(), today.getMonth() + 2, 1)
  const canGoNext = new Date(currentYear, currentMonth + 1, 1) < maxFutureDate

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-1.5 hover:bg-white/10 rounded-lg transition disabled:opacity-30"
        >
          <ChevronDown className="w-4 h-4 text-white rotate-90" />
        </button>
        <h3 className="text-sm font-semibold text-white">{monthNames[currentMonth]} {currentYear}</h3>
        <button
          type="button"
          onClick={nextMonth}
          disabled={!canGoNext}
          className="p-1.5 hover:bg-white/10 rounded-lg transition disabled:opacity-30"
        >
          <ChevronDown className="w-4 h-4 text-white -rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-white/80 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day.date) return <div key={index} />
          const isSelected = selectedDate === day.dateStr
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (day.available) onSelectDate(day.dateStr!)
              }}
              disabled={!day.available}
              tabIndex={-1}
              className={`
                aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all select-none
                ${day.available
                  ? isSelected
                    ? 'bg-[#FFD700] text-[#C2185B] shadow-lg font-bold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  : 'text-white/20 cursor-not-allowed'
                }
              `}
            >
              {day.date}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HeroReservaExpandable() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [formStep, setFormStep] = useState<"idle" | "submitting" | "success">("idle")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedHorario, setSelectedHorario] = useState<string>('')
  const [horarioDropdownOpen, setHorarioDropdownOpen] = useState(false)
  const horarioDropdownRef = useRef<HTMLDivElement>(null)

  const horarios = ['18:00', '18:30', '19:00', '19:30']

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReservaFormData>()

  const handleExpand = () => setIsExpanded(true)

  const handleClose = () => {
    setIsExpanded(false)
    setTimeout(() => setFormStep("idle"), 500)
  }

  const onSubmit = async (data: ReservaFormData) => {
    setFormStep("submitting")

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          numeroPessoas: data.numeroPessoas,
          data: data.data,
          horario: data.horario,
        }),
      })

      const result = await response.json()

      if (result.success && result.pixQrCode) {
        setFormStep("success")
        // Salvar dados no sessionStorage para a página de pagamento
        sessionStorage.setItem('paymentData', JSON.stringify(result))
        // Redirecionar para página de pagamento após breve delay
        setTimeout(() => {
          router.push(`/pagamento?reservaId=${result.reservationId}`)
        }, 1500)
      } else {
        // Em caso de erro, volta ao estado inicial
        setFormStep("idle")
        alert(result.message || 'Erro ao criar reserva. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      setFormStep("idle")
      alert('Erro de conexão. Tente novamente.')
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setValue('data', date)
  }

  // Lock body scroll when modal is open + close on Escape
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.body.style.overflow = "unset"
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isExpanded])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (horarioDropdownRef.current && !horarioDropdownRef.current.contains(event.target as Node)) {
        setHorarioDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Hero Section - tela inteira */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banners/rosa-mexicano-principal.jpg"
            alt="Rosa Mexicano Restaurante"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* GodRays Background */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <GodRays
            colorBack="#00000000"
            colors={["#C2185B40", "#E6510040", "#FFD70040", "#00897B40"]}
            colorBloom="#C2185B"
            offsetX={0.85}
            offsetY={-1}
            intensity={0.3}
            spotty={0.45}
            midSize={10}
            midIntensity={0}
            density={0.38}
            bloom={0.2}
            speed={0.3}
            scale={1.6}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6">
          <Image
            src="/images/logo-rosa-mexicano.png"
            alt="Rosa Mexicano"
            width={300}
            height={300}
            priority
            className="h-20 md:h-28 w-auto drop-shadow-lg"
          />
          <button
            onClick={handleExpand}
            className="text-xs text-white bg-[#C2185B] hover:bg-[#a8155a] px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-[#C2185B]/30"
          >
            Reservar Mesa
          </button>
        </header>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-[#C2185B] text-white text-xs font-bold mb-6 shadow-lg">
              Final de Ano 2024/2025
            </div>

            {/* Título */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-white drop-shadow-lg">Celebre com</span>
              <br />
              <span className="text-[#FFD700] drop-shadow-lg">Sabor Mexicano</span>
            </h1>

            {/* Descrição */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Reserve sua mesa e viva momentos inesquecíveis com a autêntica culinária mexicana
            </p>

            {/* Container dos botões - um em cima do outro */}
            <div className="flex flex-col items-center gap-4">
              {/* Valor R$50 (em cima) */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/30">
                <span className="text-2xl font-bold text-[#FFD700]">R$ 50</span>
                <span className="text-white/70 text-sm">de reserva</span>
                <span className="bg-[#00897B] text-white font-bold text-xs px-3 py-1 rounded-full">
                  100% CONSUMAÇÃO
                </span>
              </div>

              {/* Botão CTA Principal (embaixo) */}
              <AnimatePresence initial={false}>
                {!isExpanded && (
                  <motion.div className="inline-block relative">
                    <motion.div
                      style={{ borderRadius: "100px" }}
                      layout
                      layoutId="cta-card"
                      className="absolute inset-0 bg-gradient-to-r from-[#C2185B] to-[#E65100]"
                    />
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout={false}
                      onClick={handleExpand}
                      className="relative flex items-center gap-3 h-16 md:h-20 px-12 md:px-16 py-4 text-xl md:text-2xl font-bold text-white tracking-wide hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Fazer Reserva
                      <Calendar className="w-6 h-6 md:w-7 md:h-7" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/80">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4 text-[#FFD700]" />
                <span>Até 30/12</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-[#BA68C8]" />
                <span>1 a 50 pessoas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-[#C2185B]" />
                <span>18h às 19h30</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#FFF8E7] via-[#FFF5E0] to-[#FFEDD5]">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#C2185B]">
              Por que escolher o <span className="text-[#E65100]">Rosa Mexicano</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Ambiente Exclusivo', desc: 'Espaço acolhedor para sua confraternização', color: '#C2185B', icon: '🎉' },
                { title: 'Cardápio Especial', desc: 'Pratos autênticos e bebidas selecionadas', color: '#E65100', icon: '🌮' },
                { title: 'Garantia de Mesa', desc: 'Valor retorna 100% em consumação', color: '#00897B', icon: '✨' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="relative bg-white rounded-2xl p-7 text-center border-2 border-[#C2185B]/20 hover:border-[#C2185B]/40 transition-all shadow-lg hover:shadow-2xl"
                  style={{ borderTopColor: item.color, borderTopWidth: '4px' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-5xl mb-4"
                  >
                    {item.icon}
                  </motion.div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: item.color }}>{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -z-10"
                    style={{ background: `${item.color}20` }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      {/* Como Funciona */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#FFEDD5] to-[#FFF8E7]">
          <div className="container mx-auto max-w-3xl">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#C2185B]">
              Como <span className="text-[#E65100]">funciona</span>?
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Escolha data, horário e pessoas', desc: 'Clique em "Fazer Reserva" acima', color: '#C2185B' },
                { step: 2, title: 'Pague R$ 50,00 via PIX', desc: 'Valor retorna 100% em consumação', color: '#E65100' },
                { step: 3, title: 'Receba confirmação', desc: 'Por e-mail e SMS na hora', color: '#00897B' },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: item.step * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-center bg-white rounded-xl p-5 border-2 border-[#C2185B]/20 hover:border-[#C2185B]/40 transition-all shadow-md hover:shadow-xl"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ background: item.color }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Galeria */}
        <section className="py-16 px-4 bg-gradient-to-b from-[#FFF8E7] to-[#FFF5E0]">
          <div className="container mx-auto max-w-5xl">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#C2185B]">
              Nosso <span className="text-[#E65100]">Ambiente</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                '/images/ambiente/bnu01.jpg',
                '/images/ambiente/bnu02.jpg',
                '/images/ambiente/bnu03.jpg',
                '/images/ambiente/bnu04.jpg',
                '/images/ambiente/bnu05.jpg',
                '/images/ambiente/a3b363b686c06baa2308326374f9406b.jpg',
              ].map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative aspect-square overflow-hidden rounded-xl group shadow-lg border-2 border-white"
                >
                  <Image
                    src={src}
                    alt={`Ambiente ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#C2185B]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="py-16 px-4 bg-gradient-to-b from-[#FFF5E0] to-[#FFEDD5]">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[#C2185B]/20 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#C2185B]">
                    Visite o <span className="text-[#E65100]">Rosa Mexicano</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C2185B]/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#C2185B]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Localização</p>
                        <p className="text-gray-500 text-sm">Rua Carlos Rischbieter, 64</p>
                        <p className="text-gray-500 text-sm">Victor Konder, Blumenau/SC</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E65100]/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#E65100]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Contato</p>
                        <p className="text-gray-500 text-sm">(47) 3288-3096</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <a
                      href="tel:+554732883096"
                      className="px-6 py-3 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all border border-gray-200"
                    >
                      Ligar Agora
                    </a>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Rua+Carlos+Rischbieter,+64+-+Victor+Konder,+Blumenau+-+SC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full bg-[#C2185B] text-white text-sm font-medium hover:bg-[#a8155a] transition-all shadow-md shadow-[#C2185B]/30"
                    >
                      Como Chegar
                    </a>
                  </div>
                </div>

                <div className="h-[280px] md:h-auto rounded-xl overflow-hidden border-2 border-[#C2185B]/20 shadow-lg">
                  <iframe
                    src="https://www.google.com/maps?q=Rua+Carlos+Rischbieter,+64+-+Victor+Konder,+Blumenau+-+SC&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '280px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-[#C2185B]/20 bg-white/50">
        <div className="container mx-auto text-center">
          <Image
            src="/images/logo-rosa-mexicano.png"
            alt="Rosa Mexicano"
            width={140}
            height={47}
            className="h-10 w-auto mx-auto mb-4"
          />
          <p className="text-gray-600 text-sm mb-2">© 2025 Rosa Mexicano Restaurante</p>
          <p className="text-gray-400 text-xs">(47) 3288-3096 • Victor Konder, Blumenau/SC</p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="w-3 h-3 rounded-full bg-[#C2185B]"></span>
            <span className="w-3 h-3 rounded-full bg-[#E65100]"></span>
            <span className="w-3 h-3 rounded-full bg-[#00897B]"></span>
          </div>
        </div>
      </footer>

      {/* Modal Expandido */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <motion.div
              layoutId="cta-card"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex h-full w-full overflow-hidden bg-[#C2185B] sm:rounded-[24px] shadow-2xl"
            >
              {/* Mesh Gradient Background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none"
              >
                <MeshGradient
                  speed={0.6}
                  colors={["#C2185B", "#a8155a", "#E65100", "#d45a00"]}
                  distortion={0.8}
                  swirl={0.1}
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-8 sm:top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto overflow-hidden"
              >
                {/* Left Side: Info */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 gap-8 text-white">
                  <div className="space-y-4">
                    <Image
                      src="/images/logo-rosa-mexicano.png"
                      alt="Rosa Mexicano"
                      width={180}
                      height={60}
                      className="h-16 w-auto mb-4"
                    />
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                      Reserve sua Mesa
                    </h2>
                    <p className="text-white/80 text-lg max-w-md">
                      Garanta seu lugar para celebrar o fim de ano com a autêntica culinária mexicana.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-center bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center">
                        <Check className="w-6 h-6 text-[#C2185B]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">100% Vira Consumação</h3>
                        <p className="text-white/80 text-sm">O valor pago é descontado da sua conta</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00897B] flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Tolerância de 10 min</h3>
                        <p className="text-white/80 text-sm">Chegue no horário reservado</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E65100] flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Avise na Saída</h3>
                        <p className="text-white/80 text-sm">Ganhe o desconto de R$50 na conta</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/20 hidden lg:block">
                    <p className="text-white/60 text-sm">
                      Fechado: 24/12, 25/12 e 31/12
                    </p>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/10 backdrop-blur-sm lg:bg-transparent">
                  <div className="w-full max-w-md bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-5 sm:p-6 shadow-2xl">

                    {formStep === "success" ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center py-8 space-y-4"
                      >
                        <div className="w-16 h-16 bg-[#00897B] rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">Reserva Criada!</h3>
                          <p className="text-white/80 text-sm">Redirecionando para pagamento...</p>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-white mb-0.5">Dados da Reserva</h3>
                          <p className="text-xs text-white/80">Preencha os campos abaixo</p>
                        </div>

                        {/* Nome e Email - lado a lado */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-white mb-1 uppercase tracking-wider">
                              Nome
                            </label>
                            <input
                              {...register('nome', { required: 'Nome obrigatório' })}
                              type="text"
                              placeholder="Seu nome"
                              className="w-full px-3 py-2.5 rounded-lg bg-white/25 border border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-white mb-1 uppercase tracking-wider">
                              Telefone
                            </label>
                            <input
                              {...register('telefone', { required: 'Telefone obrigatório' })}
                              type="tel"
                              placeholder="(00) 00000-0000"
                              className="w-full px-3 py-2.5 rounded-lg bg-white/25 border border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[11px] font-semibold text-white mb-1 uppercase tracking-wider">
                            Email
                          </label>
                          <input
                            {...register('email', { required: 'Email obrigatório' })}
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            className="w-full px-3 py-2.5 rounded-lg bg-white/25 border border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Pessoas e Horário - lado a lado */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-white mb-1 uppercase tracking-wider">
                              Pessoas
                            </label>
                            <input
                              {...register('numeroPessoas', { required: true, valueAsNumber: true, min: 1, max: 50 })}
                              type="number"
                              min="1"
                              max="50"
                              placeholder="1"
                              className="w-full px-3 py-2.5 rounded-lg bg-white/25 border border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm text-center"
                            />
                          </div>
                          <div ref={horarioDropdownRef} className="relative">
                            <label className="block text-[11px] font-semibold text-white mb-1 uppercase tracking-wider">
                              Horário
                            </label>
                            <input type="hidden" {...register('horario', { required: true })} />
                            <button
                              type="button"
                              onClick={() => setHorarioDropdownOpen(!horarioDropdownOpen)}
                              className="w-full px-3 py-2.5 rounded-lg bg-white/25 border border-white/40 text-white text-sm text-center flex items-center justify-center gap-1"
                            >
                              <span className={selectedHorario ? 'text-white font-medium' : 'text-white/50'}>
                                {selectedHorario || 'Selecione'}
                              </span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${horarioDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {horarioDropdownOpen && (
                              <div className="absolute z-50 mt-1 left-0 right-0 bg-[#C2185B] border border-white/20 rounded-lg overflow-hidden shadow-xl">
                                {horarios.map((h) => (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => {
                                      setSelectedHorario(h)
                                      setValue('horario', h)
                                      setHorarioDropdownOpen(false)
                                    }}
                                    className={`w-full px-3 py-2 text-center text-sm ${selectedHorario === h ? 'bg-white/20 text-white font-medium' : 'text-white/80 hover:bg-white/10'}`}
                                  >
                                    {h}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Calendário */}
                        <div>
                          <label className="block text-[11px] font-semibold text-white mb-1 uppercase tracking-wider">
                            Data
                          </label>
                          <input type="hidden" {...register('data', { required: true })} />
                          <CalendarioInline selectedDate={selectedDate} onSelectDate={handleDateSelect} />
                          {selectedDate && (
                            <p className="text-[#FFD700] text-xs mt-2 font-medium text-center">
                              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                            </p>
                          )}
                        </div>

                        {/* Valor e Botão */}
                        <div className="pt-4 border-t border-white/20 mt-3">
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-[#FFD700]">R$ 50,00</span>
                            <span className="bg-[#00897B] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                              100% CONSUMAÇÃO
                            </span>
                          </div>

                          <button
                            disabled={formStep === "submitting"}
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-[#C2185B] text-base font-bold hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                          >
                            {formStep === "submitting" ? (
                              <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-[#C2185B] border-t-transparent rounded-full animate-spin"></span>
                                Processando...
                              </span>
                            ) : (
                              <>
                                <CreditCard className="w-5 h-5" />
                                Continuar para Pagamento
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
