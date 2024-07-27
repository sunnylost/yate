import { capitalize } from '../util.ts'
import { type Keyword, keywords, Tags, type Token, TokenType } from './tokenType.ts'

const splitterBegin = ['{{', '{#']
const splitterEnd = ['}}', '#}']

function isDigit(c: string) {
    return c >= '0' && c <= '9'
}

function isAlpha(c: string) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
}

function isAlphaNumeric(c: string) {
    return isAlpha(c) || isDigit(c)
}

function isKeyword(str: string): str is Keyword {
    return keywords.includes(str as Keyword)
}

export default class Lexer {
    #source = ''
    #pos = 0
    #size = 0
    #line = 0

    constructor(source: string) {
        this.#source = source
        this.#size = source.length
        this.#pos = 0
    }

    scan() {
        const consumeMethods: (() => Token | undefined)[] = [
            this.#consumeHTML.bind(this),
            this.#consumeComment.bind(this),
            this.#consumeTag.bind(this)
        ]

        for (const fn of consumeMethods) {
            const token = fn()

            if (token) {
                return token
            }
        }
    }

    scanAll() {
        const tokens: Token[] = []

        while (!this.#isEnd()) {
            const token = this.scan()

            if (token) {
                tokens.push(token)
            } else {
                break
            }
        }

        console.log(tokens)
        return tokens
    }

    #isEnd() {
        return this.#pos >= this.#size
    }

    #advance() {
        return this.#source[this.#pos++]
    }

    #peek(num = 0) {
        let start = this.#pos
        let text = this.#source.charAt(start)

        while (num--) {
            if (++start >= this.#size) {
                return text
            }

            text += this.#source.charAt(start)
        }

        return text
    }

    #consumeHTML() {
        let text = ''

        while (!this.#isEnd()) {
            const next = this.#peek(1)

            if (splitterBegin.includes(next)) {
                break
            }

            text += this.#source.charAt(this.#pos++)
        }

        if (text.length) {
            return this.#generateToken(TokenType.HTML, text)
        }
    }

    #consumeComment() {
        const next = this.#peek(1)

        if (splitterBegin[1] === next) {
            let text = ''
            this.#pos += 2

            while (!this.#isEnd() && this.#peek(1) !== splitterEnd[1]) {
                text += this.#source.charAt(this.#pos++)
            }

            this.#pos += 2

            if (text.length) {
                return this.#generateToken(TokenType.COMMENT, text)
            }
        } else {
            return
        }
    }

    #advanceExpressionStart() {
        if (splitterBegin[0] === this.#peek(1)) {
            this.#pos += 2

            return true
        }
    }

    #advanceExpressionEnd() {
        if (splitterEnd[0] === this.#peek(1)) {
            this.#pos += 2

            return true
        }
    }

    #scanForward(predicate: (c: string) => boolean) {
        while (!this.#isEnd() && predicate(this.#source[this.#pos])) {
            this.#pos++
        }
    }

    #consumeTag() {
        if (!this.#advanceExpressionStart()) {
            return
        }

        this.#scanForward((c) => /[ \s\t\n]/.test(c))

        const start = this.#pos
        this.#scanForward((c) => /[a-z]/.test(c))
        const tag = this.#source.substring(start, this.#pos)
        const tokens: Token[] = []

        if (Tags.includes(tag as unknown as (typeof Tags)[number])) {
            while (true) {
                const token = this.#consumeExpressionContent()

                if (token) {
                    tokens.push(token)
                } else {
                    break
                }
            }

            if (tokens.length) {
                this.#advanceExpressionEnd()
                return this.#generateToken(TokenType[`Tag${capitalize(tag)}`], '',tokens)
            }
        }
    }

    #generateToken(type: TokenType, text = '', tokens?:Token[]) {
        return {
            type,
            text,
            tokens,
            start: this.#pos - text.length - 1, // wrong
            end: this.#pos,
            line: this.#line
        }
    }

    #consumeNumber() {
        let numStr = ''
        let isInDecimal = false

        while (!this.#isEnd()) {
            const c = this.#advance()

            if (isDigit(c)) {
                numStr += c
            } else if (c === '.' && !isInDecimal) {
                isInDecimal = true
                numStr += c
            } else {
                this.#pos--
                break
            }
        }

        if (numStr.length) {
            return this.#generateToken(TokenType.NUMBER, numStr)
        }
    }

    #consumeIdentifier() {
        const start = this.#pos

        while (isAlphaNumeric(this.#peek())) this.#advance()

        const text = this.#source.substring(start, this.#pos)

        let type: TokenType

        if (isKeyword(text)) {
            type = TokenType[text.toUpperCase()]
        } else {
            type = TokenType.IDENTIFIER
        }

        return this.#generateToken(type)
    }

    #consumeString(splitter: string) {
        const start = this.#pos

        while (this.#peek() !== splitter && !this.#isEnd()) {
            if (this.#peek() === '\n') {
                this.#line++
            }
            this.#advance()
        }

        if (this.#isEnd()) {
            console.error(this.#line, 'Unterminated string.')
            return
        }

        this.#advance()

        const value = this.#source.substring(start, this.#pos)
        return this.#generateToken(TokenType.STRING, value)
    }

    #consumeExpressionContent() {
        this.#scanForward((c) => /[ \s\t\n]/.test(c))

        const c = this.#advance()

        switch (c) {
            case '(':
                return this.#generateToken(TokenType.LEFT_PAREN)

            case ')':
                return this.#generateToken(TokenType.RIGHT_PAREN)

            case '{':
                return this.#generateToken(TokenType.LEFT_BRACE)

            case '}':
                if (this.#peek() === '}') {
                    this.#pos--
                    return
                }

                return this.#generateToken(TokenType.RIGHT_BRACE)

            case ',':
                return this.#generateToken(TokenType.COMMA)

            case '.':
                return this.#generateToken(TokenType.DOT)

            case '-':
                return this.#generateToken(TokenType.MINUS)

            case '+':
                return this.#generateToken(TokenType.PLUS)

            case ';':
                return this.#generateToken(TokenType.SEMICOLON)

            case '*':
                return this.#generateToken(TokenType.STAR)

            case '!':
                return this.#generateToken(
                    this.#peek() === '=' ? TokenType.BANG_EQUAL : TokenType.BANG
                )

            case '=':
                return this.#generateToken(
                    this.#peek() === '=' ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
                )

            case '<':
                return this.#generateToken(
                    this.#peek() === '=' ? TokenType.LESS_EQUAL : TokenType.LESS
                )

            case '>':
                return this.#generateToken(
                    this.#peek() === '=' ? TokenType.GREATER_EQUAL : TokenType.GREATER
                )

            case '/':
                return this.#generateToken(TokenType.SLASH)

            case '"':
            case '':
                return this.#consumeString(c)

            case '\n':
                this.#line++
                break

            default:
                if (isDigit(c)) {
                    this.#pos--
                    return this.#consumeNumber()
                }

                if (isAlpha(c)) {
                    return this.#consumeIdentifier()
                }

                console.error('Error', c)
        }
    }
}
