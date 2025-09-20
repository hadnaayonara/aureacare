import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createPageUrl } from "@/utils";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailVerification() {
  const navigate = useNavigate();
  const { user, resendVerification, loading, error, isEmailVerified } = useAuth();
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isEmailVerified) {
      navigate(createPageUrl("Dashboard"));
    }
  }, [isEmailVerified, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    try {
      setIsResending(true);
      await resendVerification();
      setCountdown(60); // 60 segundos de cooldown
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-6 text-center">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você precisa estar logado para acessar esta página.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={() => navigate(createPageUrl("Auth"))}
                className="w-full mt-4"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={createPageUrl("Auth")} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao login
          </Link>
          
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifique seu email</h1>
          <p className="text-slate-600">
            Enviamos um link de verificação para <strong>{user.email}</strong>
          </p>
        </div>

        {/* Verification Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
            <CardTitle className="text-xl font-semibold flex items-center justify-center">
              <Mail className="w-6 h-6 mr-2" />
              Aguardando Verificação
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {loading ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : (
                    <Mail className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Verificação de Email
                </h3>
                
                <p className="text-slate-600 text-sm">
                  Clique no link que enviamos para <strong>{user.email}</strong> para ativar sua conta.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>• Verifique sua caixa de entrada</p>
                    <p>• Se não encontrar, verifique a pasta de spam</p>
                    <p>• O link expira em 24 horas</p>
                  </div>
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={countdown > 0 || isResending || loading}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Aguarde {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reenviar Email
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-500">
                    Não recebeu o email?
                  </p>
                  
                  <Link
                    to={createPageUrl("Auth")}
                    className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Voltar ao login
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>
            Problemas com a verificação?{" "}
            <a href="mailto:suporte@aurealabs.com" className="text-blue-600 hover:underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

