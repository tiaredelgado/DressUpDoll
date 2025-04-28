let placedClothes = [];
let draggedImage = null;
let draggedType = null;
let draggedScale = 1;
let dollImage = null;
let dollCanvas, dollCtx;
const viewDollhouseButton = document.getElementById('viewDollhouseButton');
let viewingDollhouse = false;


setupDressUpEvents();
setupClosetDragEvents();

function setupClosetDragEvents() {
    document.querySelectorAll('.closetItem img').forEach(img => {
      img.addEventListener('dragstart', (e) => {
        draggedImage = new Image();
        draggedImage.src = e.target.src;
        draggedType = e.target.dataset.type;
        draggedScale = parseFloat(e.target.dataset.scale) || 1; 
      });
    });
  }
function setupDressUpEvents() {
    draggedImage = null;
    draggedType = null;
    draggedScale = 1;
    dollCanvas = document.getElementById('dollCanvas');
    dollCtx = dollCanvas.getContext('2d');
    const dollForm = document.getElementById('dollForm');
    const dollNameInput = document.getElementById('dollNameInput');
    const undoButton = document.getElementById('undoButton');
    placedClothes = [];


  dollImage = new Image();
  dollImage.src = '/DollBase.png';
  dollImage.onload = () => {
    drawEverything();
  };

  dollCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  dollCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedImage) {
      const rect = dollCanvas.getBoundingClientRect();
      const scaleX = dollCanvas.width / rect.width;
      const scaleY = dollCanvas.height / rect.height;

      let snapX, snapY;
      const centerX = dollCanvas.width / 2;

      if (draggedType === "top") {
        snapX = centerX - 1;
        snapY = dollCanvas.height * 0.31;
      } else if (draggedType === "GreenTop") {
        snapX = centerX;
        snapY = dollCanvas.height * 0.33;
      } else if (draggedType === "LongSleeve") {
        snapX = centerX;
        snapY = dollCanvas.height * 0.35;
      } else if (draggedType === "bottom") {
        snapX = centerX - 8;
        snapY = dollCanvas.height * 0.65;
      } else if (draggedType === "shoe") {
        snapX = centerX - 2;
        snapY = dollCanvas.height * 0.9;
      } else if (draggedType === "skirt") {
        snapX = centerX - 5;
        snapY = dollCanvas.height * 0.455;
      } else if (draggedType === "GreenSkirt") {
        snapX = centerX - 4;
        snapY = dollCanvas.height * 0.54;
      } else if (draggedType === "Dress") {
        snapX = centerX - 4;
        snapY = dollCanvas.height * 0.38;
      } else {
        snapX = (e.clientX - rect.left) * scaleX;
        snapY = (e.clientY - rect.top) * scaleY;
      }

      const baseWidth = dollCanvas.width * 0.35;
      const desiredWidth = baseWidth * draggedScale;
      const aspectRatio = draggedImage.width / draggedImage.height;
      const desiredHeight = desiredWidth / aspectRatio;

      placedClothes.push({
        imgSrc: draggedImage.src,
        x: snapX - desiredWidth/2,
        y: snapY - desiredHeight/2,
        width: desiredWidth,
        height: desiredHeight
      });

      drawEverything();
    }
  });

  // Undo button
  if (undoButton) {
    undoButton.addEventListener('click', () => {
      if (placedClothes.length > 0) {
        placedClothes.pop();
        drawEverything();
      }
    });
  }

  // Handle form submit with AJAX
  dollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dollImageData = dollCanvas.toDataURL('image/png');
    const dollName = dollNameInput.value;

    fetch('/storeDoll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        dollName: dollName,
        dollImage: dollImageData
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadDollhouse();
        viewDollhouseButton.textContent = "Back to Dress Up";
        viewingDollhouse = true;
      }
    })
    .catch(err => console.error('Error saving doll:', err));
  });
}

function drawEverything() {
  if (!dollCtx || !dollImage) return;

  dollCtx.clearRect(0, 0, dollCanvas.width, dollCanvas.height);

  const dollAspectRatio = dollImage.width / dollImage.height;
  const canvasAspectRatio = dollCanvas.width / dollCanvas.height;

  let drawWidth, drawHeight;

  if (dollAspectRatio > canvasAspectRatio) {
    drawWidth = dollCanvas.width * 0.9;
    drawHeight = drawWidth / dollAspectRatio;
  } else {
    drawHeight = dollCanvas.height * 0.9;
    drawWidth = drawHeight * dollAspectRatio;
  }

  const offsetX = (dollCanvas.width - drawWidth) / 2;
  const offsetY = (dollCanvas.height - drawHeight) / 2;

  dollCtx.drawImage(dollImage, offsetX, offsetY, drawWidth, drawHeight);

  placedClothes.forEach(item => {
    const img = new Image();
    img.src = item.imgSrc;
    img.onload = () => {
      dollCtx.drawImage(img, item.x, item.y, item.width, item.height);
    };
    if (img.complete) {
      dollCtx.drawImage(img, item.x, item.y, item.width, item.height);
    }
  });
}

function loadDollhouse() {
  fetch('/dollhouse')
    .then(response => response.json())
    .then(dolls => {
      const leftPanel = document.getElementById('leftPanel');
      leftPanel.innerHTML = `
        <h2>Welcome to Your Dollhouse </h2>
        <div id="dollGrid"></div>
      `;

      const dollGrid = document.getElementById('dollGrid');

      dolls.forEach(doll => {
        const dollCard = document.createElement('div');
        dollCard.classList.add('dollCard');
        dollCard.innerHTML = `
          <img src="${doll.image}" alt="${doll.name}">
          <p>${doll.name}</p>
        `;
        dollGrid.appendChild(dollCard);
      });
    })
    .catch(err => console.error('Error loading dollhouse:', err));
}

function loadDressUp() {
  const leftPanel = document.getElementById('leftPanel');

  leftPanel.innerHTML = `
    <div id="titleRow">
      <h1>Dress up your doll</h1>
      <button id="undoButton" type="button">Undo</button>
    </div>
    <form id="dollForm" action="/storeDoll" method="POST">
      <canvas id="dollCanvas" width="450" height="675"></canvas>
      <div id="formRow">
        <input id="dollNameInput" type="text" name="dollName" placeholder="Name your doll...">
        <button id="storeButton" type="submit">Store in Dollhouse</button>
      </div>
    </form>
  `;
  setupDressUpEvents();
  setupClosetDragEvents();
}

viewDollhouseButton.addEventListener('click', () => {
  if (!viewingDollhouse) {
    loadDollhouse();
    viewDollhouseButton.textContent = "Back to Dress Up";
    viewingDollhouse = true;
  } else {
    loadDressUp();
    viewDollhouseButton.textContent = "View Dollhouse";
    viewingDollhouse = false;
  }
});
