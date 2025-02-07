//------Loading-Page------

let gameStarted = false; 

function startCountdown(callback) {
    const countdownScreen = document.getElementById("countdownScreen");
    let count = 3;

    countdownScreen.style.opacity = "1"; 

    const interval = setInterval(() => {
        if (count > 0) {
            countdownScreen.textContent = count;
            count--;
        } else {
            countdownScreen.textContent = "Game Start!";
            clearInterval(interval);
            setTimeout(() => {
                countdownScreen.style.opacity = "0"; 
                setTimeout(() => {
                    countdownScreen.style.display = "none";
                    gameStarted = true; 
                    callback(); 
                }, 500);
            }, 1000);
        }
    }, 1000);
}

function loadGame() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0'; 

        setTimeout(() => {
            loadingScreen.style.display = 'none'; 
            startCountdown(() => {
                document.getElementById('gameContainer').style.display = 'block'; 
            });
        }, 1000); 
    }, 3000); 
}
document.addEventListener("DOMContentLoaded", loadGame);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

camera.position.set(0, 4, 25);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.update();

// ---------Load the GLTF--------
const loader = new THREE.GLTFLoader();
let doll, mainplayer, army, army1;
let isFacingFront = false;
const players=[];
let mainPlayer = null;

loader.load(
  'model/scene.gltf', 
  (gltf) => {
    doll = gltf.scene;
    doll.scale.set(0.4, 0.4, 0.4);
    doll.position.set(0, 1, -10);
    
    doll.rotation.y = Math.PI;
    scene.add(doll);

    
    setInterval(() => {
      isFacingFront = !isFacingFront;
      gsap.to(doll.rotation, { y: isFacingFront ? 0 : Math.PI, duration: 1 });
    }, 3000);
  },
  undefined,
  (error) => {
    console.error('Error loading the doll model:', error);
  }
);


//--- Army ---
loader.load(
  'model5/scene.gltf', 
  (gltf) => {
    army = gltf.scene;
    army.scale.set(2, 2, 2);
    army.position.set(-5, -1, -10);
    scene.add(army);
  },
  undefined,
  (error) => {
    console.error('Error loading the army model:', error);
  }
);

//--- Army1 ---
loader.load(
  'model5/scene.gltf', 
  (gltf) => {
    army1 = gltf.scene;
    army1.scale.set(2, 2, 2);
    army1.position.set(5, -1, -10);
    scene.add(army1);
  },
  undefined,
  (error) => {
    console.error('Error loading the army1 model:', error);
  }
);

//--- Floor ---
function createPlane() {
  const planeGeometry = new THREE.PlaneGeometry(20, 40);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x8b8b8b });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1.5;
  scene.add(plane);
}
createPlane();


loader.load('model3/scene.gltf', (gltf) => {
  const player = gltf.scene;
  player.scale.set(1, 1, 1);
  player.position.set(0, -1, 18);
  player.rotation.y = Math.PI;
  scene.add(player);
  
  players.push(player);
  mainPlayer = player; // Set main player
}, undefined, (error) => {
  console.error('Error loading the player model:', error);
});

// Other players (do not set them as mainPlayer)
const playerPositions = [
  [2, -1, 17], [3, -1, 17.5], [4, -1, 17.5], [5.5, -1, 17], [7, -1, 17],
  [-1, -1, 17], [-3.5, -1, 17.5], [-5, -1, 17.5], [-6, -1, 17], [-7, -1, 17.5],
  [-7.5, -1, 17], [-8, -1, 17.5]
];

playerPositions.forEach(pos => {
  loader.load('model3/scene.gltf', (gltf) => {
    const player = gltf.scene;
    player.scale.set(1, 1, 1);
    player.position.set(...pos);
    player.rotation.y = Math.PI;
    scene.add(player);
    
    players.push(player); // Add to players array
  }, undefined, (error) => {
    console.error('Error loading the player model:', error);
  });
});

// Movement Controls (Only move mainPlayer)
let moveDirection = { forward: false, backward: false, left: false, right: false };
const moveSpeed = 0.02;

document.addEventListener("keydown", (event) => {
  if (!gameStarted) return; // Prevent movement before countdown ends

  switch (event.key) {
    case "ArrowUp":
      moveDirection.forward = true;
      break;
    case "ArrowDown":
      moveDirection.backward = true;
      break;
    case "ArrowLeft":
      moveDirection.left = true;
      break;
    case "ArrowRight":
      moveDirection.right = true;
      break;
  }
});



