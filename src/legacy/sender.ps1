Add-Type -AssemblyName System.Windows.Forms
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
$downloads = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path
$hoje = (Get-Date).ToString("yyyy-MM-dd")
$bases_concluidas = @()

while ($true){
	Start-Sleep -Seconds 1
	Write-Host -NoNewLine '.'
		
	$clipb = Get-Clipboard;
	$clipb = "$clipb"
	if ((($clipb.Substring(0, [Math]::Min($clipb.Length, 6))).StartsWith('@*@ - ')) -and ($bases_concluidas -notcontains $clipb)){
		Write-Host('#')
		Write-Host('!!! ------------------------------------------- ')			
		Write-Host($clipb)
		Write-Host('- - -')
		$nome_base_crua = $clipb.Substring(6, $clipb.Length -6) -replace '\\', '\'
		$nome_base_trat = $nome_base_crua -replace '[\\]', '_'
		$pasta_bases = "$($downloads)\$($hoje)_bases"
		$pasta_base = "$($pasta_bases)\$($nome_base_trat)"	
		$pasta_base_bkp = "$($pasta_base)\bkp"
		$pasta_base_trat = "$($pasta_base)\trat"
		$pasta_base_trat_base = Split-Path "$($pasta_base_trat)\$($nome_base_crua).xlsx"
		$pasta_base_zip = "$($pasta_base)\$($nome_base_trat).zip"
		Write-Host($nome_base_crua)
		Write-Host($nome_base_trat)
		Write-Host($pasta_bases)
		Write-Host($pasta_base)
		Write-Host($pasta_base_bkp)		
		Write-Host($pasta_base_trat)		
		Write-Host($pasta_base_trat_base)
		Write-Host($pasta_base_zip)	
		if(!(Test-Path $pasta_bases)) {New-Item -Path $pasta_bases -ItemType Directory -Force | Out-Null}
		if(!(Test-Path $pasta_base)) {New-Item -Path $pasta_base -ItemType Directory -Force | Out-Null}
		if(!(Test-Path $pasta_base_bkp)) {New-Item -Path $pasta_base_bkp -ItemType Directory -Force | Out-Null}
		if(!(Test-Path $pasta_base_trat)) {New-Item -Path $pasta_base_trat -ItemType Directory -Force | Out-Null}
		if(!(Test-Path $pasta_base_trat_base)) {New-Item -Path $pasta_base_trat_base -ItemType Directory -Force | Out-Null}
		Write-Host('~ v ~')	

		
		Move-Item -Path "$($downloads)\*.xlsx" -Destination $pasta_base_bkp
		$base = (Get-ChildItem -File -Path $pasta_base_bkp | Sort LastWriteTime | Select -Expand Name)
		$base = if ($base.Length -ge 33 ) { "$($pasta_base_bkp)\$($base)" } else { "$($pasta_base_bkp)\$($base[0])" }
		
		Write-Host($base)		
		Write-Host("$($pasta_base_trat)\$($nome_base_crua).xlsx")
		if(!(Test-Path "$($pasta_base_trat)\$($nome_base_crua).xlsx")) {New-Item -Path $pasta_base_trat -ItemType Directory -Force | Out-Null}
		Copy-Item -Path $base -Destination "$($pasta_base_trat)\$($nome_base_crua).xlsx"
		
		Compress-Archive -Path "$($pasta_base_trat)\*" -DestinationPath $pasta_base_zip
		Write-Host('Zipado!')
		Write-Host('- - -')
		
		if ($true) {
			$FilePath = $pasta_base_zip
			$FileName = Split-Path $FilePath -leaf
			$Params = @{
				URI = "https://api.github.com/repos/GrupoSelecionar/ponte_dados/contents/$($FileName)"
				Header = @{Authorization = "Token xxx"}
				Body = @{
					message = "Upload da base '$($FileName)'"
					content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($FilePath))
				} | ConvertTo-Json
				Method = "PUT"
			}
			Write-Host "$($Params.Method) -> $($Params.Body.message) -> $($Params.URI)"
			Invoke-RestMethod -Headers $Params.Header -Method $Params.Method -Body $Params.Body -URI $Params.URI
			Write-Host('Enviado!')
		}
		Write-Host('~~~ ------------------------------------------- ')
		$bases_concluidas += $clipb
	}
}
