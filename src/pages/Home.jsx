
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LogIn,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Users,
  DollarSign,
  TrendingUp,
  Instagram,
  Mail,
  Phone,
  Bot,
  Calendar,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const comparisonData = [
    {
      icon: Users,
      label: "Leads por mês",
      aiValue: "Ilimitado",
      humanValue: "Até 50",
    },
    {
      icon: DollarSign,
      label: "Custo mensal",
      aiValue: "Mais de 60% de economia",
      humanValue: "R$ 6.480,00 com encargos",
    },
    {
      icon: TrendingUp,
      label: "Performance",
      aiValue: "IA qualifica, agenda, integra com CRM e personaliza abordagens.",
      humanValue: "Humano limitado a volume diário e sujeito a faltas.",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Treinamos seu Assistente",
      description: "Alimentamos seu assistente de IA com informações sobre sua clínica, para que ele entenda seus processos e fale a sua língua.",
      question: "Ele vai saber responder tudo sobre a minha clínica?",
      answer: "Sim! Ele aprende com seus dados e se adapta às suas necessidades."
    },
    {
      step: 2,
      title: "Conectamos à Plataforma de Agendamentos",
      description: "Integramos seu assistente ao nosso sistema completo de agendamentos e prontuários médicos.",
      question: "Ele também agenda para meus médicos?",
      answer: "Claro! Ele gerencia a agenda de toda a equipe."
    },
    {
      step: 3,
      title: "Você e sua Equipe Recebem Acesso",
      description: "Recepção e médicos recebem login exclusivo para acompanhar e gerenciar os atendimentos.",
      question: "Preciso ficar de olho nele?",
      answer: "Não! Ele é 100% autônomo e funciona sem parar."
    },
    {
      step: 4,
      title: "Clínica 24h no Ar",
      description: "Pronto! Seu assistente está ativo e sua clínica funcionando 24 horas por dia, todos os dias.",
      question: "Mesmo fora do expediente?",
      answer: "Sim! Seus pacientes agendam quando quiserem, e você não perde nenhuma oportunidade."
    },
  ];

  const faqData = [
    {
      question: "Como a IA entende as especificidades da minha clínica?",
      answer: "Nós a treinamos com todas as informações do seu negócio, desde horários e serviços até o tom de voz que você prefere. Ela se torna uma especialista na sua clínica."
    },
    {
      question: "A plataforma é segura para os dados dos meus pacientes?",
      answer: "Sim! A segurança é nossa prioridade máxima. Utilizamos criptografia de ponta e seguimos as melhores práticas de proteção de dados, em conformidade com a LGPD."
    },
    {
      question: "A integração com minha agenda atual é complicada?",
      answer: "Pelo contrário. Nossa equipe cuida de toda a integração para que a transição seja suave e sem interrupções no seu fluxo de trabalho."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 text-slate-800">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-md">
              <img
                src="/logo.png"
                alt="Aurea Lab"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900">Aurea Lab</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm"
            >
              <Link to={createPageUrl("Auth")}>
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Login
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-xs sm:text-sm"
            >
              <Link to={createPageUrl("Registration")}>
                Cadastre-se
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-800/5 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              Agende, atenda e organize
              <span className="block text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                sua clínica com IA
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              A primeira plataforma médica inteligente que centraliza agendamentos,
              digitaliza prontuários e potencializa seu atendimento com inteligência artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full"
              >
                <a href="http://wa.me/5581996020993" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Fale com um especialista
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span className="font-medium">Agendamento automático</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span className="font-medium">Prontuário inteligente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span className="font-medium">Integração total</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span className="font-medium">Atendimento 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Features Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 leading-snug">
                Revolucione sua prática médica com tecnologia de ponta
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Centralize o agendamento, digitalize prontuários e otimize cada etapa do atendimento, desde a captação do paciente até o pós-consulta.
              </p>
              <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-5 h-5 sm:w-6 sm:h-6"/>
                      </div>
                      <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold">Assistente IA</h3>
                          <p className="text-sm sm:text-base text-slate-600">Sua recepção funcionando 24/7, tirando dúvidas e agendando seus pacientes.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6"/>
                      </div>
                      <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold">Agendamento Inteligente</h3>
                          <p className="text-sm sm:text-base text-slate-600">Assistente IA organiza sua agenda e confirma consultas via WhatsApp.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6"/>
                      </div>
                      <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold">Prontuário Digital Completo</h3>
                          <p className="text-sm sm:text-base text-slate-600">Registros, prescrições e histórico clínico sempre acessíveis.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6"/>
                      </div>
                      <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold">Controle de Médicos e Clínicas</h3>
                          <p className="text-sm sm:text-base text-slate-600">Seu sistema de Gestão todo conectado em lugar só.</p>
                      </div>
                  </div>
              </div>
            </div>
            <div className="relative h-full flex justify-center items-center order-1 md:order-2">
              <img
                src="/placeholder-image.png"
                alt="Assistente IA 3D"
                className="w-full max-w-xs sm:max-w-md object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparative Section */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">
                Funcionário IA vs. Humano
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-12">
                Veja a diferença que a automação inteligente faz no seu faturamento e eficiência.
            </p>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                {/* Mobile Header */}
                <div className="grid grid-cols-3 md:hidden">
                    <div className="col-span-1 p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider border-b">Comparação</div>
                    <div className="col-span-1 p-3 bg-blue-50 text-blue-800 font-bold text-xs flex items-center justify-center border-b">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2ef48eb50_AureaLab.png" alt="Aurea Lab Icon" className="w-4 h-4 mr-1" loading="lazy" decoding="async" />
                        Aurea Lab
                    </div>
                    <div className="col-span-1 p-3 text-slate-800 font-bold text-xs text-center border-b">Humano</div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-3">
                    <div className="col-span-1 p-6 font-semibold text-slate-500 uppercase tracking-wider">Comparação</div>
                    <div className="col-span-1 p-6 bg-blue-50 text-blue-800 font-bold text-lg flex items-center gap-2">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2ef48eb50_AureaLab.png" alt="Aurea Lab Icon" className="w-6 h-6" loading="lazy" decoding="async" />
                        Funcionário IA Aurea Lab
                    </div>
                    <div className="col-span-1 p-6 text-slate-800 font-bold text-lg">Funcionário Humano</div>
                </div>

                {comparisonData.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 border-t border-slate-200">
                        <div className="col-span-1 p-3 sm:p-6 flex items-center gap-2 sm:gap-3">
                            <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0"/>
                            <span className="font-semibold text-slate-700 text-xs sm:text-base">{item.label}</span>
                        </div>
                        <div className="col-span-1 p-3 sm:p-6 bg-blue-50/50 text-blue-900 font-medium text-xs sm:text-base">
                            {item.aiValue}
                        </div>
                        <div className="col-span-1 p-3 sm:p-6 text-slate-600 text-xs sm:text-base">
                            {item.humanValue}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">
              Seu assistente pronto em 4 passos simples
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Implementação rápida e assistida para você começar a faturar mais em tempo recorde.
            </p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 hidden lg:block -translate-y-4 -z-10"></div>
            {processSteps.map((item, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold shadow-lg mb-4 sm:mb-6 z-10">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">{item.description}</p>
                <div className="w-full space-y-2">
                    <div className="bg-slate-100 p-3 rounded-lg text-left text-xs sm:text-sm self-start max-w-xs mx-auto">
                        {item.question}
                    </div>
                    <div className="bg-blue-600 text-white p-3 rounded-lg text-left text-xs sm:text-sm self-end max-w-xs mx-auto">
                        {item.answer}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 sm:py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">
                Vale a pena investir em Assistente de IA? Os números mostram que sim.
              </h2>
              <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8">
                Clínicas e consultórios que adotam nossos assistentes de IA aumentam drasticamente sua capacidade de atendimento, reduzem custos e melhoram a experiência do paciente.
                Confira resultados reais que provam o impacto positivo da nossa solução na gestão e no atendimento médico.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8">
                Números alcançados com um cliente AureaLab.
              </p>

              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-400 text-sm sm:text-base">👩‍⚕️ Assistente Inteligente – AureaLab</h3>
                  </div>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm mb-3">
                  Uma das principais clínicas de especialidades do país precisava reduzir tarefas repetitivas, otimizar a agenda e melhorar a comunicação com pacientes — sem aumentar a equipe.
                </p>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Com a atuação do assistente de IA da AureaLab, integrado ao nosso sistema de agendamento e prontuário, a operação se transformou.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700">
                <div className="text-2xl sm:text-4xl font-bold text-blue-400 mb-2">8s</div>
                <p className="text-slate-300 text-xs sm:text-sm">Tempo médio para confirmar um agendamento.</p>
              </div>

              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700">
                <div className="text-2xl sm:text-4xl font-bold text-emerald-400 mb-2">65%</div>
                <p className="text-slate-300 text-xs sm:text-sm">Das interações resolvidas sem intervenção humana.</p>
              </div>

              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700">
                <div className="text-2xl sm:text-4xl font-bold text-purple-400 mb-2">+200k</div>
                <p className="text-slate-300 text-xs sm:text-sm">Minutos de atendimento economizados por ano.</p>
              </div>

              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700">
                <div className="text-2xl sm:text-4xl font-bold text-yellow-400 mb-2">R$ 180k</div>
                <p className="text-slate-300 text-xs sm:text-sm">Economia anual estimada em custos operacionais.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Folds */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* AI Assistant */}
            <div>
                <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">Sua clínica com atendimento humanizado 24h</h2>
                <p className="text-base sm:text-lg text-slate-600 mb-6">
                    Nossa IA não é um robô frio. Ela entende, conversa e agenda com a mesma empatia de um assistente humano, garantindo que seus pacientes se sintam acolhidos a qualquer hora do dia.
                </p>
            </div>
            {/* Scheduling Platform */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">Plataforma de agendamento completa</h2>
                <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8">
                    Visualize e gerencie todos os agendamentos em um só lugar. A plataforma centraliza informações, otimiza a rotina dos médicos e simplifica o trabalho da recepção.
                </p>
                {/* Mockup Notification */}
                <div className="space-y-4">
                    <Card className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-md animate-pulse">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base">Novo agendamento confirmado!</p>
                            <p className="text-xs sm:text-sm text-slate-500">Amanda S. - 14/08 às 15:30 com Dr. Carlos</p>
                        </div>
                    </Card>
                    <Card className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-md">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600"/>
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base">Novo agendamento confirmado!</p>
                            <p className="text-xs sm:text-sm text-slate-500">Roberto M. - 15/08 às 09:00 com Dra. Maria</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Respostas rápidas para suas dúvidas mais comuns.
            </p>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {faqData.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-xl rounded-br-none max-w-sm sm:max-w-lg">
                    <p className="font-semibold text-sm sm:text-base">{item.question}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <img
                      src="/logo.png"
                      alt="Aurea Lab Avatar"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-xl rounded-bl-none max-w-sm sm:max-w-lg">
                      <p className="text-sm sm:text-base">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white">
                  <img
                    src="/logo.png"
                    alt="Aurea Lab"
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="text-lg sm:text-xl font-bold">Aurea Lab</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                A primeira plataforma médica inteligente que centraliza agendamentos,
                digitaliza prontuários e potencializa seu atendimento com IA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Recursos</h4>
              <div className="space-y-3 text-slate-400 text-sm sm:text-base">
                <p>Funcionalidades</p>
                <p>Preços</p>
                <p>Integrações</p>
                <p>Termos de Uso</p>
                <p>Política de Privacidade</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Contato</h4>
              <div className="space-y-3 text-slate-400 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
                  <span>(81) 99602-0993</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"/>
                  <span className="break-all">contato@aurealabs.com.br</span>
                </div>
                <p>Suporte das 9:00 as 17:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs sm:text-sm text-center sm:text-left">
              © 2024 Aurea Lab. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/aurealab.ai/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5 sm:w-6 sm:h-6"/>
                </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