document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowUp': moveDirection.forward = false; break;
    case 'ArrowDown': moveDirection.backward = false; break;
    case 'ArrowLeft': moveDirection.left = false; break;
    case 'ArrowRight': moveDirection.right = false; break;
  }
});

//-------Update movement----------
function animate() {
  requestAnimationFrame(animate);

  if (mainPlayer) {
    if (moveDirection.forward) mainPlayer.position.z -= moveSpeed;
    if (moveDirection.backward) mainPlayer.position.z += moveSpeed;
    if (moveDirection.left) mainPlayer.position.x -= moveSpeed;
    if (moveDirection.right) mainPlayer.position.x += moveSpeed;
  }

  renderer.render(scene, camera);
}
animate();

//-----------Start-&-Finish-Line---
function createLine(positionZ, color) {
  const geometry = new THREE.PlaneGeometry(17, 0.2); 
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  const line = new THREE.Mesh(geometry, material);
  line.rotation.x = -Math.PI / 2; 
  line.position.set(0, -0.99, positionZ); 
  scene.add(line);
}
createLine(16, 0xffffff);
createLine(-6, 0xff0000);

//---------Move the Players---------
const randomPlayerSpeedMin = 0.5; 
const randomPlayerSpeedMax = 0.7; 
const redLineZ = -6; 
const moveIntervalTime = 3000; 

let playerMoves = [];

function movePlayersRandomly() {
  if (!gameStarted) return; 

  players.forEach((player, index) => {
    if (index !== 0) { 
      if (!playerMoves[index]) {
        playerMoves[index] = {
          lastMoveTime: Date.now(),
          speed: Math.random() * (randomPlayerSpeedMax - randomPlayerSpeedMin) + randomPlayerSpeedMin,
        };
      }

      let moveData = playerMoves[index];

      if (player.position.z > redLineZ) {
        if (Date.now() - moveData.lastMoveTime > moveIntervalTime) {
          player.position.z -= moveData.speed; 
          moveData.lastMoveTime = Date.now(); 
        }
      }
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (gameStarted) {
    if (mainPlayer) {
      if (moveDirection.forward) mainPlayer.position.z -= moveSpeed;
      if (moveDirection.backward) mainPlayer.position.z += moveSpeed;
      if (moveDirection.left) mainPlayer.position.x -= moveSpeed;
      if (moveDirection.right) mainPlayer.position.x += moveSpeed;
    }

    movePlayersRandomly();
  }

  renderer.render(scene, camera);
}
animate();

let dollLookTime = null;
const movementDelay = 1000; 

//--------Players-Fall------------
function makePlayerFall(player) {
    gsap.to(player.rotation, { x: Math.PI / 2, duration: 0.5 }); 
    gsap.to(player.position, { y: player.position.y - 1, duration: 0.5 }); 
}

function animate() {
    requestAnimationFrame(animate);

    if (gameStarted) {
        if (isFacingFront && dollLookTime === null) {
            dollLookTime = Date.now();
        }

        const oneSecondPassed = dollLookTime && (Date.now() - dollLookTime >= movementDelay);

        if (mainPlayer) {
            let moved = false;

            if (moveDirection.forward) {
                mainPlayer.position.z -= moveSpeed;
                moved = true;
            }
            if (moveDirection.backward) {
                mainPlayer.position.z += moveSpeed;
                moved = true;
            }
            if (moveDirection.left) {
                mainPlayer.position.x -= moveSpeed;
                moved = true;
            }
            if (moveDirection.right) {
                mainPlayer.position.x += moveSpeed;
                moved = true;
            }

            
            if (moved && oneSecondPassed) {
                makePlayerFall(mainPlayer);
            }
        }

        //------------Move-Players----------
        players.forEach((player, index) => {
            if (index !== 0) { 
                let moveData = playerMoves[index];

                if (!moveData) {
                    playerMoves[index] = {
                        lastMoveTime: Date.now(),
                        speed: Math.random() * (randomPlayerSpeedMax - randomPlayerSpeedMin) + randomPlayerSpeedMin,
                    };
                    moveData = playerMoves[index];
                }

                if (player.position.z > redLineZ) {
                    if (Date.now() - moveData.lastMoveTime > moveIntervalTime) {
                        player.position.z -= moveData.speed;
                        moveData.lastMoveTime = Date.now();
                                              
                        if (oneSecondPassed) {
                            makePlayerFall(player);
                        }
                    }
                }
            }
        });

        if (!isFacingFront) {
            dollLookTime = null;
        }
    }

    renderer.render(scene, camera);
}

//---------Main-Player-fall------
function makePlayerFall(player) {
  gsap.to(player.rotation, { x: Math.PI / 2, duration: 0.5 }); 
  gsap.to(player.position, { y: player.position.y - 1, duration: 0.5 }); 

  setTimeout(() => {
      const countdownScreen = document.getElementById("countdownScreen");
      countdownScreen.textContent = "Game Over...!";
      countdownScreen.style.opacity = "1";
      countdownScreen.style.display = "block";

      setTimeout(() => {
          restartGame();
      }, 2000); 
  }, 500);
}
//--------Restart-Game----------
function restartGame() {
 
  gameStarted = false;

  if (mainPlayer) {
      mainPlayer.position.set(0, -1, 18);
      mainPlayer.rotation.set(0, Math.PI, 0);
  }

  players.forEach((player, index) => {
      if (index !== 0) { 
          player.position.set(playerPositions[index - 1][0], -1, playerPositions[index - 1][2]);
      }
  });

  //---------Countdown---------
  const countdownScreen = document.getElementById("countdownScreen");
  countdownScreen.style.display = "block";
  countdownScreen.textContent = "3"; 

  let count = 3;
  const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
          countdownScreen.textContent = count;
      } else {
          clearInterval(countdownInterval);
          countdownScreen.style.display = "none";
          gameStarted = true; 
      }
  }, 1000);
}

