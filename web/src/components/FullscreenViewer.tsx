import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

interface FullscreenViewerProps {
  selectedFile: File;
  isFullScreen: boolean;
  pageNumber: number;
  scale: number;
  numPages: number | null;
  fitHeight: boolean;
  onPageNumberChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onFitHeightChange: (fit: boolean) => void;
  onNumPagesChange: (pages: number) => void;
  onExitFullscreen: () => void;
}

export default function FullscreenViewer({
  selectedFile,
  isFullScreen,
  pageNumber,
  scale,
  numPages,
  fitHeight,
  onPageNumberChange,
  onScaleChange,
  onFitHeightChange,
  onNumPagesChange,
  onExitFullscreen
}: FullscreenViewerProps) {
  const fullScreenRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [currentPPTXSlide, setCurrentPPTXSlide] = useState(1);
  const [totalPPTXSlides, setTotalPPTXSlides] = useState(0);

  // Enter browser fullscreen when entering presentation mode
  useEffect(() => {
    if (!isFullScreen) return;
    
    const el = fullScreenRef.current;
    if (!el) return;

    // Wait for the element to be properly mounted
    const timer = setTimeout(() => {
      try {
        if (document.fullscreenElement !== el && el.requestFullscreen) {
          el.requestFullscreen().catch((error) => {
            console.warn('Failed to enter fullscreen:', error);
            // Fallback: just show the presentation without browser fullscreen
          });
        }
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    }, 100);

    const handleFullscreenChange = () => {
      try {
        const currentFullscreenElement = document.fullscreenElement;
        if (currentFullscreenElement !== el) {
          console.log('Fullscreen change detected - exiting');
          // Use requestAnimationFrame to defer state update
          requestAnimationFrame(() => {
            onExitFullscreen();
          });
        }
      } catch (error) {
        console.error('Error in fullscreen change handler:', error);
        // Fallback: exit fullscreen
        requestAnimationFrame(() => {
          onExitFullscreen();
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      try {
        if (document.fullscreenElement === el) {
          document.exitFullscreen?.().catch(() => {
            // Ignore errors when exiting fullscreen
          });
        }
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    };
  }, [isFullScreen, onExitFullscreen]);

  // Global ESC key handler for fullscreen exit
  useEffect(() => {
    if (!isFullScreen) return;
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('ESC pressed - exiting fullscreen');
        e.preventDefault();
        e.stopPropagation();
        // Use requestAnimationFrame to defer state update
        requestAnimationFrame(() => {
          onExitFullscreen();
        });
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isFullScreen, onExitFullscreen]);

  // Mouse movement to show/hide controls
  useEffect(() => {
    if (!isFullScreen) return;
    
    let timeout: number;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullScreen]);

  // Keyboard navigation for PDF and PPTX pages in fullscreen
  useEffect(() => {
    if (!isFullScreen) return;
    
    const isPDF = selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf');
    const isPPTX = selectedFile?.name.toLowerCase().endsWith('.ppt') || selectedFile?.name.toLowerCase().endsWith('.pptx');
    
    console.log('Setting up keyboard handler for:', { isPDF, isPPTX, isFullScreen });
    
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'in fullscreen mode');
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (isPDF) {
          onPageNumberChange(Math.min(numPages || pageNumber, pageNumber + 1));
        } else if (isPPTX) {
          // For PPTX, we need to trigger the next slide in PPTXjs
          const container = document.getElementById('pptx-container');
          if (container) {
            const slides = container.querySelectorAll('.slide');
            const currentSlide = container.querySelector('.slide.active') || slides[0];
            const currentIndex = Array.from(slides).indexOf(currentSlide);
            const nextSlide = slides[currentIndex + 1];
            
            if (nextSlide) {
              slides.forEach(slide => slide.classList.remove('active'));
              nextSlide.classList.add('active');
              setCurrentPPTXSlide(currentIndex + 2);
              console.log('Next PPTX slide:', currentIndex + 2);
            }
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (isPDF) {
          onPageNumberChange(Math.max(1, pageNumber - 1));
        } else if (isPPTX) {
          // For PPTX, we need to trigger the previous slide in PPTXjs
          const container = document.getElementById('pptx-container');
          if (container) {
            const slides = container.querySelectorAll('.slide');
            const currentSlide = container.querySelector('.slide.active') || slides[0];
            const currentIndex = Array.from(slides).indexOf(currentSlide);
            const prevSlide = slides[currentIndex - 1];
            
            if (prevSlide) {
              slides.forEach(slide => slide.classList.remove('active'));
              prevSlide.classList.add('active');
              setCurrentPPTXSlide(currentIndex);
              console.log('Previous PPTX slide:', currentIndex);
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, selectedFile, numPages, pageNumber, onPageNumberChange]);

  // Update PPTX slide count when slides are rendered
  useEffect(() => {
    if (isFullScreen && selectedFile?.name.toLowerCase().match(/\.(ppt|pptx)$/)) {
      const container = document.getElementById('pptx-container');
      if (container) {
        const slides = container.querySelectorAll('.slide');
        if (slides.length > 0) {
          setTotalPPTXSlides(slides.length);
        }
      }
    }
  }, [isFullScreen, selectedFile]);

  if (!isFullScreen || !selectedFile) {
    return null;
  }

  const isPDF = selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf');
  const isPPT = selectedFile?.name.toLowerCase().endsWith('.ppt') || selectedFile?.name.toLowerCase().endsWith('.pptx');
  let fileURL: string | undefined;
  if (isPDF) {
    fileURL = URL.createObjectURL(selectedFile);
  }

  const currentSlide = isPDF ? pageNumber : currentPPTXSlide;
  const totalSlides = isPDF ? numPages : totalPPTXSlides;

  return (
    <div 
      ref={fullScreenRef} 
      className="fixed inset-0 bg-black z-50" 
      style={{ touchAction: 'pinch-zoom' }}
    >
      {/* Top Controls Bar */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <div className="font-semibold text-lg">{selectedFile.name}</div>
              <div className="text-sm opacity-75">
                {isPDF ? 'PDF Document' : 'PowerPoint Presentation'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress indicator */}
            {totalSlides && (
              <div className="text-white text-center">
                <div className="text-lg font-semibold">{currentSlide} / {totalSlides}</div>
                <div className="text-xs opacity-75">Slide</div>
              </div>
            )}
            
            {/* Exit button */}
            <button
              onClick={onExitFullscreen}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center p-4 space-x-8">
          {/* Navigation controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (isPDF) {
                  onPageNumberChange(Math.max(1, pageNumber - 1));
                } else if (isPPT) {
                  const container = document.getElementById('pptx-container');
                  if (container) {
                    const slides = container.querySelectorAll('.slide');
                    const currentSlide = container.querySelector('.slide.active') || slides[0];
                    const currentIndex = Array.from(slides).indexOf(currentSlide);
                    const prevSlide = slides[currentIndex - 1];
                    
                    if (prevSlide) {
                      slides.forEach(slide => slide.classList.remove('active'));
                      prevSlide.classList.add('active');
                      setCurrentPPTXSlide(currentIndex);
                    }
                  }
                }
              }}
              disabled={currentSlide <= 1}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => {
                if (isPDF) {
                  onPageNumberChange(Math.min(numPages || pageNumber, pageNumber + 1));
                } else if (isPPT) {
                  const container = document.getElementById('pptx-container');
                  if (container) {
                    const slides = container.querySelectorAll('.slide');
                    const currentSlide = container.querySelector('.slide.active') || slides[0];
                    const currentIndex = Array.from(slides).indexOf(currentSlide);
                    const nextSlide = slides[currentIndex + 1];
                    
                    if (nextSlide) {
                      slides.forEach(slide => slide.classList.remove('active'));
                      nextSlide.classList.add('active');
                      setCurrentPPTXSlide(currentIndex + 2);
                    }
                  }
                }
              }}
              disabled={totalSlides ? currentSlide >= totalSlides : false}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Instructions */}
          <div className="text-white text-center">
            <div className="text-sm opacity-75">Use arrow keys or click to navigate</div>
            <div className="text-xs opacity-50">Press ESC to exit</div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {isPDF && fileURL && (
        <div className="w-full h-full flex items-center justify-center">
          <Document
            file={fileURL}
            onLoadSuccess={async (pdf) => {
              onNumPagesChange(pdf.numPages);
              if (fitHeight) {
                const availableHeight = window.innerHeight;
                const availableWidth = window.innerWidth;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1 });
                const hScale = availableHeight / viewport.height;
                const wScale = availableWidth / viewport.width;
                const newScale = Math.min(hScale, wScale);
                onScaleChange(newScale);
                onFitHeightChange(false);
              }
            }}
            loading={
              <div className="flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <span className="ml-3 text-lg">Loading PDF...</span>
              </div>
            }
            error={
              <div className="flex items-center justify-center text-red-400">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg">Failed to load PDF.</span>
              </div>
            }
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
      )}
      {isPPT && (
        <div className="w-full h-full">
          <div id="pptx-container" className="w-full h-full" />
        </div>
      )}
      {!isPDF && !isPPT && (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-lg">Preview not available for this file type.</div>
          </div>
        </div>
      )}
    </div>
  );
} 