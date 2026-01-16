let portraitImg; 
let currentEffect = 1; 
let particleStep = 1.2; // 粒子采样步长，决定粒子密度,受性能影响
let startX = 0; // 粒子消散起始位置
let mosaicSize = 15; 
let mosaicGrid = []; // 马赛克网格数组
let windStrengthMultiplier = 2; // 风力大小乘数
let redSquareSizeX = 400; 
let redSquareSizeY = 100; 
let fixedSquares = [];//储存固定方块
let followingSquare = null; // 当前跟随鼠标的方块
let addRandomSquareBtn = null; // 新增方块按钮
let isParticleLocked = false; 
let lockedStartX = 0; // 锁定时的起始位置
let lockedMouseX = 0; // 锁定时的鼠标X位置
let effectButtons = [];
let paramControls = [];
let saveBtn = null;
let uploadBtn = null;
let fileInput = null;
let isSaving = false;

function preload() {
  // 加载肖像图片
  portraitImg = loadImage('portrait.jpg');
}

function setup() {
  createCanvas(800, 800);
  
  portraitImg.resize(width, height);//调整图片大小以匹配画布
  
  initMosaicGrid();//初始化马赛克网格
  
  // 设置文本样式
  textAlign(CENTER, CENTER);
  textSize(16);
  
  startX = width / 2;// 初始化粒子消散起始位置
  
  // 加载图片像素数据
  portraitImg.loadPixels();
  
  createUI();
}

function draw() {
  background(255);

  if (currentEffect === 1) {
    drawParticleEffect();
  } 
  else if (currentEffect === 2) {
    drawMosaicEffect();
  }
  
  // 如果不是保存状态，才显示文字
  if (!isSaving) {
    displayModeInfo();
    displayParamValues();
  }
}

function mousePressed() {
  if (isMouseInUI()) {
    return;
  }
  
  if (currentEffect === 1) {
    toggleParticleLock();  // 粒子消散模式：点击切换锁定状态
  }
  else if (currentEffect === 2) {
    handleMouseClick();
  }
}

// 切换粒子效果锁定状态
function toggleParticleLock() {
  isParticleLocked = !isParticleLocked;
  if (isParticleLocked) {
    lockedStartX = startX;
    lockedMouseX = mouseX;
  }
}

// 检查鼠标是否在UI控件上
function isMouseInUI() {
  // 检查是否在宽度/高度控制按钮上
  for (let control of paramControls) {
    if (control.effect === 2) { 
      let decBtn = control.decreaseBtn;
      let incBtn = control.increaseBtn;
      
      // 检查减少按钮
      let decX = decBtn.elt.offsetLeft;
      let decY = decBtn.elt.offsetTop;
      if (mouseX >= decX && mouseX <= decX + 30 && 
          mouseY >= decY && mouseY <= decY + 25) {
        return true;
      }
      
      // 检查增加按钮
      let incX = incBtn.elt.offsetLeft;
      let incY = incBtn.elt.offsetTop;
      if (mouseX >= incX && mouseX <= incX + 30 && 
          mouseY >= incY && mouseY <= incY + 25) {
        return true;
      }
    }
  }
  
  // 检查是否在"添加新方块"按钮上
  if (addRandomSquareBtn) {
    let btnX = addRandomSquareBtn.elt.offsetLeft;
    let btnY = addRandomSquareBtn.elt.offsetTop;
    let btnWidth = addRandomSquareBtn.elt.offsetWidth;
    let btnHeight = addRandomSquareBtn.elt.offsetHeight;
    
    if (mouseX >= btnX && mouseX <= btnX + btnWidth && 
        mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return true;
    }
  }
  
  // 检查是否在保存或上传按钮上
  if (saveBtn) {
    let btnX = saveBtn.elt.offsetLeft;
    let btnY = saveBtn.elt.offsetTop;
    let btnWidth = saveBtn.elt.offsetWidth;
    let btnHeight = saveBtn.elt.offsetHeight;
    
    if (mouseX >= btnX && mouseX <= btnX + btnWidth && 
        mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return true;
    }
  }
  
  if (uploadBtn) {
    let btnX = uploadBtn.elt.offsetLeft;
    let btnY = uploadBtn.elt.offsetTop;
    let btnWidth = uploadBtn.elt.offsetWidth;
    let btnHeight = uploadBtn.elt.offsetHeight;
    
    if (mouseX >= btnX && mouseX <= btnX + btnWidth && 
        mouseY >= btnY && mouseY <= btnY + btnHeight) {
      return true;
    }
  }
  
  return false;
}

