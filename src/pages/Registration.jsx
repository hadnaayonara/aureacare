import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createPageUrl } from "@/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User as UserIcon,
  Building2,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registrationSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clinic_name: z.string().min(2, "Nome da clínica deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  city_state: z.string().min(2, "Cidade e estado são obrigatórios"),
  main_specialty: z.string().min(2, "Especialidade é obrigatória"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

const specialties = [
  "Clínica Geral",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Ginecologia",
  "Neurologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
  "Oftalmologia",
  "Otorrinolaringologia",
  "Outro"
];

export default function Registration() {
  const navigate = useNavigate();
  const { signUp, loading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      clinic_name: "",
      phone: "",
      email: "",
      city_state: "",
      main_specialty: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(createPageUrl("Dashboard"));
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.full_name,
        clinic_name: data.clinic_name,
        phone: data.phone,
        city_state: data.city_state,
        main_specialty: data.main_specialty
      });
      
      if (error) {
        form.setError("root", { message: error.message });
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      form.setError("root", { message: "Erro inesperado. Tente novamente." });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
              <CardTitle className="text-xl font-semibold flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Conta Criada!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <p className="text-slate-700">
                  Sua conta foi criada com sucesso! Enviamos um email de verificação para <strong>{form.getValues("email")}</strong>
                </p>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(createPageUrl("Auth"))}
                    className="w-full"
                  >
                    Ir para Login
                  </Button>
                  
                  <Link
                    to={createPageUrl("Home")}
                    className="block text-center text-sm text-slate-600 hover:text-slate-900"
                  >
                    Voltar ao início
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Cadastro na Plataforma</h1>
          <p className="text-slate-600">Crie sua conta e comece a usar o Aurea Labs</p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
            <CardTitle className="text-xl font-semibold">Informações da Clínica</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Nome Completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="Seu nome completo"
                              className="pl-10"
                              disabled={loading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
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

                  {/* Nome da Clínica */}
                  <FormField
                    control={form.control}
                    name="clinic_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Nome da Clínica</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="Nome da sua clínica"
                              className="pl-10"
                              disabled={loading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Telefone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="(11) 99999-9999"
                              className="pl-10"
                              disabled={loading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cidade e Estado */}
                  <FormField
                    control={form.control}
                    name="city_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Cidade e Estado</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="São Paulo, SP"
                              className="pl-10"
                              disabled={loading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Especialidade */}
                  <FormField
                    control={form.control}
                    name="main_specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Especialidade Principal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a especialidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Senhas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Senha</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Confirmar Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirme sua senha"
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
                </div>

                {/* Error Display */}
                {(error || form.formState.errors.root) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error || form.formState.errors.root?.message}
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
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            </Form>

            {/* Links */}
            <div className="mt-6 text-center">
              <div className="text-slate-600 text-sm">
                Já tem uma conta?{" "}
                <Link
                  to={createPageUrl("Auth")}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Fazer login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.</p>
        </div>
      </div>
    </div>
  );
}