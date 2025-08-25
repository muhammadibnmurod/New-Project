import axios from 'axios'

const BASE_URL = 'https://das-vagon-api.das-uty.uz/api/v1'

export async function getPlannedTakenOutWagons(date = null, ownerType = null, ownershipId = null) {
  try {
    const params = {}
    if (date) params.date = date
    if (ownerType) params.ownerType = ownerType
    if (ownershipId) params.ownershipId = ownershipId

    const response = await axios.get(`${BASE_URL}/outcome/planned/taken-out`, { params })

    return response.data
  } catch (error) {
    console.error("Ma'lumotlarni yuklashda xatolik yuz berdi:", error)
    throw error
  }
}
