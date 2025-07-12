import { useState, useEffect, useRef, useCallback } from 'react';
import SlideControlUI from '../components/SlideControlUI';
import FullscreenViewer from '../components/FullscreenViewer';
import { checkPPTXAvailability, renderPPTXWithJQuery, renderPPTXWithPPTXjs } from '../utils/pptxUtils';

export default function SlideControl() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFileIdx, setSelectedFileIdx] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [fitHeight, setFitHeight] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const pptxRenderingRef = useRef<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const alreadyUploaded = uploadedFiles.some(f =>
          f.name === file.name && f.size === file.size && f.type === file.type
        );
        
        if (alreadyUploaded) {
          alert(`File "${file.name}" is already uploaded.`);
        } else {
          newFiles.push(file);
        }
      }
      
      if (newFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...newFiles]);
        // Select the first new file if no file is currently selected
        if (selectedFileIdx === null) {
          setSelectedFileIdx(uploadedFiles.length);
        }
      }
      
      e.target.value = '';
    }
  };

  const handleRemoveFile = (idx: number) => {
    if (window.confirm('Are you sure you want to remove this file?')) {
      setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
      // Adjust selected file index if needed
      setSelectedFileIdx(prev => {
        if (prev === null) return null;
        if (prev === idx) return null;
        if (prev > idx) return prev - 1;
        return prev;
      });
    }
  };

  const openFullScreen = useCallback(() => {
    setPageNumber(1);
    setScale(1.0);
    setFitHeight(true);
    setIsFullScreen(true);
  }, []);

  const exitFullScreen = useCallback(() => {
    setIsFullScreen(false);
    setPageNumber(1);
    setScale(1.0);
    setFitHeight(false);
    pptxRenderingRef.current = false;
    
    // Clean up PPTX container
    const container = document.getElementById('pptx-container');
    if (container) {
      container.innerHTML = '';
      console.log('PPTX container cleaned up');
    }
  }, []);

  const selectedFile = selectedFileIdx !== null ? uploadedFiles[selectedFileIdx] : null;

  // PPTX rendering effect
  useEffect(() => {
    if (
      isFullScreen &&
      selectedFile &&
      (selectedFile.name.endsWith('.ppt') || selectedFile.name.endsWith('.pptx'))
    ) {
      const fileURL = URL.createObjectURL(selectedFile);
      const container = document.getElementById('pptx-container');
      if (container) container.innerHTML = '';

      // Wait for fullscreen to be entered and DOM to be ready
      setTimeout(() => {
        // Check if still in fullscreen mode
        if (!isFullScreen) {
          console.log('Exited fullscreen before PPTX rendering started');
          URL.revokeObjectURL(fileURL);
          return;
        }
        
        console.log('Checking PPTXjs availability...');
        const availability = checkPPTXAvailability();
        console.log('PPTX availability:', availability);
        
        // Try rendering with jQuery plugin first
        if (availability.jQueryPlugin !== 'undefined') {
          console.log('PPTXjs is available via jQuery plugin');
          try {
            pptxRenderingRef.current = true;
            const success = renderPPTXWithJQuery(fileURL, 'pptx-container');
            
            if (success) {
              // Use setTimeout to wait for rendering to complete
              setTimeout(() => {
                // Check if still rendering and still in fullscreen
                if (!pptxRenderingRef.current || !isFullScreen) {
                  console.log('PPTX rendering cancelled or fullscreen exited');
                  return;
                }
                
                const container = document.getElementById('pptx-container');
                if (container) {
                  const slides = container.querySelectorAll('.slide');
                  if (slides.length > 0) {
                    slides.forEach(slide => slide.classList.remove('active'));
                    slides[0].classList.add('active');
                    console.log('PPTX rendered with', slides.length, 'slides');
                  }
                }
                pptxRenderingRef.current = false;
              }, 1000); // Wait for rendering to complete
            } else {
              throw new Error('Failed to render with jQuery plugin');
            }
          } catch (error) {
            console.error('Error rendering PPTX:', error);
            pptxRenderingRef.current = false;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (container) container.innerHTML = `Error rendering PPTX: ${errorMessage}`;
          }
        } else if (availability.PPTXjsRender !== 'undefined') {
          console.log('PPTXjs is available via window.PPTXjs');
          try {
            const success = renderPPTXWithPPTXjs(fileURL, 'pptx-container');
            if (!success) {
              throw new Error('Failed to render with PPTXjs');
            }
          } catch (error) {
            console.error('Error rendering PPTX:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (container) container.innerHTML = `Error rendering PPTX: ${errorMessage}`;
          }
        } else {
          console.error('PPTXjs not available in any expected form');
          if (container) container.innerHTML = 'PPTXjs failed to load. Check console for details.';
        }
      }, 500); // Increased delay to ensure scripts are loaded

      return () => {
        URL.revokeObjectURL(fileURL);
        pptxRenderingRef.current = false;
        if (container) container.innerHTML = '';
      };
    }
  }, [isFullScreen, selectedFile]);

  // Error fallback UI
  if (hasError) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-red-700 mb-4">
            An error occurred while loading the component.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setHasError(false)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <>
        <SlideControlUI
          uploadedFiles={uploadedFiles}
          selectedFileIdx={selectedFileIdx}
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onRemoveFile={handleRemoveFile}
          onSelectFile={setSelectedFileIdx}
          onDoubleClickFile={(idx) => {
            setSelectedFileIdx(idx);
            openFullScreen();
          }}
          onOpenFullScreen={openFullScreen}
        />
        
        {selectedFile && (
          <FullscreenViewer
            selectedFile={selectedFile}
            isFullScreen={isFullScreen}
            pageNumber={pageNumber}
            scale={scale}
            numPages={numPages}
            fitHeight={fitHeight}
            onPageNumberChange={setPageNumber}
            onScaleChange={setScale}
            onFitHeightChange={setFitHeight}
            onNumPagesChange={setNumPages}
            onExitFullscreen={exitFullScreen}
          />
        )}
      </>
    );
  } catch (error) {
    console.error('Error in SlideControl render:', error);
    setHasError(true);
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-red-700 mb-4">
            An error occurred while rendering the component.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setHasError(false)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
} 