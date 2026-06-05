export const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    return `${import.meta.env.VITE_BASE_URL}${imagePath}`
}
