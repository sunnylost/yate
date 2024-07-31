import fs from 'node:fs'
import compile from './compiler/index.ts'
import Env from './env.ts'
import type { RenderContext, RenderCallback, RenderError } from './types.ts'

export default class Template {
    compile(code:string) {
        const env = new Env()
        const { envName, ctxName, compiledCodes } = compile(code)
        console.log(envName, ctxName)

        const templateFn = new Function(envName, `return ${compiledCodes}(${envName})`)

        return {
            render(ctx:unknown) {
                const newEnv = Object.assign({} ,env, {
                    ctx: ctx || {}
                })
                return templateFn(newEnv)(newEnv.ctx)
            }
        }
    }

    /**
     *
     * @param name
     * @param ctx
     * @param callback
     */
    render(name: string, ctx?:RenderContext, callback?:RenderCallback) {
        try {
            const str = fs.readFileSync(name, {
                encoding: 'utf8'
            })
            return this.renderString(str, ctx, callback)
        } catch (e) {
            console.error(e)
        }
    }

    renderString(str:string, ctx?:RenderContext, callback?:RenderCallback) {
        const fn = this.compile(str)
        const hasCallback = typeof callback === 'function'

        try {
            const result = fn.render(ctx)

            if (hasCallback) {
                callback(null, result)
                return this
            }
            return result
        } catch (err) {
            if (hasCallback) {
                callback(err as RenderError)
            } else {
                throw new Error(err as unknown as string)
            }
        }
    }
}
