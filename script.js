let currentInput = '0'; 
let accumulatedValue = null;
let pendingOperator = null;
let isNewInput = false;
let historyText = '';
let expressionText = '';
let isError = false;

const mainDisplay = document.getElementById('mainDisplay');
const subDisplay = document.getElementById('subDisplay');
const historyList = document.getElementById('historyList');

const OPERATOR_SYMBOLS = { '+': '＋', '-': '−', '*': '×', '/': '÷' };

function updateDisplay() {
  mainDisplay.textContent = currentInput;
  subDisplay.textContent = historyText;
}

function countDigits(str) {
  return str.replace(/[^0-9]/g, '').length;
}

function handleNumber(num) {
  if (isError) return;

  if (isNewInput) {
    currentInput = num;
    isNewInput = false;
  } else {
    if (countDigits(currentInput) >= 12) return;
    currentInput = currentInput === '0' ? num : currentInput + num;
  }
  updateDisplay();
}

function handleDecimal() {
  if (isError) return;

  if (isNewInput) {
    currentInput = '0.';
    isNewInput = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function calculate(a, b, op) {
  let result = 0;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) return '0では割れません';
      result = a / b;
      break;
  }
  return result;
}

function formatResult(val) {
  if (typeof val === 'string') return val;

  let rounded = Number(Math.round(val + 'e8') + 'e-8');
  let str = rounded.toString();

  let integerPart = str.split('.')[0].replace('-', '');
  if (integerPart.length > 12) {
    isError = true;
    return '桁数が多すぎます';
  }
  return str;
}

function handleOperator(op) {
  if (isError) return;

  const inputValue = parseFloat(currentInput);

  // ① 完全な初回（例: 1 を入力して * を押した時）
  if (accumulatedValue === null) {
    accumulatedValue = inputValue;
    expressionText = `${currentInput}`;
    pendingOperator = op;
    historyText = `${expressionText} ${OPERATOR_SYMBOLS[op]}`;
    isNewInput = true;
  } 
  // ② 新しい数字を入力した後に演算子が押された時（例: 1 * のあとに 3 を入力して - を押した時）
  else if (!isNewInput) {
    const calcResult = calculate(accumulatedValue, inputValue, pendingOperator);
    const formatted = formatResult(calcResult);
    
    if (formatted === '桁数が多すぎます' || formatted === '0では割れません') {
      currentInput = formatted;
      isError = true;
      updateDisplay();
      return;
    }
    
    // 式を更新して累積値を計算結果にする
    expressionText = `${expressionText} ${OPERATOR_SYMBOLS[pendingOperator]} ${currentInput}`;
    accumulatedValue = parseFloat(formatted);
    currentInput = formatted; // メイン表示用
    
    pendingOperator = op;
    historyText = `${expressionText} ${OPERATOR_SYMBOLS[op]}`;
    isNewInput = true;
  } 
  // ③ 数字を入力せずに演算子を連打・変更した時（isNewInput === true の時）
  else {
    // 式も累積値も一切いじらず、最後の演算子表記だけを付け替える
    pendingOperator = op;
    historyText = `${expressionText} ${OPERATOR_SYMBOLS[op]}`;
  }

  updateDisplay();
}

function handleEqual() {
  if (isError || pendingOperator === null || isNewInput) return;

  const inputValue = parseFloat(currentInput);
  const calcResult = calculate(accumulatedValue, inputValue, pendingOperator);
  const formattedResult = formatResult(calcResult);

  const fullEquationText = `${expressionText} ${OPERATOR_SYMBOLS[pendingOperator]} ${currentInput} = ${formattedResult}`;

  if (formattedResult !== '0では割れません' && formattedResult !== '桁数が多すぎます') {
    addHistory(fullEquationText);
  } else {
    isError = true;
  }

  currentInput = formattedResult;
  // 計算完了後、結果を使って次の計算を始められるように準備
  accumulatedValue = null;
  pendingOperator = null;
  historyText = '';
  expressionText = '';
  isNewInput = true;
  updateDisplay();
}

function handleClear() {
  currentInput = '0';
  accumulatedValue = null;
  pendingOperator = null;
  historyText = '';
  expressionText = '';
  isNewInput = false;
  isError = false;
  updateDisplay();
}

function addHistory(itemText) {
  const li = document.createElement('li');
  li.textContent = itemText;
  historyList.insertBefore(li, historyList.firstChild);
}

// イベントリスナー
document.querySelectorAll('.num').forEach(btn => {
  btn.addEventListener('click', () => handleNumber(btn.textContent));
});

document.querySelectorAll('.operator').forEach(btn => {
  btn.addEventListener('click', () => handleOperator(btn.dataset.op));
});

document.getElementById('btnDecimal').addEventListener('click', handleDecimal);
document.getElementById('btnEqual').addEventListener('click', handleEqual);
document.getElementById('btnClear').addEventListener('click', handleClear);

window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
  else if (e.key === '.') handleDecimal();
  else if (e.key === '+') handleOperator('+');
  else if (e.key === '-') handleOperator('-');
  else if (e.key === '*') handleOperator('*');
  else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); handleEqual(); }
  else if (e.key === 'Escape') handleClear();
});