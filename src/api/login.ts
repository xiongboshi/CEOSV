import { get, post, getDynamicynamic, getFileUseBlobByPost } from '@/request/axios'


export const postUser = (user:any) => {
    post('/api/login', user);
}