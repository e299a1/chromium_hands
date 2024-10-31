//console.log('---------------------------------------------------------------------------------------------------------');
//console.log('download listener');

//--------------------------------------------------------------------------------------------------

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob)
  });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        //console.log(sender)
        //if (item.referrer.search(request.referrer) == -1) { // If the file does not come from referrer website, suggest nothing new.
        //    suggest({ filename: item.filename });
        //} else {


        // Add Download Renamer 
        if (request.message === "rename download") {
            var newFilePath = ''
            chrome.downloads.onDeterminingFilename.addListener(function renameDownload(item, suggest) {
                const fileExt = item.filename.split('.').pop();
                const fileDir = item.filename.substr(0, item.filename.lastIndexOf("/"))
                var newFilename = request.filename + "." + fileExt;
                suggest({ filename: newFilename, conflictAction: "overwrite"});
                chrome.downloads.onDeterminingFilename.removeListener(renameDownload)

                newFilePath  = fileDir +'/'+ newFilename 
                sendResponse({newFilePath: newFilePath});

                return true
            });
            return true
        }


        // Add Download File Grabber
        if (request.message === "grab download") {
            (async () => {
                const blob = await fetch(request.filepath).then((res) => res.blob())
                const base64 = await blobToBase64(blob).then((b64) => b64.split(',')[1]); 
                sendResponse({blob: blob, base64:base64});
            })();
            return true
        }
    }
);    
