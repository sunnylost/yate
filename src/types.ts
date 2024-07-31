export type RenderContext = object

export type RenderError = Error | null

export type RenderCallback = (error: RenderError, data?: unknown) => void
