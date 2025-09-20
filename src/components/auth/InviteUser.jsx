import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Mail } from "lucide-react";
import { ClinicUser } from "@/api/entities";
import { SendEmail } from "@/api/integrations";

export default function InviteUser({ clinicId, onInviteSent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gerar token de convite
      const invitationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
      
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // Expira em 7 dias
      
      // Criar registro de convite
      const currentUser = JSON.parse(localStorage.getItem('activeClinic'));
      
      await ClinicUser.create({
        clinic_id: clinicId,
        user_id: 'pending', // Será preenchido quando aceitar
        role: formData.role,
        is_active: false,
        invited_by: currentUser.id,
        invited_email: formData.email, // <<< CORREÇÃO APLICADA AQUI
        invitation_token: invitationToken,
        invitation_expires_at: expirationDate.toISOString()
      });

      // Enviar email de convite
      const inviteUrl = `${window.location.origin}/invite/${invitationToken}`;
      
      await SendEmail({
        to: formData.email,
        subject: 'Convite para Aurea Lab',
        body: `
          <h2>Você foi convidado para fazer parte da equipe!</h2>
          <p>Você foi convidado para ser ${formData.role} em nossa clínica.</p>
          ${formData.message ? `<p><strong>Mensagem:</strong> ${formData.message}</p>` : ''}
          <p>Clique no link abaixo para aceitar o convite:</p>
          <a href="${inviteUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Aceitar Convite</a>
          <p><small>Este convite expira em 7 dias.</small></p>
        `
      });

      toast({ 
        title: "Convite enviado!", 
        description: `Convite enviado para ${formData.email}` 
      });
      
      setFormData({ email: '', role: '', message: '' });
      setIsOpen(false);
      
      if (onInviteSent) onInviteSent();
      
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast({ 
        variant: "destructive",
        title: "Erro", 
        description: "Não foi possível enviar o convite." 
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Convidar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Convidar novo usuário
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do usuário</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="usuario@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Papel na clínica</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="reception">Recepção</SelectItem>
                <SelectItem value="doctor">Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Bem-vindo à nossa equipe!"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}