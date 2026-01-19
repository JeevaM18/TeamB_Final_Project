import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import PixelSnow from '@/components/PixelSnow';
import Sidebar from '@/components/Sidebar';
import Header, { TabType } from '@/components/Header';
import SingleQueryTab from '@/components/tabs/SingleQueryTab';
import BatchTestingTab from '@/components/tabs/BatchTestingTab';
import EvaluationTab from '@/components/tabs/EvaluationTab';
import IntentSchemaTab from '@/components/tabs/IntentSchemaTab';
import ModelComparisonTab from '@/components/tabs/ModelComparisonTab';
import { getConfig } from '@/lib/api';
import HistoryTab from "@/components/tabs/HistoryTab";


const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('query');
  const [modelType, setModelType] = useState<'gemma' | 'qwen'>('gemma');
  const [ollamaModelName, setOllamaModelName] = useState<string>('gemma3');
  const [showRawPrompt, setShowRawPrompt] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<boolean>(true);
  const [config, setConfig] = useState<any>(null);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const fetchedConfig = await getConfig();
        setConfig(fetchedConfig);

        if (fetchedConfig.llm.default_model) {
          setModelType(fetchedConfig.llm.default_model as 'gemma' | 'qwen');
        }
        // Initialize based on default model
        if (fetchedConfig.llm.default_model === 'qwen') {
          setOllamaModelName(fetchedConfig.qwen?.model_name || 'qwen2.5:3b');
        } else {
          setOllamaModelName(fetchedConfig.ollama?.model_name || 'gemma3');
        }

        setApiStatus(true);
      } catch (error) {
        console.log('Could not load config, using defaults');
        setApiStatus(false);
      }
    };
    loadConfig();
  }, []);

  // Update input text when model type switches
  useEffect(() => {
    if (!config) return;
    if (modelType === 'gemma') {
      setOllamaModelName(config.ollama?.model_name || 'gemma3');
    } else if (modelType === 'qwen') {
      setOllamaModelName(config.qwen?.model_name || 'qwen2.5:3b');
    }
  }, [modelType, config]);

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
      case 'history':
        return <HistoryTab />;
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          modelType={modelType}
          setModelType={setModelType}
          ollamaModelName={ollamaModelName}
          setOllamaModelName={setOllamaModelName}
          showRawPrompt={showRawPrompt}
          setShowRawPrompt={setShowRawPrompt}
          apiStatus={apiStatus}
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