let mainPlayerCrossedLine = false; 

function checkForWin() {
    if (mainPlayer.position.z < redLineZ && !mainPlayerCrossedLine) {
        mainPlayerCrossedLine = true; 
        displayWinMessage();
    }
}

//-----Won-Message----
function displayWinMessage() {
    const countdownScreen = document.getElementById("countdownScreen");
    countdownScreen.textContent = "You Won!";
    countdownScreen.style.opacity = "1"; 

    setTimeout(() => {
        countdownScreen.style.opacity = "0"; 
    }, 2000); 
}

function animate() {
  requestAnimationFrame(animate);

  if (gameStarted) {
      if (mainPlayer) {
          let moved = false;

          if (moveDirection.forward) {
              mainPlayer.position.z -= moveSpeed;
              moved = true;
          }
          if (moveDirection.backward) {
              mainPlayer.position.z += moveSpeed;
              moved = true;
          }
          if (moveDirection.left) {
              mainPlayer.position.x -= moveSpeed;
              moved = true;
          }
          if (moveDirection.right) {
              mainPlayer.position.x += moveSpeed;
              moved = true;
          }

          
          if (mainPlayer.position.z <= redLineZ) {
             
              const countdownScreen = document.getElementById("countdownScreen");
              countdownScreen.textContent = "You Won...!";
              countdownScreen.style.opacity = "1";
              countdownScreen.style.display = "block";

             
              setTimeout(() => {
                  restartGame();
              }, 2000); 
          }
          
          if (moved && oneSecondPassed) {
              makePlayerFall(mainPlayer);
          }
      }
      players.forEach((player, index) => {
          if (index !== 0) { 
              let moveData = playerMoves[index];

              if (!moveData) {
                  playerMoves[index] = {
                      lastMoveTime: Date.now(),
                      speed: Math.random() * (randomPlayerSpeedMax - randomPlayerSpeedMin) + randomPlayerSpeedMin,
                  };
                  moveData = playerMoves[index];
              }

              if (player.position.z > redLineZ) {
                  if (Date.now() - moveData.lastMoveTime > moveIntervalTime) {
                      player.position.z -= moveData.speed;
                      moveData.lastMoveTime = Date.now();
                      
                      
                      if (oneSecondPassed) {
                          makePlayerFall(player);
                      }
                  }
              }
          }
      });

      if (!isFacingFront) {
          dollLookTime = null;
      }
  }
  renderer.render(scene, camera);
}



