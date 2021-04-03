import { Repartidor } from "./usert.interface";


// Generated by https://quicktype.io

export interface Pedido {
    address_negocio:      string;
    address_user:         AddressUser;
    createdAt:            string;
    formaPago:            string;
    ganancia:             number;
    id:                   string;
    id_delivery:          string;
    id_nano:              string;
    id_negocio:           string;
    id_order:             string;
    id_user:              string;
    name_delivery:        string;
    negocio_name:         string;
    phone_delivery:       string;
    phone_number_negocio: string;
    phone_number_user:    string;
    status:               string;
    total:                number;
    user_name:            string;
    repartidor?: Repartidor
    solicitado?: boolean
    recolectado?: boolean
    repartidor_llego?: boolean
}

export interface AddressUser {
    direccion:  string;
    estado:     string;
    referencia: string;
    titulo:     string;
}


export interface Order {
    createdAt: number
    address_user: Address
    address_negocio: Address
    id_user: string
    id_order: string
    id_nano: string
    id_negocio: string
    phone_number_user: string
    phone_number_negocio: string
    status: string
    total: number
    user_name: string
    negocio_name: string
    ganancia: number
    formaPago: string
    repartidor?: Repartidor
    solicitado?: boolean
    recolectado?: boolean
    repartidor_llego?: boolean
}

export interface Address {
    lat: number
    lng: number
    direccion: string
}