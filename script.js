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

// 数字入力桁数チェック（小数点は除外して12桁まで）
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
  
  // 小数第8位までで四捨五入して末尾の不要な0を削除
  let rounded = Number(Math.round(val + 'e8') + 'e-8');
  let str = rounded.toString();
  
  // 整数部分の桁数チェック
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

  if (accumulatedValue === null) {
    accumulatedValue = inputValue;
    expressionText = `${currentInput}`;
  } else if (pendingOperator && !isNewInput) {
    const calcResult = calculate(accumulatedValue, inputValue, pendingOperator);
    const formatted = formatResult(calcResult);
    
    if (formatted === '桁数が多すぎます' || formatted === '0では割れません') {
      currentInput = formatted;
      isError = true;
      updateDisplay();
      return;
    }
    // 途中計算の結果表示を行いながら、履歴用テキスト（expressionText）には元の入力を繋げて保持する
    expressionText = `${expressionText} ${OPERATOR_SYMBOLS[pendingOperator]} ${currentInput}`;
    accumulatedValue = parseFloat(formatted);
    currentInput = formatted;
  } else if (pendingOperator && isNewInput) {
    // 演算子だけを連続で変更した場合の対応
    expressionText = expressionText.substring(0, expressionText.lastIndexOf(' '));
  }

  pendingOperator = op;
  historyText = `${expressionText} ${OPERATOR_SYMBOLS[op]}`;
  isNewInput = true;
  updateDisplay();
}

function handleEqual() {
  if (isError || pendingOperator === null || isNewInput) return;

  const inputValue = parseFloat(currentInput);
  const calcResult = calculate(accumulatedValue, inputValue, pendingOperator);
  const formattedResult = formatResult(calcResult);
  
  // 最終的な式を作成（全過程をまとめた形）
  const fullEquationText = `${expressionText} ${OPERATOR_SYMBOLS[pendingOperator]} ${currentInput} = ${formattedResult}`;
  
  if (formattedResult !== '0では割れません' && formattedResult !== '桁数が多すぎます') {
    addHistory(fullEquationText);
  } else {
    isError = true;
  }

  currentInput = formattedResult;
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

// イベントリスナーのセットアップ
document.querySelectorAll('.num').forEach(btn => {
  btn.addEventListener('click', () => handleNumber(btn.textContent));
});

document.querySelectorAll('.operator').forEach(btn => {
  btn.addEventListener('click', () => handleOperator(btn.dataset.op));
});

document.getElementById('btnDecimal').addEventListener('click', handleDecimal);
document.getElementById('btnEqual').addEventListener('click', handleEqual);
document.getElementById('btnClear').addEventListener('click', handleClear);

// キーボードイベント
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