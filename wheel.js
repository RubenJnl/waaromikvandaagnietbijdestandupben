// Helpers
const shuffle = function (o) {
  for (let j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

String.prototype.hashCode = function () {
  // See http://www.cse.yorku.ca/~oz/hash.html        
  let hash = 5381;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) + hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
}

// Import list of excuses.
import excuses from './excuses'

const createExcuses = () => {

  // console.log(excuses);
  let excusesContainer = document.querySelector('#excuses ul');
  for (const [key, item] of Object.entries(excuses)) {

    let listEl = document.createElement('li')
    let inputEl = document.createElement('input')
    let labelEl = document.createElement('label')

    inputEl.setAttribute('id', 'excuse-' + key)
    inputEl.setAttribute('name', item)
    inputEl.setAttribute('value', item)
    inputEl.setAttribute('type', 'checkbox')
    inputEl.setAttribute('checked', true)

    inputEl.addEventListener('change', (e) => {

      let cbox = e.target;
      let segments = wheel.segments;
      let i = segments.indexOf(cbox.value);

      if (cbox.checked && i == -1) {
        segments.push(cbox.value);

      } else if (!cbox.checked && i != -1) {
        segments.splice(i, 1);
      }

      segments.sort();
      wheel.update();
    })

    labelEl.setAttribute('for', 'excuse-' + key)
    labelEl.innerHTML = item

    listEl.appendChild(inputEl)
    listEl.appendChild(labelEl)
    excusesContainer.appendChild(listEl)

  }

  checkUpdatesWheel()
}


// WHEEL!
let wheel = {

  timerHandle: 0,
  timerDelay: 20,

  angleCurrent: 0,
  angleDelta: 0,

  size: 290,

  canvasContext: null,

  colors: ['#ffff00', '#ffc700', '#ff9100', '#ff6301', '#ff0000', '#c6037e', '#559211',
    '#713697', '#444ea1', '#2772b2', '#0297ba', '#008e5b', '#8ac819', '#398272'],

  segments: [],

  seg_colors: [],
  // Cache of segments to colors
  maxSpeed: Math.PI / 16,

  upTime: 500,
  // How long to spin up for (in ms)
  downTime: 10000,
  // How long to slow down for (in ms)
  spinStart: 1500,

  frames: 0,

  centerX: 300,
  centerY: 300,

  spin: function () {
    // Start the wheel only if it's not already spinning
    if (wheel.timerHandle == 0 && wheel.segments.length > 0) {
      wheel.spinStart = new Date().getTime();
      wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
      // wheel.frames = 0;

      wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
    }
  },

  onTimerTick: function () {

    // wheel.frames++;

    wheel.draw();

    let duration = (new Date().getTime() - wheel.spinStart);
    let progress = 0;
    let finished = false;

    if (duration < wheel.upTime) {
      progress = duration / wheel.upTime;
      wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2);
    } else {
      progress = duration / wheel.downTime;
      wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2 + Math.PI / 2);
      if (progress >= 1) finished = true;
    }

    wheel.angleCurrent += wheel.angleDelta;
    while (wheel.angleCurrent >= Math.PI * 2)
      // Keep the angle in a reasonable range
      wheel.angleCurrent -= Math.PI * 2;

    if (finished) {
      clearInterval(wheel.timerHandle);
      wheel.timerHandle = 0;
      wheel.angleDelta = 0;

      console.log(wheel.winner);

      document.getElementById('result').innerHTML = wheel.winner
      document.querySelector('.winner').classList.remove('hidden')

      //document.getElementById("counter").innerHTML = (wheel.frames / duration * 1000) + " FPS";
      // console.log((wheel.frames / duration * 1000) + " FPS");
    }

    /*
          // Display RPM
          let rpm = (wheel.angleDelta * (1000 / wheel.timerDelay) * 60) / (Math.PI * 2);
          $("#counter").html( Math.round(rpm) + " RPM" );
           */
  },

  init: function (optionList) {
    try {
      wheel.initWheel();
      wheel.initCanvas();
      wheel.draw();

      let newwheel = { wheel, ...optionList }

      // $.extend(wheel, optionList);

    } catch (exceptionData) {
      alert('Wheel is not loaded ' + exceptionData);
    }

  },


  initCanvas: function () {
    let canvas = document.getElementById('canvas');

    canvas.addEventListener("click", wheel.spin, false);
    wheel.canvasContext = canvas.getContext("2d");
  },

  initWheel: function () {
    shuffle(wheel.colors);
  },

  // Called when segments have changed
  update: function () {
    // Ensure we start mid way on a item
    //let r = Math.floor(Math.random() * wheel.segments.length);
    let r = 0;
    wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * Math.PI * 2;

    let segments = wheel.segments;
    let len = segments.length;
    let colors = wheel.colors;
    let colorLen = colors.length;

    // Generate a color cache (so we have consistant coloring)
    let seg_color = new Array();
    for (let i = 0; i < len; i++)
      if (typeof segments[i] !== 'undefined') {
        seg_color.push(colors[segments[i].hashCode().mod(colorLen)]);

        wheel.seg_color = seg_color;

      }
    wheel.draw();
  },

  draw: function () {
    wheel.clear();
    wheel.drawWheel();
    wheel.drawNeedle();
  },

  clear: function () {
    let ctx = wheel.canvasContext;
    ctx.clearRect(0, 0, 1000, 800);
  },

  drawNeedle: function () {
    let ctx = wheel.canvasContext;
    let centerX = wheel.centerX;
    let centerY = wheel.centerY;
    let size = wheel.size;

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.fileStyle = '#ffffff';

    ctx.beginPath();

    ctx.moveTo(centerX + size - 20, centerY);
    ctx.lineTo(centerX + size + 20, centerY - 10);
    ctx.lineTo(centerX + size + 20, centerY + 10);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();

    // Which segment is being pointed to?
    let i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2)) * wheel.segments.length) - 1;

    // Now draw the winning name
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#000000';
    ctx.font = "2em Arial";
    ctx.fillText(wheel.segments[i] ? wheel.segments[i] : '', centerX + size + 25, centerY);
    wheel.winner = wheel.segments[i]
  },

  drawSegment: function (key, lastAngle, angle) {
    let ctx = wheel.canvasContext;
    let centerX = wheel.centerX;
    let centerY = wheel.centerY;
    let size = wheel.size;

    let segments = wheel.segments;
    // let colors = wheel.seg_color;
    let colors = wheel.colors;

    let value = segments[key];

    ctx.save();
    ctx.beginPath();

    // Start in the centre
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw a arc around the edge
    ctx.lineTo(centerX, centerY); // Now draw a line back to the centre
    // Clip anything that follows to this area
    //ctx.clip(); // It would be best to clip, but we can double performance without it
    ctx.closePath();

    let newKey = key
    if (typeof colors[key] == 'undefined') {
      newKey = key - colors.length
    }
    ctx.fillStyle = colors[newKey];
    ctx.fill();
    ctx.stroke();

    // Now draw the text
    ctx.save(); // The save ensures this works on Android devices
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);

    const newValue = value.match(/.{1,25}(\s|$)/g);
    let y = 0
    let xmultiplier = 0

    ctx.fillStyle = '#000000';

    for (let l = 0; l < newValue.length; l++) {
      if (newValue.length >= 3 && l == 0) {
        y = -10
      }
      ctx.fillText(newValue[l], size / 2 + 20 + xmultiplier, y);
      xmultiplier += 5
      y += 20;
    }

    ctx.restore();
  },

  drawWheel: function () {
    let ctx = wheel.canvasContext;

    let angleCurrent = wheel.angleCurrent;
    let lastAngle = angleCurrent;

    let len = wheel.segments.length;

    let centerX = wheel.centerX;
    let centerY = wheel.centerY;
    let size = wheel.size;

    let PI2 = Math.PI * 2;

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "1.4em Arial";

    for (let i = 1; i <= len; i++) {
      let angle = PI2 * (i / len) + angleCurrent;
      wheel.drawSegment(i - 1, lastAngle, angle);
      lastAngle = angle;
    }
    // Draw a center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, PI2, false);
    ctx.closePath();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.fill();
    ctx.stroke();

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, PI2, false);
    ctx.closePath();

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  },
}

