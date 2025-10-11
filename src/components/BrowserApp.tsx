
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';

/**
 * BrowserApp Component
 * Main component for the web browser application
 * Manages tabs, navigation, and UI state
 */
interface Tab {
  id: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  name: string;
  url: string;
  historyStack: string[];
  historyIndex: number;
}

const BrowserApp: React.FC = () => {
  // State management
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(-1);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [customHomePage, setCustomHomePage] = useState<string>(() => {
    return localStorage.getItem("customHomePage") || "https://www.google.com";
  });
  const [sidebar, setSidebar] = useState<{ type: 'history' | 'settings' | null; title: string; items?: string[] }>({ type: null, title: '' });
  const [urlInputValue, setUrlInputValue] = useState('');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("https://www.google.com/search?q=");

  // Refs for touch events
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);
  const nextTabId = useRef(0);
  const [gestureDirection, setGestureDirection] = useState<'left' | 'right' | null>(null);
  const [showGestureHint, setShowGestureHint] = useState(true);

  // Initialize first tab
  useEffect(() => {
    if (tabs.length === 0) {
      createTab();
    }
  }, []);

  // Update URL input when switching tabs
  useEffect(() => {
    if (activeTabIndex >= 0 && activeTabIndex < tabs.length) {
      setUrlInputValue(tabs[activeTabIndex].url);
    }
  }, [activeTabIndex, tabs]);

  /**
   * Create a new tab
   * @param url - URL to open in the new tab
   */
  const createTab = (url: string = customHomePage) => {
    const iframeRef = React.createRef<HTMLIFrameElement>();
    const newTab: Tab = {
      id: nextTabId.current++,
      iframeRef,
      name: `Tab ${tabs.length + 1}`,
      url,
      historyStack: [url],
      historyIndex: 0,
    };
    
    setTabs(prev => {
      const newTabs = [...prev, newTab];
      setActiveTabIndex(newTabs.length - 1);
      return newTabs;
    });
  };

  /**
   * Switch to a specific tab
   * @param index - Index of the tab to switch to
   */
  const switchTab = (index: number) => {
    if (index < 0 || index >= tabs.length) return;
    setActiveTabIndex(index);
  };

  /**
   * Close a tab
   * @param index - Index of the tab to close
   */
  const closeTab = (index: number) => {
    if (tabs.length <= 1) return; // Don't close the last tab
    
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    
    if (activeTabIndex === index) {
      // If we're closing the active tab, switch to the next one or the previous one
      if (index >= newTabs.length) {
        setActiveTabIndex(newTabs.length - 1);
      } else {
        setActiveTabIndex(index);
      }
    } else if (activeTabIndex > index) {
      // Adjust the active index if it was after the closed tab
      setActiveTabIndex(activeTabIndex - 1);
    }
  };

  /**
   * Navigate to a URL
   * @param input - URL or search term
   */
  const goToUrl = (input: string) => {
    if (activeTabIndex < 0) return;
    
    let url = input.trim();
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = url === "" ? selectedSearchEngine : selectedSearchEngine + encodeURIComponent(url);
    }
    
    // Update the active tab
    setTabs(prev => {
      const newTabs = [...prev];
      const activeTab = { ...newTabs[activeTabIndex] };
      
      // Update the URL and history
      activeTab.url = url;
      activeTab.historyStack = activeTab.historyStack.slice(0, activeTab.historyIndex + 1);
      activeTab.historyStack.push(url);
      activeTab.historyIndex = activeTab.historyStack.length - 1;
      
      newTabs[activeTabIndex] = activeTab;
      return newTabs;
    });
    
    // Also update the history list
    setHistoryList(prev => [...prev, url]);
  };

  /**
   * Go back in history for the active tab
   */
  const handleBack = () => {
    if (activeTabIndex < 0) return;
    const activeTab = tabs[activeTabIndex];
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const newUrl = activeTab.historyStack[newIndex];
      
      // Update the active tab
      setTabs(prev => {
        const newTabs = [...prev];
        const updatedTab = { ...activeTab, url: newUrl, historyIndex: newIndex };
        newTabs[activeTabIndex] = updatedTab;
        return newTabs;
      });
    }
  };

  /**
   * Go forward in history for the active tab
   */
  const handleForward = () => {
    if (activeTabIndex < 0) return;
    const activeTab = tabs[activeTabIndex];
    if (activeTab.historyIndex < activeTab.historyStack.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const newUrl = activeTab.historyStack[newIndex];
      
      // Update the active tab
      setTabs(prev => {
        const newTabs = [...prev];
        const updatedTab = { ...activeTab, url: newUrl, historyIndex: newIndex };
        newTabs[activeTabIndex] = updatedTab;
        return newTabs;
      });
    }
  };

  /**
   * Show sidebar with content
   * @param type - Type of sidebar content
   * @param title - Title for the sidebar
   * @param items - Items to display (optional)
   */
  const showSidebar = (type: 'history' | 'settings', title: string, items?: string[]) => {
    setSidebar({ type, title, items });
  };

  /**
   * Close the sidebar
   */
  const closeSidebar = () => {
    setSidebar({ type: null, title: '' });
  };

  /**
   * Save custom home page
   */
  const saveHomePage = () => {
    if (customHomePage) {
      localStorage.setItem("customHomePage", customHomePage);
      alert("Home page set to: " + customHomePage);
    }
  };

  // Touch handlers for navigation gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    const end = touchEndRef.current;
    const threshold = 50;

    if (start - end > threshold) {
      // Swipe left - go forward
      handleForward();
    } else if (end - start > threshold) {
      // Swipe right - go back
      handleBack();
    }
  };

  // Enhanced gesture handlers with visual feedback
  const handleGestureStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    // Add visual feedback for gesture start
    document.body.style.cursor = 'grabbing';
    setGestureDirection(null);
  };

  const handleGestureMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    const deltaX = currentX - touchStartRef.current;
    const threshold = 30;

    if (Math.abs(deltaX) > threshold) {
      setGestureDirection(deltaX > 0 ? 'right' : 'left');
    }
  };

  const handleGestureEnd = () => {
    document.body.style.cursor = '';
    setGestureDirection(null);
    handleTouchEnd();
  };

  // Auto-hide gesture hint after first use
  useEffect(() => {
    if (showGestureHint && (historyList.length > 3 || bookmarks.length > 0)) {
      const timer = setTimeout(() => setShowGestureHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [historyList.length, bookmarks.length, showGestureHint]);

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-[#e8eaf0] font-sans">
      {/* TabBar */}
      <div className="flex gap-1 p-1 bg-black/25 border-b border-[#2c3040]">
        {tabs.map((tab, index) => (
          <Card 
            key={tab.id}
            className={`flex items-center gap-1 px-3 py-1 rounded-t-lg cursor-pointer ${
              index === activeTabIndex 
                ? 'bg-[#eaeff9] text-[#0b1020]' 
                : 'bg-[#555a66] text-white'
            }`}
            onClick={() => switchTab(index)}
          >
            <span className="font-medium">{tab.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-transparent text-red-400 hover:text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(index);
              }}
            >
              ×
            </Button>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-1 p-2 bg-[#2a2b38]">
        <Select value={selectedSearchEngine} onValueChange={setSelectedSearchEngine}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="https://www.wikipedia.org/wiki/">Wikipedia</SelectItem>
            <SelectItem value="https://www.example.com/">Example.com</SelectItem>
            <SelectItem value="https://www.google.com/search?q=">Google</SelectItem>
            <SelectItem value="https://www.bing.com/search?q=">Bing</SelectItem>
          </SelectContent>
        </Select>
        
        <Input 
          value={urlInputValue}
          onChange={(e) => setUrlInputValue(e.target.value)}
          placeholder="Enter URL or search"
          className="flex-1"
        />
        
        <Button onClick={() => goToUrl(urlInputValue)}>Go</Button>
        <Button onClick={() => createTab()}>New Tab</Button>
        <Button onClick={() => goToUrl(customHomePage)}>Home</Button>
        <Button 
          onClick={() => { 
            if (activeTabIndex >= 0) { 
              setBookmarks(prev => [...prev, tabs[activeTabIndex].url]); 
            } 
          }}
        >
          ☆ Bookmark
        </Button>
        <Button onClick={() => showSidebar('history', 'History', historyList)}>History</Button>
        <Button onClick={() => showSidebar('settings', 'Settings')}>⚙ Settings</Button>
      </div>

      {/* BrowserContainer */}
      <div 
        className="flex-1 relative"
        onTouchStart={handleGestureStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleGestureEnd}
      >
        {tabs.map((tab, index) => (
          <iframe
            key={tab.id}
            ref={tab.iframeRef}
            src={tab.url}
            className={`absolute top-0 left-0 w-full h-full ${index === activeTabIndex ? '' : 'hidden'}`}
          />
        ))}
      </div>

      {/* Sidebar */}
      {sidebar.type && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white text-black border-l border-[#2c3040] p-4 overflow-auto">
          <button 
            className="absolute right-2 top-2 text-2xl bg-transparent hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
            onClick={closeSidebar}
          >
            ✕
          </button>
          <h3 className="text-lg font-bold mb-4">{sidebar.title}</h3>
          
          {sidebar.type === 'history' && sidebar.items?.map((item, index) => (
            <div 
              key={index} 
              className="cursor-pointer text-blue-600 underline my-1 hover:text-blue-800"
              onClick={() => {
                goToUrl(item);
                closeSidebar();
              }}
            >
              {item}
            </div>
          ))}
          
          {sidebar.type === 'settings' && (
            <div>
              <label className="block mb-2 font-medium">Custom Home Page:</label>
              <Input 
                value={customHomePage} 
                onChange={(e) => setCustomHomePage(e.target.value)} 
                className="w-full mb-4"
              />
              <Button onClick={saveHomePage} className="w-full mb-4">Save Home</Button>
              <p className="text-sm text-gray-600">Right-click a tab name to rename it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowserApp;
