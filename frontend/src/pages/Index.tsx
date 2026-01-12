import React, { useState, useEffect } from 'react';
import PixelSnow from '@/components/PixelSnow';
import Sidebar from '@/components/Sidebar';
import Header, { TabType } from '@/components/Header';
import SingleQueryTab from '@/components/tabs/SingleQueryTab';
import BatchTestingTab from '@/components/tabs/BatchTestingTab';
import EvaluationTab from '@/components/tabs/EvaluationTab';
import IntentSchemaTab from '@/components/tabs/IntentSchemaTab';
import ModelComparisonTab from '@/components/tabs/ModelComparisonTab';
import { getConfig } from '@/lib/api';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('query');
  const [modelType, setModelType] = useState<'gemma' | 'gemini'>('gemma');
  const [ollamaModelName, setOllamaModelName] = useState<string>('gemma3');
  const [showRawPrompt, setShowRawPrompt] = useState<boolean>(false);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getConfig();
        if (config.llm.default_model) {
          setModelType(config.llm.default_model as 'gemma' | 'gemini');
        }
        if (config.ollama.model_name) {
          setOllamaModelName(config.ollama.model_name);
        }
      } catch (error) {
        console.log('Could not load config, using defaults');
      }
    };
    loadConfig();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'query':
        return (
          <SingleQueryTab
            modelType={modelType}
            modelName={ollamaModelName}
            showRawPrompt={showRawPrompt}
          />
        );
      case 'batch':
        return <BatchTestingTab />;
      case 'evaluation':
        return <EvaluationTab />;
      case 'schema':
        return <IntentSchemaTab />;
      case 'comparison':
        return <ModelComparisonTab />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Pixel Snow Background */}
      <PixelSnow color="#4fd1c5" flakeSize={1.5} speed={0.5} density={0.8} />

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar
          modelType={modelType}
          setModelType={setModelType}
          ollamaModelName={ollamaModelName}
          setOllamaModelName={setOllamaModelName}
          showRawPrompt={showRawPrompt}
          setShowRawPrompt={setShowRawPrompt}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Tabs */}
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          <main className="flex-1 overflow-hidden">{renderTabContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Index;
