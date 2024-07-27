export default {
    exprStart: '{{',
    exprEnd: '}}',
    stmtStart: '{%',
    stmtEnd: '%}',
    commentStart: '{#',
    commentEnd: '#}',
    text: 'text',
    stmt: 'statement',
    expr: 'expression',
    comment: 'comment'
}

export enum TokenType {
    HTML,
    COMMENT,
    TagIf,
    TagEndIf,
    TagFor,
    TagEndFor,
    TagSet,
    TagBlock,
    TagImport,
    TagInclude,
    TagFilter,
    TagCall,
    TagRaw,
    LEFT_PAREN, // expression
    RIGHT_PAREN,
    LEFT_BRACE,
    RIGHT_BRACE,
    LEFT_BRACKET,
    RIGHT_BRACKET,
    COMMA,
    DOT,
    MINUS,
    PLUS,
    SEMICOLON,
    STAR,
    BANG,
    LESS,
    GREATER,
    EQUAL,
    BANG_EQUAL,
    LESS_EQUAL,
    EQUAL_EQUAL,
    GREATER_EQUAL,
    SLASH,
    IN,
    NUMBER,
    STRING,
    IDENTIFIER,
    EOF
}

export const Tags = [
    'if',
    'endif',
    'for',
    'endfor',
    'set',
    'block',
    'import',
    'include',
    'filter',
    'call',
    'raw'
] as const
export type Tag = (typeof Tags)[number]

export const keywords = ['in'] as const

export type Keyword = (typeof keywords)[number]

export type Token = {
    type: TokenType
    text?: string
    start: number
    end: number
    line: number
    tokens?: Token[]
}
