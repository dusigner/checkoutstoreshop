import $ from 'jquery';
import 'slick-carousel/slick/slick.min.js';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { rootPath } from './utils/_rootPath';

export default class TopBanners {
  constructor() {
    this.autoplay = true;
    this.sliderRef = null;
  }

  toggleAutoplay() {
    if (this.autoplay) {
      this.sliderRef.slick('slickPause');
    } else {
      this.sliderRef.slick('slickPlay');
    }
    this.autoplay = !this.autoplay;

    const toggleAutoplayButton = document.querySelector('.toggleAutoplay');
    const icon = toggleAutoplayButton.querySelector('.icon');
    icon.className = this.autoplay ? 'icon iconPause' : 'icon iconPlay';
  }

  async getTopBanners() {
    var sendData = {
      acronym: 'TB',
      fields: 'isImage,imageurldesktop,imageurlmobile,text',
    };

    try {
      const response = await $.ajax({
        url: `${rootPath()}/pvt/get/searchDocuments`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(sendData),
      });
      this.setData(response);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  }

  setData(data) {
    const sliderSlides = data.map(item => {
      if (item.isImage) {
        return `<div class="sliders">
                  <img class="desktopImage" src="${item.imageurldesktop}">
                  <img class="mobileImage" src="${item.imageurlmobile}">
                </div>`;
      } else {
        return `<div>${item.text}</div>`;
      }
    });

    this.injectSliderToHeader(sliderSlides);

    this.sliderRef = $('.slider');

    this.sliderRef.slick({
      dots: false,
      arrows: false,
      autoplay: this.autoplay,
      autoplaySpeed: 3000,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
    });
  }

  injectSliderToHeader(sliderSlides) {
    const header = document.querySelector('header');

    const topBannersContainer = document.createElement('div');
    topBannersContainer.className = 'topBanners';

    const topBannersWrapper = document.createElement('div');
    topBannersWrapper.className = 'topBannersWraper';

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider';

    sliderContainer.innerHTML = sliderSlides.join('');

    const toggleAutoplayButton = document.createElement('button');
    toggleAutoplayButton.className = 'toggleAutoplay';
    toggleAutoplayButton.addEventListener('click', () => this.toggleAutoplay());

    const iconPause = document.createElement('span');
    iconPause.className = 'icon iconPause';

    const iconPlay = document.createElement('span');
    iconPlay.className = 'icon iconPlay';

    const icon = this.autoplay ? iconPause : iconPlay;
    toggleAutoplayButton.appendChild(icon);

    topBannersWrapper.appendChild(sliderContainer);
    topBannersWrapper.appendChild(toggleAutoplayButton);
    topBannersContainer.appendChild(topBannersWrapper);

    header.appendChild(topBannersContainer);
  }

  init() {
    this.getTopBanners();
  }
}
