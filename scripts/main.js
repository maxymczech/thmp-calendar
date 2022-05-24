import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js'
import { collection, getDocs, getFirestore } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js'

import * as THREE from './three.module.js';
import { OBJLoader } from './OBJLoader.js';
import lightsConfig from './lights-config.js';

import Swiper from './swiper.min.js';

(async () => {
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
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach(doc => {
      events.push(doc);
    });
  })()

  // Set up 3D scene
  let camera, scene, renderer, object;
  const lights = {};
  const clock = new THREE.Clock();

  initTowerScene();
  animateTowerScene();

  function initTowerScene() {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight - lightsConfig.params.cardsHeight), 1, 1000);
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
    renderer.setSize(window.innerWidth, window.innerHeight - lightsConfig.params.cardsHeight);
    document.getElementById('tower-container').append(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - lightsConfig.params.cardsHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - lightsConfig.params.cardsHeight);
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
