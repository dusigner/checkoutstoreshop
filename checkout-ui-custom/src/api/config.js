import axios from 'axios'

const api = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 1000,
    headers: {'X-Custom-Header': 'foobar'}
})

export default api