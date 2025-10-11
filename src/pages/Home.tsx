import React from 'react';
import BrowserApp from '../components/BrowserApp';

/**
 * Home Page Component
 * Serves as the entry point for the web browser application
 */
export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <BrowserApp />
    </div>
  );
}