// 处理鼠标点击
function handleMouseClick() {
  // 检查是否点击在跟随方块上
  if (followingSquare && !followingSquare.fixed) {//检查是否有跟随方块（不是 null）是否没有固定
    if (isMouseInSquare(followingSquare)) {
      fixFollowingSquare();
      return;
    }
  }
  
  // 检查是否点击在固定方块上
  for (let i = fixedSquares.length - 1; i >= 0; i--) {
    let square = fixedSquares[i];
    if (isMouseInSquare(square)) {
      fixedSquares.splice(i, 1);
      return;
    }
  }
}

// 鼠标是否在方块内判断
function isMouseInSquare(square) {
  return mouseX >= square.x && mouseX <= square.x + square.sizeX &&
         mouseY >= square.y && mouseY <= square.y + square.sizeY;
}

// 固定当前跟随方块
function fixFollowingSquare() {
  followingSquare.fixed = true;
  fixedSquares.push({...followingSquare});//！！！没学过。使用扩展运算符 创建新对象副本，复制到固定方块数组
  followingSquare = null;  // 不再自动创建新方块
}

// 创建新的跟随方块
function createNewFollowingSquare() {
  let r = random(100, 255);  
  let g = random(100, 255);
  let b = random(100, 255);
  let value = random(10, 40);
  //创建object
  followingSquare = {
    x: mouseX - redSquareSizeX / 2,
    y: mouseY - redSquareSizeY / 2,
    sizeX: redSquareSizeX,
    sizeY: redSquareSizeY,
    r: r,
    g: g,
    b: b,
    value: value,
    fixed: false
  };
}

// 移除固定方块
function removeFixedSquare(square) {
  let index = fixedSquares.indexOf(square);//返回找到的square的索引位置
  if (index !== -1) {
    fixedSquares.splice(index, 1);
  }
}

//马赛克网格
function initMosaicGrid() {
  mosaicGrid = [];
  for (let x = 0; x < width; x += mosaicSize) {
    for (let y = 0; y < height; y += mosaicSize) {
      mosaicGrid.push({
        x: x,
        y: y,
        size: mosaicSize,
        active: false,
        fade: 0
      });
    }
  }
}


//粒子消散
function drawParticleEffect() {
  image(portraitImg, 0, 0, width, height);
  if (isParticleLocked) {
    startX = lockedStartX;
  } else {
    startX = mouseX;
  }
  
  strokeWeight(2);

  for (let i = 0; i < startX; i += particleStep) {
    for (let j = 0; j < height; j += particleStep) {
      let col = portraitImg.get(i, j);// 获取像素颜色
      
      let windStrength = map(i, 0, startX, 100, 0);
      
      let currentMouseX = isParticleLocked ? lockedMouseX : mouseX;
      let windSpeed = map(currentMouseX, 0, width, 0.5, 3) * windStrengthMultiplier;
      let xoff = -abs(randomGaussian()) * windStrength * windSpeed * 0.1;// 计算X轴偏移（使用高斯分布模拟自然风）负号表示风向向左
      let yoff = random(-windStrength * 0.5, windStrength * 0.5) * windSpeed * 0.1;

      stroke(col);
      point(i + xoff, j + yoff);
    }
  }
}


function drawMosaicEffect() {
  // 绘制马赛克基础图像
  for (let cell of mosaicGrid) {
    let imgX = map(cell.x, 0, width, 0, portraitImg.width);
    let imgY = map(cell.y, 0, height, 0, portraitImg.height);
    let c = portraitImg.get(imgX, imgY);
    
    fill(c);
    noStroke();
    rect(cell.x, cell.y, cell.size, cell.size);
  }
  
  drawFixedSquares();// 绘制所有固定方块
  drawFollowingSquare();// 绘制跟随鼠标的方块
}

