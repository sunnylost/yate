let gid = 0

export function uuid() {
    return `gid_${gid++}`
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
}
