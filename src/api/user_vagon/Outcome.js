export async function getOutcome() {
  const response = await fetch('http://192.168.136.207:3000/outcome/planned/released', {
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
