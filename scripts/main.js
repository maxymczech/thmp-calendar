import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js'
import { collection, getDocs, getFirestore, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js'

import * as THREE from './three.module.js';
import { OBJLoader } from './OBJLoader.js';
import lightsConfig from './lights-config.js';

import Swiper from './swiper.min.js';

(async () => {
  // Season functions
  function setSeason(d) {
    const m = d.getMonth();
    const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
    document.body.classList.remove('spring', 'summer', 'autumn', 'winter');
    document.body.classList.add(seasons[m]);
  }
  setSeason(new Date());

  // Initialize Firebase app
  const firebaseConfig = {
    apiKey: "AIzaSyBzswh9S2lilZ-VfGHL1cjFiIQoyqhIcgk",
    authDomain: "thmp-admin.firebaseapp.com",
    projectId: "thmp-admin",
    storageBucket: "thmp-admin.appspot.com",
    messagingSenderId: "549904307740",
    appId: "1:549904307740:web:b4737be98bdafde4d931d9"
  };
  const app = initializeApp(firebaseConfig);

  // Set up events
  const events = [];
  (async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(query(
      collection(db, "events"),
      orderBy('date', 'asc')
    ));
    querySnapshot.forEach(doc => {
      events.push(doc);
      const data = doc.data();
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      const d = data.date?.toDate?.();
      slide.innerHTML = `
        <div class="slider-item-wrap">
          <div class="slider-item">
            <div class="slider-item-flag" style="background-image: url(${data.flagUrl})"></div>
            <div class="slider-item-date">
              <span data-language="cs">${d.toLocaleDateString('cs', {month: 'long', day: 'numeric'})}</span>
              <span data-language="en">${d.toLocaleDateString('en', {month: 'long', day: 'numeric'})}</span>
              <span data-language="ua">${d.toLocaleDateString('uk', {month: 'long', day: 'numeric'})}</span>
            </div>
            <div class="slider-item-name">
              <span>
                <span data-language="cs">${data.name?.cs}</span>
                <span data-language="en">${data.name?.en}</span>
                <span data-language="ua">${data.name?.ua}</span>
              </span>
            </div>
          </div>
        </div>
      `;
      slide.addEventListener('click', () => selectEvent(doc));
      document.querySelector('#calendar-items-wrap .swiper-wrapper').append(slide);
    });
    if (events.length) {
      selectEvent(events[0]);
    }

    const swiper = new Swiper(document.querySelector('#calendar-items-wrap .swiper'), {
      breakpoints: {
        0: {
        },
        992: {
        }
      },
      loop: false,
      navigation: {
        nextEl: '#calendar-items-wrap .swiper-button-next',
        prevEl: '#calendar-items-wrap .swiper-button-prev'
      },
      slidesPerView: 3,
      spaceBetween: 15
    });
  })();

  function selectEvent(doc) {
    const data = doc.data();
    setSeason(data.date.toDate());

    const c1 = new THREE.Color(data.fixtures[1]);
    const c2 = new THREE.Color(data.fixtures[2]);
    const c3 = new THREE.Color(data.fixtures[3]);
    lights.base.forEach(light => { light.color = c1; });
    lights.shaft.forEach(light => { light.color = c2; });
    lights.top.forEach(light => { light.color = c3; });

    const detailCard = document.querySelector('#card-detail');
    if (detailCard) {
      detailCard.innerHTML = `
        <div class="detail-card-image" style="background-image: url(${data.pictureUrl})"></div>
        <div class="detail-card-title">
          <span data-language="cs">${data.name?.cs}</span>
          <span data-language="en">${data.name?.en}</span>
          <span data-language="ua">${data.name?.ua}</span>
        </div>
        <a href="#detail-full" data-fancybox class="btn-blue">
          <span data-language="cs">Dozvědět víc</span>
          <span data-language="en">Learn more</span>
          <span data-language="ua">Читати далі</span>
        </a>
      `;
      detailCard.style.display = 'block';
    }

    const d = data.date?.toDate?.();
    document.querySelector('#detail-full').innerHTML = `
      <div class="detail-full-top">
        <div class="detail-full-top-image" style="background-image: url(${data.pictureUrl})"></div>
        <div class="detail-full-top-rest">
          <div class="detail-full-top-date">
            <span data-language="cs">${d.toLocaleDateString('cs', {month: 'long', day: 'numeric'})}</span>
            <span data-language="en">${d.toLocaleDateString('en', {month: 'long', day: 'numeric'})}</span>
            <span data-language="ua">${d.toLocaleDateString('uk', {month: 'long', day: 'numeric'})}</span>
          </div>
          <div class="detail-full-top-event-type">
            <span data-language="cs">${data.type?.cs}</span>
            <span data-language="en">${data.type?.en}</span>
            <span data-language="ua">${data.type?.ua}</span>
          </div>
          <div class="detail-full-top-time">${data.time}</div>
          <div class="detail-full-top-flag">
            <div class="detail-full-top-flag-in" style="background-image: url(${data.flagUrl})"></div>
          </div>
          <div class="detail-full-top-name">
            <span data-language="cs">${data.name?.cs}</span>
            <span data-language="en">${data.name?.en}</span>
            <span data-language="ua">${data.name?.ua}</span>
          </div>
        </div>
      </div>
      <div class="detail-full-content"
        ><span data-language="cs">${data.description?.cs}</span
        ><span data-language="en">${data.description?.en}</span
        ><span data-language="ua">${data.description?.ua}</span
      ></div>
      <a href="javascript:void(0);" class="btn-blue" onclick="Fancybox.close();">
        <span data-language="cs">Zpět</span>
        <span data-language="en">Back</span>
        <span data-language="ua">Назад</span>
      </a>
    `;
  }

  // Set up 3D scene
  let camera, scene, renderer, object;
  const lights = {};
  const clock = new THREE.Clock();

  initTowerScene();
  animateTowerScene();

  function getRendererWidth() {
    return window.innerWidth;
  }

  function getRendererHeight() {
    return window.innerWidth >= 992 ? 800 : (window.innerHeight - 250);
  }

  function initTowerScene() {
    camera = new THREE.PerspectiveCamera(50, getRendererWidth() / getRendererHeight(), 1, 1000);
    camera.position.z = 100;

    scene = new THREE.Scene();

    // model
    const loader = new OBJLoader();
    loader.load('models/tower.obj', function (obj) {
      object = obj;
      object.scale.multiplyScalar(lightsConfig.params.towerScaleFactor);
      object.position.x = lightsConfig.params.towerOffset.x;
      object.position.y = lightsConfig.params.towerOffset.y;
      object.position.z = lightsConfig.params.towerOffset.z;
      scene.add(object);
    });

    const sphere = new THREE.SphereGeometry(0.5, 16, 8);

    // lights
    Object.entries(lightsConfig.parts).forEach(([k, { defaultColor, points }]) => {
      lights[k] = [];
      points.forEach(p => {
        const light = new THREE.PointLight(defaultColor, 1, lightsConfig.params.defaultIntensity);

        // Uncomment to visualize light source
        // light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: defaultColor })));

        lights[k].push(light);
        scene.add(light);

        light.position.x = p[0] * lightsConfig.params.towerScaleFactor + lightsConfig.params.towerOffset.x;
        light.position.y = p[2] * lightsConfig.params.towerScaleFactor + lightsConfig.params.towerOffset.y;
        light.position.z = p[1] * lightsConfig.params.towerScaleFactor + lightsConfig.params.towerOffset.z;
      });
    });

    // renderer
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(getRendererWidth(), getRendererHeight());
    document.getElementById('tower-container').append(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = getRendererWidth() / getRendererHeight();
    camera.updateProjectionMatrix();
    renderer.setSize(getRendererWidth(), getRendererHeight());
  }

  function animateTowerScene() {
    requestAnimationFrame(animateTowerScene);
    render();
  }

  function render() {
    const time = Date.now() * 0.0005;
    const delta = clock.getDelta();

    if (object) {
      object.rotation.y -= lightsConfig.params.rotationSpeed * delta;
    }

    renderer.render(scene, camera);
  }
})();

// Main nav
document.querySelector('.nav-toggle').addEventListener('click', function() {
  document.body.classList.toggle('nav-in');
});
document.querySelector('.main-nav-backdrop').addEventListener('click', function() {
  document.body.classList.remove('nav-in');
});

// Language switcher
document.querySelectorAll('a[data-set-language]').forEach(element => {
  element.addEventListener('click', function() {
    const language = element.getAttribute('data-set-language');
    document.documentElement.setAttribute('lang', language);
  });
});
