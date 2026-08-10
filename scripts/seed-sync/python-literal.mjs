/**
 * A tiny parser for the *literal* subset of Python used by the `lennix_pro`
 * seed modules in `lennix-ms-bk`.
 *
 * It is deliberately NOT a Python interpreter: it understands strings (incl.
 * implicit concatenation), numbers, booleans, `None`, lists, tuples, dicts,
 * identifiers resolved from a symbol table, and calls dispatched to handlers
 * supplied by the caller (`uuid.UUID`, `Decimal`, `date`, the seed's own
 * `_task()` / `_expense()` / `_notif()` factories, …).
 *
 * Anything it does not understand raises — a silent wrong value would defeat
 * the whole point of deriving the frontend fixtures from the seed.
 */

const NAME_START = /[A-Za-z_]/
const NAME_CHAR = /[A-Za-z0-9_]/
const DIGIT = /[0-9]/

export class PythonParseError extends Error {}

export class PythonExprParser {
  /**
   * @param {string} src full module source
   * @param {{symbols?: Record<string, unknown>, calls?: Record<string, (args: unknown[], kwargs: Record<string, unknown>) => unknown>}} options
   */
  constructor(src, { symbols = {}, calls = {} } = {}) {
    this.src = src
    this.symbols = symbols
    this.calls = calls
    this.pos = 0
  }

  fail(message) {
    const line = this.src.slice(0, this.pos).split('\n').length
    throw new PythonParseError(
      `${message} (line ${line}: ${JSON.stringify(this.src.slice(this.pos, this.pos + 40))})`,
    )
  }

