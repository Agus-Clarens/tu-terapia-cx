export const CARGADO_POR = [
  'Sol CX', 'Agus Admin', 'Sofi Admin', 'Orne Talent',
  'Caro Talent', 'Belu Talent', 'Nico Director', 'Nacho Director',
]

export const PAISES = ['Argentina', 'Uruguay']

export const ESTADOS = ['Nuevo', 'En curso', 'Requiere atención', 'Cerrado']

export const TIPOS_CASO: Record<string, { area: string; requiere_descuento: boolean; tipos: string[] }> = {
  'Admin': {
    area: 'Admin',
    requiere_descuento: false,
    tipos: [
      'Link de pago', 'Devolucion dentro del plazo', 'Devolucion fuera del plazo sin falla',
      'Envio de factura', 'Problema con factura', 'Cupon no aplicado', 'Pago duplicado',
      'Transferencia sesiones', 'Contracargo MP', 'Cambiar modalidad',
    ],
  },
  'Talent': {
    area: 'Talent',
    requiere_descuento: false,
    tipos: [
      'Disponibilidad agenda', 'No confirma sesion', 'Cancelacion psicologo',
      'Calendario incorrecto', 'Sesiones pendientes aprobacion', 'Psicologo fantasmeado',
      'Pocas horas', 'Sin horas', 'Mejora perfil',
    ],
  },
  'Admin+Talent (con descuento)': {
    area: 'Admin+Talent',
    requiere_descuento: true,
    tipos: [
      'Devolucion fuera plazo con falla', 'Sesion sin consentimiento',
      'Sesion marcada realizada no ocurrio', 'Descontar sesion',
    ],
  },
  'Admin+Talent': {
    area: 'Admin+Talent',
    requiere_descuento: false,
    tipos: [
      'Desvinculacion con pacientes activos', 'Cobra fuera plataforma',
      'Horario incorrecto con dano',
    ],
  },
  'CX': {
    area: 'CX',
    requiere_descuento: false,
    tipos: [
      'Contactar retencion', 'Derivacion psicologo',
      'Mala experiencia devolucion autonoma', 'Cancelacion por paciente',
    ],
  },
}

export function getTipoCasoInfo(tipo: string): { area: string; requiere_descuento: boolean } | null {
  for (const config of Object.values(TIPOS_CASO)) {
    if (config.tipos.includes(tipo)) {
      return { area: config.area, requiere_descuento: config.requiere_descuento }
    }
  }
  return null
}

export const STATUS_COLORS: Record<string, string> = {
  'Nuevo': '#75B781',
  'En curso': '#FCD07F',
  'Requiere atención': '#F29683',
  'Cerrado': '#9CA3AF',
}
