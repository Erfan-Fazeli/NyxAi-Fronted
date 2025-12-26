"use client";

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function IsometricScene() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full h-full min-h-screen flex items-start justify-end relative pt-16">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="w-full md:w-[75%] lg:w-[65%] h-full translate-x-[10%] md:translate-x-[15%] lg:translate-x-[20%] -translate-y-40">
        <Spline 
          className="w-full h-full scale-100 md:scale-110 lg:scale-105"
          onLoad={() => setIsLoading(false)}
          scene="https://prod.spline.design/pYElgUXnLij8BgVT/scene.splinecode" 
        />
      </div>
    </div>
  );
}