// 绘制固定方块
function drawFixedSquares() {
  for (let square of fixedSquares) {
    copy(portraitImg, 
         square.x, square.y, square.sizeX, square.sizeY,
         square.x, square.y, square.sizeX, square.sizeY);
    
    fill(square.r, square.g, square.b, square.value);
    noStroke();
    rect(square.x, square.y, square.sizeX, square.sizeY);
  }
}

// 绘制跟随鼠标的方块
function drawFollowingSquare() {
  if (followingSquare && !followingSquare.fixed) {
    followingSquare.x = mouseX - followingSquare.sizeX / 2; 
    followingSquare.y = mouseY - followingSquare.sizeY / 2;
    
    followingSquare.x = constrain(followingSquare.x, 0, width - followingSquare.sizeX);
    followingSquare.y = constrain(followingSquare.y, 0, height - followingSquare.sizeY);
    
    followingSquare.sizeX = redSquareSizeX;
    followingSquare.sizeY = redSquareSizeY;
    
    copy(portraitImg, 
         followingSquare.x, followingSquare.y, followingSquare.sizeX, followingSquare.sizeY,
         followingSquare.x, followingSquare.y, followingSquare.sizeX, followingSquare.sizeY);
    
    fill(followingSquare.r, followingSquare.g, followingSquare.b, followingSquare.value);
    noStroke();
    rect(followingSquare.x, followingSquare.y, followingSquare.sizeX, followingSquare.sizeY);
  }
}

/**
 * 显示当前模式信息
 */
function displayModeInfo() {
  push();
  fill(0, 200);
  noStroke();
  textSize(16);
  textAlign(RIGHT);
  
  let modeText = "";
  if (currentEffect === 1) {
    modeText = "粒子消散 - 鼠标X位置控制强度与消散起始点";
  } else if (currentEffect === 2) {
    modeText = "马赛克 - 点击方块固定/移除";
  }
  
  text(modeText, width - 20, 30);
  pop();
}

/**
 * 显示参数值（包含标签和数值）
 */
function displayParamValues() {
  push();
  fill(0);
  noStroke();
  textSize(14);
  textAlign(LEFT);
  
  // 显示当前效果的参数值
  if (currentEffect === 1) {
    text("粒子密度: " + abs(particleStep.toFixed(1)-3), 20, 90);
    text("强度: " + windStrengthMultiplier.toFixed(1), 20, 120);
  } else if (currentEffect === 2) {
    text("方块宽度: " + redSquareSizeX, 20, 90);
    text("方块高度: " + redSquareSizeY, 20, 120);
    text("马赛克大小: " + mosaicSize, 20, 150);
  }
  pop();
}

// ====== 保存和上传功能 ======

// 保存图片
function saveImage() {
  // 设置保存状态为true，这样draw函数不会绘制文字
  isSaving = true;
  
  for (let btn of effectButtons) btn.hide();
  for (let control of paramControls) {
    control.decreaseBtn.hide();
    control.increaseBtn.hide();
  }
  if (addRandomSquareBtn) addRandomSquareBtn.hide();
  if (saveBtn) saveBtn.hide();
  if (uploadBtn) uploadBtn.hide();
  
  // 立即重绘画布（不包含文字）
  redraw();
  
  // 使用现有画布保存（包含背景图片和效果）
  saveCanvas('我的作品', 'png');
  
  // 短暂延迟后恢复显示
  setTimeout(() => {
    // 恢复UI
    updateParamVisibility();
    for (let btn of effectButtons) btn.show();
    if (saveBtn) saveBtn.show();
    if (uploadBtn) uploadBtn.show();
    
    // 恢复保存状态
    isSaving = false;
  }, 100);
}

// 处理图片上传
function handleFile(file) {
  if (file.type === 'image') {
    portraitImg = loadImage(file.data, () => {
      portraitImg.resize(width, height);
      portraitImg.loadPixels();
      initMosaicGrid();
    });
  }
}

