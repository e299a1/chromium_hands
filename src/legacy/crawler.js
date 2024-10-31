
async function pegar_elemento(raiz, selector, content, timeout) {
	content = String(content);
	if (content.startsWith('[num->')) {
		var num = parseInt(content.substring(content.indexOf("[num->")+6,content.lastIndexOf("<-num]")));
		if (debug) {console.log(content.substring(0,content.lastIndexOf("<-num]")+6))};
		if (debug) {console.log(num)};
		content = content.substring(content.lastIndexOf("<-num]")+6)
		if (debug) {console.log(content)};
	} else {
		var num = 0;
	}
	
    timeout = timeout*1000;
    timeout_promise = new Promise(resolve => {
        setTimeout(() => {
            return resolve('timeout');
        }, timeout);
        });
    
    encontrar_elm = new Promise(resolve => {
        if (content.endsWith('*')) {
            if (raiz.querySelector(selector)) {
					//if (debug) {console.log(raiz.querySelectorAll(selector)[num])};
					return resolve(raiz.querySelectorAll(selector)[num]);
            };
    
            const observer = new MutationObserver(mutations => {
                if (raiz.querySelector(selector)) {
						//if (debug) {console.log(raiz.querySelectorAll(selector)[num])};
						return resolve(raiz.querySelectorAll(selector)[num]);					
                    observer.disconnect();
                };
            });
            observer.observe(document.body, {
            childList: true,
            subtree: true
            });
        } else {
            if (Array.from(raiz.querySelectorAll(selector)).find(el => el.textContent == content)) {
					//if (debug) {console.log(Array.from(raiz.querySelectorAll(selector)).filter(el => el.textContent == content)[num])};
					return resolve(Array.from(raiz.querySelectorAll(selector)).filter(el => el.textContent == content)[num]);
            };
    
            const observer = new MutationObserver(mutations => {
                if (Array.from(raiz.querySelectorAll(selector)).find(el => el.textContent == content)) {
						//if (debug) {console.log(Array.from(raiz.querySelectorAll(selector)).filter(el => el.textContent == content)[num])};
						return resolve(Array.from(raiz.querySelectorAll(selector)).filter(el => el.textContent == content)[num]);
                    observer.disconnect();
                };
            });
            observer.observe(document.body, {
            childList: true,
            subtree: true
            });
        };
    });
    
    return  Promise.race([encontrar_elm, timeout_promise]);
};

function esperar(s) {
    ms = s*1000;
    return new Promise(resolve => setTimeout(resolve, ms));
};

function data(intervalo, desvio) {
	
	if (intervalo == 'd') {
		var data = new Date();
		data.setDate(data.getDate()+desvio);
		
	} else if (intervalo == 'm-inicio') {
		var data = new Date(new Date().getFullYear(), new Date().getMonth(), 01);
		data.setMonth(data.getMonth()+desvio);
		
	} else if (intervalo == 'm-fim') {
		var data = new Date(new Date().getFullYear(), new Date().getMonth(), 01);
		data.setMonth(data.getMonth()+desvio);
		data = new Date(data.getFullYear(), data.getMonth()+1, 00);
	};
		
	var y = data.getUTCFullYear();
	var m = data.getUTCMonth() + 1; // Janeiro é "0", por isso o +1
	var d = data.getUTCDate();
	
	return [y, m, d]
}

function diasNoMes (mes, ano) {
	return new Date(ano, mes, 0).getDate();
}

