import { FlipDown } from "./src/flipdown"

/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

export default class CountDown {

  constructor() {
    this.data = undefined
  }

  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  async getData() {

    if(!this.data){
      try{
        this.data = await fetch(`${this.rootPath()}/_v/get/countdown`)
        .then(resp => resp.json())
        .then(resp => {
          if(resp.isActive){
            this.data = resp
            this.createElement()
          }
        })

        

      }catch(error){
        console.log('Erro ao consultar o countdown', error)
      }
    }
  }

  async createElement() {
    const container = document.querySelector('.container-main')

    if (container && !document.querySelector('#samsungCountdown')) {
      const countdownHTML = `
        <section class="samsungCountdown" id="samsungCountdown">
          <div class="samsungCountdownContent">
            <div class="samsungCountdownTextContent">
              <p class="samsungCountdownText">${this.data.text}</p>
              <p class="samsungCountdownLegend">Garanta agora em:</p>
            </div>
            <div class="samsungCountdownTimer">
              <div id="flipdown" class="flipdown"></div>
            </div>
          </div>
        </section>
      `;

      container.insertAdjacentHTML('beforebegin', countdownHTML);

      this.insertCountDown();
    }
  }

  insertCountDown() {
      const minutes = this.data.time
      const time = Date.now()
      const downTime = Math.floor(time / 1000) + (minutes * 60)

      new FlipDown(downTime, {
        headings: ["Dias", "Hora", "Minutos", "Segundos"],
        hideDays: true
      })
      .start()
      .ifEnded(() => {
        document.querySelector('#samsungCountdown').remove()
      });
  }

  async init() {
    
    if(this.data == undefined){
      await this.getData()
    }
  }
  
}