// ====== UI创建函数 ======

/**
 * 创建用户界面控件
 */
function createUI() {
  // 创建效果切换按钮
  createEffectButton('粒子消散', 20, 20, 1);
  createEffectButton('马赛克', 120, 20, 2);
  
  // 创建保存和上传按钮
  createSaveAndUploadButtons();
  
  // 创建粒子效果参数控制
  createParamControl(0, 85, 0.2, (isIncrease) => {
    if (isIncrease) {
      particleStep = max(0.5, particleStep - 0.2);
    } else {
      particleStep = min(3, particleStep + 0.2);
    }
  }, 1);
  
  createParamControl(0, 115, 0.2, (isIncrease) => {
    if (isIncrease) {
      windStrengthMultiplier = min(8, windStrengthMultiplier + 0.2);
    } else {
      windStrengthMultiplier = max(2, windStrengthMultiplier - 0.2);
    }
  }, 1);
  
  // 创建马赛克效果参数控制
  createParamControl(15, 85, 10, (isIncrease) => {
    if (isIncrease) {
      redSquareSizeX = min(800, redSquareSizeX + 10);
    } else {
      redSquareSizeX = max(50, redSquareSizeX - 10);
    }
    if (followingSquare && !followingSquare.fixed) {
      followingSquare.sizeX = redSquareSizeX;
    }
  }, 2);
  
  createParamControl(15, 115, 10, (isIncrease) => {
    if (isIncrease) {
      redSquareSizeY = min(800, redSquareSizeY + 10);
    } else {
      redSquareSizeY = max(50, redSquareSizeY - 10);
    }
    if (followingSquare && !followingSquare.fixed) {
      followingSquare.sizeY = redSquareSizeY;
    }
  }, 2);
  
  createParamControl(15, 145, 1, (isIncrease) => {
    if (isIncrease) {
      mosaicSize = min(50, mosaicSize + 1);
    } else {
      mosaicSize = max(5, mosaicSize - 1);
    }
    initMosaicGrid();
  }, 2);
  
  createAddSquareButton();
  
  updateParamVisibility();
}

// 创建保存和上传按钮
function createSaveAndUploadButtons() {
  // 保存按钮
  saveBtn = createButton('💾 保存');
  saveBtn.position(width - 100, 100);
  saveBtn.mousePressed(saveImage);
  saveBtn.style('padding', '10px 15px');
  saveBtn.style('border-radius', '5px');
  saveBtn.style('border', 'none');
  saveBtn.style('cursor', 'pointer');
  saveBtn.style('background-color', '#4bad4f8a');
  saveBtn.style('color', 'white');
  saveBtn.style('font-family', 'Arial, sans-serif');
  saveBtn.style('font-size', '14px');
  saveBtn.style('font-weight', 'bold');
  
  // 上传按钮
  uploadBtn = createButton('📁 上传图片');
  uploadBtn.position(width - 130, 50);
  uploadBtn.mousePressed(() => {
    // 创建隐藏的文件输入元素
    if (!fileInput) {
      fileInput = createFileInput(handleFile);
      fileInput.position(-100, -100); // 隐藏
      fileInput.elt.accept = 'image/*';
    }
    fileInput.elt.click();
  });
  uploadBtn.style('padding', '10px 15px');
  uploadBtn.style('border-radius', '5px');
  uploadBtn.style('border', 'none');
  uploadBtn.style('cursor', 'pointer');
  uploadBtn.style('background-color', '#31a2ff83');
  uploadBtn.style('color', 'white');
  uploadBtn.style('font-family', 'Arial, sans-serif');
  uploadBtn.style('font-size', '14px');
  uploadBtn.style('font-weight', 'bold');
}