function dif_meses(dateFrom, dateTo) {
 return dateTo.getMonth() - dateFrom.getMonth() + 
   (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

function manter_apenas_widgets(ids, classes){
	var widgets_nomeados = []
    for (const i in ids) {widgets_nomeados[i] = document.querySelector("#bimeWidgets-1 >  bime-widget:nth-child("+ids[i]+")")}
	
    
    query = "#bimeWidgets-1 > .null"
    for (let id of ids) {query = query+", bime-widget:nth-child("+id+")"}
	
    query = query + ", #bimeWidgets-1 > .null"
    for (let classe of classes) {query = query+", ."+classe}
    
    widgets_permitidos = document.querySelectorAll(query)

    for (let widget of document.querySelectorAll("#bimeWidgets-1 > *")) {
        if([].indexOf.call(widgets_permitidos, widget)<0){
            widget.remove()
        }
    }
	
	return widgets_nomeados
}

async function sucesso_download(){
    var sucesso = false;
    
    var processando = true;
    while(processando) {
        var interrompido = false;
        await pegar_elemento(document, "#notifications-portal > div > div", '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if(debug) {console.log("Aguardando download...")};
        }}});
    
        if (!interrompido){
            processando = false;
        };
    };
    
    var processando = true;
	var falha = false
    while(processando) {
        var interrompido = false;
        await pegar_elemento(document, "#notifications-portal div div", '*', 2).then((elm) => { if (elm == 'timeout') {interrompido=true} else { if (!interrompido) {
            if(debug) {console.log("...")};
        }}})
        .then(await pegar_elemento(document, "#notifications-portal div div div", 'Falha ao baixar', 2).then((elm) => { if (elm == 'timeout') {} else { if (!interrompido) {
            if(debug) {console.log("Falhou!")};
            document.querySelector("#notifications-portal div div button").click();
            falha = true
        }}}));
    
        if (interrompido){
			if (falha){
				if(debug) {console.log("Download Falhou!")};
				return false;
			} else {
				if(debug) {console.log("Sucesso!")};
				while (minuto_anterior == new Date().getMinutes()) {await esperar(1)};
				minuto_anterior = new Date().getMinutes()
				return true;
			}
        };
    };
};

async function filtrar_tribo(tribo) {
    var processando = true;
    while(processando) {
        console.log('- - - - - - - - - Filtro ('+tribo+')');
        var interrompido = false;
        await pegar_elemento(document, '#bimeBookmarkWidget-1 > [bime-tooltip="'+tribo+'"]', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Filtrando " + tribo)};
            elm.click();
            
        }}});
    
        if (!interrompido){
            processando = false;
        };
    };
    
    var processando = true;
    while(processando) {
        var interrompido = false;
        await pegar_elemento(document, '#bimeWidgets-1 div.small-chart-loader', '*', 2).then((elm) => { if (elm == 'timeout') {interrompido=true} else { if (!interrompido) {
            if(debug) {console.log("...")};
        }}});
    
        if (interrompido){
            if(debug) {console.log("Carregado!")};
            return true;
        } else {
			await esperar(2);
		};
    };
};

