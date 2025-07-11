import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// TypeScript declarations for external libraries
declare global {
  interface Window {
    PPTXjs?: {
      render: (fileURL: string, options: { containerID: string }) => void;
    };
    jQuery?: {
      fn?: {
        pptxToHtml?: (options: unknown) => void;
      };
      (selector: string): {
        pptxToHtml: (options: unknown) => Promise<void>;
      };
    };
    JSZip?: unknown;
    FileReaderJS?: unknown;
    pptxjs?: unknown;
    PPTX?: unknown;
  }
}

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
  if (size >= 1024) return (size / 1024).toFixed(2) + ' KB';
  return size + ' B';
}

export default function SlideControl() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFileIdx, setSelectedFileIdx] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [fitHeight, setFitHeight] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const alreadyUploaded = uploadedFiles.some(f =>
        f.name === selected.name && f.size === selected.size && f.type === selected.type
      );
      if (alreadyUploaded) {
        alert('This file is already uploaded.');
        e.target.value = '';
        return;
      }
      setUploadedFiles(prev => [...prev, selected]);
      setSelectedFileIdx(uploadedFiles.length); // select the newly uploaded file
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

  const openFullScreen = () => {
    setPageNumber(1);
    setScale(1.0);
    setFitHeight(true);
    setIsFullScreen(true);
  };

  const selectedFile = selectedFileIdx !== null ? uploadedFiles[selectedFileIdx] : null;

  // Keyboard navigation for PDF and PPTX pages in fullscreen
  useEffect(() => {
    if (!(isFullScreen && selectedFile)) return;
    
    const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    const isPPTX = selectedFile.name.toLowerCase().endsWith('.ppt') || selectedFile.name.toLowerCase().endsWith('.pptx');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (isPDF) {
          setPageNumber(p => {
            const next = Math.min(numPages || p, p + 1);
            console.log('Next PDF page:', next);
            return next;
          });
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
              console.log('Next PPTX slide:', currentIndex + 2);
            }
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (isPDF) {
          setPageNumber(p => {
            const prev = Math.max(1, p - 1);
            console.log('Previous PDF page:', prev);
            return prev;
          });
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
              console.log('Previous PPTX slide:', currentIndex);
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, selectedFile, numPages]);

  // Enter browser fullscreen when entering presentation mode
  useEffect(() => {
    if (!isFullScreen) return;
    
    const el = fullScreenRef.current;
    if (!el) return;

    // Wait for the element to be properly mounted
    const timer = setTimeout(() => {
      if (document.fullscreenElement !== el && el.requestFullscreen) {
        el.requestFullscreen().catch((error) => {
          console.warn('Failed to enter fullscreen:', error);
          // Fallback: just show the presentation without browser fullscreen
        });
      }
    }, 100);

    const handleFullscreenChange = () => {
      if (document.fullscreenElement !== el) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement === el) {
        document.exitFullscreen?.().catch(() => {
          // Ignore errors when exiting fullscreen
        });
      }
    };
  }, [isFullScreen]);

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
        console.log('Checking PPTXjs availability...');
        console.log('window.PPTXjs:', typeof window.PPTXjs);
        console.log('window.jQuery:', typeof window.jQuery);
        console.log('window.JSZip:', typeof window.JSZip);
        console.log('window.pptxjs:', typeof window.pptxjs);
        console.log('window.PPTX:', typeof window.PPTX);
        console.log('jQuery.fn.pptxToHtml:', typeof window.jQuery?.fn?.pptxToHtml);
        
        // Try different ways to access PPTXjs
        if (window.jQuery?.fn?.pptxToHtml) {
          console.log('PPTXjs is available via jQuery plugin');
          try {
            // Use jQuery plugin method
            window.jQuery!('#pptx-container').pptxToHtml({
              pptxFileUrl: fileURL,
              slidesScale: "100%"
            }).then(() => {
              // After rendering, make the first slide active
              setTimeout(() => {
                const container = document.getElementById('pptx-container');
                if (container) {
                  const slides = container.querySelectorAll('.slide');
                  if (slides.length > 0) {
                    slides.forEach(slide => slide.classList.remove('active'));
                    slides[0].classList.add('active');
                    console.log('PPTX rendered with', slides.length, 'slides');
                  }
                }
              }, 1000); // Wait for rendering to complete
            });
          } catch (error) {
            console.error('Error rendering PPTX:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (container) container.innerHTML = `Error rendering PPTX: ${errorMessage}`;
          }
        } else if (window.PPTXjs && typeof window.PPTXjs.render === 'function') {
          console.log('PPTXjs is available via window.PPTXjs');
          try {
            window.PPTXjs.render(fileURL, { containerID: 'pptx-container' });
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
        if (container) container.innerHTML = '';
      };
    }
  }, [isFullScreen, selectedFile]);

  if (isFullScreen && selectedFile) {
    const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    const isPPT = selectedFile.name.toLowerCase().endsWith('.ppt') || selectedFile.name.toLowerCase().endsWith('.pptx');
    let fileURL: string | undefined;
    if (isPDF) {
      fileURL = URL.createObjectURL(selectedFile);
    }
    return (
      <div ref={fullScreenRef} className="fixed inset-0 bg-black z-50" style={{ touchAction: 'pinch-zoom' }}>
        {isPDF && fileURL && (
          <div className="w-full h-full flex items-center justify-center">
            <Document
              file={fileURL}
              onLoadSuccess={async (pdf) => {
                setNumPages(pdf.numPages);
                if (fitHeight) {
                  const availableHeight = window.innerHeight;
                  const availableWidth = window.innerWidth;
                  const page = await pdf.getPage(1);
                  const viewport = page.getViewport({ scale: 1 });
                  const hScale = availableHeight / viewport.height;
                  const wScale = availableWidth / viewport.width;
                  const newScale = Math.min(hScale, wScale);
                  setScale(newScale);
                  setFitHeight(false);
                }
              }}
              loading={<div className="text-gray-500">Loading PDF...</div>}
              error={<div className="text-red-500">Failed to load PDF.</div>}
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
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Preview not available for this file type.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h2 className="text-3xl font-bold mb-2 text-center">Slide Control</h2>
      {/* File Upload Section */}
      <section className="group bg-white rounded-lg shadow p-6 transition-colors duration-200 hover:bg-blue-50 cursor-pointer">
        <h3 className="text-lg font-semibold mb-2">Upload Slides</h3>
        <label
          className="block font-medium mb-2 cursor-pointer transition-colors group-hover:text-blue-700"
          htmlFor="slide-upload"
        >
          Supported: PDF, PPTX, PPT
        </label>
        <input
          id="slide-upload"
          type="file"
          accept=".pdf,.pptx,.ppt"
          className="mb-4 cursor-pointer"
          onChange={handleFileChange}
        />
      </section>
      {/* Uploaded Files Section */}
      {uploadedFiles.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          <ul className="list-disc pl-6 space-y-2">
            {uploadedFiles.map((f, idx) => (
              <li
                key={idx}
                className={`flex items-center justify-between text-base font-semibold rounded px-2 py-1 cursor-pointer transition-colors ${selectedFileIdx === idx ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-blue-50'}`}
                onClick={e => {
                  // Only select if not clicking the cross
                  if ((e.target as HTMLElement).closest('.remove-btn')) return;
                  setSelectedFileIdx(idx);
                }}
                onDoubleClick={() => {
                  setSelectedFileIdx(idx);
                  openFullScreen();
                }}
              >
                <span>
                  {f.name} <span className="text-sm text-gray-500">({formatFileSize(f.size)}, {f.type || 'unknown'})</span>
                </span>
                <button
                  className="remove-btn ml-3 text-gray-400 hover:text-red-600 text-2xl font-bold px-2 py-0.5 rounded-full focus:outline-none"
                  title="Remove file"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveFile(idx);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {/* Slide Viewer Section */}
      <section className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        {/* Placeholder for slide preview */}
        {selectedFile ? (
          <>
            <div className="text-gray-500 mb-4">Preview for {selectedFile.name}</div>
            <div className="flex gap-4">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={openFullScreen}
              >
                Present
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400">No file selected yet.</div>
        )}
      </section>
    </div>
  );
} 