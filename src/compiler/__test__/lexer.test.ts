import Lexer from '../lexer.ts'
import { TokenType } from '../tokenType.ts'

test('lexer html', () => {
    const lexer = new Lexer('<html lang="en"><body></body></body></html>')
    const tokens = lexer.scanAll()
    expect(tokens.length).toBe(1)
    expect(tokens[0].type).toBe(TokenType.HTML)
})

test('lexer comment', () => {
    const lexer = new Lexer('<html lang="en">{# some comment #}</body></html>')
    const tokens = lexer.scanAll()
    expect(tokens.length).toBe(3)
    expect(tokens[1].type).toBe(TokenType.COMMENT)
})

test('lexer tag', () => {
    const lexer = new Lexer('<html lang="en">{{ if 1 }}</body></html>')
    const tokens = lexer.scanAll()
    expect(tokens.length).toBe(3)
    expect(tokens[1].type).toBe(TokenType.TagIf)
})