async function filtrar_data(inicio, fim) {
    var processando = true;
	//var meses = {01:'Jan', 02:'Fev', 03:'Mar', 04:'Abr', 05:'Mai', 06:'Jun', 07:'Jul', 08:'Ago', 09:'Set', 10:'Out', 11:'Nov', 12:'Dez'};
	var meses = {01:'Jan', 02:'Feb', 03:'Mar', 04:'Apr', 05:'May', 06:'Jun', 07:'Jul', 08:'Aug', 09:'Sep', 10:'Oct', 11:'Nov', 12:'Dec'};
	
	var dataTexto_inicio = String(inicio[2]).padStart(2, '0')+'/'+String(inicio[1]).padStart(2, '0')+'/'+inicio[0];
	var dataTexto_fim = String(fim[2]).padStart(2, '0')+'/'+String(fim[1]).padStart(2, '0')+'/'+fim[0];
	var dataTexto = dataTexto_inicio+' — '+dataTexto_fim;
	
	inicio[1] = meses[inicio[1]];
	fim[1] = meses[fim[1]];
	
	var falhas = 0;
	
	while(true) {	
		while(processando) {
			console.log('- - - - - - - - - Filtro ('+dataTexto+')');
			
			var interrompido = false;
			var mesma_data = false;
			var mesma_data_inicio = false;
			var mesma_data_fim = false;
			var i_inicio = 0;
			var i_fim = 0;
			
			
			//if(debug) {console.log("Checkando Erros... (pré)")};
			var erros = false;

			//await pegar_elemento(document, '[class="widget-query-error"]', '*', 2).then((elm) => { if (elm == 'timeout') {} else {
			//	if(debug) {console.log("Erro encontrado.")};
			//	erros = true;
			//}});
			
			
			await pegar_elemento(document, "#bimeWidgets-1 > bime-widget.forward.timeFilter > div > div.widget-visualisation > div > div > div > div > span > b", '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
				if (debug) {console.log("Checkando data (pré)")};
				if ((elm.innerText == dataTexto) && !erros) {
					mesma_data = true;
				};
			}}});
			
			if (!mesma_data) {
				await pegar_elemento(document, '#bimeTimeFilterWidget-2', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
					//if (debug) {console.log("Abrindo calendario")};
					elm.click();  
				}}})
				.then(await pegar_elemento(document, 'bime-time-filter-pane > div > div > div.range-dates > div.simple-range-date > bime-radio:nth-child(3) > div > div.radio-text', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
					if (debug) {console.log("Resetando filtro")};
					elm.click();
				}}}))
				.then(await pegar_elemento(document, 'bime-time-filter-pane > div > div > div.range-dates > div.simple-range-date > bime-radio:nth-child(4) > div > div.radio-text', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
					//if (debug) {console.log("Resetando filtro")};
					elm.click();
				}}}))
				.then(await pegar_elemento(document, 'bime-time-filter-pane > div > div > div.range-dates > div.simple-range-date > bime-radio:nth-child(1) > div > div.radio-text', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
					//if (debug) {console.log("Data personalizada")};
					elm.click();
				}}}))
				
				
				// \/   \/   \/ LOOP WHILE Data Inicio tiver diferente; Alternar index entre 0/1/2
				while(!mesma_data_inicio) {
					await pegar_elemento(document, 'div.calendar.from-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > thead > tr:nth-child(1) > th.switch', '*', 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Periodo inicial")};
						elm.click();
						elm.click();
					}}})
					.then(await pegar_elemento(document, 'div.calendar.from-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > tbody > tr > td > span', inicio[0], 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Selecionando " + inicio[0])};
						elm.click();
					}}}))
					.then(await pegar_elemento(document, 'div.calendar.from-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > tbody > tr > td > span', inicio[1], 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Selecionando " + inicio[1])};
						elm.click();
					}}}))
					.then(await pegar_elemento(document, 'div.calendar.from-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > tbody > tr > td', ((inicio[2]>15) ? ['[num->'+i_inicio+'<-num]'] : "")+inicio[2], 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Selecionando " + inicio[2])};
						elm.click();
					}}}))
					
					//await esperar(1);
					await pegar_elemento(document, "#bimeWidgets-1 > bime-widget.forward.timeFilter > div > div.widget-visualisation > div > div > div > div > span > b", '*', 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Checkando data inicio")};
						if (elm.innerText.startsWith(dataTexto_inicio)) {
							mesma_data_inicio = true;
						} else if (i_inicio > 1){
							i_inicio = 0;
						} else {
							i_inicio += 1;
						};
					}}});
					
				};
				// /\   /\   /\



				// \/   \/   \/ LOOP WHILE Data Fim tiver diferente ; Alternar index entre 0/1/2
				while(!mesma_data_fim && !interrompido) {
					await pegar_elemento(document, 'div.calendar.to-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > thead > tr:nth-child(1) > th.switch', '*', 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Periodo final")};
						elm.click();
						elm.click();
					}}})
					.then(await pegar_elemento(document, 'div.calendar.to-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > tbody > tr > td > span', fim[0], 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Selecionando " + fim[0])};
						elm.click();
					}}}))
					.then(await pegar_elemento(document, 'div.calendar.to-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > tbody > tr > td > span', fim[1], 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Selecionando " + fim[1])};
						elm.click();
					}}}))
					.then(await pegar_elemento(document, 'div.calendar.to-calendar > div.datetimepicker.ng-not-empty.ng-valid > table > tbody > tr > td', ((fim[2]>15) ? ['[num->'+i_fim+'<-num]'] : "")+fim[2], 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Selecionando " + fim[2])};
						elm.click();
					}}}))
					
					//await esperar(1);
					await pegar_elemento(document, "#bimeWidgets-1 > bime-widget.forward.timeFilter > div > div.widget-visualisation > div > div > div > div > span > b", '*', 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
						if (debug) {console.log("Checkando data fim")};
						if (elm.innerText.endsWith(dataTexto_fim)) {
							mesma_data_fim = true;
						} else if (i_inicio > 1){
							i_fim = 0;
						} else {
							i_fim += 1;
						};
					}}});
					
				};
				// /\   /\   /\




			}
			
			//await esperar(1);
			await pegar_elemento(document, "#bimeWidgets-1 > bime-widget.forward.timeFilter > div > div.widget-visualisation > div > div > div > div > span > b", '*', 5).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
				if (debug) {console.log("Checkando data (pós)")};
				if (elm.innerText == dataTexto) {
					mesma_data = true;					
				} else {
					mesma_data = false;
				};
			}}});
		
			if (mesma_data) {	
				await pegar_elemento(document, '#bimeWidgets-1 div.small-chart-loader', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Sem rodinhas. Continuando mesmo assim');} else { if (!interrompido) {
					if (debug) {console.log("Checkando rodinhas de loading...")};
				}}});
			}
			
			if (!interrompido && mesma_data){
				processando = false;
			} else {
				falhas += 1;
				
				if (falhas > 30) {
					throw "Excesso de falhas. Encerrando."
				};
			};
		};
		
		var carregando = true;
		while(carregando) {
			var interrompido = false;
			await pegar_elemento(document, '#bimeWidgets-1 div.small-chart-loader', '*', 2).then((elm) => { if (elm == 'timeout') {interrompido=true} else { if (!interrompido) {
				if(debug) {console.log("...")};
			}}});
		
			if (interrompido){
				if(debug) {console.log("Carregado!")};

				carregando = false;
			} else {
				await esperar(2);
			};
		};
		
		//if(debug) {console.log("Checkando Erros... (pós)")};
		var erros = false;

		//await pegar_elemento(document, '[class="widget-query-error"]', '*', 2).then((elm) => { if (elm == 'timeout') {} else {
		//	if(debug) {console.log("Erro encontrado.")};
		//	erros = true;
		//}});
		
		if (!erros) {return true}
		else { processando = true};
	};
};

