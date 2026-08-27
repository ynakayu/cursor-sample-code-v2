const display = document.getElementById('display');

function appendValue(value) {
  // #region agent log
  fetch('http://127.0.0.1:7754/ingest/715b0e30-0771-417f-8039-3501a82fe44b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a48f6a'},body:JSON.stringify({sessionId:'a48f6a',runId:'initial',hypothesisId:'H2-H3',location:'main.js:4',message:'appendValue entry',data:{value,current:display.value},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (display.value === '0' || display.value === 'Error') {
    if (['+', '-', '*', '/', ')'].includes(value)) {
      return;
    }

    if (value === '.') {
      display.value = '0.';
      return;
    }

    display.value = value;
    return;
  }

  display.value += value;
  // #region agent log
  fetch('http://127.0.0.1:7754/ingest/715b0e30-0771-417f-8039-3501a82fe44b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a48f6a'},body:JSON.stringify({sessionId:'a48f6a',runId:'initial',hypothesisId:'H2-H3',location:'main.js:21',message:'appendValue exit',data:{next:display.value},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

function clearDisplay() {
  display.value = '0';
}

function calculateResult() {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7754/ingest/715b0e30-0771-417f-8039-3501a82fe44b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a48f6a'},body:JSON.stringify({sessionId:'a48f6a',runId:'initial',hypothesisId:'H1-H2',location:'main.js:31',message:'calculateResult start',data:{expression:display.value},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const result = Function(`return ${display.value}`)();
    // #region agent log
    fetch('http://127.0.0.1:7754/ingest/715b0e30-0771-417f-8039-3501a82fe44b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a48f6a'},body:JSON.stringify({sessionId:'a48f6a',runId:'initial',hypothesisId:'H1',location:'main.js:34',message:'calculateResult eval success',data:{result},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!Number.isFinite(result)) {
      display.value = 'Error';
      return;
    }

    display.value = String(result);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7754/ingest/715b0e30-0771-417f-8039-3501a82fe44b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a48f6a'},body:JSON.stringify({sessionId:'a48f6a',runId:'initial',hypothesisId:'H1-H2',location:'main.js:45',message:'calculateResult catch',data:{name:error?.name,message:error?.message,expression:display.value},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    display.value = 'Error';
  }
}

document.addEventListener('keydown', (event) => {
  const key = event.key;
  // #region agent log
  fetch('http://127.0.0.1:7754/ingest/715b0e30-0771-417f-8039-3501a82fe44b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a48f6a'},body:JSON.stringify({sessionId:'a48f6a',runId:'initial',hypothesisId:'H4',location:'main.js:53',message:'keydown event',data:{key,current:display.value},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if ((key >= '0' && key <= '9') || ['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
    appendValue(key);
    return;
  }

  if (key === 'Enter') {
    calculateResult();
    return;
  }

  if (key === 'Escape') {
    clearDisplay();
    return;
  }

  if (key === 'Backspace') {
    if (display.value.length <= 1 || display.value === 'Error') {
      display.value = '0';
    } else {
      display.value = display.value.slice(0, -1);
    }
  }
});
