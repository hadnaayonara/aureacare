import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createPageUrl } from "@/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shield,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const emailSchema = z.object({
  email: z.string().email("Email inválido")
});

const passwordSchema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

export default function PasswordReset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, updatePassword, loading, error } = useAuth();
  const [step, setStep] = useState("email"); // email, sent, reset
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  useEffect(() => {
    // Verificar se há token de reset na URL
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    
    if (token && type === "recovery") {
      setStep("reset");
    }
  }, [searchParams]);

  const onEmailSubmit = async (data) => {
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        emailForm.setError("root", { message: error.message });
      } else {
        setStep("sent");
      }
    } catch (error) {
      emailForm.setError("root", { message: "Erro inesperado. Tente novamente." });
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      const { error } = await updatePassword(data.password);
      if (error) {
        passwordForm.setError("root", { message: error.message });
      } else {
        navigate(createPageUrl("Auth"));
      }
    } catch (error) {
      passwordForm.setError("root", { message: "Erro inesperado. Tente novamente." });
    }
  };

  if (step === "sent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
              <CardTitle className="text-xl font-semibold flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Email Enviado!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <p className="text-slate-700">
                  Enviamos um link de recuperação para <strong>{emailForm.getValues("email")}</strong>
                </p>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => setStep("email")}
                    variant="outline"
                    className="w-full"
                  >
                    Enviar Novamente
                  </Button>
                  
                  <Link
                    to={createPageUrl("Auth")}
                    className="block text-center text-sm text-slate-600 hover:text-slate-900"
                  >
                    Voltar ao login
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "reset") {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Nova Senha</h1>
            <p className="text-slate-600">Digite sua nova senha</p>
          </div>

          {/* Password Reset Form */}
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
              <CardTitle className="text-xl font-semibold">Redefinir Senha</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  {/* Nova Senha */}
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 8 caracteres"
                              className="pl-10 pr-10"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirmar Senha */}
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirme sua nova senha"
                              className="pl-10 pr-10"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Error Display */}
                  {(error || passwordForm.formState.errors.root) && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error || passwordForm.formState.errors.root?.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Redefinir Senha"
                    )}
                  </Button>
                </form>
              </Form>
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Esqueceu sua senha?</h1>
          <p className="text-slate-600">Digite seu email para receber um link de recuperação</p>
        </div>

        {/* Email Form */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
            <CardTitle className="text-xl font-semibold">Recuperar Senha</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                {/* Email Field */}
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Display */}
                {(error || emailForm.formState.errors.root) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error || emailForm.formState.errors.root?.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </Button>
              </form>
            </Form>

            {/* Links */}
            <div className="mt-6 text-center">
              <Link
                to={createPageUrl("Auth")}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Lembrou da senha? Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>O link será válido por 1 hora após o envio.</p>
        </div>
      </div>
    </div>
  );
}

