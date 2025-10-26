
import React, { useState, useCallback } from 'react';
import { askWithMaps, askWithThinking } from '../services/geminiService';
import { BrainCircuitIcon, MapPinIcon } from './Icons';

export const GeminiMapsTool = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<{ text: string; groundingChunks: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = useCallback(() => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await askWithMaps(prompt, position.coords);
          setResponse(result);
        } catch (e) {
          setError('Failed to get a response. Please check your API key and try again.');
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setError(`Geolocation error: ${geoError.message}. Please enable location services.`);
        setIsLoading(false);
      }
    );
  }, [prompt]);

  return (
    <div className="bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200/20">
      <div className="flex items-center gap-3 mb-4">
        <MapPinIcon className="w-8 h-8 text-cyan-300" />
        <h3 className="text-xl font-bold text-white">Logistics & Location Query</h3>
      </div>
      <p className="text-gray-300 mb-4 text-sm">Ask about shipping routes, warehouse locations, or local pickup points. This tool uses your location for accurate, up-to-date answers from Google Maps.</p>
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'What are the closest cargo pickup points to me in Kigali?'"
          className="w-full p-3 bg-gray-700/50 text-white rounded-md border border-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleQuery}
          disabled={isLoading || !prompt}
          className="w-full flex justify-center items-center gap-2 bg-cyan-500 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Ask with Maps'}
        </button>
      </div>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {response && (
        <div className="mt-6 p-4 bg-gray-800/60 rounded-md">
          <p className="text-gray-200 whitespace-pre-wrap">{response.text}</p>
          {response.groundingChunks.length > 0 && (
            <div className="mt-4 border-t border-gray-600 pt-3">
              <h4 className="font-semibold text-gray-300 mb-2">Sources:</h4>
              <ul className="list-disc list-inside space-y-1">
                {response.groundingChunks.map((chunk, index) => (
                  chunk.maps && (
                    <li key={index}>
                      <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        {chunk.maps.title}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const GeminiThinkingTool = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = useCallback(async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await askWithThinking(prompt);
      setResponse(result.text);
    } catch (e) {
      setError('Failed to get a response. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200/20">
      <div className="flex items-center gap-3 mb-4">
        <BrainCircuitIcon className="w-8 h-8 text-purple-300" />
        <h3 className="text-xl font-bold text-white">Advanced AI Query</h3>
      </div>
      <p className="text-gray-300 mb-4 text-sm">For complex logistics planning, cost analysis, or strategic questions. This tool uses Gemini 2.5 Pro with maximum thinking budget for in-depth answers.</p>
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'What's the most cost-effective way to ship 500kg of electronics from Guangzhou to Kigali, considering customs duties and shipping times?'"
          className="w-full p-3 bg-gray-700/50 text-white rounded-md border border-gray-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
          rows={4}
          disabled={isLoading}
        />
        <button
          onClick={handleQuery}
          disabled={isLoading || !prompt}
          className="w-full flex justify-center items-center gap-2 bg-purple-500 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Thinking...' : 'Submit Advanced Query'}
        </button>
      </div>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {response && (
        <div className="mt-6 p-4 bg-gray-800/60 rounded-md">
          <p className="text-gray-200 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};
