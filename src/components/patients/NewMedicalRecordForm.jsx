import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Trash2 } from "lucide-react";
import { format } from 'date-fns';

export default function NewMedicalRecordForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    consultation_date: format(new Date(), 'yyyy-MM-dd'),
    doctor: '',
    specialty: '',
    chief_complaint: '',
    history_present_illness: '',
    physical_examination: '',
    diagnosis: [''],
    treatment_plan: '',
    prescriptions: [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    follow_up_date: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDynamicListChange = (listName, index, field, value) => {
    const newList = [...formData[listName]];
    if (typeof newList[index] === 'object') {
      newList[index][field] = value;
    } else {
      newList[index] = value;
    }
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const addDynamicListItem = (listName, itemTemplate) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], itemTemplate] }));
  };

  const removeDynamicListItem = (listName, index) => {
    const newList = formData[listName].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalData = {
      ...formData,
      diagnosis: formData.diagnosis.filter(d => d.trim() !== ''),
      prescriptions: formData.prescriptions.filter(p => p.medication.trim() !== '')
    }
    await onSave(finalData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto p-2 pr-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="consultation_date">Data da Consulta</Label>
          <Input type="date" id="consultation_date" name="consultation_date" value={formData.consultation_date} onChange={handleInputChange} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="doctor">Médico</Label>
          <Input id="doctor" name="doctor" value={formData.doctor} onChange={handleInputChange} placeholder="Nome do médico" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="specialty">Especialidade</Label>
          <Input id="specialty" name="specialty" value={formData.specialty} onChange={handleInputChange} placeholder="Especialidade" />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="chief_complaint">Queixa Principal</Label>
        <Textarea id="chief_complaint" name="chief_complaint" value={formData.chief_complaint} onChange={handleInputChange} placeholder="Queixa principal do paciente" />
      </div>

       <div className="space-y-1">
        <Label htmlFor="history_present_illness">História da Doença Atual</Label>
        <Textarea id="history_present_illness" name="history_present_illness" value={formData.history_present_illness} onChange={handleInputChange} />
      </div>

       <div className="space-y-1">
        <Label htmlFor="physical_examination">Exame Físico</Label>
        <Textarea id="physical_examination" name="physical_examination" value={formData.physical_examination} onChange={handleInputChange} />
      </div>
      
      <div className="space-y-2">
        <Label>Diagnóstico(s)</Label>
        {formData.diagnosis.map((diag, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={diag} onChange={(e) => handleDynamicListChange('diagnosis', index, null, e.target.value)} placeholder={`Diagnóstico ${index + 1}`} />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('diagnosis', index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('diagnosis', '')}><Plus className="w-4 h-4 mr-2" />Adicionar Diagnóstico</Button>
      </div>

      <div className="space-y-2">
        <Label>Prescrições</Label>
        {formData.prescriptions.map((presc, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 border p-2 rounded-lg">
            <Input value={presc.medication} onChange={(e) => handleDynamicListChange('prescriptions', index, 'medication', e.target.value)} placeholder="Medicação" />
            <Input value={presc.dosage} onChange={(e) => handleDynamicListChange('prescriptions', index, 'dosage', e.target.value)} placeholder="Dosagem" />
            <Input value={presc.frequency} onChange={(e) => handleDynamicListChange('prescriptions', index, 'frequency', e.target.value)} placeholder="Frequência" />
            <Input value={presc.duration} onChange={(e) => handleDynamicListChange('prescriptions', index, 'duration', e.target.value)} placeholder="Duração" />
            <div className="flex items-center gap-1">
                <Input value={presc.instructions} onChange={(e) => handleDynamicListChange('prescriptions', index, 'instructions', e.target.value)} placeholder="Instruções" className="flex-grow"/>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('prescriptions', index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('prescriptions', { medication: '', dosage: '', frequency: '', duration: '', instructions: '' })}><Plus className="w-4 h-4 mr-2" />Adicionar Prescrição</Button>
      </div>
      
       <div className="space-y-1">
        <Label htmlFor="treatment_plan">Plano de Tratamento</Label>
        <Textarea id="treatment_plan" name="treatment_plan" value={formData.treatment_plan} onChange={handleInputChange} />
      </div>

       <div className="space-y-1">
          <Label htmlFor="follow_up_date">Data de Retorno</Label>
          <Input type="date" id="follow_up_date" name="follow_up_date" value={formData.follow_up_date} onChange={handleInputChange} />
        </div>
      
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" />Salvar Registro</>}
        </Button>
      </div>
    </form>
  );
}