  skipTrivia() {
    for (;;) {
      const c = this.src[this.pos]
      if (c === undefined) return
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\\') {
        this.pos++
        continue
      }
      if (c === '#') {
        while (this.pos < this.src.length && this.src[this.pos] !== '\n')
          this.pos++
        continue
      }
      return
    }
  }

  peek() {
    this.skipTrivia()
    return this.src[this.pos]
  }

  eat(char) {
    this.skipTrivia()
    if (this.src[this.pos] !== char) this.fail(`expected '${char}'`)
    this.pos++
  }

  tryEat(char) {
    this.skipTrivia()
    if (this.src[this.pos] !== char) return false
    this.pos++
    return true
  }

  readName() {
    this.skipTrivia()
    if (!NAME_START.test(this.src[this.pos] ?? '')) this.fail('expected a name')
    const start = this.pos
    while (NAME_CHAR.test(this.src[this.pos] ?? '')) this.pos++
    return this.src.slice(start, this.pos)
  }

  /** Reads one string literal (prefixes `f`/`r`/`b` are rejected on purpose). */
  readString() {
    const quoteChar = this.src[this.pos]
    const triple = this.src.startsWith(quoteChar.repeat(3), this.pos)
    const closing = triple ? quoteChar.repeat(3) : quoteChar
    this.pos += closing.length
    let out = ''
    for (;;) {
      if (this.pos >= this.src.length) this.fail('unterminated string')
      if (this.src.startsWith(closing, this.pos)) {
        this.pos += closing.length
        return out
      }
      const c = this.src[this.pos]
      if (c === '\\') {
        const next = this.src[this.pos + 1]
        const escapes = {
          n: '\n',
          t: '\t',
          r: '\r',
          '\\': '\\',
          "'": "'",
          '"': '"',
        }
        if (next in escapes) {
          out += escapes[next]
          this.pos += 2
          continue
        }
        this.fail(`unsupported escape '\\${next}'`)
      }
      out += c
      this.pos++
    }
  }

  readNumber() {
    const start = this.pos
    if (this.src[this.pos] === '-') this.pos++
    while (DIGIT.test(this.src[this.pos] ?? '') || this.src[this.pos] === '_')
      this.pos++
    if (this.src[this.pos] === '.') {
      this.pos++
      while (DIGIT.test(this.src[this.pos] ?? '')) this.pos++
    }
    return Number(this.src.slice(start, this.pos).replaceAll('_', ''))
  }

  /** Parses one expression starting at the current position. */
  parseExpr() {
    this.skipTrivia()
    const c = this.src[this.pos]
    if (c === undefined) this.fail('unexpected end of input')

    if (c === '"' || c === "'") {
      // Python implicit string concatenation: "a" "b" == "ab".
      let value = this.readString()
      for (;;) {
        const save = this.pos
        this.skipTrivia()
        const next = this.src[this.pos]
        if (next === '"' || next === "'") {
          value += this.readString()
          continue
        }
        this.pos = save
        return value
      }
    }
    if (c === '[') return this.parseSequence(']')
    if (c === '(') return this.parseSequence(')')
    if (c === '{') return this.parseDict()
    if (
      DIGIT.test(c) ||
      (c === '-' && DIGIT.test(this.src[this.pos + 1] ?? ''))
    )
      return this.readNumber()
    if (NAME_START.test(c)) return this.parseNameExpr()
    return this.fail('unsupported expression')
  }

  parseSequence(close) {
    this.pos++ // opening bracket
    const items = []
    for (;;) {
      if (this.tryEat(close)) return items
      items.push(this.parseExpr())
      if (this.tryEat(',')) continue
      this.eat(close)
      return items
    }
  }

  parseDict() {
    this.pos++ // '{'
    /** @type {Record<string, unknown>} */
    const out = {}
    for (;;) {
      if (this.tryEat('}')) return out
      const key = this.parseExpr()
      if (typeof key !== 'string')
        this.fail('only string dict keys are supported')
      this.eat(':')
      out[key] = this.parseExpr()
      if (this.tryEat(',')) continue
      this.eat('}')
      return out
    }
  }

  parseNameExpr() {
    let name = this.readName()
    if (name === 'True') return true
    if (name === 'False') return false
    if (name === 'None') return null

    // Dotted path: uuid.UUID, RiskLevel.HIGH, …
    while (this.src[this.pos] === '.') {
      this.pos++
      name += `.${this.readName()}`
    }

    if (this.src[this.pos] === '(') {
      const { args, kwargs } = this.parseCallArgs()
      const handler = this.calls[name]
      if (handler) return handler(args, kwargs)
      // `SOME_DICT.keys()` / `.values()` on an already-resolved literal.
      const dot = name.lastIndexOf('.')
      const receiver = dot === -1 ? undefined : this.symbols[name.slice(0, dot)]
      if (receiver && typeof receiver === 'object') {
        const method = name.slice(dot + 1)
        if (method === 'keys') return Object.keys(receiver)
        if (method === 'values') return Object.values(receiver)
      }
      return this.fail(`no handler registered for call '${name}('`)
    }

    if (name in this.symbols) return this.symbols[name]
    // `SomeEnum.MEMBER.value` — StrEnum members are seeded by their wire value.
    if (
      name.endsWith('.value') &&
      name.slice(0, -'.value'.length) in this.symbols
    )
      return this.symbols[name.slice(0, -'.value'.length)]
    return this.fail(`unknown identifier '${name}'`)
  }

  parseCallArgs() {
    this.pos++ // '('
    /** @type {unknown[]} */
    const args = []
    /** @type {Record<string, unknown>} */
    const kwargs = {}
    for (;;) {
      if (this.tryEat(')')) return { args, kwargs }
      // Look ahead for `name=` (but not `name ==`, which the seed never uses).
      const save = this.pos
      this.skipTrivia()
      if (NAME_START.test(this.src[this.pos] ?? '')) {
        const keyword = this.readName()
        this.skipTrivia()
        if (this.src[this.pos] === '=' && this.src[this.pos + 1] !== '=') {
          this.pos++
          kwargs[keyword] = this.parseExpr()
          if (this.tryEat(',')) continue
          this.eat(')')
          return { args, kwargs }
        }
      }
      this.pos = save
      args.push(this.parseExpr())
      if (this.tryEat(',')) continue
      this.eat(')')
      return { args, kwargs }
    }
  }
}

/**
 * Finds every call to `functionName(` in the source and parses its arguments.
 * Used for entities the seed builds inline inside its `async def` bodies
 * (the broken-dependency and force-start demos), which have no module-level
 * assignment to evaluate.
 *
 * @returns {{args: unknown[], kwargs: Record<string, unknown>}[]}
 */
export function parseCallSites(
  src,
  functionName,
  { symbols = {}, calls = {} } = {},
) {
  const out = []
  let from = 0
  for (;;) {
    const at = src.indexOf(`${functionName}(`, from)
    if (at === -1) return out
    from = at + functionName.length
    const before = src[at - 1] ?? ''
    if (NAME_CHAR.test(before) || before === '.') continue
    const parser = new PythonExprParser(src, { symbols, calls })
    parser.pos = at + functionName.length
    out.push(parser.parseCallArgs())
  }
}

/**
 * Reads `NAME = "value"` members out of a Python `StrEnum` class body, keyed by
 * `EnumName.MEMBER` so the expression parser can resolve them by dotted path.
 */
