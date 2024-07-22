import fs from 'node:fs'
import Compiler from './compiler.js'
import Env from './env.js'
import Tokenizer from './tokenizer.js'

export default class Template {
    constructor(config) {
        this.config = Object.assign({}, config)
        this.$tokenizer = new Tokenizer(this.config)
        this.$compiler = new Compiler(this.config)
        this.$customFilters = new Map()
    }

    addFilter(name, handler) {
        if (typeof name === 'string' && typeof handler === 'function') {
            this.$customFilters.set(name, handler)
        }
    }

    tokenizer() {
        return new Tokenizer(this)
    }

    compile(str) {
        const envName = this.$compiler.envName
        const rawFn = this.$compiler.run(str)
        const env = new Env()

        for (const [filterName, filterHandler] of this.$customFilters) {
            env.filter.addFilter(filterName, filterHandler)
        }

        return {
            env,
            template: new Function(envName, `return ${rawFn}(${envName})`)(env),
            render(ctx) {
                env.ctx = ctx || {}
                return this.template(env.ctx)
            }
        }
    }

    render(name, ctx, callback) {
        try {
            const str = fs.readFileSync(name, {
                encoding: 'utf8'
            })
            return this.renderString(str, ctx, callback)
        } catch (e) {
            console.error(e)
        }
    }

    renderString(str, ctx, callback) {
        const fn = this.compile(str)
        const hasCallback = typeof callback === 'function'

        try {
            const result = fn.render(ctx)

            if (hasCallback) {
                callback(null, result)
                return this
            }
            return result
        } catch (e) {
            if (hasCallback) {
                callback(e)
            } else {
                throw new Error(e)
            }
        }
    }
}
