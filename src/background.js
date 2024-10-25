//console.log('---------------------------------------------------------------------------------------------------------');
//console.log('download listener');

//--------------------------------------------------------------------------------------------------

// Add Download Renamer Listener
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender)
        chrome.downloads.onDeterminingFilename.addListener(function renameDownload(item, suggest) {
            if (item.referrer.search(request.referrer) == -1) { // If the file does not come from referrer website, suggest nothing new.
                suggest({ filename: item.filename });
            } else {
                fileExt = item.filename.split('.').pop();
                var newFilename = request.filename + "." + fileExt;
                suggest({ filename: newFilename });
                chrome.downloads.onDeterminingFilename.removeListener(renameDownload)
                return true; // Storage API is asynchronous so we need to return true
            }
        });
        sendResponse({response: "Listener created for downloads from '"+request.referrer+"' to rename to '"+request.filename+"'"});
    }
);    
//
// Kill Download Renamer Listener
