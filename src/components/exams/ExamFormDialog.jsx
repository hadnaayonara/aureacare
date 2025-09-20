import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Exam } from '@/api/entities';
import { User } from '@/api/entities';
import { Loader2 } from 'lucide-react';

const initialFormState = {
  name: '',
  category: '',
  default_duration: 30,
  price: 0,
  instructions: '',
  notes: '',
  status: 'active'
};

export default function ExamFormDialog({ isOpen, onClose, onSave, examToEdit }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        name: examToEdit.name || '',
        category: examToEdit.category || '',
        default_duration: examToEdit.default_duration || 30,
        price: examToEdit.price || 0,
        instructions: examToEdit.instructions || '',
        notes: examToEdit.notes || '',
        status: examToEdit.status || 'active',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [examToEdit, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formData.name?.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome do exame é obrigatório."
      });
      return;
    }

    // Ensure default_duration is a valid positive number
    const parsedDuration = Number(formData.default_duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Duração deve ser um número maior que zero."
      });
      return;
    }

    if (!currentUser?.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        default_duration: parsedDuration,
        created_by: currentUser.email
      };

      console.log('Payload sendo enviado:', payload);

      if (examToEdit) {
        await Exam.update(examToEdit.id, payload);
        toast({ title: "Sucesso!", description: "Exame atualizado." });
      } else {
        await Exam.create(payload);
        toast({ title: "Sucesso!", description: "Exame criado." });
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar exame:", error);

      let errorMessage = "Não foi possível salvar o exame.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({ variant: "destructive", title: "Erro", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{examToEdit ? 'Editar Exame' : 'Novo Exame'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Exame *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={(e) => handleInputChange('category', e.target.value)} 
                placeholder="Ex: Imagem, Laboratorial" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_duration">Duração (min) *</Label>
              <Input 
                id="default_duration" 
                type="number" 
                value={formData.default_duration} 
                onChange={(e) => handleInputChange('default_duration', e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input 
                id="price" 
                type="number" 
                value={formData.price} 
                onChange={(e) => handleInputChange('price', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instruções de Preparo (para o paciente)</Label>
            <Textarea 
              id="instructions" 
              value={formData.instructions} 
              onChange={(e) => handleInputChange('instructions', e.target.value)} 
              rows={4} 
              placeholder="Ex: Jejum de 8 horas..." 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações Internas</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              rows={2} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}