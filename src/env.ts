import Ext from './ext'
import Filter from './filter'
import { Builtin } from './builtin'

export default function () {
    return {
        ctx: {},
        builtin: Builtin,
        filter: Filter,
        ext: Ext
    }
}
