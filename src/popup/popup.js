//--------------------------------------------------------------------------------------------------------------------
// this code will bind the modifyDOM function to the btnShowOrangeDiv click event
document.getElementById('btnRun').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: modifyDOM
        });
    });
});

// this code will be executed when the button btnShowOrangeDiv is clicked
async function modifyDOM() {
    try {
        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('Base Utils');

        function data(intervalo, desvio) {
            if (intervalo == 'd') {
                var data = new Date();
                data.setDate(data.getDate() + desvio);

            } else if (intervalo == 'm-inicio') {
                var data = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                data.setMonth(data.getMonth() + desvio);

            } else if (intervalo == 'm-fim') {
                var data = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                data.setMonth(data.getMonth() + desvio);
                data = new Date(data.getFullYear(), data.getMonth() + 1, 0);
            };

            var y = data.getUTCFullYear();
            var m = data.getUTCMonth() + 1; // Janeiro é "0", por isso o +1
            var d = data.getUTCDate();

            return [y, m, d]
        };

        async function pegar_elemento(raiz, selector, content, timeout, multiple) {
            content = String(content);
            if (content.startsWith('[num->')) {
                var num = parseInt(content.substring(content.indexOf("[num->") + 6, content.lastIndexOf("<-num]")));
                if (debug) { console.log(content.substring(0, content.lastIndexOf("<-num]") + 6)) };
                if (debug) { console.log(num) };
                content = content.substring(content.lastIndexOf("<-num]") + 6)
                if (debug) { console.log(content) };
            } else {
                var num = 0;
            }

            timeout = timeout * 1000;
            timeout_promise = new Promise(resolve => {
                setTimeout(() => {
                    return resolve('timeout');
                }, timeout);
            });

            encontrar_elm = new Promise(resolve => {
                if (content.endsWith('*')) {
                    if (raiz.querySelector(selector)) {
                        if (multiple) {
                            return resolve(raiz.querySelectorAll(selector));
                        } else {
                            return resolve(raiz.querySelectorAll(selector)[num]);
                        }
                    };

                    const observer = new MutationObserver(mutations => {
                        if (raiz.querySelector(selector)) {
                            if (multiple) {
                                return resolve(raiz.querySelectorAll(selector));
                            } else {
                                return resolve(raiz.querySelectorAll(selector)[num]);
                            }
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

            return Promise.race([encontrar_elm, timeout_promise]);
        };

        function esperar_tempo(s) {
            ms = s * 1000;
            return new Promise(resolve => setTimeout(resolve, ms));
        };

        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('Compound Utils');

        async function esperar_relatorio() {
            if (debug) { console.log("Esperando relatório carregar...") };

            await esperar_tempo(2);

            var carregando = true;
            while (carregando) {
                var interrompido = false;
                await pegar_elemento(document, 'bime-dots-loader', '*', 2).then((elm) => {
                    if (elm == 'timeout') { interrompido = true } else {
                        if (!interrompido) {
                            if (debug) { console.log("...") };
                        }
                    }
                });
                if (interrompido) {
                    if (debug) { console.log("Carregado!") };
                    carregando = false;
                    processando = false;
                } else {
                    await esperar_tempo(2);
                };
            };
        };

        async function sucesso_download() {
            var sucesso = false;

            var processando = true;
            while (processando) {
                var interrompido = false;
                await pegar_elemento(document, "#notifications-portal > div > div", '*', 30).then((elm) => {
                    if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                        if (!interrompido) {
                            if (debug) { console.log("Aguardando download...") };
                        }
                    }
                });

                if (!interrompido) {
                    processando = false;
                };
            };

            var processando = true;
            var falha = false
            while (processando) {
                var interrompido = false;
                await pegar_elemento(document, "#notifications-portal div div", '*', 2).then((elm) => {
                    if (elm == 'timeout') { interrompido = true } else {
                        if (!interrompido) {
                            if (debug) { console.log("...") };
                        }
                    }
                })
                    .then(await pegar_elemento(document, "#notifications-portal div div div", 'Falha ao baixar', 2).then((elm) => {
                        if (elm == 'timeout') { } else {
                            if (!interrompido) {
                                if (debug) { console.log("Falhou!") };
                                document.querySelector("#notifications-portal div div button").click();
                                falha = true
                            }
                        }
                    }));

                if (interrompido) {
                    if (falha) {
                        if (debug) { console.log("Download Falhou!") };
                        return false;
                    } else {
                        if (debug) { console.log("Sucesso!") };
                        return true;
                    }
                };
            };
        };

        async function exportar_excel() {
            var processando = true;
            while (processando) {
                console.log('- Extraindo...');
                var interrompido = false;


                await pegar_elemento(document, '[data-test-id=query-builder-save-menu-dropdown]', '*', 30).then((elm) => {
                    if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                        if (!interrompido) {
                            if (debug) { console.log("Clicando Dropdown") };
                            elm.click();

                        }
                    }
                })
                    .then(await pegar_elemento(document, '[data-test-id=save-menu-export-button]', '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                if (debug) { console.log("Clicando Exportar") };
                                elm.click();
                            }
                        }
                    }))
                    .then(await pegar_elemento(document, "label", 'CSV', 15).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                if (debug) { console.log("Desmarcando [CSV]") };
                                input = document.querySelector('[id=\'' + elm.getAttribute('for') + '\']');
                                if (input.checked == true) {
                                    elm.click();
                                };

                            }
                        }
                    }))
                    .then(await pegar_elemento(document, "label", 'Imagem', 1).then((elm) => {
                        if (elm == 'timeout') { } else {
                            if (!interrompido) {
                                if (debug) { console.log("Desmarcando [Imagem]") };
                                input = document.querySelector('[id=\'' + elm.getAttribute('for') + '\']');
                                if (input.checked == true) {
                                    elm.click();
                                };

                            }
                        }
                    }))
                    .then(await pegar_elemento(document, "label", 'PDF', 1).then((elm) => {
                        if (elm == 'timeout') { } else {
                            if (!interrompido) {
                                if (debug) { console.log("Desmarcando [PDF]") };
                                input = document.querySelector('[id=\'' + elm.getAttribute('for') + '\']');
                                if (input.checked == true) {
                                    elm.click();
                                };

                            }
                        }
                    }))
                    .then(await pegar_elemento(document, "label", 'Imagem e PDF', 1).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                if (debug) { console.log("Desmarcando [Imagem e PDF]") };
                                input = document.querySelector('[id=\'' + elm.getAttribute('for') + '\']');
                                if (input.checked == true) {
                                    elm.click();
                                };

                            }
                        }
                    }))
                    .then(await pegar_elemento(document, "label", 'Excel', 1).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                if (debug) { console.log("Marcando [Excel]") };
                                input = document.querySelector('[id=\'' + elm.getAttribute('for') + '\']');
                                if (input.checked == false) {
                                    elm.click();
                                }

                            }
                        }
                    }))
                    .then(await pegar_elemento(document, "[data-test-id=export-modal-export-button]", '*', 15).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                if (debug) { console.log("Clicando Exportar") };
                                elm.click();

                            }
                        }
                    }));

                if (!interrompido) {
                    if (await sucesso_download()) {
                        processando = false;
                    };
                };
            };
        };

        async function filtrar_data(nome_filtro, data) {
            var processando = true;
            var retorno = 'Ok!';

            while (processando) {
                if (debug) { console.log(console.log('- Filtrando data...')) };
                var interrompido = false;

                await esperar_tempo(2)
                    .then(() => { if (debug) { console.log("Clicando filtro de data") } })
                    .then(await pegar_elemento(document, '[bime-tooltip="' + nome_filtro + '"]', '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                elm.click();
                            }
                        }
                    }))
                    .then(await esperar_tempo(2))
                    .then(() => { if (debug) { console.log("Inserindo data '" + data + "' na barra de pesquisa") } })
                    .then(await pegar_elemento(document, "[placeholder='Pesquisar']", '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                elm.click();
                                elm.focus();
                                document.execCommand('selectAll')
                                document.execCommand('delete')
                                document.execCommand('insertText', false, data)
                            }
                        }
                    }))
                    .then(await esperar_tempo(3))
                    .then(() => { if (debug) { console.log("Clicando em 'Selecionar Tudo'") } })
                    .then(await pegar_elemento(document, '[ng-if="hierarchy.areAllMembersSelected === false"]', '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Checkbox não encontrada, continuando mesmo assim.'); } else {
                            if (!interrompido) {
                                elm.click();
                            }
                        }
                    }))
                    .then(await esperar_tempo(3))
                    .then(() => { if (debug) { console.log("Clicando em 'Anular Seleção de Todos'") } })
                    .then(await pegar_elemento(document, '[ng-if="hierarchy.areAllMembersSelected"]', '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                elm.click();
                            }
                        }
                    }))
                    .then(await esperar_tempo(2))
                    .then(() => { if (debug) { console.log("Clicando na data '" + data + "'") } })
                    .then(await pegar_elemento(document, "[bime-tooltip='" + data + "']", '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                elm.click();
                            }
                        }
                    }))
                    .then(await esperar_tempo(2))
                    .then(() => { if (debug) { console.log("Clicando 'Aplicar'") } })
                    .then(await pegar_elemento(document, '[ng-click="apply()"]', '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Timeout'); interrompido = true } else {
                            if (!interrompido) {
                                elm.click();
                            }
                        }
                    }))
                    .then(await esperar_tempo(2))
                    .then(() => { if (debug) { console.log("Checkando erros") } })
                    .then(await pegar_elemento(document, '[class="error-message"]', '*', 30).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Dados encontrados'); } else {
                            {
                                retorno = elm.innerHTML
                                elm.remove()
                                if (debug) { console.log("-- Erro: " + retorno) }
                            }
                        }
                    }))
                    .then(await esperar_tempo(2))
                    .then(() => { if (debug) { console.log("Clicando 'OK'") } })
                    //.then(await pegar_elemento(document, '[data-test-id="popup-save-button"]', '*', 30).then((elm) => {  if (elm == 'timeout') {console.log(' --- Dados encontrados');} else {{
                    //.then(await pegar_elemento(document, '[id="bimePopup-1"]', '*', 30).then((elm) => {  if (elm == 'timeout') {console.log(' --- Dados encontrados');} else {{
                    //.then(await pegar_elemento(document, '[ng-click="clickOk()"][id="bimePopup-1"]', '*', 30, true).then((elm) => {  if (elm == 'timeout') {console.log(' --- Dados encontrados');} else {{
                    .then(await pegar_elemento(document, '[class="btn btn-primary"]', '*', 30, true).then((elm) => {
                        if (elm == 'timeout') { console.log(' --- Dados encontrados'); } else {
                            {
                                elm.forEach((e) => { e.click() })
                                elm.forEach((e) => { e.click() }) // Three times for good luck
                                elm.forEach((e) => { e.click() })
                            }
                        }
                    }));
                if (!interrompido) {
                    processando = false;
                    return retorno
                };
            };
        };

        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('Setup');

        const div = document.createElement('div');
        div.id = 'GhastHandWarning'
        div.textContent = `DOM is currently being controlled by ${chrome.runtime.getManifest().name} v${chrome.runtime.getManifest().version}`;
        div.style.cssText = 'background-color: orange; color: black; font-weight: bold; padding: 10px; width: 100%; box-sizing: border-box;';
        document.body.insertAdjacentElement('afterbegin', div);
        document.body.style.zoom = "64%";
        console.log(div.textContent);

        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('Testing Recipe');

        var debug = true;

        console.log(0)
        await esperar_tempo(2);
        console.log(document.querySelector("#\\:R55ab\\: > span"))
        console.log(document.querySelector("#\\:R55ab\\: > span").click())
        await esperar_tempo(2)
        console.log(document.querySelector("#\\:rv\\:--label"))
        console.log(document.querySelector("#\\:rv\\:--label").click())
        await esperar_tempo(2)
        console.log(document.querySelector("#\\:R55ab\\: > span"))
        console.log(document.querySelector("#\\:R55ab\\: > span").click())
        await esperar_tempo(2)
        console.log(1)
        //Renomear download


        //console.log('---------------------------------------------------------------------------------------------------------');
        //console.log('Zendesk Recipe');

        ////-----------------------------------------------------------------------------------
        ////	[x] receita:  Extrair arquivo
        ////	[x] receita:  Filtrar data
        ////	[x] receita:  Filtrar e extrair sequencia de datas em loop
        ////	[x] extensão: Estrutura e funcionalidades já existentes
        ////	[x] extensão: Interceptar e renomear download
        ////	[ ] extensão: Botar string correta no nome do arquivo ("data_atual/data_filtrada.xlsx")
        ////	[ ] extensão: Organizar código e subir repo
        ////	[ ] extensão: Criar separação entre funções da extensão e receitas do usuário
        ////	[ ] receita:  Extrair histórico do último ano em pastas organizadinhas
        ////	[ ] receita:  Subir dados pro GitHub
        ////-----------------------------------------------------------------------------------

        //var debug = true;
        //desvio_inicio	= -0
        //desvio_fim		= -365
        //passo			= -1
        //
        //await pegar_elemento(document, 'div.column-left', '*', 30).then((elm) => { if(elm == 'timeout'){console.log(' --- Timeout')}else{elm.remove()}})
        //await pegar_elemento(document, 'div.column-right', '*', 30).then((elm) => { if(elm == 'timeout'){console.log(' --- Timeout')}else{elm.remove()}})
        //await pegar_elemento(document, '[class="btn btn-primary"]', '*', 30, true).then((elm) => { if(elm == 'timeout'){console.log(' --- Timeout')}else{elm[3].remove()}})
        //	
        //for (let desvio=desvio_inicio; desvio>=desvio_fim; desvio=desvio+passo) {
        //	d = data('d', desvio)
        //	d = d[0]+'-'+("00"+d[1]).slice(-2)+'-'+("00"+d[2]).slice(-2) 
        //	console.log(desvio + "/" + desvio_fim + "  -->  " + d);
        //	await esperar_relatorio();
        //	r = await filtrar_data('Atualização do ticket - Data', d);
        //	console.log('retorno ='+r)
        //	if (r == 'Ok!') {
        //		await esperar_relatorio();
        //		await exportar_excel();
        //	}
        //}

        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('Setdown');

        document.querySelectorAll('[id="GhastHandWarning"]').forEach((e) => { e.remove() });
        document.body.style.zoom = "100%";
        console.log('Ghast is done and down.');

    } catch (error) {
        console.error("Error:", error);
    }
}