async function extracao_direta(widget) {
    titulo_widget = widget.querySelector("div > div.widget-header.both-exclusions").textContent.replace(/\n/g, "").trim();
    var processando = true;
    while(processando) {
        console.log('- '+titulo_widget);
        var interrompido = false;
    
        await pegar_elemento(widget, '#export-query-image > i', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            //if(debug) {console.log("Clicando botão de exportação")};
            elm.click();
            
        }}})
        .then(await pegar_elemento(document, "label", 'CSV', 15).then((elm) => {  if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            //if(debug) {console.log("Desmarcando [CSV]")};
            input = document.querySelector('[id=\''+elm.getAttribute('for')+'\']');
            if (input.checked == true) {
                elm.click();
            };
            
        }}}))
        .then(await pegar_elemento(document, "label", 'Imagem', 1).then((elm) => { if (elm == 'timeout') {} else { if (!interrompido) {
            //if(debug) {console.log("Desmarcando [Imagem]")};
            input = document.querySelector('[id=\''+elm.getAttribute('for')+'\']');
            if (input.checked == true) {
                elm.click();
            };
            
        }}}))
        .then(await pegar_elemento(document, "label", 'PDF', 1).then((elm) => { if (elm == 'timeout') {} else { if (!interrompido) {
            //if(debug) {console.log("Desmarcando [PDF]")};
            input = document.querySelector('[id=\''+elm.getAttribute('for')+'\']');
            if (input.checked == true) {
                elm.click();
            };
            
        }}}))
        .then(await pegar_elemento(document, "label", 'Imagem e PDF', 1).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            //if(debug) {console.log("Desmarcando [Imagem e PDF]")};
            input = document.querySelector('[id=\''+elm.getAttribute('for')+'\']');
            if (input.checked == true) {
                elm.click();
            };
            
        }}}))
        .then(await pegar_elemento(document, "label", 'Excel', 1).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            //if(debug) {console.log("Marcando [Excel]")};
            input = document.querySelector('[id=\''+elm.getAttribute('for')+'\']');
            if (input.checked == false) {
                elm.click();
            }
            
        }}}))
        .then(await pegar_elemento(document, "[data-test-id=export-modal-export-button]", '*', 15).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            //if(debug) {console.log("Clicando Exportar")};
            elm.click();
            
        }}}));

        if (!interrompido){
            if (await sucesso_download()){
                processando = false;
            };
        };
    };
};