// 创建"添加新方块"按钮
function createAddSquareButton() {
  addRandomSquareBtn = createButton('+ 添加新方块');
  addRandomSquareBtn.position(20, 170);
  addRandomSquareBtn.mousePressed(() => {
    if (currentEffect === 2) {
      if (!followingSquare) {
        createNewFollowingSquare();
      }
    }
  });
  
  addRandomSquareBtn.style('padding', '8px 12px');
  addRandomSquareBtn.style('border-radius', '5px');
  addRandomSquareBtn.style('border', 'none');
  addRandomSquareBtn.style('cursor', 'pointer');
  addRandomSquareBtn.style('background-color', '#ec9eff60');
  addRandomSquareBtn.style('color', '#676767ff');
  addRandomSquareBtn.style('font-family', 'Arial, sans-serif');
  addRandomSquareBtn.style('font-size', '14px');
  addRandomSquareBtn.style('font-weight', 'bold');
  
  addRandomSquareBtn.hide();
}

/**
 * 创建效果按钮
 */
function createEffectButton(label, x, y, effectNum) {
  let btn = createButton(label);
  btn.position(x, y);
  
  btn.mousePressed(() => {
    setEffect(effectNum);
  });
  
  if (effectNum === currentEffect) {
    btn.style('background-color', '#4362eea5');
    btn.style('color', 'white');
  } else {
    btn.style('background-color', '#2a2d4387');
    btn.style('color', '#e0e0e0');
  }
  
  btn.style('padding', '10px 15px');
  btn.style('border-radius', '5px');
  btn.style('border', 'none');
  btn.style('cursor', 'pointer');
  btn.style('font-family', 'Arial, sans-serif');
  btn.style('font-size', '14px');
  btn.style('font-weight', 'bold');
  
  effectButtons.push(btn);
}

/**
 * 创建参数控制
 */
function createParamControl(x, y, step, callback, effectNum) {
  let decreaseBtn = createButton('▼');
  decreaseBtn.position(x + 120, y - 10);
  decreaseBtn.mousePressed(() => {
    callback(false);
  });
  decreaseBtn.style('width', '30px');
  decreaseBtn.style('height', '25px');
  decreaseBtn.style('padding', '0');
  decreaseBtn.style('border-radius', '3px');
  decreaseBtn.style('border', 'none');
  decreaseBtn.style('cursor', 'pointer');
  decreaseBtn.style('background-color', '#72727264');
  decreaseBtn.style('color', '#e0e0e0');
  decreaseBtn.style('font-size', '12px');
  
  let increaseBtn = createButton('▲');
  increaseBtn.position(x + 160, y - 10);
  increaseBtn.mousePressed(() => {
    callback(true);
  });
  increaseBtn.style('width', '30px');
  increaseBtn.style('height', '25px');
  increaseBtn.style('padding', '0');
  increaseBtn.style('border-radius', '3px');
  increaseBtn.style('border', 'none');
  increaseBtn.style('cursor', 'pointer');
  increaseBtn.style('background-color', '#72727264');
  increaseBtn.style('color', '#e0e0e0');
  increaseBtn.style('font-size', '12px');
  
  paramControls.push({
    decreaseBtn: decreaseBtn,
    increaseBtn: increaseBtn,
    effect: effectNum
  });
}

/**
 * 更新参数控件可见性
 */
function updateParamVisibility() {
  for (let control of paramControls) {
    if (control.effect === currentEffect) {
      control.decreaseBtn.show();
      control.increaseBtn.show();
    } else {
      control.decreaseBtn.hide();
      control.increaseBtn.hide();
    }
  }
  
  if (currentEffect === 2) {
    addRandomSquareBtn.show();
  } else {
    addRandomSquareBtn.hide();
  }
}

// ====== 效果切换函数 ======

/**
 * 设置当前效果
 */
function setEffect(effectNum) {
  currentEffect = effectNum;
  
  for (let i = 0; i < effectButtons.length; i++) {
    if (i < 2) {
      if (i === effectNum - 1) {
        effectButtons[i].style('background-color', '#4362eea5');
        effectButtons[i].style('color', 'white');
      } else {
        effectButtons[i].style('background-color', '#2a2d4387');
        effectButtons[i].style('color', '#e0e0e0');
      }
    }
  }
  
  if (effectNum === 2) {
    initMosaicGrid();
    if (!followingSquare) {
      createNewFollowingSquare();
    }
  }
  
  updateParamVisibility();
}