import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChoreCatalogSelector } from './ChoreCatalogSelector';
import { ChoreForm } from './ChoreForm';
import { ChoreConfigurator } from './ChoreConfigurator';
import type { CatalogItemDTO, MemberDTO, CreateDailyChoreCmd } from '@/types';

type ModalStep = 'catalog' | 'form' | 'config';

interface AddChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cmd: CreateDailyChoreCmd) => void;
  members: MemberDTO[];
}

export function AddChoreModal({ isOpen, onClose, onSubmit, members }: AddChoreModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('catalog');
  const [selectedItem, setSelectedItem] = useState<CatalogItemDTO | null>(null);
  const [customData, setCustomData] = useState<Partial<CatalogItemDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetModal = () => {
    setCurrentStep('catalog');
    setSelectedItem(null);
    setCustomData(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleCatalogSelect = (item: CatalogItemDTO) => {
    setSelectedItem(item);
    setCurrentStep('config');
  };

  const handleCreateCustom = () => {
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: Partial<CatalogItemDTO>) => {
    setCustomData(data);
    setCurrentStep('config');
  };

  const handleFormCancel = () => {
    setCurrentStep('catalog');
  };

  const handleConfigSubmit = async (config: {
    date: string;
    time_of_day?: string;
    assignee_id?: string | null;
  }) => {
    setIsLoading(true);

    try {
      const cmd: CreateDailyChoreCmd = {
        date: config.date,
        chore_catalog_id: selectedItem?.id || '',
        assignee_id: config.assignee_id || undefined,
        time_of_day: config.time_of_day as any,
        // For custom chores, we might need to create the catalog item first
        // For now, assume catalog items exist
      };

      await onSubmit(cmd);
      handleClose();
    } catch (error) {
      console.error('Failed to add chore:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigCancel = () => {
    if (customData) {
      setCurrentStep('form');
    } else {
      setCurrentStep('catalog');
    }
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'catalog':
        return 'Add New Chore';
      case 'form':
        return 'Create Custom Chore';
      case 'config':
        return 'Configure Chore';
      default:
        return 'Add New Chore';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 'catalog' && (
            <ChoreCatalogSelector
              onItemSelect={handleCatalogSelect}
              onCreateCustom={handleCreateCustom}
            />
          )}

          {currentStep === 'form' && (
            <ChoreForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}

          {currentStep === 'config' && (
            <ChoreConfigurator
              selectedItem={selectedItem}
              customData={customData}
              members={members}
              onSubmit={handleConfigSubmit}
              onCancel={handleConfigCancel}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}