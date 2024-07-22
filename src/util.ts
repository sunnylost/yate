export function uuid() {
    return `${Math.random().toString(16)}000000000`.substring(2, 8).substring(0, 8)
}