async function extracao_detalhada(widget, colunas) {
	
	header = widget.querySelector("div > div.widget-header.both-exclusions");
	if (header == null) {
		header = widget.querySelector("div > div.widget-visualisation > div > div.chart-container.kpiChart > div.kpi-measure > span")
	};
	
	try { titulo_widget = header.textContent.replace(/\n/g, "").trim();} 
	catch(e) {titulo_widget = "<Header não encontrado>"; }
    
	var processando = true;
    while(processando) {
        console.log('- '+titulo_widget);
        var interrompido = false;
    
	
		await esperar(2); // Abrir detalhamento
	
        await pegar_elemento(widget, 'div.kpi-first-measure > div', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Click card")};
            elm.click();
			
        }}})
        .then(await pegar_elemento(document, "[class=drill-in]", '*', 15).then((elm) => {  if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Click detalhar")};
            elm.click();
            
        }}}));
		
		await esperar(2); // Selecionar colunas
		
        await pegar_elemento(document, '[data-garden-container-id="containers.selection"]', '*', 15).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Open dropdown")};
            elm.click();
			
			if (debug) {console.log("Procurando dropdown (item:'"+colunas[0]+"')")};
        }}})
        .then(await pegar_elemento(document, "[id ^=downshift][id $=menu]>*", colunas[0], 15).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Selecionar colunas")};
			for (let coluna of colunas){
				if (debug) {console.log("-- "+coluna)};
				Array.from(document.querySelectorAll("[id ^=downshift][id $=menu]>*")).find(el => el.textContent == coluna).click();
			};
        }}})).then(await pegar_elemento(document, '[data-garden-container-id="containers.selection"]', '*', 15).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Close dropdown")};
            elm.click();
			
        }}}))
        .then(await pegar_elemento(document, '[data-garden-id="modals.body"] [class="circular-loader"]', '*', 15).then((elm) => { if (elm == 'timeout') {if (debug) {console.log(' --- timeout(Não encontrou rodinha, continuando...)')}} else { if (!interrompido) {
            if (debug) {console.log("Esperando rodinha")};
			
        }}}))
        .then(await pegar_elemento(document, '[data-garden-id="modals.body"] div.fixed-headers-container', '*', 60).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Tabela carregou")};
			
        }}}));
				
		await esperar(2); // Extrair
		
        await pegar_elemento(document, '[aria-label="export"]', '*', 15).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Click opções")};
            elm.click();
			
        }}})
		.then(await pegar_elemento(document, '[data-garden-id="dropdowns.menu.item"][tabindex="-1"]', '*', 15).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout'); interrompido=true} else { if (!interrompido) {
            if (debug) {console.log("Selecionar excel")};
            elm.click();
			
        }}}));
		

        if (!interrompido){
            if (await sucesso_download()){
                processando = false;
            };
        } else {
			await pegar_elemento(widget, 'div.kpi-first-measure > div', '*', 30).then((elm) => { if (elm == 'timeout') {console.log(' --- Timeout FORA'); interrompido=true} else { if (!interrompido) {
				if (debug) {console.log("Clicando fora")};
				elm.click();
			}}})
		};
    };
};

