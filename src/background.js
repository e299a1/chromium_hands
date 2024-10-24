
chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
    if (item.referrer.search("github.com") == -1) {
        // If the file does not come from gutenberg.org, suggest nothing new.
        suggest({ filename: item.filename });
    } else {
        fileExt = item.filename.split('.').pop();
        var newFilename = "gutenberg/" + 'JonasBrothers' + "." + fileExt;
        suggest({ filename: newFilename });
        return true; // Storage API is asynchronous so we need to return true
    }
});