export function parseStrEnum(src, enumName) {
  const start = src.indexOf(`class ${enumName}(`)
  if (start === -1) throw new PythonParseError(`enum '${enumName}' not found`)
  const rest = src.slice(start)
  const end = rest.indexOf('\nclass ', 1)
  const body = end === -1 ? rest : rest.slice(0, end)
  /** @type {Record<string, string>} */
  const out = {}
  for (const match of body.matchAll(
    /^[ \t]+([A-Z][A-Z0-9_]*)\s*=\s*"([^"]*)"/gm,
  ))
    out[`${enumName}.${match[1]}`] = match[2]
  if (Object.keys(out).length === 0)
    throw new PythonParseError(`enum '${enumName}' has no string members`)
  return out
}

/** Splits a parameter/argument list on top-level commas. */
function splitTopLevel(text) {
  const parts = []
  let depth = 0
  let current = ''
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quote) {
      current += c
      if (c === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      current += c
      continue
    }
    if (c === '#') {
      while (i < text.length && text[i] !== '\n') i++
      continue
    }
    if ('([{'.includes(c)) depth++
    if (')]}'.includes(c)) depth--
    if (c === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += c
  }
  if (current.trim()) parts.push(current)
  return parts
}

/**
 * Reads a `def name(...)` signature and returns its parameters in order with
 * their default values (parsed with the same literal parser), so a call to that
 * factory in the seed can be resolved exactly the way Python would resolve it.
 *
 * @returns {{names: string[], defaults: Record<string, unknown>}}
 */
export function parseSignature(src, functionName, parserOptions = {}) {
  const marker = `def ${functionName}(`
  const start = src.indexOf(marker)
  if (start === -1)
    throw new PythonParseError(`function '${functionName}' not found`)
  let depth = 0
  let i = start + marker.length - 1
  for (; i < src.length; i++) {
    if (src[i] === '(') depth++
    else if (src[i] === ')') {
      depth--
      if (depth === 0) break
    }
  }
  const body = src.slice(start + marker.length, i)
  const names = []
  /** @type {Record<string, unknown>} */
  const defaults = {}
  for (const rawParam of splitTopLevel(body)) {
    const param = rawParam.trim()
    if (!param || param === '*' || param.startsWith('*')) continue
    const eq = findTopLevelEquals(param)
    const declaration = eq === -1 ? param : param.slice(0, eq)
    const name = declaration.split(':')[0].trim()
    names.push(name)
    if (eq !== -1) {
      const parser = new PythonExprParser(param.slice(eq + 1), parserOptions)
      defaults[name] = parser.parseExpr()
    }
  }
  return { names, defaults }
}

function findTopLevelEquals(param) {
  let depth = 0
  let quote = null
  for (let i = 0; i < param.length; i++) {
    const c = param[i]
    if (quote) {
      if (c === quote && param[i - 1] !== '\\') quote = null
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      continue
    }
    if ('([{'.includes(c)) depth++
    if (')]}'.includes(c)) depth--
    if (
      c === '=' &&
      depth === 0 &&
      param[i + 1] !== '=' &&
      param[i - 1] !== '|'
    )
      return i
  }
  return -1
}

/**
 * Evaluates every module-level `NAME = <literal>` assignment in source order,
 * feeding each result back into the symbol table so later statements can refer
 * to earlier ones (the seed does this constantly, e.g. `P1 = PROJECT_TORRE_ID`).
 *
 * Assignments whose right-hand side this parser cannot understand are skipped:
 * the seed modules also contain imports, engines and coroutines we don't care
 * about. Callers assert on the keys they need.
 */
export function evaluateModuleAssignments(
  src,
  { symbols = {}, calls = {}, includeIndented = false } = {},
) {
  const scope = { ...symbols }
  /** @type {Record<string, unknown>} */
  const assigned = {}
  const assignmentRe = includeIndented
    ? /^[ \t]*([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=\n]+)?=\s*/gm
    : /^([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=\n]+)?=\s*/gm
  for (const match of src.matchAll(assignmentRe)) {
    const name = match[1]
    const parser = new PythonExprParser(src, { symbols: scope, calls })
    parser.pos = match.index + match[0].length
    let value
    try {
      value = parser.parseExpr()
    } catch {
      continue // not a literal we model — imports, engines, coroutines, …
    }
    scope[name] = value
    assigned[name] = value
  }
  return { scope, assigned }
}
