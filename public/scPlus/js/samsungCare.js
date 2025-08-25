
class SamsungCarePlus {
    static instance;
    options = []
    mainProductSkuId = null;
    selectedItem = null;

    constructor() {
        if (!window.__ssgCareListenerAttached) {
            window.addEventListener('ssg-care', (event) => {
                const detail = event.detail;
                this.mainProductSkuId = detail.skuId
                this.init()
            });
            window.__ssgCareListenerAttached = true;
        }
    }

    static getInstance() {
        if (!SamsungCarePlus.instance) {
          SamsungCarePlus.instance = new SamsungCarePlus();
        }
        return SamsungCarePlus.instance;
    }

    rootPath() {
        return window?.__RUNTIME__?.rootPath ? window.__RUNTIME__.rootPath : ''
    }
      
    init(){
        try {
            this.insertModal();
            this.getSCPlusSimilars();
            this.start();
        }catch(e) {
            console.log("SamsungCarePlus init error =>", e)
        }
    }
    
    formatCurrencyBRL(_value, _division = true) {
        if(!_value) return null
        const price = (_value / (_division ? 100 : 1)).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        })
    
        return price
    }
  

    getSCPlusSimilars() {
        try {
            const _this = this;
            const skuId = this.mainProductSkuId;
            const item = vtexjs?.checkout?.orderForm?.items?.find(item => item.id === this.mainProductSkuId);
            const productId = item?.productId;

            if (!skuId || !productId) {
                return;
            }

            const url = `${this.rootPath()}/api/catalog_system/pub/products/crossselling/similars/${productId}`;
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar complemento');
                return response.json();
            })
            .then(async data => {
                try {
                    const products = data;
                    const itemsInCart = vtexjs?.checkout?.orderForm?.items?.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                        seller: item.seller
                    }))

                    const options = []
                    for (const product of products) {
                        const item = product.items[0];
                        const getValidValue = (key) => {
                            const value = item[key];
                            return value && value[0] !== 'not-applicable' ? value[0] : '';
                        };
                        const { price, maxInstallment } =  await _this.simulateItem({
                            items: [
                                ...itemsInCart,
                                {
                                    id: item.itemId,
                                    quantity: 1,
                                    seller: "1"
                                }
                            ],
                            country: "BRA"
                        }, item.itemId)
                        const option = {
                            id: item.itemId,
                            price,
                            maxInstallment,
                            name: item.name,
                            isMainOption: item.name.includes('Proteção Completa'),
                            description: getValidValue('Descrição'),
                            eventoAcidental: getValidValue('Evento Acidental'),
                            eventoRoubo: getValidValue('Evento Roubo'),
                            franquiaADH: getValidValue('Franquia_ADH'),
                            franquiaSP: getValidValue('Franquia_SP'),
                            franquiaTHEFT: getValidValue('Franquia_THEFT'),
                            garantia: getValidValue('Garantia'),
                            segundaDescricao: getValidValue('Segunda Descrição'),
                            vigencia: getValidValue('Vigência'),
                            telaQuebrada: getValidValue('Evento Tela Quebrada')
                        }
                        options.push(option)
                    }

                    _this.options = options.sort((a, b) => {
                        const nameA = a.name.toUpperCase();
                        const nameB = b.name.toUpperCase();

                        if(nameA === 'PROTEÇÃO COMPLETA' && nameB !== 'PROTEÇÃO COMPLETA'){
                            return -1
                        } else if (nameB === 'PROTEÇÃO COMPLETA' && nameA !== 'PROTEÇÃO COMPLETA'){
                            return 1;
                        }else {
                            return nameA.localeCompare(nameB);
                        }
                    });
                    _this.selectedItem = _this.options[0].id
                    _this.renderOptions();
                }catch(e) {
                    console.log("error during simulation =>", e)
                }
            })
            .catch(error => {
                console.error('Erro ao buscar complemento do SKU:', error);
            });
        }catch(e) {
            console.log("getSCPlusSimilars error =>", e)
        }
    }

    insertModal() {
        if (!document.getElementById('ssg-care-modal')) {
            const modalHTML = `
                <div id="ssg-care-backdrop" class="ssg-care-backdrop">
                    <div id="ssg-care-modal" class="ssg-care-modal">
                        <button id="ssg-care-close" class="ssg-care-close" aria-label="Fechar modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M19.7925 2.7925L12 10.585L4.20748 2.7925L2.79248 4.2075L10.585 12L2.79248 19.7925L4.20748 21.2075L12 13.415L19.7925 21.2075L21.2075 19.7925L13.415 12L21.2075 4.2075L19.7925 2.7925Z" fill="black"/>
                            </svg>
                        </button>
                        <h2 class="ssg-care-title">Samsung Care+</h2>
                        <p class="ssg-care-content">Contrate o seguro Samsung Care+ e proteja seu aparelho</p>
                        <div class="ssg-care-options" id="ssg-care-options-list">
                        <div class="ssg-care-skeleton-placeholder" id="ssg-care-skeleton-placeholder"></div>
                        </div>
                        <div class="ssg-care-benefit">
                            <div>
                                <img class="ssg-care-benefit-image" src="https://samsungbrshop.vtexassets.com/assets/vtex.file-manager-graphql/images/8ba2fef8-dbed-46ee-8072-992e27e9c446___8f8a5e54e6135417dd0d9792b6576e02.png" alt="beneficio"/>
                            </div>
                            <div>
                                <b>Benefício Grátis: Cadeado Galaxy</b><br/>
                                Bloqueio total dos seus dados em segundos em caso de perda ou roubo.
                            </div>
                        </div>
                        <div class="ssg-care-terms">
                            <b>Termos e Condições</b><br/>
                            <small>
                                Ao confirmar a compra, declaro que li e concordo com as informações contidas nos links das
                                <a href="https://samsung.com.br/docs/samsungcareplus/Condicoes_gerais.pdf">Condições Gerais do Seguro</a> e o 
                                <a href="https://samsung.com.br/docs/samsungcareplus/Termo_autorizacao_de_cobranca.pdf">Termo de Autorização de Pagamento de Prêmio</a>. 
                                Declaro que estou ciente sobre a <a href="https://samsung.com.br/docs/samsungcareplus/Termos_LGPD.pdf">coleta e o tratamento de meus dados pessoais</a>, 
                                e confirmo que todas as informações fornecidas são verdadeiras. 
                                <a href="https://samsung.com.br/docs/samsungcareplus/Informacoes_legais.pdf">Informações legais do seguro.</a>
                            </small>
                        </div>
                        <div class="ssg-care-actions">
                            <button class="ssg-care-btn ssg-care-btn-cancel">Cancelar</button>
                            <button class="ssg-care-btn ssg-care-btn-confirm" disabled>Confirmar</button>
                        </div>
                    </div>
                </div>
            `;
            $('body').append(modalHTML);
        }
    }

    setSelectedItem(index) {
        this.selectedItem = this.options?.[index]?.id;
    
        const optionsList = document.getElementById('ssg-care-options-list');
        if (!optionsList) return;
    
        optionsList.querySelectorAll('.ssg-care-option').forEach((opt, idx) => {
            const isSelected = idx === index;
            opt.classList.toggle('ssg-care-option--selected', isSelected);
    
            const details = opt.querySelector('.ssg-care-option-details');
            if (details) {
                details.style.display = isSelected ? 'block' : 'none';
            }
        });

        this.renderOptions(); 
    }

    renderOptions() {
        try {
            const optionsList = document.getElementById('ssg-care-options-list');
            const buttonConfirm = document.querySelector('.ssg-care-btn-confirm');
            if (!optionsList) return;
            optionsList.innerHTML = '';
            this.options.forEach((opt, idx) => {
                const isSelected = this.selectedItem === opt.id
                const selectedClass = isSelected ? 'ssg-care-option--selected' : '';
                const detailsDisplay = isSelected ? 'block' : 'none';
                const optionDiv = document.createElement('div');
                optionDiv.className = `ssg-care-option ${selectedClass}`;
                optionDiv.setAttribute('data-index', idx);
                const showFranquias = (opt.franquiaTHEFT) || (opt.franquiaADH )
                optionDiv.innerHTML = `
                    <div class="ssg-care-option-header ${opt.isMainOption ? "ssg-main-option" : ""}">
                        <span class="ssg-care-option-icon">
                            ${isSelected ? 
                                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M1.38358 13.9935C2.3812 16.1301 4.13716 17.8198 6.31055 18.7346C7.47792 19.2278 8.73263 19.481 9.99993 19.4792C12.358 19.479 14.6318 18.6025 16.38 17.0201C18.1282 15.4376 19.226 13.262 19.4603 10.9156C19.6946 8.56922 19.0487 6.21948 17.6479 4.32257C16.2472 2.42565 14.1915 1.11691 11.8801 0.650418C9.56864 0.183925 7.16632 0.592967 5.1395 1.79813C3.11268 3.0033 1.60599 4.91859 0.911929 7.17219C0.217869 9.42578 0.385965 11.8569 1.38358 13.9935Z" fill="#2189FF"/>
                                    <path d="M5.73604 8.7525L5 9.48958L9.21854 13.7033L15.319 7.6125L14.5827 6.875L9.21896 12.2317L5.73604 8.7525Z" fill="white"/>
                                </svg>` :
                                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5.81983 18.7638C3.64644 17.849 1.89048 16.1593 0.89286 14.0227C-0.104757 11.8861 -0.272853 9.45496 0.421206 7.20137C1.11527 4.94777 2.62196 3.03247 4.64878 1.82731C6.67559 0.622146 9.07792 0.213104 11.3894 0.679596C13.7008 1.14609 15.7565 2.45483 17.1572 4.35174C18.558 6.24866 19.2039 8.59839 18.9696 10.9448C18.7353 13.2912 17.6375 15.4668 15.8893 17.0492C14.1411 18.6317 11.8673 19.5081 9.50921 19.5083C8.24191 19.5102 6.9872 19.257 5.81983 18.7638ZM6.22504 2.25459C4.29034 3.06894 2.72726 4.57314 1.83926 6.47516C0.951251 8.37718 0.801682 10.5413 1.41959 12.5474C2.03749 14.5535 3.37878 16.2584 5.18306 17.3312C6.98733 18.404 9.12586 18.768 11.1835 18.3527C13.2411 17.9373 15.0709 16.7723 16.3178 15.0836C17.5647 13.395 18.1396 11.3033 17.931 9.21455C17.7223 7.12584 16.745 5.18917 15.1887 3.78054C13.6325 2.3719 11.6083 1.5918 9.50921 1.59168C8.38109 1.58999 7.26417 1.81544 6.22504 2.25459Z" fill="#8F8F8F"/>
                                </svg>`
                            }
                        </span>
                        <span class="ssg-care-option-title">${opt.name}</span>
                        ${opt.isMainOption ? '<span class="ssg-care-option-recomended">Recomendado</span>' : ''}
                        <span class="ssg-care-option-price">${opt.maxInstallment} de ${this.formatCurrencyBRL(opt.price / opt.maxInstallment, true)} / ${this.formatCurrencyBRL(opt.price, true)} à vista</span>
                        <span class="ssg-care-option-open-close-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.99995 15.261L2.42725 7.5752L3.61475 6.40541L9.99995 12.8865L16.3856 6.40541L17.5731 7.5752L9.99995 15.261Z" fill="black"/>
                            </svg>
                        </span>
                    </div>
                    <div class="ssg-care-option-details" style="display:${detailsDisplay}">
                        ${opt.description && '<b>Cobertura</b>'}
                        <ul>
                            ${opt.description && `<li>${opt.description}</li>`}
                            ${opt.segundaDescricao && `<li>${opt.segundaDescricao}</li>`}
                            ${showFranquias && (`
                                <li>Franquias:</li>
                                <ul>
                                    ${opt.franquiaTHEFT && `<li>Roubo ou Furto: ${opt.franquiaTHEFT} (${opt.eventoRoubo || 1} evento por ano)</li>`}
                                    ${opt.franquiaADH && `<li>Danos Acidentais: ${opt.franquiaADH} (${opt.eventoAcidental || 2} eventos por ano)</li>`}
                                </ul>
                            `)}
                            ${opt.telaQuebrada && `<li>${opt.telaQuebrada} eventos por ano de Quebra de Tela</li>`}
                            ${opt.vigencia && `<li>Vigência de seguro: ${opt.vigencia} meses</.i>`}
                        </ul>
                        ${opt.garantia && `<b>Garantia:</b> ${opt.garantia}<br/>`}
                    </div>
                `;
                optionsList.appendChild(optionDiv);
                buttonConfirm.removeAttribute('disabled')
            });
        }catch(e) {
            console.log("renderOptions error =>", e)
        }
    }

    async simulateItem(payload, scItemId){
        return fetch(`${this.rootPath()}/api/checkout/pub/orderForms/simulation`, {
            method: "POST",
            body: JSON.stringify(payload)
        })
        .then(resp => resp.json())
        .then(data => {
            const installmentsVisa = data?.paymentData?.installmentOptions?.find(option => option.paymentSystem === '2')
            const maxInstallment = installmentsVisa?.installments?.reduce((acc, installment) => {
                return installment.count < (acc.count ?? 0) ? acc : installment
            }, {})

            return {
                maxInstallment: maxInstallment?.count,
                price: data?.items?.find(item => item.id === scItemId).price
            }
        }).catch(error => {
            console.error("error in simulation: ", error)
        })
    }

    addItem(closeModalFn) {
        const itemId = this.selectedItem;
        const mainProduct = vtexjs?.checkout?.orderForm?.items?.find(item => item.id === this.mainProductSkuId);
        const referenceId = mainProduct?.refId;
        const seller = mainProduct?.seller;

        window.vtexjs?.checkout?.addToCart([
            {
                id: itemId,
                quantity: 1,
                seller: seller,
                attachments: [
                    {
                      name: 'linkSCPLUS',
                      content: {
                        idsku: this.mainProductSkuId,
                        refId: referenceId || ''
                      }
                    }
                ]     
            },
        ]).then(() => {
            closeModalFn();
            const buttonConfirm = document.querySelector('.ssg-care-btn-confirm');
            buttonConfirm.removeAttribute('disabled')
        })
    }

    start() {
        const modalBackdrop = document.getElementById('ssg-care-backdrop');
        const closeBtn = document.getElementById('ssg-care-close');
        const cancelBtn = document.querySelector('.ssg-care-btn-cancel');
        const confirmBtn = document.querySelector('.ssg-care-btn-confirm');
        const optionsList = document.getElementById('ssg-care-options-list');

        if (this.options && this.options.length) {
            this.renderOptions();
        }

        function closeModal() {
            if (modalBackdrop) modalBackdrop.style.display = 'none';
        }

        if (closeBtn) closeBtn.onclick = closeModal;
        if (cancelBtn) cancelBtn.onclick = closeModal;
        if (modalBackdrop) {
            modalBackdrop.onclick = function (e) {
                if (e.target === modalBackdrop) closeModal();
            };
        }

        if (optionsList) {
            optionsList.onclick = (e) => {
                const optionDiv = e.target.closest('.ssg-care-option');
                if (!optionDiv) return;
                const idx = Number(optionDiv.getAttribute('data-index'));
                this.setSelectedItem(idx);
            };
        }

        if (optionsList) {
            optionsList.querySelectorAll('.ssg-care-option').forEach((opt, idx) => {
                const details = opt.querySelector('.ssg-care-option-details');
                if (opt.classList.contains('ssg-care-option--selected')) {
                    if (details) details.style.display = 'block';
                } else {
                    if (details) details.style.display = 'none';
                }
            });
        }

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.addItem(closeModal)
                const buttonConfirm = document.querySelector('.ssg-care-btn-confirm');
                buttonConfirm.setAttribute('disabled')
            };
        }

        if (modalBackdrop) {
            modalBackdrop.style.display = 'flex';
        }
    }
};

SamsungCarePlus.getInstance().init();