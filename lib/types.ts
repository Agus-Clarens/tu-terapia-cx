export interface Caso {
  id: string
  nro_caso: string
  fecha: string
  cargado_por: string
  pais: string
  pac_nombre: string
  pac_mail: string
  psi_nombre: string | null
  psi_mail: string | null
  tipo_caso: string
  area: string
  descripcion: string
  estado: string
  estado_admin: string | null
  estado_talent: string | null
  estado_cx: string | null
  requiere_descuento: boolean
  monto_descuento: number | null
  mes_descuento: string | null
  created_at: string
}

export interface Descuento {
  id: string
  caso_id: string
  nro_caso: string
  psi_nombre: string
  psi_mail: string
  pac_nombre: string
  motivo: string
  monto: number
  mes: string
  estado: string
  created_at: string
}

export interface CasoActualizacion {
  id: string
  caso_id: string
  autor: string
  texto: string
  created_at: string
}
