export async function getOutcome() {
  const response = await fetch('https://das-vagon-api.das-uty.uz/api/v1/outcome/planned/released', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })

  if (!response.ok) {
    throw new Error('Serverda maummo')
  }

  return response.json()
}
