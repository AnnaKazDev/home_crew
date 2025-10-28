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
  const [isLoading, setIsLoading] = useState(false);
  const [catalogKey, setCatalogKey] = useState(0); // Force re-render of catalog
  const [error, setError] = useState<string | null>(null);

  const resetModal = () => {
    setCurrentStep('catalog');
    setSelectedItem(null);
    setIsLoading(false);
    setError(null);
    setCatalogKey(prev => prev + 1);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleCatalogSelect = (item: CatalogItemDTO) => {
    setSelectedItem(item);
    setError(null); // Clear any previous errors
    setCurrentStep('config');
  };

  const handleCreateCustom = () => {
    setCurrentStep('form');
    setError(null); // Clear any previous errors
  };

  const handleFormSubmit = async (data: Partial<CatalogItemDTO>) => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      // Create the catalog item immediately
      const createCatalogResponse = await fetch('/api/v1/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          points: data.points,
          time_of_day: data.time_of_day || 'any',
          emoji: data.emoji,
        }),
      });

      if (!createCatalogResponse.ok) {
        const errorData = await createCatalogResponse.json();
        throw new Error(errorData.error || 'Failed to create catalog item');
      }

      // Go back to catalog view so user can select the newly created chore
      setCurrentStep('catalog');
      setCatalogKey(prev => prev + 1); // Force catalog refresh
    } catch (error) {
      console.error('Failed to create catalog item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create catalog item';
      setError(errorMessage);
      setCurrentStep('catalog'); // Go back to catalog to show error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setCurrentStep('catalog');
  };

  const handleConfigSubmit = async (config: {
    date: string;
    assignee_id?: string | null;
  }) => {
    setIsLoading(true);

    try {
      const cmd: CreateDailyChoreCmd = {
        date: config.date,
        chore_catalog_id: selectedItem!.id,
        assignee_id: config.assignee_id || undefined,
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
    setCurrentStep('catalog');
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'catalog':
        return 'Choose a Chore';
      case 'form':
        return 'Create Custom Chore';
      case 'config':
        return 'Configure Chore';
      default:
        return 'Choose a Chore';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {currentStep === 'catalog' && (
            <ChoreCatalogSelector
              key={catalogKey}
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
              customData={null}
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