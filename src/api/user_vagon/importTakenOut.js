import axios from 'axios'

const API_URL = 'https://das-vagon-api.das-uty.uz/api/v1'

export const getImportTakenOut = async (filterType = 'daily') => {
  try {
    const response = await axios.get(`${API_URL}/outcome/planned/import-taken-out`, {
      params: { filterType },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching import-taken-out data:', error)
    throw error
  }
}
