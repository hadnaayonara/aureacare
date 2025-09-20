"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth/AuthGuard";
import { createPageUrl } from "@/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider
} from "@/components/ui/sidebar";
import ClinicSelector from "@/components/auth/ClinicSelector";
import { LayoutDashboard, Calendar, Users, Stethoscope, Building2, BarChart3, UserIcon, LogOut, FileText, Beaker, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const { user, userProfile, signOut, isAuthenticated } = useAuth();
  const [userType, setUserType] = useState(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // EFEITO PARA SOLUÇÃO DEFINITIVA DO AUTOFILL
  useEffect(() => {
    const handleAutoFill = (event) => {
      if (event.animationName === "onAutoFillStart") {
        const node = event.target;
        if (node && !node.classList.contains("is-autofilled")) {
          node.classList.add("is-autofilled");
        }
      }
    };
    document.addEventListener("animationstart", handleAutoFill, true);
    return () => {
      document.removeEventListener("animationstart", handleAutoFill, true);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      const storedUserType = localStorage.getItem("userType");
      if (storedUserType) {
        setUserType(storedUserType);
      } else {
        setUserType(userProfile.app_role);
      }
    }
  }, [isAuthenticated, userProfile]);

  const handleLogout = async () => {
    localStorage.removeItem("activeClinic");
    localStorage.removeItem("userClinics");
    localStorage.removeItem("userType");
    await signOut();
    navigate(createPageUrl("Home"));
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard
      }];

    if (userType === 'admin') {
      // ADMIN: Acesso completo + páginas administrativas
      return [
        ...baseItems,
        { title: "Agenda", url: createPageUrl("Agenda"), icon: Calendar },
        { title: "Pacientes", url: createPageUrl("Patients"), icon: Users },
        { title: "Prontuários", url: createPageUrl("Prontuarios"), icon: FileText },
        { title: "Profissionais", url: createPageUrl("Doctors"), icon: Stethoscope },
        { title: "Catálogo de Exames", url: createPageUrl("Exams"), icon: Beaker },
        { title: "Clínicas", url: createPageUrl("Clinics"), icon: Building2 },
        { title: "Convidar Recepção", url: createPageUrl("InviteReception"), icon: UserIcon },
        { title: "Relatórios", url: createPageUrl("Reports"), icon: BarChart3 },
        // Páginas administrativas exclusivas do ADMIN
        { title: "Aprovar Cadastros", url: createPageUrl("PendingApprovals"), icon: UserIcon },
        { title: "Gerar API Keys", url: createPageUrl("Developer"), icon: UserIcon }];

    } else if (userType === "host") {
      // HOST: Funcionalidades completas de gestão da clínica
      return [
        ...baseItems,
        { title: "Agenda", url: createPageUrl("Agenda"), icon: Calendar },
        { title: "Pacientes", url: createPageUrl("Patients"), icon: Users },
        { title: "Prontuários", url: createPageUrl("Prontuarios"), icon: FileText },
        { title: "Profissionais", url: createPageUrl("Doctors"), icon: Stethoscope },
        { title: "Catálogo de Exames", url: createPageUrl("Exams"), icon: Beaker },
        { title: "Clínicas", url: createPageUrl("Clinics"), icon: Building2 },
        { title: "Convidar Recepção", url: createPageUrl("InviteReception"), icon: UserIcon },
        { title: "Relatórios", url: createPageUrl("Reports"), icon: BarChart3 }];

    } else if (userType === "reception") {
      // RECEPÇÃO: Acesso limitado (sem relatórios, clínicas, convites, catálogo de exames)
      return [
        ...baseItems,
        { title: "Agenda", url: createPageUrl("Agenda"), icon: Calendar },
        { title: "Pacientes", url: createPageUrl("Patients"), icon: Users },
        { title: "Prontuários", url: createPageUrl("Prontuarios"), icon: FileText },
        { title: "Profissionais", url: createPageUrl("Doctors"), icon: Stethoscope }];

    } else if (userType === "doctor") {
      // DOCTOR: Acesso muito restrito (apenas agenda e prontuários próprios)
      return [
        ...baseItems,
        { title: "Minha Agenda", url: createPageUrl("Agenda"), icon: Calendar },
        { title: "Meus Prontuários", url: createPageUrl("Prontuarios"), icon: FileText }];

    }

    return baseItems;
  };

  const getPageTitle = (pageName) => {
    const titles = {
      Dashboard: "Dashboard",
      Agenda: "Agenda",
      Patients: "Pacientes",
      Doctors: "Profissionais",
      Clinics: "Clínicas",
      Reports: "Relatórios",
      Prontuarios: "Prontuários",
      Exams: "Catálogo de Exames",
      InviteReception: "Convidar Recepção",
      PendingApprovals: "Aprovar Cadastros",
      Developer: "Gerar API Keys"
    };
    return titles[pageName] || pageName;
  };

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["Home", "Auth", "Registration", "InviteAccept", "NewsletterClinica4", "LandingPage"];
  
  if (publicRoutes.includes(currentPageName)) {
    return (
      <>
        {/* Estilos globais */}
        <style jsx global>{`
          /* Import da Fonte Montserrat */
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');

          body, html {
            font-family: 'Montserrat', sans-serif;
            background-color: hsl(220, 20%, 98%);
          }

          /* PATCH PARA AUTOFILL (Mantido) */
          @keyframes onAutoFillStart { from {} to {} }
          input:-webkit-autofill { animation-name: onAutoFillStart; animation-iteration-count: 1; animation-fill-mode: forwards; }
          input.is-autofilled, input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
            -webkit-text-fill-color: hsl(222, 47%, 11%) !important;
            box-shadow: 0 0 0px 1000px hsl(0, 0%, 100%) inset !important;
            border-color: hsl(220, 13%, 94%) !important;
            transition: background-color 5000s ease-in-out 0s;
          }
          input:autofill, input:autofill:hover, input:autofill:focus {
            -webkit-text-fill-color: hsl(222, 47%, 11%) !important;
            box-shadow: 0 0 0px 1000px hsl(0, 0%, 100%) inset !important;
            border-color: hsl(220, 13%, 94%) !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
        
        <div className="min-h-screen">{children}</div>
      </>
    );
  }

  // Rotas protegidas - usar AuthGuard
  return (
    <>
      {/* Estilos globais */}
      <style jsx global>{`
        /* Import da Fonte Montserrat */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');

        body, html {
          font-family: 'Montserrat', sans-serif;
          background-color: hsl(220, 20%, 98%);
        }

        /* PATCH PARA AUTOFILL (Mantido) */
        @keyframes onAutoFillStart { from {} to {} }
        input:-webkit-autofill { animation-name: onAutoFillStart; animation-iteration-count: 1; animation-fill-mode: forwards; }
        input.is-autofilled, input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
          -webkit-text-fill-color: hsl(222, 47%, 11%) !important;
          box-shadow: 0 0 0px 1000px hsl(0, 0%, 100%) inset !important;
          border-color: hsl(220, 13%, 94%) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input:autofill, input:autofill:hover, input:autofill:focus {
          -webkit-text-fill-color: hsl(222, 47%, 11%) !important;
          box-shadow: 0 0 0px 1000px hsl(0, 0%, 100%) inset !important;
          border-color: hsl(220, 13%, 94%) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <SidebarProvider>
            <div className="flex h-screen">
              {/* Sidebar */}
              <Sidebar className="border-r border-slate-200">
                <SidebarHeader className="border-b border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/logo.png"
                        alt="Aurea Labs"
                        className="w-8 h-8 rounded-lg"
                      />
                      {!isSidebarCollapsed && (
                        <span className="font-bold text-slate-900">Aurea Labs</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                      className="p-1 rounded-md hover:bg-slate-100"
                    >
                      {isSidebarCollapsed ? (
                        <PanelLeftOpen className="w-4 h-4" />
                      ) : (
                        <PanelLeftClose className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </SidebarHeader>

                <SidebarContent className="p-2">
                  <SidebarGroup>
                    <SidebarGroupLabel>Navegação</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {getNavigationItems().map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === item.url}
                            >
                              <Link to={item.url} className="flex items-center space-x-3">
                                <item.icon className="w-4 h-4" />
                                {!isSidebarCollapsed && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-slate-200 p-4">
                  <div className="space-y-2">
                    {user && (
                      <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <UserIcon className="w-4 h-4" />
                        {!isSidebarCollapsed && (
                          <span>{user.email}</span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full p-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {!isSidebarCollapsed && <span>Sair</span>}
                    </button>
                  </div>
                </SidebarFooter>
              </Sidebar>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-slate-900">
                      {getPageTitle(currentPageName)}
                    </h1>
                    <div className="flex items-center gap-4">
                      {(userType === "host" || userType === "admin") && <ClinicSelector />}
                      <button className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors">
                        <Bell className="w-6 h-6" />
                      </button>
                      <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </header>
                
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </AuthGuard>
    </>
  );
}