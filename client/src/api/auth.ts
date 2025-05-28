import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})
export async function getAllUsers(token: string) {
  const res = await API.get('/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
export default API