function pad(toPad, padChar, length) {
	return (String(toPad).length < length) ? new Array(length - String(toPad).length + 1).join(padChar) + String(toPad) : toPad;
}

console.log('----------------------------------------------------------------------------');
var debug = true;
var copiar_texto = copy;
var minuto_anterior = 00;

console.log('0');
await esperar(5);
document.body.style.zoom = "65%";
await esperar(30);
console.log('1');

//----------------------------------------------------------------------------------- Extrator
if (true) {
	d_i	= -1 //desvio_inicio
	d_fa= -4 //desvio_final (acumulado)
	d_f = new Date().getDate() <= 1 ? (new Date().getDate())*-1 : (new Date().getDate()-1)*-1 ; //desvio_final (intervalado)

	widgets = manter_apenas_widgets([ 81, 11, 45, 73, 123, 101, 107 ], ['bookmark', 'timeFilter']);
	
	SLA 	= {n:'SLA', 	w:widgets[0], c:[]}
	NPS 	= {n:'NPS', 	w:widgets[2], c:["ID do ticket", "Resolução do ticket - Carimbo de data/hora"]}
	CRIADOS = {n:'CRIADOS', w:widgets[1], c:["ID do ticket", "Criação do ticket - Carimbo de data/hora", "Nome do status personalizado do ticket"]}
	TRATADOS= {n:'TRAT',	w:widgets[2], c:["ID do ticket", "Formulário de ticket", "(New) Árvore Motivos V2.0", "Criação do ticket - Carimbo de data/hora", "Resolução do ticket - Carimbo de data/hora", "Login dos Agentes"]}
	TMTS	= {n:'TMTS', 	w:widgets[4], c:["ID do ticket"]}
	TAGS	= {n:'TAGS', 	w:widgets[2], c:["ID do ticket", "Tags de ticket"]}
	REIN48H = {n:'REIN48h', w:widgets[5], c:["ID do ticket"]}
	REIN30D = {n:'REIN30d', w:widgets[6], c:["ID do ticket"]}
	RES 	= {n:'RES', 	w:widgets[3], c:["ID do ticket"]}
	


	tribos =[{tribo_zendesk: 'TEMPLATE',						tribo_python: 'N/A',		passos: {acumulado: {p: 0, i:d_i, f: -0, bases:[]}, 	intervalado: {p: 0, 	 i:d_i, f: -0,  bases:[]}}}
			,{tribo_zendesk: '0800 Premium', 					tribo_python: 'PREMIUM',	passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS]}}}
			,{tribo_zendesk: 'Central de Ajuda - Autenticação',	tribo_python: 'CA_AUTH',	passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: 4, 	 i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, RES]}}}
			,{tribo_zendesk: 'Central de Ajuda - Produtos',		tribo_python: 'CA_PROD',	passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: 4, 	 i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, RES]}}}
			,{tribo_zendesk: 'Chat Serasa',						tribo_python: 'CHAT', 		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: 4, 	 i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS]}}}
			,{tribo_zendesk: 'Suporte PJ', 						tribo_python: 'SSU', 		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS]}}}
			,{tribo_zendesk: 'ReclameAQUI',						tribo_python: 'RA', 		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS]}}}
			,{tribo_zendesk: 'Consumidor.GOV',					tribo_python: 'GOV',		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS]}}}
			];
