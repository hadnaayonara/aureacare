
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { UserApiKey } from '@/api/entities';
import { ClinicUser } from '@/api/entities'; // Import ClinicUser
import { generateApiKeyForUser } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Users as UsersIcon, Search, Eye, EyeOff, Loader2, RefreshCw, Key, Shield, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Developer() {
  const [users, setUsers] = useState([]);
  const [userApiKeys, setUserApiKeys] = useState({});
  const [doctorUserIds, setDoctorUserIds] = useState(new Set()); // State for doctor IDs
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleKeys, setVisibleKeys] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadUsers();
    }
  }, [isAuthorized]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const checkAuthorization = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);

      if (userData.email === 'hadnaguinho@gmail.com') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Esta página é restrita apenas ao desenvolvedor principal."
        });
        setTimeout(() => navigate(createPageUrl('Dashboard')), 3000);
      }
    } catch (error) {
      console.error("Erro ao verificar autorização:", error);
      navigate(createPageUrl('Auth'));
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch users, api keys, and clinic user associations in parallel
      const [usersData, apiKeys, clinicUsers] = await Promise.all([
        User.list('-created_date'),
        UserApiKey.filter({ status: 'active' }),
        ClinicUser.list()
      ]);

      setUsers(usersData);
      setFilteredUsers(usersData);

      const apiKeysByUser = {};
      apiKeys.forEach((key) => {
        apiKeysByUser[key.user_id] = key;
      });
      setUserApiKeys(apiKeysByUser);

      // Create a set of user IDs that have a 'doctor' role
      const docIds = new Set(
        clinicUsers
          .filter(cu => cu.role === 'doctor' && cu.user_id)
          .map(cu => cu.user_id)
      );
      setDoctorUserIds(docIds);

    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os usuários." });
    }
    setIsLoading(false);
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = users.filter((user) =>
      user.full_name?.toLowerCase().includes(lowercasedFilter) ||
      user.email?.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredUsers(filtered);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "API Key copiada para a área de transferência." });
  };

  const toggleVisibility = (userId) => {
    setVisibleKeys((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const generateApiKey = async (userId, force = false) => {
    setGeneratingFor(userId);
    try {
      const { data } = await generateApiKeyForUser({ userId, force });

      // Reload users and API keys to show the new key
      await loadUsers();

      toast({
        title: "✅ API Key Gerada!",
        description: `Nova chave gerada com sucesso: ${data.api_key.substring(0, 15)}...`
      });

    } catch (error) {
      console.error("Erro ao gerar API key:", error);

      if (error.response?.status === 409) {
        // User already has a key, ask if they want to force replace
        const shouldForce = confirm("Este usuário já possui uma API Key ativa. Deseja revogar a antiga e gerar uma nova?");
        if (shouldForce) {
          await generateApiKey(userId, true);
          return;
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.response?.data?.error || "Não foi possível gerar a API key."
        });
      }
    }
    setGeneratingFor(null);
  };

  const revokeApiKey = async (userId) => {
    if (!confirm("Tem certeza que deseja revogar esta API Key? Ela ficará inválida imediatamente.")) {
      return;
    }

    try {
      const userApiKey = userApiKeys[userId];
      if (userApiKey) {
        // Get the user email to ensure we have it for the update
        const user = users.find(u => u.id === userId);
        const userEmail = user?.email || userApiKey.user_email;

        const updateData = {
          status: 'revoked'
        };

        // Only add user_email if we have it and it's not already in the record
        if (userEmail && !userApiKey.user_email) {
          updateData.user_email = userEmail;
        }

        await UserApiKey.update(userApiKey.id, updateData);
        await loadUsers();
        toast({
          title: "🚫 API Key Revogada!",
          description: "A chave foi revogada e não pode mais ser usada."
        });
      }
    } catch (error) {
      console.error("Erro ao revogar API key:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível revogar a API key."
      });
    }
  };

  const renderApiKey = (user) => {
    // If user is a doctor, show "Not applicable"
    if (doctorUserIds.has(user.id)) {
      return (
        <Badge variant="outline" className="text-slate-500 border-slate-300">
          Não aplicável (Médico)
        </Badge>
      );
    }

    const userApiKey = userApiKeys[user.id];
    const isGenerating = generatingFor === user.id;

    if (!userApiKey) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            Não gerada
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateApiKey(user.id)}
            disabled={isGenerating} className="bg-sky-600 text-slate-100 px-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-9 rounded-md border-blue-300 hover:bg-blue-50">


            {isGenerating ?
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> :

              <Key className="w-3 h-3 mr-1" />
            }
            Gerar
          </Button>
        </div>);

    }

    const isVisible = visibleKeys[user.id];
    const maskedKey = `AUREA_${'*'.repeat(64)}`;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-green-600 border-green-300">
          Ativa
        </Badge>
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border max-w-xs overflow-hidden">
          {isVisible ? userApiKey.api_key : maskedKey}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleVisibility(user.id)}
          className="shrink-0 p-1">

          {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(userApiKey.api_key)}
          className="shrink-0 p-1">

          <Copy className="w-3 h-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateApiKey(user.id, true)}
          disabled={isGenerating} className="bg-slate-100 text-slate-600 px-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-9 rounded-md shrink-0 border-orange-300 hover:bg-orange-50">


          {isGenerating ?
            <Loader2 className="w-3 h-3 animate-spin" /> :

            <RefreshCw className="w-3 h-3" />
          }
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => revokeApiKey(user.id)} className="bg-red-600 text-slate-100 px-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-9 rounded-md shrink-0 border-red-300 hover:bg-red-50">


          Revogar
        </Button>
      </div>);

  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getUsersWithKeys = () => users.filter((u) => userApiKeys[u.id] && !doctorUserIds.has(u.id));
  const getUsersWithoutKeys = () => users.filter((u) => !userApiKeys[u.id] && !doctorUserIds.has(u.id));
  const getDoctorUsers = () => users.filter((u) => doctorUserIds.has(u.id));


  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Toaster />
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">Acesso Restrito</h2>
            <p className="text-red-700 mb-6">
              Esta área é exclusiva do desenvolvedor principal da plataforma.
            </p>
            <div className="text-sm text-red-600">
              Redirecionando em alguns segundos...
            </div>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              Painel do Desenvolvedor
            </h1>
            <Badge className="bg-purple-600 text-white">
              Acesso Exclusivo
            </Badge>
          </div>
          <p className="text-slate-600">
            Gerencie usuários e chaves de API da plataforma Aurea Lab.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <UsersIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Com API Key</p>
                  <p className="text-2xl font-bold">
                    {getUsersWithKeys().length}
                  </p>
                </div>
                <Key className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Sem API Key / Médico</p>
                  <p className="text-2xl font-bold">
                    {getUsersWithoutKeys().length + getDoctorUsers().length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="bg-slate-100 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Pesquisar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-200 text-slate-600 pl-10 px-3 py-2 text-base flex w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12" />


              </div>
              <Button onClick={loadUsers} variant="outline" className="bg-slate-200 text-slate-600 px-6 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-12">
                <RefreshCw className="w-5 h-5 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-100 pb-4 p-6 flex flex-col space-y-1.5">
            <CardTitle className="text-xl text-slate-900">
              Usuários Registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ?
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              </div> :

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="bg-slate-100 text-slate-600 px-4 font-semibold h-12 align-middle [&:has([role=checkbox])]:pr-0">Nome</TableHead>
                      <TableHead className="bg-slate-100 text-slate-600 px-4 font-semibold h-12 align-middle [&:has([role=checkbox])]:pr-0">Email</TableHead>
                      <TableHead className="bg-slate-100 text-slate-600 px-4 font-semibold h-12 align-middle [&:has([role=checkbox])]:pr-0">Role</TableHead>
                      <TableHead className="bg-slate-100 text-slate-600 px-4 font-semibold h-12 align-middle [&:has([role=checkbox])]:pr-0">API Key</TableHead>
                      <TableHead className="bg-slate-100 text-slate-600 px-4 font-semibold h-12 align-middle [&:has([role=checkbox])]:pr-0">Último Login</TableHead>
                      <TableHead className="bg-slate-100 text-slate-600 px-4 font-semibold h-12 align-middle [&:has([role=checkbox])]:pr-0">Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ?
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow> :

                      filteredUsers.map((user) =>
                        <TableRow key={user.id} className="hover:bg-slate-50">
                          <TableCell className="bg-slate-100 text-slate-600 p-4 font-medium align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="flex items-center gap-2">
                              {user.email === 'hadnaguinho@gmail.com' &&
                                <Crown className="w-4 h-4 text-purple-600" />
                              }
                              {user.full_name || 'Nome não informado'}
                            </div>
                          </TableCell>
                          <TableCell className="bg-slate-100 text-slate-600 p-4 align-middle [&:has([role=checkbox])]:pr-0">{user.email}</TableCell>
                          <TableCell className="bg-slate-100 text-slate-600 p-4 align-middle [&:has([role=checkbox])]:pr-0">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="bg-sky-600 text-slate-100 px-2.5 py-0.5 text-xs font-semibold inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80">
                              {user.role || 'user'}
                            </Badge>
                          </TableCell>
                          <TableCell className="bg-slate-100 text-slate-600 p-4 align-middle [&:has([role=checkbox])]:pr-0 max-w-md">
                            {renderApiKey(user)}
                          </TableCell>
                          <TableCell className="bg-slate-100 text-slate-600 p-4 text-sm align-middle [&:has([role=checkbox])]:pr-0">
                            {formatDate(user.last_login)}
                          </TableCell>
                          <TableCell className="bg-slate-100 text-slate-600 p-4 text-sm align-middle [&:has([role=checkbox])]:pr-0">
                            {formatDate(user.created_date)}
                          </TableCell>
                        </TableRow>
                      )
                    }
                  </TableBody>
                </Table>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>);

}
