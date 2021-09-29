/* eslint-disable import/extensions */
import { fetchPhotographer, getMediasFromPhotographer, factory } from './functions.js';

let photographerData = [];
let mediaData = [];
export const pageId = new URLSearchParams(window.location.search).get('id');

export const photographerBannerDisplay = async () => {
  photographerData = await fetchPhotographer();
  const getPhotographerId = photographerData.find((element) => element.id === parseInt(pageId, 10));
  const tags = [];
  for (let i = 0; i < getPhotographerId.tags.length; i += 1) {
    tags.push(
      `  <li><a href="#" class="tag" data-tag="${getPhotographerId.tags[i]}">#${getPhotographerId.tags[i]}</a></li>`,
    );
  }

  document.querySelector('.photographer-banner').innerHTML = `
      
  <div class="photographer-banner__description">
  <h1 class="photographer-banner__name profile-name">${
  getPhotographerId.name
}</h1>
  <div>
      <p class="photographer-banner__location profile-location">${
  getPhotographerId.city
}, ${getPhotographerId.country}</p>
      <p class="photographer-banner__tagline">${getPhotographerId.tagline}</p>
  </div>
   <ul>
       <li><a href="#" class="tags" data-tags=""></a>${tags.join('')}</li>
       <span></span>
   </ul>
 </div>
 <button class="modal-btn btn">Contactez-moi</button>
 <img src="images/photographers/${
  getPhotographerId.portrait
}" class="profile-image" alt="">
 `;
};
photographerBannerDisplay();

export const mediaDisplay = async (filter) => {
  mediaData = await getMediasFromPhotographer(pageId);
  // Trier les médias en fonction du filtre
  if (filter === 'Popularité') {
    mediaData.sort((a, b) => (a.likes < b.likes ? 1 : -1));
  } else if (filter === 'Date') {
    mediaData.sort((a, b) => (a.date < b.date ? 1 : -1));
  } else if (filter === 'Titre') {
    mediaData.sort((a, b) => (a.title > b.title ? 1 : -1));
  }

  // Afficher les images en fonction de l'id du photographe
  const mediaContainer = document.querySelector('.media-display');
  mediaContainer.innerHTML = '';
  mediaData.forEach((element) => {
    const media = factory(element);
    mediaContainer.innerHTML += media.displayList();
  });
};

// Dropdown
const toggle = document.querySelector('.dropdown__toggle');
const menu = document.querySelector('.dropdown__menu');

const toggler = (expand = null) => {
  const display = expand === null ? menu.getAttribute('aria-expanded') !== 'true' : expand;

  menu.setAttribute('aria-expanded', display);

  if (display) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
};

toggle.addEventListener('click', () => {
  toggler();
});

const option = menu.querySelectorAll('li');

const setValue = (element) => {
  const elt = element;
  const elementContent = element.textContent;
  const toggleContent = toggle.textContent;
  toggle.textContent = elementContent;
  elt.textContent = toggleContent;
  mediaDisplay(toggle.innerText);
  toggler(false);
};
option.forEach((item) => {
  item.addEventListener('click', () => setValue(item));
});
//Lightbox
mediaDisplay('Popularité').then(() => {
  const links = document.querySelectorAll('a[href$=".jpg"], a[href$=".mp4"');
  const lightbox = document.querySelector('.lightbox');
  const lightboxContainer = document.createElement('div');

  // Créer le container de la lightbox
  lightboxContainer.classList.add('lightbox__container');
  lightbox.appendChild(lightboxContainer);

  const close = () => {
    lightbox.classList.add('close');
    document.removeEventListener('keyup', onKeyUp);
  };
  const onKeyUp = (e) => {
    if (e.key === 'Escape') {
      close();
    }
  };

  const createMedia = (media) => {
    lightboxContainer.innerHTML = '';
    const mediaLightbox = factory(media);
    lightboxContainer.innerHTML += mediaLightbox.displayLightbox();
    let i = mediaData.findIndex((element) => element.id === media.id);

    // Navigation dans la lightbox
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    window.addEventListener('keyup', onKeyUp);
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => {
      if (i === mediaData.length - 1) {
        i = 0;
      } else {
        i += 1;
      }
      createMedia(mediaData[i]);
    });
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => {
      if (i === 0) {
        i = mediaData.length - 1;
      } else {
        i -= 1;
      }
      createMedia(mediaData[i]);
    });
  };

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const mediaId = mediaData.find((elt) => elt.id === parseInt(e.currentTarget.dataset.id, 10));

      e.preventDefault();
      lightbox.classList.remove('close');
      createMedia(mediaId);
    });
  });
});
