import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChoreCatalogSelector } from './ChoreCatalogSelector';
import { ChoreForm } from './ChoreForm';
import { ChoreConfigurator } from './ChoreConfigurator';
import type { AddChoreModalProps } from '@/types/daily-view.types';
import type { CatalogItemDTO, CreateDailyChoreCmd } from '@/types';

type ModalStep = 'catalog' | 'custom' | 'configure';

export function AddChoreModal({
  isOpen,
  onClose,
  onSubmit,
  members,
}: AddChoreModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('catalog');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItemDTO | null>(null);
  const [customChoreData, setCustomChoreData] = useState<Partial<CatalogItemDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('catalog');
      setSelectedCatalogItem(null);
      setCustomChoreData(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleCatalogItemSelect = (item: CatalogItemDTO) => {
    setSelectedCatalogItem(item);
    setCurrentStep('configure');
  };

  const handleCreateCustomChore = () => {
    setCurrentStep('custom');
  };

  const handleCustomChoreSubmit = (data: Partial<CatalogItemDTO>) => {
    setCustomChoreData(data);
    setCurrentStep('configure');
  };

  const handleConfigureSubmit = (config: {
    date: string;
    time_of_day?: string;
    assignee_id?: string | null;
  }) => {
    if (!selectedCatalogItem && !customChoreData) return;

    setIsLoading(true);
    setError(null);

    try {
      const choreData: CreateDailyChoreCmd = {
        date: config.date,
        chore_catalog_id: selectedCatalogItem?.id || '', // TODO: Handle custom chore creation
        assignee_id: config.assignee_id,
        time_of_day: config.time_of_day as any,
      };

      onSubmit(choreData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chore');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'configure') {
      setCurrentStep(selectedCatalogItem ? 'catalog' : 'custom');
    } else if (currentStep === 'custom') {
      setCurrentStep('catalog');
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 'catalog':
        return 'Add Chore';
      case 'custom':
        return 'Create Custom Chore';
      case 'configure':
        return selectedCatalogItem ? 'Configure Chore' : 'Configure Custom Chore';
      default:
        return 'Add Chore';
    }
  };

  if (!isOpen) return null;

  console.log('AddChoreModal rendering, step:', currentStep);

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-yellow-50 rounded-lg max-w-lg mx-4 max-h-[90vh] overflow-hidden p-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{getModalTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center space-x-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${currentStep === 'catalog' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'custom' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep === 'configure' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {currentStep === 'catalog' && (
            <ChoreCatalogSelector
              onItemSelect={handleCatalogItemSelect}
              onCreateCustom={handleCreateCustomChore}
            />
          )}

          {currentStep === 'custom' && (
            <ChoreForm
              onSubmit={handleCustomChoreSubmit}
              onCancel={handleBack}
            />
          )}

          {currentStep === 'configure' && (
            <ChoreConfigurator
              selectedItem={selectedCatalogItem}
              customData={customChoreData}
              members={members}
              onSubmit={handleConfigureSubmit}
              onCancel={handleBack}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using Portal to document.body
  return createPortal(modalContent, document.body);
}
