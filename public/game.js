//const express = require("express");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const textbox = document.getElementById('textbox');
// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Player settings
const player = {
    x: canvas.width / 2,
    y: canvas.height -200,
    width: 40,
    height: 20,
    color: 'lime',
    speed: 5,
    gold: 100,
    inventory: {},
};

// Key press events
let keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Move player
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}
let isKeyDown = false; // Tracks if the key is currently held down

window.addEventListener('keydown', (e) => {
    if ((e.code === 'KeyM' ) && !isKeyDown) { 
        isKeyDown = true; // Mark the key as down
        console.log("KeyM pressed!");
        handleButtonPress(); // Perform the action
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyM') {
        isKeyDown = false; // Reset the key state on release
        console.log("KeyM released!");
    }
});

window.addEventListener('keydown', (event_space) => {
    if ((event_space.code === 'Space' ) && !isKeyDown) { 
        isKeyDown = true; // Mark the key as down
        console.log("KeyM pressed!");
        earnGold(); // Perform the action
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isKeyDown = false; // Reset the key state on release
        console.log("KeyM released!");
    }
});

function earnGold() {
    player.gold += 1; // Add gold
    console.log(`You earned 1 gold! Total gold: ${player.gold}`);
}


function handleButtonPress() {
    if (player.gold >= 10) {
        player.gold -= 10;
        player.inventory['health potion'] = (player.inventory['health potion'] || 0) + 1; // Add health potion to inventory
        console.log("You bought a health potion! Gold remaining: " + player.gold);
    } else {
        console.log("You don't have enough gold!");
    }
}


class create_npc {
    constructor(posx, posy, width, height, color) {
        this.posx = posx;
        this.posy = posy;
        this.width = width;
        this.height = height;
        this.color = color;
        this.text= "NPC";
    }
    setText(text) {
        this.text = text;
    }
}

//draw npcs
function draw_npc(npcs) {
    npcs.forEach(npc => {
        ctx.fillStyle = npc.color;
        ctx.fillRect(npc.posx, npc.posy, npc.width, npc.height);
    });
}

// Create NPCs
npcs = [];
merchant = new create_npc(1, 100, 50, 50, 'red');
friend= new create_npc(1, 200, 50, 50, 'blue');
merchant.setText("Merchant: press buttons to buy , m="+"'health potion'" +"'space to earn gold'");
friend.setText("Hello friend");
npcs.push(merchant);
npcs.push(friend);


// Collision Detection
function detectCollision(player, npc) {
    return (
        player.x < npc.posx + npc.width &&
        player.x + player.width > npc.posx &&
        player.y < npc.posy + npc.height &&
        player.y + player.height > npc.posy
    );
}
function checkCollisions() {
    npcs.forEach(npc => {
        if (detectCollision(player, npc)) {
            player.x = npc.width+npc.posx; // Reset player position on collision
        }
    });
}//check collision in game loop

// Check if player is near NPCs
function detect_Near(player, npc, range = 50) {
    return(
        player.x < npc.posx + npc.width + range &&
        player.x + player.width > npc.posx - range &&
        player.y < npc.posy + npc.height + range &&
        player.y + player.height > npc.posy - range
    );
}

function check_Near(){
    for (npc of npcs){
        if (detect_Near(player, npc)) {
            return npc; // Return the NPC that is near the player
        }
    }
    return null; // Return null if no NPC is near
}

//to make text if they are near npc

function changeText(npc) {
    if (npc) {
        textbox.innerHTML = `${npc.text}`;
    }
}

function updatePlayerStats() {
    document.getElementById('goldStat').innerText = `Gold: ${player.gold || 0}`;
    const inventoryList = Object.entries(player.inventory)
    .map(([item, quantity]) => `${item} (${quantity})`)
    .join(', ') || 'None';
document.getElementById('inventoryStat').innerText = `Inventory: ${inventoryList}`;

    document.getElementById('positionStat').innerText = `Position: (${player.x}, ${player.y})`;
}

console.log(canvas.width, canvas.height);

 
// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_npc(npcs);
    drawPlayer();
    movePlayer();
    checkCollisions();
    changeText(check_Near());
    updatePlayerStats();
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
