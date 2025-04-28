const dollCanvas = document.getElementById('dollCanvas');
const dollCtx = dollCanvas.getContext('2d');
let draggedImage = null;
let draggedType = null;
let draggedScale = 1;

const dollImage = new Image();
dollImage.src = '/DollBase.png';

dollImage.onload = () => {
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

    dollCtx.clearRect(0, 0, dollCanvas.width, dollCanvas.height);
    dollCtx.drawImage(dollImage, offsetX, offsetY, drawWidth, drawHeight);
};

document.querySelectorAll('.closetItem img').forEach(img => {
    img.addEventListener('dragstart', (e) => {
        draggedImage = new Image();
        draggedImage.src = e.target.src;
        draggedType = e.target.dataset.type;
        draggedScale = parseFloat(e.target.dataset.scale) || 1;
    });
});

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
            snapX = centerX-1;
            snapY = dollCanvas.height * 0.31; 
        } else if(draggedType === "GreenTop") {
            snapX = centerX;
            snapY = dollCanvas.height * 0.33; 
        }
        else if(draggedType === "LongSleeve") {
            snapX = centerX;
            snapY = dollCanvas.height * 0.35; 
        }
        else if (draggedType === "bottom") {
            snapX = centerX-8;
            snapY = dollCanvas.height * 0.65;
        } else if (draggedType === "shoe") {
            snapX = centerX-2;
            snapY = dollCanvas.height * 0.9; 
        } else if(draggedType ==="skirt"){
            snapX = centerX-5;
            snapY = dollCanvas.height * 0.455; 
        }
        else if(draggedType ==="GreenSkirt"){
            snapX = centerX-4;
            snapY = dollCanvas.height * 0.54; 
        }
        else if(draggedType ==="Dress"){
            snapX = centerX-4;
            snapY = dollCanvas.height * 0.38; 
        }
        else {
            snapX = (e.clientX - rect.left) * scaleX;
            snapY = (e.clientY - rect.top) * scaleY;
        }

        const baseWidth = dollCanvas.width * 0.35; 
        const desiredWidth = baseWidth * draggedScale;
        const aspectRatio = draggedImage.width / draggedImage.height;
        const desiredHeight = desiredWidth / aspectRatio;

        // Draw centered at snapX/snapY
        draggedImage.onload = () => {
            dollCtx.drawImage(draggedImage, snapX - desiredWidth/2, snapY - desiredHeight/2, desiredWidth, desiredHeight);
        };
        if (draggedImage.complete) {
            dollCtx.drawImage(draggedImage, snapX - desiredWidth/2, snapY - desiredHeight/2, desiredWidth, desiredHeight);
        }
    }
});