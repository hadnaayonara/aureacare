
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  MessageCircle,
  Clock,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Calendar,
  BarChart3,
  Users,
  Building,
  Car,
  Home,
  Stethoscope,
  ChevronDown,
  Star,
  Play,
  Bot,
  Menu,
  X,
  Globe,
  Target,
  Layers,
  Code,
  Lightbulb,
  Award,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';

const WhatsAppMockup = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    { type: 'user', text: 'Olá, vocês atendem aos sábados?', time: '21:30' },
    { type: 'bot', text: 'Olá! Sim, atendemos aos sábados. Posso te ajudar a agendar uma consulta? 😊', time: '21:31' },
    { type: 'user', text: 'Preciso de uma consulta urgente', time: '21:32' },
    { type: 'bot', text: 'Entendi! Tenho algumas opções disponíveis:\n\n📅 Sábado às 14:00\n📅 Segunda às 09:30\n📅 Segunda às 16:00\n\nQual prefere?', time: '21:32' },
    { type: 'user', text: 'Sábado às 14h está perfeito!', time: '21:33' },
    { type: 'bot', text: '✅ Agendamento confirmado!\n\nDr. Carlos - Sábado 14:00\n📍 Clínica Central\n\nVou enviar os dados por SMS. Até lá! 👩‍⚕️', time: '21:33' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-green-500 to-green-600 rounded-t-3xl px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h4 className="text-white font-semibold">Assistente IA</h4>
          <p className="text-green-100 text-sm">online agora</p>
        </div>
      </div>

      <div className="bg-gray-100 h-96 p-4 space-y-3 overflow-hidden">
        {messages.slice(0, currentMessage + 1).map((message, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div className={`max-w-xs px-3 py-2 rounded-2xl ${
              message.type === 'user' ?
                'bg-blue-500 text-white' :
                'bg-white text-gray-800 shadow-sm'}`
            }>
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`
              }>
                {message.time}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>);
};

const MetricChip = ({ icon: Icon, value, label, delay = 0 }) =>
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg border border-white/20">

    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="font-bold text-gray-900 text-lg">{value}</p>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  </motion.div>;


const SolutionCard = ({ icon: Icon, title, description, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    orange: "from-orange-500 to-red-600"
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 h-full">

      <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>);

};

const BrandMarquee = () => {
  const brands = [
    {
      name: "Logo 1",
      url: "/placeholder-logo.png"
    },
    {
      name: "Logo 2",
      url: "/placeholder-logo.png"
    },
    {
      name: "SAKA",
      url: "/placeholder-logo.png"
    },
    {
      name: "SAND",
      url: "/placeholder-logo.png"
    },
    {
      name: "Ana Mônica",
      url: "/placeholder-logo.png"
    },
    {
      name: "Luana Álvarez",
      url: "/placeholder-logo.png"
    },
    {
      name: "ProVida",
      url: "/placeholder-logo.png"
    },
    {
      name: "Borcelle",
      url: "/placeholder-logo.png"
    },
    {
      name: "Dra. Ísis Amaro",
      url: "/placeholder-logo.png"
    },
    {
      name: "Dra. Olívia Vieira",
      url: "/placeholder-logo.png"
    },
    {
      name: "Medvida",
      url: "/placeholder-logo.png"
    },
    {
      name: "Multimed",
      url: "/placeholder-logo.png"
    }
  ];

  return (
    <div className="overflow-hidden bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center text-2xl font-bold text-gray-900 mb-12">
          Empresas que já confiam na AureaLabs
        </h3>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-12 whitespace-nowrap"
              animate={{ x: [0, -100 * brands.length * 8] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear"
                }
              }}>

              {/* First set of brands */}
              {brands.concat(brands).map((brand, index) =>
                <motion.div
                  key={index}
                  className="flex-shrink-0 h-16 w-48 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-200 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105 p-4"
                  whileHover={{ scale: 1.03 }}>

                  <img
                    src={brand.url}
                    alt={brand.name}
                    className="max-h-12 max-w-full object-contain" />

                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>);

};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  const navItems = [
    { id: 'solucoes', label: 'Soluções' },
    { id: 'sobre', label: 'Sobre nós' },
    { id: 'resultados', label: 'Resultados' },
    { id: 'contato', label: 'Contato' }];


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const solutions = [
    {
      icon: Bot,
      title: "AureaIA: Automações de Atendimento no WhatsApp",
      description: "Criamos e treinamos seu funcionário de IA que atende 24/7, qualifica leads e agenda automaticamente. Nada de perder cliente por demora ou equipe sobrecarregada.",
      color: "blue"
    },
    {
      icon: Target,
      title: "AureaFlow: Tráfego Pago com estratégias exclusivas",
      description: "Campanhas inteligentes para trazer o lead certo, no momento certo, direto para sua automação.",
      color: "green"
    },
    {
      icon: Globe,
      title: "AureaWeb: Criação de Landing Pages que convertem",
      description: "Landing pages rápidas, modernas e persuasivas, feitas para transformar cliques em vendas.",
      color: "purple"
    },
    {
      icon: Code,
      title: "AureaSolutions: Criação de Sistemas Sob Medida",
      description: "Sites, plataformas web e aplicativos criados sob demanda para o seu negócio, com escalabilidade e integração total.",
      color: "orange"
    }];


  const whyChooseUs = [
    "Unimos estratégia + tecnologia em um só lugar",
    "Experiência real em múltiplos setores (clínicas, concessionárias, imobiliárias e mais)",
    "Integração com WhatsApp, CRMs, ERPs e APIs personalizadas",
    "Equipe que fala de negócio, não só de código"];


  const results = [
    "+40% de aumento em conversões com agentes de IA",
    "Redução de até 80% no tempo de resposta no WhatsApp",
    "Landing pages com média de 15–25% de taxa de conversão",
    "Sistemas sob medida entregues em tempo recorde"];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/b62050af4_AureaLab.png"
                  alt="AureaLab Logo"
                  className="w-8 h-8 object-contain" />

              </div>
              <span className="text-xl font-bold text-gray-900">AureaLabs</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) =>
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium">

                  {item.label}
                </button>
              )}
            </div>

            <div className="hidden md:flex">
              <Button
                onClick={() => window.open('http://wa.me/5581996020993', '_blank')}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">

                <MessageCircle className="w-4 h-4 mr-2" />
                Falar com especialista
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>

              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen &&
            <motion.div
              initial={{ opacity: 0, height: '0px' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: '0px' }}
              className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">

              {navItems.map((item) =>
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left py-2 text-gray-600 hover:text-blue-600 transition-colors">

                  {item.label}
                </button>
              )}
              <div className="mt-4">
                <Button
                  onClick={() => window.open('http://wa.me/5581996020993', '_blank')}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">

                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com especialista
                </Button>
              </div>
            </motion.div>
          }
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 relative overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}>

            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-2xl">
              🚀 Soluções com IA para empresas
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Seu cliente não pode esperar.{' '}
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                Sua empresa também não.
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Enquanto você demora para responder, seu concorrente fecha a venda. A Aurea Labs cria <strong className="text-gray-900">agentes de IA, tráfego e tecnologia sob medida</strong> para você atender, vender e escalar no automático.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={() => window.open('http://wa.me/5581996020993', '_blank')}
                size="lg"
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-lg shadow-xl">

                <Zap className="w-5 h-5 mr-2" />
                Quero automatizar meu atendimento
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <MetricChip icon={Clock} value="24/7" label="Atendimento" delay={0.1} />
              <MetricChip icon={TrendingUp} value="+40%" label="Conversões" delay={0.2} />
              <MetricChip icon={Shield} value="100%" label="Automático" delay={0.3} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative">

            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-xl -z-10" />
            <WhatsAppMockup />
          </motion.div>
        </div>
      </section>

      {/* O que fazemos Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Soluções integradas para{' '}
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                acelerar resultados
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Não somos só uma agência. Não somos só tecnologia.<br />
              Somos o time que une <strong>IA + performance + sistemas</strong> para transformar seu WhatsApp em máquina de vendas e sua empresa em operação escalável.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center">

              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Estratégia</h3>
              <p className="text-gray-600">Entendemos seu negócio e criamos soluções que fazem sentido para seu mercado e seus clientes.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center">

              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tecnologia</h3>
              <p className="text-gray-600">IA, automações e sistemas desenvolvidos sob medida para escalar sua operação sem complicação.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center">

              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Gauge className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance</h3>
              <p className="text-gray-600">Campanhas de tráfego e otimizações focadas em resultados mensuráveis e crescimento real.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nossas Soluções Section */}
      <section id="solucoes" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content with Background */}
            <div className="relative rounded-3xl overflow-hidden p-8 min-h-[500px] flex flex-col justify-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/cca944e4a_ChatGPTImage13desetde202517_11_52.png"
                alt="Assistente IA da AureaLabs"
                className="absolute inset-0 w-full h-full object-cover opacity-20 transform -scale-x-100"
                style={{ objectPosition: '30% 40%' }}
                aria-hidden="true" />

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 space-y-6">

                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  O que fazemos?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed max-w-md">
                  Unimos inteligência artificial + automação + marketing digital para criar fluxos de crescimento reais, com soluções que se adaptam a diferentes setores.
                </p>
                <Button
                  onClick={() => window.open('http://wa.me/5581996020993', '_blank')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-xl">

                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com especialista
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>

            {/* Right Side - Services Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* AureaIA */}
              <div className="bg-white/50 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/50">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/a36299b0b_ChatGPTImage13desetde202516_56_15.png"
                    alt="AureaIA"
                    className="w-16 h-16 object-contain" />

                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AureaIA</h4>
                <p className="text-slate-700 text-sm">
                  Automações de atendimento no WhatsApp. Criamos seu funcionário de IA que atende 24/7, qualifica leads e agenda automaticamente.
                </p>
              </div>

              {/* AureaFlow */}
              <div className="bg-white/50 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/50">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/51e9a1b82_ChatGPTImage13desetde202516_58_37.png"
                    alt="AureaFlow"
                    className="w-16 h-16 object-contain" />

                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AureaFlow</h4>
                <p className="text-slate-700 text-sm">
                  Tráfego pago com estratégias exclusivas. Campanhas inteligentes para trazer o lead certo, no momento certo.
                </p>
              </div>

              {/* AureaWeb */}
              <div className="bg-white/50 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/50">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/f5df269f8_ChatGPTImage13desetde202517_00_47.png"
                    alt="AureaWeb"
                    className="w-16 h-16 object-contain" />

                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AureaWeb</h4>
                <p className="text-slate-700 text-sm">
                  Criação de Landing Pages que convertem. Páginas rápidas, modernas e persuasivas, feitas para transformar cliques em vendas.
                </p>
              </div>

              {/* AureaSolutions */}
              <div className="bg-white/50 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/50">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/14577175a_ChatGPTImage13desetde202517_02_22.png"
                    alt="AureaSolutions"
                    className="w-16 h-16 object-contain" />

                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AureaSolutions</h4>
                <p className="text-slate-700 text-sm">
                  Criação de sistemas sob medida. Sites, plataformas web e aplicativos criados com escalabilidade e integração total.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Fold 1: AureaIA */}
      <section id="solucao-ia" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/a36299b0b_ChatGPTImage13desetde202516_56_15.png" alt="AureaIA" className="w-12 h-12" />
              <Badge className="bg-blue-100 text-blue-800 text-sm">AureaIA - Automações de Atendimento no WhatsApp</Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">📲 Nunca mais perca clientes por demora no WhatsApp</h2>
            <p className="text-lg text-gray-600">Agentes de IA que respondem em segundos, 24/7, qualificam leads e já deixam tudo agendado.</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Resposta automática em &lt; 3s</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Leads quentes nunca esfriam</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Integração com agenda, CRM e sistemas internos</span></li>
            </ul>
            <Button size="lg" onClick={() => window.open('http://wa.me/5581996020993', '_blank')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl">Quero automatizar meu WhatsApp</Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center">

            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/fad4e21bc_CapturadeTela2025-08-21as64630PM.png" alt="Assistente IA AureaLabs" className="max-w-full h-auto rounded-2xl shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* New Fold 2: AureaFlow */}
      <section id="solucao-flow" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
           <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center">
             <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/ea5a149cd_image.png" alt="Dashboard de performance" className="max-w-md w-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6">

            <div className="flex items-center gap-4 mb-4">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/51e9a1b82_ChatGPTImage13desetde202516_58_37.png" alt="AureaFlow" className="w-12 h-12" />
              <Badge className="bg-green-100 text-green-800 text-sm">AureaFlow - Tráfego Pago com Estratégias Exclusivas</Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">📈 Tráfego pago que entrega clientes prontos para comprar</h2>
            <p className="text-lg text-gray-600">Não basta atrair cliques, é preciso atrair pessoas que convertem. Nossa gestão de mídia une dados + criatividade para escalar vendas.</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Estratégias exclusivas por segmento</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Otimização contínua para reduzir CAC</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Integração direta com o funil de atendimento IA</span></li>
            </ul>
            <Button size="lg" onClick={() => window.open('http://wa.me/5581996020993', '_blank')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl">Quero vender mais com tráfego inteligente</Button>
          </motion.div>
        </div>
      </section>

      {/* New Fold 3: AureaWeb */}
      <section id="solucao-web" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6">

            <div className="flex items-center gap-4 mb-4">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/f5df269f8_ChatGPTImage13desetde202517_00_47.png" alt="AureaWeb" className="w-12 h-12" />
              <Badge className="bg-purple-100 text-purple-800 text-sm">AureaWeb - Criação de Landing Pages</Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">🌐 Landing pages feitas para converter, não só para "ficar bonita"</h2>
            <p className="text-lg text-gray-600">Cada detalhe pensado para transformar cliques em vendas: copy, design, velocidade e performance.</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Estrutura pensada no funil</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Layouts responsivos e rápidos</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Testes A/B e otimização constante</span></li>
            </ul>
            <Button size="lg" onClick={() => window.open('http://wa.me/5581996020993', '_blank')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl">Quero uma landing page que converte</Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center">
             <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/724e3d82b_image.png" alt="Criação de landing page" className="max-w-md w-full" />
          </motion.div>
        </div>
      </section>

      {/* New Fold 4: AureaSolutions */}
      <section id="solucao-solutions" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
           <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center">
             <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-gray-700 p-6 relative overflow-hidden">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 </div>
                 <span className="text-gray-400 text-sm">AureaSolutions.js</span>
               </div>
               <div className="text-green-400 font-mono text-sm space-y-2">
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 0.2 }}
                 >
                   <span className="text-blue-400">function</span> <span className="text-yellow-400">criarSistema</span>() {'{'}
                 </motion.div>
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 0.4 }}
                   className="ml-4"
                 >
                   <span className="text-purple-400">const</span> <span className="text-white">solucao</span> = <span className="text-orange-400">'sob-medida'</span>;
                 </motion.div>
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 0.6 }}
                   className="ml-4"
                 >
                   <span className="text-blue-400">return</span> <span className="text-white">integrarAPIs</span>(<span className="text-orange-400">'CRM'</span>, <span className="text-orange-400">'ERP'</span>);
                 </motion.div>
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 0.8 }}
                 >
                   {'}'}
                 </motion.div>
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 1.0 }}
                   className="mt-4"
                 >
                   <span className="text-gray-500">// Sistema escalável ✨</span>
                 </motion.div>
               </div>
             </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6">

            <div className="flex items-center gap-4 mb-4">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/14577175a_ChatGPTImage13desetde202517_02_22.png" alt="AureaSolutions" className="w-12 h-12" />
              <Badge className="bg-orange-100 text-orange-800 text-sm">AureaSolutions - Criação de Sistemas Sob Medida</Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">⚙️ Sistemas sob demanda para a sua empresa.</h2>
            <p className="text-lg text-gray-600">Sites, sistemas web e aplicativos desenhados sob medida para as necessidades reais da sua empresa.</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Desenvolvimento de sistemas escaláveis</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Integrações via API (CRM, ERP, WhatsApp)</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>UX simples, moderna e segura</span></li>
            </ul>
            <Button size="lg" onClick={() => window.open('http://wa.me/5581996020993', '_blank')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl">Quero meu sistema personalizado</Button>
          </motion.div>
        </div>
      </section>

      {/* Por que escolher Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Por que escolher a{' '}
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                Aurea Labs?
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}>

              <div className="space-y-6">
                {whyChooseUs.map((reason, index) =>
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4">

                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-gray-700">{reason}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white text-center">

              <Award className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h3 className="text-3xl font-bold mb-4">Experiência Comprovada</h3>
              <p className="text-blue-100 text-lg mb-6">
                Mais de 50 empresas já transformaram seus resultados com nossas soluções integradas
              </p>
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-sm">
                  "A Aurea Labs revolucionou nossa operação. Agora vendemos 24/7 sem parar!"
                </p>
                <p className="text-blue-100 text-xs mt-2">- ninesproject </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resultados Section */}
      <section id="resultados" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Resultados que falam mais alto que promessas
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {results.map((result, index) =>
              <motion.div
                key={result}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">

                <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                <span className="text-lg">{result}</span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* CTA Final Section */}
      <section id="contato" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Pronto para levar sua empresa para o próximo nível?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Atenda mais rápido, venda mais e escale com tecnologia inteligente da Aurea Labs.
            </p>

            <Button
              onClick={() => window.open('http://wa.me/5581996020993', '_blank')}
              size="lg"
              variant="secondary"
              className="rounded-2xl px-12 py-6 text-xl font-semibold bg-white text-blue-600 hover:bg-gray-100 shadow-xl">

              <MessageCircle className="w-6 h-6 mr-3" />
              Quero falar com um especialista agora
            </Button>

            <div className="flex justify-center items-center gap-8 text-blue-100 text-sm mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Consulta gratuita</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Resultados garantidos</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689514cc5ed772ee73f83c53/b62050af4_AureaLab.png"
                    alt="AureaLab Logo"
                    className="w-8 h-8 object-contain" />

                </div>
                <span className="text-xl font-bold">AureaLabs</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Agência de soluções com IA para empresas. Criamos agentes inteligentes,
                campanhas de tráfego e sistemas sob medida para acelerar seus resultados.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => window.open('http://wa.me/5581996020993', '_blank')} variant="outline" size="sm" className="rounded-2xl border-gray-700 text-gray-300 hover:bg-gray-800">
                  WhatsApp
                </Button>
                <Button onClick={() => window.location.href = 'mailto:contato@aurealabs.com.br'} variant="outline" size="sm" className="rounded-2xl border-gray-700 text-gray-300 hover:bg-gray-800">
                  Email
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soluções</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AureaIA - Automações WhatsApp</li>
                <li>AureaFlow - Tráfego Pago</li>
                <li>AureaWeb - Landing Pages</li>
                <li>AureaSolutions - Sistemas</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre nós</li>
                <li>Casos de Sucesso</li>
                <li>Blog</li>
                <li>Contato</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AureaLabs. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">LGPD</a>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
