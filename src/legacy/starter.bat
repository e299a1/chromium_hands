START "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "https://serasaconsumidor.zendesk.com/explore/dashboard/45B58771BD804C0EA32C6A31D350C39290FB5861FF26EF8404878D1D4A80971E" --js-flags="--expose-gc" --force-device-scale-factor=0.75 --start-maximized --safebrowsing-disable-download-protection
START "" "\\SPOBRVDICFSFR\FolderRedirection$\%username%\Desktop\auto_rotina"
START "" "\\SPOBRVDICFSFR\FolderRedirection$\%username%\Downloads"
powershell -NoExit "\\SPOBRVDICFSFR\FolderRedirection$\%username%\Desktop\auto_rotina\sender.ps1"