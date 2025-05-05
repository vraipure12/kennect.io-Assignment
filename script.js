const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let array = [];
let actions = [];
let currentAction = 0;
let isPaused = false;
let isSorting = false;
let barWidth = 10;
let speedSlider = document.getElementById("speedSlider");

function generateArray(size = 50) {
  array = Array.from({ length: size }, () =>
    Math.floor(Math.random() * canvas.height)
  );
  actions = [];
  currentAction = 0;
  drawArray(array);
}

function drawArray(arr, highlight = -1) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = canvas.width / arr.length;
  arr.forEach((val, i) => {
    ctx.fillStyle = i === highlight ? "red" : "rgba(100, 100, 255, 0.7)";
    ctx.fillRect(i * width, canvas.height - val, width - 2, val);
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText(val, i * width + 2, canvas.height - 5);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animate(actions) {
  for (let i = currentAction; i < actions.length; i++) {
    if (isPaused) break;
    const [type, a, b] = actions[i];
    if (type === "swap") {
      [array[a], array[b]] = [array[b], array[a]];
    }
    drawArray(array, a);
    currentAction++;
    await sleep(105 - speedSlider.value);
  }
  isSorting = false;
}

async function startSort(type) {
  if (isSorting) return;
  isSorting = true;
  isPaused = false;
  actions = [];
  currentAction = 0;
  let arrCopy = [...array];

  switch (type) {
    case "insertion":
      insertionSort(arrCopy);
      break;
    case "selection":
      selectionSort(arrCopy);
      break;
    case "bubble":
      bubbleSort(arrCopy);
      break;
    case "quick":
      quickSort(arrCopy, 0, arrCopy.length - 1);
      break;
    case "merge":
      mergeSort(arrCopy, 0, arrCopy.length - 1);
      break;
    case "shell":
      shellSort(arrCopy);
      break;
  }

  await animate(actions);
}

function pauseSort() {
  if (!isSorting) return;
  isPaused = !isPaused;
  document.getElementById("pauseBtn").innerText = isPaused ? "Resume" : "Pause";
  if (!isPaused) animate(actions);
}

function stepForward() {
  if (currentAction < actions.length) {
    const [type, a, b] = actions[currentAction];
    if (type === "swap") {
      [array[a], array[b]] = [array[b], array[a]];
    }
    drawArray(array, a);
    currentAction++;
  }
}

function stepBack() {
  if (currentAction > 0) {
    generateArray(array.length);
    currentAction = 0;
    let arrCopy = [...array];
    let tempActions = [];

    // Regenerate actions up to previous point
    switch (lastSortType) {
      case "insertion":
        insertionSort(arrCopy, tempActions);
        break;
      case "selection":
        selectionSort(arrCopy, tempActions);
        break;
      case "bubble":
        bubbleSort(arrCopy, tempActions);
        break;
      case "quick":
        quickSort(arrCopy, 0, arrCopy.length - 1, tempActions);
        break;
      case "merge":
        mergeSort(arrCopy, 0, arrCopy.length - 1, tempActions);
        break;
      case "shell":
        shellSort(arrCopy, tempActions);
        break;
      default:
        return;
    }

    actions = tempActions;
    for (let i = 0; i < currentAction - 1; i++) {
      const [type, a, b] = actions[i];
      if (type === "swap") {
        [array[a], array[b]] = [array[b], array[a]];
      }
    }
    drawArray(array);
  }
}

function skipBack() {
  currentAction = 0;
  drawArray(array);
}

function skipForward() {
  while (currentAction < actions.length) {
    const [type, a, b] = actions[currentAction];
    if (type === "swap") {
      [array[a], array[b]] = [array[b], array[a]];
    }
    currentAction++;
  }
  drawArray(array);
}

function changeSize() {
  if (barWidth === 10) {
    barWidth = 5;
    generateArray(50);
  } else {
    barWidth = 10;
    generateArray(50);
  }
}

function changeCanvasSize() {
  let w = parseInt(document.getElementById("canvasWidth").value);
  let h = parseInt(document.getElementById("canvasHeight").value);
  canvas.width = w;
  canvas.height = h;
  drawArray(array);
}

// Sorting algorithms 
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0 && arr[j] < arr[j - 1]) {
      actions.push(["swap", j, j - 1]);
      [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
      j--;
    }
  }
}

function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) {
      actions.push(["swap", i, min]);
      [arr[i], arr[min]] = [arr[min], arr[i]];
    }
  }
}

function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        actions.push(["swap", j, j + 1]);
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
}

function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      actions.push(["swap", i, j]);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  actions.push(["swap", i + 1, high]);
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

function mergeSort(arr, l, r) {
  if (l >= r) return;
  let m = l + ((r - l) >> 1);
  mergeSort(arr, l, m);
  mergeSort(arr, m + 1, r);
  merge(arr, l, m, r);
}

function merge(arr, l, m, r) {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);
  let i = 0,
    j = 0,
    k = l;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      arr[k] = left[i];
      actions.push(["swap", k, k]);
      i++;
    } else {
      arr[k] = right[j];
      actions.push(["swap", k, k]);
      j++;
    }
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i++];
    actions.push(["swap", k, k]);
    k++;
  }
  while (j < right.length) {
    arr[k] = right[j++];
    actions.push(["swap", k, k]);
    k++;
  }
}

function shellSort(arr) {
  let n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j;
      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        actions.push(["swap", j, j - gap]);
        arr[j] = arr[j - gap];
      }
      arr[j] = temp;
    }
  }
}

generateArray();
