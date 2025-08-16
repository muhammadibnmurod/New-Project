export async function getTakenOutVagons(date = '') {
  const url = new URL('http://192.168.136.207:3000/outcome/current/taken-out')
  if (date) {
    url.searchParams.append('date', date)
  }

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP xatosi! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("API ma'lumotlarini olishda xatolik yuz berdi:", error)
    throw error
    message
  }
}
