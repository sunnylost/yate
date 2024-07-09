export default {
    htmlEncode(s) {
        const escaped = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }
        return s.replace(/[&<>'"]/g, (m) => escaped[m])
    },

    urlEncode(str) {
        return encodeURIComponent(str)
    },

    each(obj, handler) {
        if (!obj || !handler) {
            return
        }

        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                handler.call(null, obj[i], i, obj)
            }
        } else {
            for (const key of Object.getOwnPropertyNames(obj)) {
                handler.call(null, obj[key], key, obj)
            }
        }
    }
}
