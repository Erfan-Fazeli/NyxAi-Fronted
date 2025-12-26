"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Loader2, Image as ImageIcon, Sparkles, X, Check, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function RemoveBackgroundPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must not exceed 10MB');
      return;
    }

    setSelectedImage(file);
    setError(null);
    setProcessedImageUrl(null);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setCurrentStep(0);

    try {
      setCurrentStep(1);
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      setProgress(30);
      setCurrentStep(2);
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use production URL directly
      const API_URL = 'https://nyxai-bg-remover-production.up.railway.app';
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
      
      const response = await fetch(`${API_URL}/api/remove-background`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
        },
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      setCurrentStep(3);
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      const blob = await response.blob();
      setProgress(95);
      
      const url = URL.createObjectURL(blob);
      setProcessedImageUrl(url);
      setProgress(100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImageUrl) return;
    const a = document.createElement('a');
    a.href = processedImageUrl;
    a.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setProcessedImageUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        AI Background Remover
      </h1>
      <p className="text-center text-zinc-400 mb-8">
        Remove backgrounds from images using AI
      </p>
      
      <div className="max-w-4xl mx-auto">
        {!selectedImage ? (
          <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center">
            <Upload className="h-16 w-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2">Upload Your Image</h3>
            <p className="text-zinc-400 mb-6">Click to select or drag and drop</p>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              />
              <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-3 font-semibold">
                <ImageIcon className="h-5 w-5" />
                Select Image
              </span>
            </label>
            <p className="mt-4 text-sm text-zinc-500">PNG, JPG (Max 10MB)</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between">
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-zinc-800">
                <X className="h-4 w-4" />
                Cancel
              </button>
              {processedImageUrl && (
                <button onClick={downloadImage} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold">Original</h3>
                </div>
                <div className="relative aspect-square bg-zinc-800/50">
                  {previewUrl && <Image src={previewUrl} alt="Original" fill className="object-contain" />}
                </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold">Background Removed</h3>
                </div>
                <div className="relative aspect-square bg-zinc-800/50">
                  {processedImageUrl ? (
                    <Image src={processedImageUrl} alt="Processed" fill className="object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                      {isProcessing ? 'Processing...' : 'Result will appear here'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!processedImageUrl && !isProcessing && (
              <div className="text-center">
                <button onClick={processImage} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold">
                  <Sparkles className="h-5 w-5" />
                  Process Image
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="border border-white/10 rounded-xl p-6 bg-zinc-900/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span>
                      {currentStep === 1 && "Preparing image..."}
                      {currentStep === 2 && "Uploading to server..."}
                      {currentStep === 3 && "Waiting for AI processing..."}
                      {currentStep === 0 && "Starting..."}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">{progress}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  />
                </div>
              </div>
            )}

            {processedImageUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  Processing completed successfully!
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-500">{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
