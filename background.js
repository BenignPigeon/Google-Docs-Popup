/*-------------------------------------------------------------------------------------------------------------------------------------------
 * Popup for Google Docs - Chrome Extension
 * Open your Google Docs, Sheets and Slides documents in separated and dedicated windows, without an address bar or browser buttons.
 * V1 - 10/10/2021
 * By benignpigeon
 * Based on code by Julien MEUGNIER
 * https://github.com/
\*-------------------------------------------------------------------------------------------------------------------------------------------*/


// Contain list of created Dedicated Windows ID with this Extension to not reopen a new window from the already created window
gDocWindowsIDs = [];

//Lists of IDs of the "sources" tabs that triggered the opening of the new window thanks to this extension, so as not to repeat the opening of a new window several times while waiting for it to be closed
gDocTabsClodedsIDs = []; 

// At each change of a tab (opening, change of url)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){

	// We check that it's a URL of a Google document, and that we have not already processed this event
    if (tab.url.startsWith("https://docs.google.com/spreadsheets") && !gDocWindowsIDs.includes(tab.windowId) && !gDocTabsClodedsIDs.includes(tab.id))
    {
		// The "source" tab is an unprocessed Google document...
		
		// The "onUpdated" function can be called several times before closing "source" tab. We put the ID of the source tab in memory so as not to open several times before closing the source tab. 
        gDocTabsClodedsIDs.push(tab.id);
		
       
    // Create a unique key for the window ID
    var key = "windowsIDs" + "_" + tab.windowId;

    // Retrieve data from Chrome storage using the key
    chrome.storage.sync.get(key, function(result) {
      console.log(result);

      // If the value associated with the key is not true
      if (result[key] != true) {
        // Remove the tab
        chrome.tabs.remove(tabId);

        // Create a new window with the same URL as the tab,
        // as a maximized popup window
        chrome.windows.create(
          {
            url: tab.url,
            type: "popup",
            state: "maximized"
          },
          function(windowCreated) {
            // Add the newly created window's ID to the gDocWindowsIDs array
            gDocWindowsIDs.push(windowCreated.id);

            // Set the value of the key in local storage to true
            setLocalStorageValue("windowsIDs", windowCreated.id, true);
          }
        );
      }
    });
  }
});

// Function to set a value in local storage
function setLocalStorageValue(prefix, id, value) {
  var key = prefix + "_" + id,
    val = value;

  // Store the key-value pair in Chrome storage
  chrome.storage.sync.set({ [key]: val });
}

// Function to get a value from local storage
function getLocalStorageValue(prefix, id) {
  key = prefix + "_" + id;

  // Retrieve the value associated with the key from Chrome storage
  chrome.storage.sync.get(key, function(result) {
    console.log(result);
    return result[key];
  });
}
