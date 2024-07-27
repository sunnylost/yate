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
    BOF,
    HTML,
    COMMENT,
    ExpressionStart,
    ExpressionEnd,
    TagIf,
    TagIfEnd,
    TagFor,
    TagForEnd,
    TagSet,
    TagBlock,
    TagImport,
    TagInclude,
    TagFilter,
    TagCall,
    TagRaw,
    // expression
    LEFT_PAREN,
    RIGHT_PAREN,
    LEFT_BRACE,
    RIGHT_BRACE,
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
    NUMBER,
    STRING,
    AND,
    OR,
    IDENTIFIER,
    EOF
}

export const Tags = [
    'if',
    'for',
    'set',
    'block',
    'import',
    'include',
    'filter',
    'call',
    'raw'
] as const

export const keywords = ['and', 'or'] as const

export type Keyword = (typeof keywords)[number]

export type Token = {
    type: TokenType
    text?: string
    start: number
    end: number
    line: number
    tokens?: Token[]
}
