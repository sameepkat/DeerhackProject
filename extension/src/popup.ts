console.log('Popup script loaded.');

function updatePopup(info: { title: string; url: string; html: string }) {
  document.body.innerHTML = `
    <h2>Page Info</h2>
    <div><b>Title:</b> ${info.title}</div>
    <div><b>URL:</b> ${info.url}</div>
    <button id="prevSlideBtn">Previous Slide</button>
    <button id="nextSlideBtn">Next Slide</button>
    <pre style="max-height:200px;overflow:auto;">${info.html}...</pre>
  `;

  document.getElementById('nextSlideBtn')?.addEventListener('click', () => {
    sendSlideCommand('nextSlide');
  });
  document.getElementById('prevSlideBtn')?.addEventListener('click', () => {
    sendSlideCommand('prevSlide');
  });
}

function sendSlideCommand(action: 'nextSlide' | 'prevSlide') {
  chrome.tabs && chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      console.log(`Sending ${action} command to tab ${tabs[0].id}`);
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending slide command:', chrome.runtime.lastError);
            // Show error in popup
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
            document.body.appendChild(errorDiv);
          } else if (response) {
            console.log('Slide command response:', response);
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.color = 'green';
            successDiv.textContent = `Success: ${response.method}`;
            document.body.appendChild(successDiv);
            // Remove success message after 2 seconds
            setTimeout(() => successDiv.remove(), 2000);
          }
        }
      );
    } else {
      console.error('No active tab found');
    }
  });
}

// Initialize popup
chrome.tabs && chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.id) {
    console.log(`Querying page info from tab ${tabs[0].id}`);
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getPageInfo' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting page info:', chrome.runtime.lastError);
          document.body.innerHTML = `
            <div style="color:red;">
              <h3>Error: ${chrome.runtime.lastError.message}</h3>
              <p>This usually means the content script is not loaded on this page.</p>
              <p>Try refreshing the page or navigating to a different site.</p>
            </div>
          `;
        } else if (response) {
          console.log('Page info response:', response);
          updatePopup(response);
        } else {
          document.body.innerHTML = '<div>No response from content script.</div>';
        }
      }
    );
  } else {
    document.body.innerHTML = '<div>No active tab found.</div>';
  }
}); 