const checkUpdatesWheel = () => {
  let segments = new Array();

  for (const [inputKey, input] of Object.entries(document.querySelectorAll('form input[type="text"]'))) {
    if (input.value.length >= 1) {
      segments.push(input.value)
    }
  }

  for (const [key, cbox] of Object.entries(document.querySelectorAll('#excuses input:checked'))) {
    segments.push(cbox.value);
  }

  wheel.segments = segments;

  const canvas = document.getElementById('canvas');
  if (segments.length >= 1) {
    canvas.classList.add('ready')
  } else {
    canvas.classList.remove('ready')
  }
  wheel.update();
}

window.inputTextEls = []
window.inputTextBoundElements = []
const changeInput = (e) => {
  setTimeout(() => {
    checkUpdatesWheel()
  }, 10)
}



const bindChangingEvents = () => {
  if (inputTextBoundElements.length > 0) {
    Array.prototype.forEach.call(window.inputTextEls, (input, key) => {
      console.log(input);
      input.removeEventListener('keydown', inputTextBoundElements[key])
    })
    inputTextBoundElements = new Array()
    window.inputTextEls = new Array()
  }

  window.inputTextEls = document.querySelectorAll('form input[type="text"]')
  Array.prototype.forEach.call(window.inputTextEls, (input, key) => {
    if (input.value.length >= 1) {
      checkUpdatesWheel()
    }
    inputTextBoundElements[key] = changeInput.bind(this)
    input.addEventListener('keydown', inputTextBoundElements[key])
  })

}

window.newInputCounter = 0

const bindEvents = () => {

  const generateEl = document.getElementById('suggest')
  generateEl.addEventListener('click', () => {
    createExcuses()
    generateEl.setAttribute('disabled', '')
  })

  const addButton = document.getElementById('add')
  const inputList = document.querySelector('.input-list')
  addButton.addEventListener('click', () => {
    newInputCounter++
    const newDiv = document.createElement('div')
    newDiv.innerHTML = `
          <input type="text" name="e${newInputCounter}" id="e${newInputCounter}" />
    `
    inputList.appendChild(newDiv)
    bindChangingEvents()
  })

  bindChangingEvents()
}

window.onload = function () {

  wheel.init();

  bindEvents()

}