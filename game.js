const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d')
let times = 0
let timem = 0
let next

const width = window.innerWidth
const height = window.innerHeight
const backingStores = ['webkitBackingStorePixelRatio', 'mozBackingStorePixelRatio', 'msBackingStorePixelRatio', 'oBackingStorePixelRatio', 'backingStorePixelRatio']
const deviceRatio = window.devicePixelRatio

const backingRatio = backingStores.reduce(function(prev, curr) {
    return (Object.prototype.hasOwnProperty.call(context, curr) ? context[curr] : 1)
})

const ratio = deviceRatio / backingRatio
canvas.width = Math.round(width * ratio)
canvas.height = Math.round(height * ratio)
canvas.style.width = width + 'px'
canvas.style.height = height + 'px'
context.setTransform(ratio, 0, 0, ratio, 0, 0)

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}



function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}



function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}



function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.beginPath()
                context.fillStyle = 'rgba(67,77,67, 0.75)'
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
                                 context.closePath()
            }
        });
    });
}



function draw() {
    context.fillStyle = "#acbeac"
    context.fillRect(0, 0, canvas.width, canvas.height);
	
	const score = 'Score: ' + player.score
	const scoreWidth = context.measureText(score)
	
	context.save()
	context.beginPath()
	context.font = '0.85em Tetris'
	context.fillStyle = 'rgba(67,77,67, 1)'
	context.fillText('Score: ' + player.score, 0, (height / 6) + 9)
	context.fillText('Time: ' + Math.floor(timem) + ":" + (Math.floor(times) > 9 ? Math.floor(times) : "0"+Math.floor(times)), 0, (height / 6) + 27)
	context.closePath()
	context.restore()
	
	context.save()
	const scale = (width / 2) / 12
	context.translate(width / 4, height / 6)
	context.scale(scale, scale)
	context.strokeStyle = 'rgba(67,77,67, 1)'
	context.lineWidth = 0.0625
	context.strokeRect(0, 0, 12, 20)
	context.lineWidth = 1
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(next, {x: 13, y: 0});
    drawMatrix(player.matrix, player.pos);
    context.restore()
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}


function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}


function playerReset() {
    const pieces = 'TJLOSZI';
    if(!next)
    next = createPiece(pieces[pieces.length * Math.random() | 0]);
    
    player.matrix = next
    
    next = createPiece(pieces[pieces.length * Math.random() | 0]);
    
    
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
    }
}


function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
        times++
        if (times == 60) {
        timem++
        times -= 60
        }
    }

    lastTime = time;
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

document.addEventListener("click", (point) => {
    const {
        pageX,
        pageY
    } = point

    const i = {
        x: pageX,
        y: pageY
    }

    const ii = {
        x: player.pos.x * 20 + width / 4,
        y: player.pos.y * 20 + height / 6
    }

    const dy = ii.y - i.y
    const dx = ii.x - i.x

    const ay = Math.abs(dy)
    const ax = Math.abs(dx)

    if (ay > ax) {
        playerRotate((dy > 0) ? (-1) : (1))
    } else {
        playerMove((dx > 0) ? (-1) : (1))
    }
})

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
update();