
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  TrendingUp, 
  Bot, 
  Users, 
  CheckCircle, 
  Shield, 
  Mail,
  Building2,
  BarChart3,
  Lock,
  Star,
  Zap,
  Target,
  Brain,
  Loader2,
  UserCheck,
  Hospital,
  Microscope,
  HeartHandshake
} from 'lucide-react';
import { subscribeNewsletter } from '@/api/functions';

export default function NewsletterClinica4() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const { data } = await subscribeNewsletter({
        full_name: formData.name,
        email: formData.email
      });
      
      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Erro ao realizar inscrição');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <Card className="max-w-2xl mx-auto text-center border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              🎉 Bem-vindo à Newsletter Clínica 4.0!
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Obrigado por se inscrever, <span className="font-semibold text-blue-600">{formData.name}</span>!
            </p>
            <p className="text-slate-600 mb-8">
              Você receberá o primeiro conteúdo exclusivo em seu e-mail nos próximos dias. 
              Prepare-se para transformar sua clínica com inovação e tecnologia!
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Próximos passos:</strong> Verifique sua caixa de entrada (e spam) 
                para confirmar sua inscrição e não perder nenhum conteúdo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Elementos de fundo animados - mais suaves para fundo branco */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* 1. Hero Section Redesenhado com fundo branco */}
      <section className="relative pt-20 pb-16 min-h-screen flex items-center bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo à esquerda */}
          <div className="space-y-8">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
              🚀 Conteúdo Exclusivo e Gratuito
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 leading-tight">
              Newsletter 
              <span className="block text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                Clínica 4.0
              </span>
            </h1>
            
            <p className="text-xl text-blue-600 leading-relaxed">
              Tecnologia, Marketing e IA na Saúde. Conteúdos exclusivos sobre como clínicas modernas estão 
              crescendo com inovação e automação.
            </p>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-amber-800 font-medium text-sm">
                📬 Conteúdo fechado, entregue apenas por e-mail. Totalmente gratuito.
              </p>
            </div>

            {/* Formulário Hero */}
            <Card className="bg-white/90 backdrop-blur-md border border-blue-200 shadow-2xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-12 bg-white border-2 border-blue-200 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
                  />
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-12 bg-white border-2 border-blue-200 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
                  />
                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-xl text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "👉 Quero Receber Gratuitamente"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Nova imagem 3D à direita */}
          <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
            <div className="relative">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c2fab3410_ChatGPTImage21deagode202519_02_48.png"
                alt="Médico e Assistente IA - Aurea Lab"
                className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
              />
              
              {/* Efeitos decorativos ao redor da imagem */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-60 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -right-6 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-60 animate-pulse delay-500"></div>
              
              {/* Círculos de conexão tech */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-70"></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-700 opacity-70"></div>
                <div className="absolute top-3/4 left-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300 opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Por que assinar? - fundo azul royal */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              📈 O futuro das clínicas já começou
            </h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-10">
              Clínicas que não se adaptarem à era digital vão perder pacientes e competitividade.
              Na Newsletter Clínica 4.0, você terá acesso gratuito a:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Tendências médicas digitais", desc: "Da telemedicina às inovações em IA", color: "from-blue-500 to-cyan-500", icon: TrendingUp },
              { title: "Estratégias de marketing médico", desc: "Que realmente funcionam", color: "from-green-500 to-emerald-500", icon: Target },
              { title: "Automação prática", desc: "Para atendimento e agendamento", color: "from-purple-500 to-violet-500", icon: Bot },
              { title: "Cases reais de clínicas", desc: "Que estão crescendo com tecnologia", color: "from-orange-500 to-red-500", icon: BarChart3 }
            ].map((item, index) => (
              <div key={index} className="group">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                        <p className="text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Para quem é - Com elementos 3D - FUNDO BRANCO */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-600 mb-6">
              👥 Exclusiva para líderes e gestores da saúde
            </h2>
            <p className="text-xl text-blue-800 mb-12">
              Este conteúdo foi criado especialmente para:
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Grid de cards à esquerda */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { text: "Donos e gerentes de clínicas médicas", icon: Building2, color: "from-blue-500 to-cyan-500" },
                { text: "Clínicas odontológicas e de estética", icon: Star, color: "from-purple-500 to-pink-500" },
                { text: "Clínicas multiprofissionais", icon: Users, color: "from-green-500 to-emerald-500" },
                { text: "Centros de exames laboratoriais", icon: Microscope, color: "from-orange-500 to-red-500" },
                { text: "Hospitais e gestores de equipes", icon: Hospital, color: "from-indigo-500 to-blue-500" },
                { text: "Profissionais que desejam inovar", icon: Brain, color: "from-cyan-500 to-purple-500" }
              ].map((item, index) => (
                <div key={index} className="group animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-blue-900 font-semibold group-hover:text-blue-600 transition-colors">{item.text}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Imagem 3D à direita */}
            <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
              <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4faad9f55_ChatGPTImage21deagode202519_06_35.png"
                  alt="Médico Robô e Paciente - Aurea Lab"
                  className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
                />
                
                {/* Elementos decorativos animados */}
                <div className="absolute -top-6 -left-6 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-70 animate-ping"></div>
                <div className="absolute -bottom-6 -right-6 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-70 animate-ping delay-1000"></div>
                <div className="absolute top-1/2 -left-8 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-70 animate-ping delay-500"></div>
                
                {/* Círculos de conexão tech */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-80"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-700 opacity-80"></div>
                  <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-300 opacity-80"></div>
                </div>
                
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 -translate-x-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-blue-800 font-medium max-w-4xl mx-auto">
              Se você quer que sua clínica seja referência em atendimento, eficiência e crescimento, 
              esta newsletter é para você.
            </p>
          </div>
        </div>
      </section>

      {/* 4. O que você vai receber - fundo branco */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-600 mb-6">
              🎯 Um tema prático e direto, toda semana — sem pagar nada
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Tecnologia na Medicina",
                desc: "Como novas ferramentas estão transformando diagnósticos, exames e atendimento.",
                icon: Stethoscope,
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/20 to-cyan-500/20"
              },
              {
                title: "Marketing Médico Inteligente", 
                desc: "Estratégias digitais que atraem pacientes qualificados e reduzem custos.",
                icon: Target,
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-500/20 to-emerald-500/20"
              },
              {
                title: "IA para Clínicas",
                desc: "Como automatizar WhatsApp, agendamento e relacionamento com pacientes.",
                icon: Bot,
                color: "from-purple-500 to-violet-500",
                bgColor: "from-purple-500/20 to-violet-500/20"
              }
            ].map((item, index) => (
              <Card key={index} className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <CardContent className="p-8 text-center relative overflow-hidden">
                  {/* Fundo gradiente animado */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className={`relative w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="relative text-xl font-bold text-blue-600 mb-4 group-hover:text-blue-800 transition-colors">{item.title}</h3>
                  <p className="relative text-blue-800 group-hover:text-blue-900 transition-colors">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Exclusividade - fundo azul royal */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-3xl blur-3xl"></div>
          
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-6">
              🔒 Conhecimento fechado e gratuito
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              A Newsletter Clínica 4.0 é enviada apenas para quem faz parte da lista.
              Sem posts abertos, sem spam. Apenas informação prática e estratégica.
            </p>
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                E o melhor: 100% gratuito
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Seção Aurea Lab Redesenhada - fundo branco */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-600 mb-6">
              🚀 Quem está por trás da Clínica 4.0?
            </h2>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-md rounded-3xl p-8 border border-blue-200 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Logo e Descrição */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-lg">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2ef48eb50_AureaLab.png"
                      alt="Aurea Lab"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-blue-600">Aurea Lab</h3>
                    <p className="text-blue-800 font-medium">Automações e Funis de Conversão</p>
                  </div>
                </div>
                
                <p className="text-blue-800 leading-relaxed mb-6">
                  Referência em automação para clínicas inteligentes. Nossos assistentes de IA 
                  ajudam dezenas de profissionais a reduzir custos, melhorar a experiência do 
                  paciente e aumentar o faturamento.
                </p>
                
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl border border-blue-300">
                  <p className="text-lg text-blue-800 font-semibold">
                    "Transformamos leads em pacientes no automático"
                  </p>
                </div>
              </div>
              
              {/* Logos das Tecnologias */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-blue-600 text-center">Powered by:</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Zaia", color: "from-blue-500 to-cyan-500" },
                    { name: "Z-API", color: "from-green-500 to-emerald-500" },
                    { name: "Lovable", color: "from-purple-500 to-pink-500" }
                  ].map((tech, index) => (
                    <div key={index} className={`bg-gradient-to-r ${tech.color} p-4 rounded-xl text-center shadow-lg hover:scale-105 transition-transform`}>
                      <Badge className="bg-white/20 text-white border-0 px-3 py-1 font-semibold">
                        {tech.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Final Redesenhado - fundo azul royal */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
            ✨ Sua clínica pode faturar mais com menos esforço
            <span className="block text-cyan-200">O primeiro passo é simples — e grátis</span>
          </h2>
          
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-16 px-12 text-xl font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-0"
          >
            👉 Quero Receber a Newsletter Clínica 4.0 Gratuitamente
          </Button>
        </div>
      </section>

      {/* 8. Rodapé Redesenhado - fundo azul escuro */}
      <footer className="py-12 bg-slate-900 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <p className="text-slate-300">
              Prometemos não enviar spam. Seu e-mail é 100% seguro com a Aurea Lab.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-slate-400 mb-6">
            <a href="#" className="hover:text-cyan-300 transition-colors">Política de privacidade</a>
            <span>|</span>
            <a href="mailto:contato@aurealabs.com.br" className="hover:text-cyan-300 transition-colors">Contato</a>
          </div>
          
          <div className="pt-6 border-t border-slate-800 text-slate-500 text-sm">
            <p>© 2024 Aurea Lab. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
