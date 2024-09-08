export function getSetting(key) {
    const settings = localStorage.getItem("settings")
    if (!settings) {
        return null
    }
    return JSON.parse(settings)[key] || null
}

export function getSettings() {
    const settings = localStorage.getItem("settings")
    if (!settings) {
        return {}
    }
    return JSON.parse(settings)
}

export function setSettings(settings) {
    localStorage.setItem("settings", JSON.stringify(settings))
}