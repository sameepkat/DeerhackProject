// Utility functions for PPTX handling to avoid property descriptor conflicts

export const checkPPTXAvailability = () => {
  try {
    // Use a more defensive approach to avoid property descriptor conflicts
    const windowObj = window as any;
    const jQuery = windowObj.jQuery;
    const PPTXjs = windowObj.PPTXjs;
    
    return {
      jQuery: typeof jQuery,
      PPTXjs: typeof PPTXjs,
      jQueryPlugin: typeof jQuery?.fn?.pptxToHtml,
      PPTXjsRender: typeof PPTXjs?.render
    };
  } catch (error) {
    console.error('Error checking PPTX availability:', error);
    return {
      jQuery: 'undefined',
      PPTXjs: 'undefined',
      jQueryPlugin: 'undefined',
      PPTXjsRender: 'undefined'
    };
  }
};

export const renderPPTXWithJQuery = (fileURL: string, containerId: string) => {
  try {
    const windowObj = window as any;
    const jQuery = windowObj.jQuery;
    if (jQuery?.fn?.pptxToHtml) {
      jQuery(`#${containerId}`).pptxToHtml({
        pptxFileUrl: fileURL,
        slidesScale: "100%"
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error rendering PPTX with jQuery:', error);
    return false;
  }
};

export const renderPPTXWithPPTXjs = (fileURL: string, containerId: string) => {
  try {
    const windowObj = window as any;
    const PPTXjs = windowObj.PPTXjs;
    if (PPTXjs?.render) {
      PPTXjs.render(fileURL, { containerID: containerId });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error rendering PPTX with PPTXjs:', error);
    return false;
  }
}; 