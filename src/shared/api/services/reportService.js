import adminClient from '../adminClient'
import useReportStore from '../../stores/useReportStore'
import toast from 'react-hot-toast'

/**
 * Servicio de Reportes
 * Incluye endpoints de análisis del backend:
 * - Demanda de restaurantes
 * - Top de platos
 * - Ingresos
 * - Horas pico
 * - Reservaciones
 * - Desempeño por restaurante
 * - Ocupación
 * - Clientes frecuentes
 * - Pedidos recurrentes
 */

const REPORTS_STORAGE_KEY = 'restaurante_reports'

const getStoredReports = () => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error al leer reportes del storage:', error)
    return []
  }
}

const saveStoredReports = (reports) => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports))
    return true
  } catch (error) {
    console.error('Error al guardar reportes en storage:', error)
    return false
  }
}

export const reportService = {
  // ============== CRUD GENERAL ==============
  
  // Obtener todos los reportes guardados
  getReports: async () => {
    try {
      useReportStore.getState().setLoading(true)
      const storedReports = getStoredReports()
      useReportStore.getState().setReports(storedReports)
      return { success: true, data: storedReports }
    } catch (error) {
      toast.error('Error al obtener reportes')
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Crear reporte
  createReport: async (reportData) => {
    try {
      const newReport = {
        ...reportData,
        _id: Date.now().toString(),
        fechaCreacion: reportData.fechaCreacion || new Date().toISOString(),
      }

      const allReports = getStoredReports()
      allReports.push(newReport)
      saveStoredReports(allReports)
      useReportStore.getState().addReport(newReport)
      toast.success('Reporte creado exitosamente')
      return { success: true, data: newReport }
    } catch (error) {
      toast.error('Error al crear reporte')
      return { success: false, error: error.message }
    }
  },

  // Actualizar reporte
  updateReport: async (id, reportData) => {
    try {
      const updatedReport = {
        ...reportData,
        _id: id,
        fechaActualizacion: new Date().toISOString(),
      }

      const allReports = getStoredReports()
      const index = allReports.findIndex(r => r._id === id)
      if (index !== -1) {
        allReports[index] = updatedReport
        saveStoredReports(allReports)
        useReportStore.getState().updateReport(id, updatedReport)
        toast.success('Reporte actualizado exitosamente')
        return { success: true, data: updatedReport }
      }
      throw new Error('Reporte no encontrado')
    } catch (error) {
      toast.error('Error al actualizar reporte')
      return { success: false, error: error.message }
    }
  },

  // Eliminar reporte
  deleteReport: async (id) => {
    try {
      const allReports = getStoredReports()
      const filtered = allReports.filter(r => r._id !== id)
      saveStoredReports(filtered)
      useReportStore.getState().deleteReport(id)
      toast.success('Reporte eliminado exitosamente')
      return { success: true }
    } catch (error) {
      toast.error('Error al eliminar reporte')
      return { success: false, error: error.message }
    }
  },

  // Obtener reporte por ID
  getReportById: async (id) => {
    try {
      const allReports = getStoredReports()
      const report = allReports.find(r => r._id === id)
      if (report) {
        return { success: true, data: report }
      }
      throw new Error('Reporte no encontrado')
    } catch (error) {
      toast.error('Error al obtener el reporte')
      return { success: false, error: error.message }
    }
  },

  // ============== ENDPOINTS DE ANÁLISIS ==============

  // Demanda de restaurantes
  getDemandaRestaurantes: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get('/reports/demanda-restaurantes', { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener demanda de restaurantes:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Top de platos
  getTopPlatos: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get('/reports/top-platos', { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener top platos:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Ingresos
  getIngresos: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get('/reports/ingresos', { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener ingresos:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Horas pico
  getHorasPico: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get('/reports/horas-pico', { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener horas pico:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Reservaciones
  getReservaciones: async (params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get('/reports/reservaciones', { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener reservaciones:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Desempeño de restaurante
  getDesempenoRestaurante: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get(`/reports/desempeno-restaurante/${restaurantID}`, { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener desempeño del restaurante:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Ocupación
  getOcupacion: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get(`/reports/ocupacion/${restaurantID}`, { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener ocupación:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Clientes frecuentes
  getClientesFrecuentes: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get(`/reports/clientes-frecuentes/${restaurantID}`, { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener clientes frecuentes:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // Pedidos recurrentes
  getPedidosRecurrentes: async (restaurantID, params = {}) => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get(`/reports/pedidos-recurrentes/${restaurantID}`, { params })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error al obtener pedidos recurrentes:', error)
      return { success: false, error: error.message }
    } finally {
      useReportStore.getState().setLoading(false)
    }
  },

  // ============== DESCARGAS ==============

  // Descargar reporte en CSV
  downloadReportCSV: async (id, format = 'csv') => {
    try {
      const report = getStoredReports().find(r => r._id === id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const headers = ['Título', 'Tipo', 'Estado', 'Autor', 'Período', 'Fecha Creación']
      const values = [
        report.titulo || '',
        report.tipo || '',
        report.estado || '',
        report.autor || '',
        report.periodo || '',
        report.fechaCreacion ? new Date(report.fechaCreacion).toLocaleDateString('es-ES') : '',
      ]
      const content = headers.join(',') + '\n' + values.join(',')
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      
      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },

  // Descargar reporte en PDF (HTML)
  downloadReportPDF: async (id) => {
    try {
      const report = getStoredReports().find(r => r._id === id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const content = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${report.titulo}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
              .container { background: white; padding: 20px; border-radius: 8px; }
              h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              .section { margin: 15px 0; }
              .label { font-weight: bold; color: #555; }
              p { margin: 8px 0; color: #666; }
              hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${report.titulo}</h1>
              <div class="section">
                <p><span class="label">Tipo:</span> ${report.tipo || 'N/A'}</p>
                <p><span class="label">Estado:</span> ${report.estado || 'N/A'}</p>
                <p><span class="label">Autor:</span> ${report.autor || 'N/A'}</p>
                <p><span class="label">Período:</span> ${report.periodo || 'N/A'}</p>
                <p><span class="label">Fecha Creación:</span> ${report.fechaCreacion ? new Date(report.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'}</p>
              </div>
              <hr>
              <div class="section">
                <h3>Descripción</h3>
                <p>${report.descripcion || 'Sin descripción'}</p>
              </div>
              <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
                <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
              </footer>
            </div>
          </body>
        </html>
      `
      
      const blob = new Blob([content], { type: 'application/pdf' })
      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },
}
