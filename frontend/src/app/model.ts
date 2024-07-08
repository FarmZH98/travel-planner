export interface LoginRequest {
    username: string
    password: string
}

export interface User {
    username: string
    password: string
    firstname: string
    lastname: string
    email: string
    gender: string
    token: string
}

export interface Travel {
    title: string
    places: Place[]
    startDate: Date
    endDate: Date
    token: string
    id: string
}

export interface Place {
    name: string
    lat: number
    lon: number
    address: string 
    url: string
}

export interface WeatherData {
    icon: string
    main: string
    description: string
    city: string
}
  
export interface TravelsSlice {
    trips: Travel[]
}