/*
	tribos =[{tribo_zendesk: 'TEMPLATE',						tribo_python: 'N/A',		passos: {acumulado: {p: 0, i:d_i, f: -0, bases:[]}, 	intervalado: {p: 0, 	 i:d_i, f: -0,  bases:[]}}}
			,{tribo_zendesk: 'Central de Ajuda - Autenticação',	tribo_python: 'CA_AUTH',	passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: 4, 	 i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS, REIN48H, REIN30D, RES]}}}
			,{tribo_zendesk: 'Central de Ajuda - Produtos',		tribo_python: 'CA_PROD',	passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: 4, 	 i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS, REIN48H, REIN30D, RES]}}}
			,{tribo_zendesk: 'Chat Serasa',						tribo_python: 'CHAT', 		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: 4, 	 i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS]}}}
			,{tribo_zendesk: 'Suporte PJ', 						tribo_python: 'SSU', 		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS, REIN48H, REIN30D]}}}
			,{tribo_zendesk: 'ReclameAQUI',						tribo_python: 'RA', 		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS, REIN48H, REIN30D]}}}
			,{tribo_zendesk: 'Consumidor.GOV',					tribo_python: 'GOV',		passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS, REIN48H, REIN30D]}}}
			,{tribo_zendesk: '0800 Premium', 					tribo_python: 'PREMIUM',	passos: {acumulado: {p: 1, i:d_i, f: d_fa, bases:[SLA]}, intervalado: {p: d_f*-1, i:d_i, f: d_f, bases:[CRIADOS, TRATADOS, TMTS, TAGS, REIN48H, REIN30D]}}}
			,{tribo_zendesk: 'Consumer Care',					tribo_python: 'CONSUMER',	passos: {acumulado: {p: 0, i:d_i, f: -0, bases:[]}, 	intervalado: {p: 4, 	 i:d_i, f: -4,  bases:[NPS]}}}
			];
//	@*@ - REP_GOV_0
//	@*@ - REP_RA_0

*/


	console.log('2');
	for (let tribo of tribos){
		console.log(tribo['tribo_zendesk']);
		if (tribo['tribo_zendesk'] == 'TEMPLATE') { continue }
		if (true) {
			passo = tribo['passos']['acumulado']
			desvio_inicio = passo['i']
			desvio_final = passo['f']
			desvio = passo['f']
			step = passo['p']
			await filtrar_tribo(tribo['tribo_zendesk']);
			console.log(`//--------- ${tribo['tribo_zendesk']} (Passo: acumulado) (f:${desvio_final} | p:${step})`)
			while (desvio <= desvio_inicio) {
				console.log(`- - - (${desvio}/${desvio_final})`)
				var desvio_mes = data('d', desvio)[1] - data('m-inicio', 0)[1];
				await filtrar_data(data('m-inicio', desvio_mes),data('d', desvio));
				for (let base of passo['bases']){
					data_formatada = ''.concat(pad(data('d', desvio)[0], 0, 2), '-', pad(data('d', desvio)[1], 0, 2), '-', pad(data('d', desvio)[2], 0, 2))
					arquivo = `@*@ - ${data_formatada}\\${base['n']}_${tribo['tribo_python']}`;
					console.log(`//------ ${arquivo}`)
					if (base['c'].length > 0){ 
						await extracao_detalhada(base['w'], base['c']) 
					} else { 
						await extracao_direta(base['w']) 
					};
					copiar_texto(arquivo);
					desvio += step;
				};
			};
		};
		if (true) {
			passo = tribo['passos']['intervalado']
			desvio_inicio = passo['i']
			desvio_final = passo['f']
			step = passo['p']
			await filtrar_tribo(tribo['tribo_zendesk']);
			console.log(`//--------- ${tribo['tribo_zendesk']} (Passo: intervalado) (f:${desvio_final} | p:${step})`)
			for (let i=desvio_inicio, loop=0; i>desvio_final-(step%desvio_final); i=i-step-1, loop=loop+1) {
				e = i-step < desvio_final ? desvio_final : i-step		
				if (e > i) { continue; };
				console.log(` - - - (${i}/${desvio_final})`)
				await filtrar_data(data('d', e),data('d', i));
				for (let base of passo['bases']){
					arquivo = `@*@ - ${base['n']}_${tribo['tribo_python']}_${loop}`;
					console.log(`//------ ${arquivo}`)
					if (base['c'].length > 0){ 
						await extracao_detalhada(base['w'], base['c']) 
					} else { 
						await extracao_direta(base['w']) 
					};
					copiar_texto(arquivo);
				};
			};
		};
	};
	console.log('#### Trafego Concluído ####');

}
