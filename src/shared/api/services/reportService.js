import adminClient from '../adminClient'
import useReportStore from '../../stores/useReportStore'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

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

const fetchReportById = async (id) => {
  const response = await adminClient.get(`/reports/${id}`)
  return response.data?.data || response.data
}

export const reportService = {
  // ============== CRUD GENERAL ==============
  
  // Obtener todos los reportes guardados
  getReports: async () => {
    try {
      useReportStore.getState().setLoading(true)
      const response = await adminClient.get('/reports')
      const reportsData = Array.isArray(response.data) ? response.data : response.data.data || []
      useReportStore.getState().setReports(reportsData)
      return { success: true, data: reportsData }
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
      const response = await adminClient.post('/reports', reportData)
      const reportResult = response.data?.data || response.data
      useReportStore.getState().addReport(reportResult)
      toast.success('Reporte creado exitosamente')
      return { success: true, data: reportResult }
    } catch (error) {
      toast.error('Error al crear reporte')
      return { success: false, error: error.message }
    }
  },

  // Actualizar reporte
  updateReport: async (id, reportData) => {
    try {
      const response = await adminClient.put(`/reports/${id}`, reportData)
      const reportResult = response.data?.data || response.data
      useReportStore.getState().updateReport(id, reportResult)
      toast.success('Reporte actualizado exitosamente')
      return { success: true, data: reportResult }
    } catch (error) {
      toast.error('Error al actualizar reporte')
      return { success: false, error: error.message }
    }
  },

  // Eliminar reporte
  deleteReport: async (id) => {
    try {
      await adminClient.delete(`/reports/${id}`)
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
      const report = await fetchReportById(id)
      return { success: true, data: report }
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
      const report = await fetchReportById(id)
      
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

  // Descargar reporte en Excel
  downloadReportExcel: async (id) => {
    try {
      const report = await fetchReportById(id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const data = [
        {
          'Título': report.titulo || '',
          'Tipo': report.tipo || '',
          'Estado': report.estado || '',
          'Autor': report.autor || '',
          'Período': report.periodo || '',
          'Fecha Creación': report.fechaCreacion ? new Date(report.fechaCreacion).toLocaleDateString('es-ES') : '',
          'Descripción': report.descripcion || '',
        }
      ]

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },

  // Descargar reporte en PDF
  downloadReportPDF: async (id) => {
    try {
      const report = await fetchReportById(id)
      
      if (!report) {
        throw new Error('Reporte no encontrado')
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const margin = 40
      let y = 50

      doc.setFontSize(20)
      doc.setTextColor('#111827')
      doc.text(report.titulo || 'Reporte', margin, y)
      y += 30

      doc.setFontSize(11)
      doc.setTextColor('#374151')
      const rows = [
        ['Tipo', report.tipo || 'N/A'],
        ['Estado', report.estado || 'N/A'],
        ['Autor', report.autor || 'N/A'],
        ['Período', report.periodo || 'N/A'],
        ['Fecha Creación', report.fechaCreacion ? new Date(report.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'],
      ]

      rows.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold')
        doc.text(`${label}:`, margin, y)
        doc.setFont(undefined, 'normal')
        doc.text(String(value), margin + 90, y)
        y += 18
      })

      y += 10
      doc.setDrawColor('#d1d5db')
      doc.setLineWidth(0.5)
      doc.line(margin, y, 555, y)
      y += 24

      doc.setFontSize(13)
      doc.setFont(undefined, 'bold')
      doc.text('Descripción', margin, y)
      y += 18
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      const description = report.descripcion || 'Sin descripción'
      const paragraph = doc.splitTextToSize(description, 515)
      doc.text(paragraph, margin, y)
      y += paragraph.length * 14 + 20

      doc.setFontSize(9)
      doc.setTextColor('#6b7280')
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, margin, y)

      const blob = doc.output('blob')
      return { success: true, data: blob }
    } catch (error) {
      toast.error('Error al descargar reporte')
      return { success: false, error: error.message }
    }
  },
}
