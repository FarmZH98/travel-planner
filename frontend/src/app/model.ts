export interface LoginRequest {
    username: string
    password: string
}

export interface Upload {
    name: string
    title: string
    comments: string
    pictures: Blob[]
}