import React, { useState } from 'react'

function toggleSign(expression) {
  if (!expression) {
    return '-'
  }

  let idx = expression.length - 1
  while (idx >= 0 && /[0-9.]/.test(expression[idx])) {
    idx -= 1
  }

  const trailingStart = idx + 1

  if (trailingStart === expression.length) {
    return `${expression}-`
  }

  let tokenStart = trailingStart

  if (
    tokenStart > 0 &&
    expression[tokenStart - 1] === '-' &&
    (tokenStart - 1 === 0 || /[+\-x÷*/%]/.test(expression[tokenStart - 2]))
  ) {
    tokenStart -= 1
  }

  const token = expression.slice(tokenStart)
  if (!token.length) {
    return `${expression}-`
  }

  if (token[0] === '-') {
    return `${expression.slice(0, tokenStart)}${token.slice(1)}`
  }

  return `${expression.slice(0, tokenStart)}-${token}`
}

function Button({ className = '', onClick, children }) {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  )
}

function normalizeApiResponse(data) {
  if (data && typeof data.result !== 'undefined') {
    return data
  }

  if (data && typeof data.body === 'string') {
    try {
      const parsedBody = JSON.parse(data.body)
      return parsedBody && typeof parsedBody === 'object' ? parsedBody : {}
    } catch (error) {
      return {}
    }
  }

  return {}
}

function App() {
  const defaultUrl = 'https://e1j89cwifa.execute-api.us-east-2.amazonaws.com/test/CalculatorManager'
  const calculateApiUrl =
    import.meta.env.VITE_CALC_API_URL ||
    (import.meta.env.DEV ? '/api/calculate' : defaultUrl)
  const [expression, setExpression] = useState('')
  const [error, setError] = useState('')

  const handleClick = async (value) => {
    if (value === 'Clear') {
      setExpression('')
      setError('')
      return
    }

    if (value === 'Backspace') {
      setExpression((prev) => prev.slice(0, -1))
      setError('')
      return
    }

    if (value === '+/-') {
      setExpression((prev) => toggleSign(prev))
      setError('')
      return
    }

    if (value === '=') {
      if (!expression) {
        return
      }

      try {
        const response = await fetch(calculateApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression })
        })

        const rawData = await response.json()
        const data = normalizeApiResponse(rawData)

        if (!response.ok) {
          throw new Error(data.error || 'Failed to evaluate')
        }

        setExpression(String(data.result))
        setError('')
      } catch (err) {
        setError(err.message)
      }

      return
    }

    setExpression((prev) => `${prev}${value}`)
    setError('')
  }

  return (
    <main className="calculator-app">
      <h1 className="title">Calculator</h1>

      <section className="display" aria-live="polite">
        <div className="expression">{expression || '0'}</div>
        <div className="error">{error}</div>
      </section>

      <section className="button-grid" aria-label="calculator keys">
        <Button className="span-2" onClick={() => handleClick('Clear')}>Clear</Button>
        <Button onClick={() => handleClick('Backspace')}>Backspace</Button>
        <Button onClick={() => handleClick('+/-')}>+/-</Button>

        <Button onClick={() => handleClick('7')}>7</Button>
        <Button onClick={() => handleClick('8')}>8</Button>
        <Button onClick={() => handleClick('9')}>9</Button>
        <Button onClick={() => handleClick('÷')}>÷</Button>

        <Button onClick={() => handleClick('4')}>4</Button>
        <Button onClick={() => handleClick('5')}>5</Button>
        <Button onClick={() => handleClick('6')}>6</Button>
        <Button onClick={() => handleClick('x')}>x</Button>

        <Button onClick={() => handleClick('1')}>1</Button>
        <Button onClick={() => handleClick('2')}>2</Button>
        <Button onClick={() => handleClick('3')}>3</Button>
        <Button onClick={() => handleClick('-')}>-</Button>

        <Button className="span-2" onClick={() => handleClick('0')}>0</Button>
        <Button onClick={() => handleClick('.')}>.</Button>
        <Button onClick={() => handleClick('+')}>+</Button>

        <Button className="span-2 equal" onClick={() => handleClick('%')}>%</Button>
        <Button className="span-2 equal" onClick={() => handleClick('=')}>=</Button>
      </section>
    </main>
  )
}

export default App
