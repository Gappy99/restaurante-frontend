import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useReportStore from '../../../shared/stores/useReportStore'
import { reportService } from '../../../shared/api/services/reportService'
import Modal from '../../../shared/components/Modal'

const IconFile = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconChart = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M7 14V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 14V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17 14V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const IconPdf = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2H14L20 8V22C20 22.5523 19.5523 23 19 23H5C4.44772 23 4 22.5523 4 22V3C4 2.44772 4.44772 2 5 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8.5 18H11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8.5 14H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const IconExcel = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2H14L20 8V22C20 22.5523 19.5523 23 19 23H5C4.44772 23 4 22.5523 4 22V3C4 2.44772 4.44772 2 5 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8 15H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8 19H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10 11L12 15L14 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconView = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)

/**
 * Página de Gestión de Reportes (CRUD + Análisis)
 */
const ReportsPage = () => {
  const { reports, loading } = useReportStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('guardados') // 'guardados' o 'generar'
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)

  // Cargar reportes al montar
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    await reportService.getReports()
  }

  const handleOpenModal = (report = null) => {
    setEditingReport(report)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingReport(null)
    setIsModalOpen(false)
  }

  const handleViewDetail = (report) => {
    setSelectedReport(report)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setSelectedReport(null)
    setIsDetailOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      await reportService.deleteReport(id)
      await loadReports()
    }
  }

  const handleDownload = async (id, format = 'pdf') => {
    const result = format === 'pdf'
      ? await reportService.downloadReportPDF(id)
      : format === 'excel'
      ? await reportService.downloadReportExcel(id)
      : await reportService.downloadReportCSV(id)

    if (result.success) {
      const url = window.URL.createObjectURL(new Blob([result.data]))
      const extension = format === 'excel' ? 'xlsx' : format
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte-${id}.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    }
  }

  const handleLoadAnalysis = async (analysisType) => {
    setAnalysisLoading(true)
    let result
    
    switch(analysisType) {
      case 'demanda':
        result = await reportService.getDemandaRestaurantes()
        break
      case 'top-platos':
        result = await reportService.getTopPlatos()
        break
      case 'ingresos':
        result = await reportService.getIngresos()
        break
      case 'horas-pico':
        result = await reportService.getHorasPico()
        break
      case 'reservaciones':
        result = await reportService.getReservaciones()
        break
      default:
        result = { success: false }
    }

    if (result.success) {
      setAnalysisData(result.data)
      setSelectedAnalysis(analysisType)
    } else {
      toast.error('Error al cargar el análisis')
    }
    setAnalysisLoading(false)
  }

  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'type', label: 'Tipo' },
    { key: 'status', label: 'Estado' },
    { key: 'createdAt', label: 'Fecha Creación' },
    { key: 'author', label: 'Autor' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reportes</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + Nuevo Reporte
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('guardados')}
          className={`px-4 py-2 font-semibold inline-flex items-center gap-2 transition ${
            activeTab === 'guardados'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <IconFile className="h-5 w-5" />
          Reportes Guardados
        </button>
        <button
          onClick={() => setActiveTab('generar')}
          className={`px-4 py-2 font-semibold inline-flex items-center gap-2 transition ${
            activeTab === 'generar'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <IconChart className="h-5 w-5" />
          Generar Análisis
        </button>
      </div>

      {/* Tab: Reportes Guardados */}
      {activeTab === 'guardados' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Cargando reportes...</div>
          ) : !Array.isArray(reports) || reports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay reportes registrados
            </div>
          ) : (
            <ReportTable
              columns={columns}
              data={reports}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onView={handleViewDetail}
              onDownload={handleDownload}
            />
          )}
        </div>
      )}

      {/* Tab: Generar Análisis */}
      {activeTab === 'generar' && (
        <div className="space-y-6">
          {/* Opciones de análisis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnalysisCard
              title="Demanda de Restaurantes"
              description="Analiza la demanda por restaurante"
              icon={<IconChart className="h-8 w-8 text-blue-600" />}
              onClick={() => handleLoadAnalysis('demanda')}
              loading={analysisLoading && selectedAnalysis === 'demanda'}
            />
            <AnalysisCard
              title="Top de Platos"
              description="Platos más vendidos"
              icon={<IconFile className="h-8 w-8 text-emerald-600" />}
              onClick={() => handleLoadAnalysis('top-platos')}
              loading={analysisLoading && selectedAnalysis === 'top-platos'}
            />
            <AnalysisCard
              title="Ingresos"
              description="Análisis de ingresos"
              icon={<IconExcel className="h-8 w-8 text-zinc-600" />}
              onClick={() => handleLoadAnalysis('ingresos')}
              loading={analysisLoading && selectedAnalysis === 'ingresos'}
            />
            <AnalysisCard
              title="Horas Pico"
              description="Horarios con mayor demanda"
              icon={<IconChart className="h-8 w-8 text-indigo-600" />}
              onClick={() => handleLoadAnalysis('horas-pico')}
              loading={analysisLoading && selectedAnalysis === 'horas-pico'}
            />
            <AnalysisCard
              title="Reservaciones"
              description="Datos de reservaciones"
              icon={<IconFile className="h-8 w-8 text-fuchsia-600" />}
              onClick={() => handleLoadAnalysis('reservaciones')}
              loading={analysisLoading && selectedAnalysis === 'reservaciones'}
            />
          </div>

          {/* Datos del análisis */}
          {analysisData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Resultados del Análisis</h2>
              <div className="overflow-auto">
                <pre className="bg-gray-50 p-4 rounded text-sm text-gray-800 overflow-x-auto">
                  {JSON.stringify(analysisData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de creación/edición */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={editingReport}
        onSuccess={async () => {
          await loadReports()
          handleCloseModal()
        }}
      />

      {/* Modal de detalle */}
      <ReportDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        report={selectedReport}
        onDownload={handleDownload}
      />
    </div>
  )
}

/**
 * Tabla de Reportes con acciones mejoradas
 */
const ReportTable = ({ columns, data, onEdit, onDelete, onView, onDownload }) => {
  const safeData = Array.isArray(data) ? data : []
  const fallbackKeys = {
    title: ['title', 'titulo', 'name'],
    type: ['type', 'tipo', 'reportType', 'tipoReporte'],
    status: ['status', 'estado', 'state'],
    author: ['author', 'autor', 'createdBy', 'creador'],
    createdAt: ['createdAt', 'created_at', 'fechaCreacion', 'fecha_creacion', 'fecha'],
  }

  const getCellValue = (row, key) => {
    const candidates = fallbackKeys[key] || [key]
    let value = ''

    for (const candidate of candidates) {
      if (row?.[candidate] !== undefined && row?.[candidate] !== null) {
        value = row[candidate]
        break
      }
    }

    if (value === '' && row?.report) {
      for (const candidate of candidates) {
        if (row.report?.[candidate] !== undefined && row.report?.[candidate] !== null) {
          value = row.report[candidate]
          break
        }
      }
    }

    if (key === 'type') {
      return REPORT_TYPE_LABELS[value] || value || ''
    }
    if (key === 'status') {
      return REPORT_STATUS_LABELS[value] || value || ''
    }

    return value
  }
  
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
            >
              {col.label}
            </th>
          ))}
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {safeData.map((row) => (
          <tr key={row._id} className="border-b border-gray-200 hover:bg-gray-50">
            {columns.map((col) => {
              const cellValue = getCellValue(row, col.key)
              return (
                <td key={col.key} className="px-6 py-4 text-gray-700">
                  {cellValue}
                </td>
              )
            })}
            <td className="px-6 py-4 flex gap-2 flex-wrap">
              <button
                onClick={() => onView(row)}
                className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 text-sm font-semibold transition inline-flex items-center gap-1"
                title="Ver detalles"
              >
                <IconView className="h-4 w-4" /> Ver
              </button>
              <button
                onClick={() => onEdit(row)}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-semibold transition inline-flex items-center gap-1"
                title="Editar reporte"
              >
                Editar
              </button>
              <button
                onClick={() => onDownload(row._id, 'pdf')}
                className="px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-sm font-semibold transition inline-flex items-center gap-1"
                title="Descargar PDF"
              >
                <IconPdf className="h-4 w-4" /> PDF
              </button>
              <button
                onClick={() => onDownload(row._id, 'excel')}
                className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 text-sm font-semibold transition inline-flex items-center gap-1"
                title="Descargar Excel"
              >
                <IconExcel className="h-4 w-4" /> Excel
              </button>
              <button
                onClick={() => onDelete(row._id)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-semibold transition"
                title="Eliminar reporte"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Modal de Reporte para crear/editar
 */
const mapReportToFormValues = (report) => ({
  titulo: report?.title || report?.titulo || '',
  descripcion: report?.description || report?.descripcion || '',
  tipo: report?.type || report?.tipo || '',
  estado: report?.status || report?.estado || report?.state || '',
  autor:
    report?.author ||
    report?.autor ||
    report?.createdBy ||
    report?.owner?.name ||
    report?.owner?.username ||
    report?.owner?.fullName ||
    '',
  periodo: report?.period || report?.periodo || '',
})

const REPORT_TYPE_LABELS = {
  'análisis': 'Análisis',
  'demanda': 'Demanda',
  'ingresos': 'Ingresos',
  'ocupación': 'Ocupación',
  custom: 'Personalizado',
}

const REPORT_STATUS_LABELS = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

const ReportModal = ({ isOpen, onClose, report, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: mapReportToFormValues(report),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    reset(mapReportToFormValues(report))
  }, [report, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Mapear campos españoles al esquema del backend
      const reportData = {
        title: data.titulo,
        description: data.descripcion,
        type: data.tipo,
        status: data.estado,
        ownerName: data.autor,
        period: data.periodo,
        shared: report?.shared ?? false,
        query: report?.query ?? {},
      }

      let result
      if (report?._id) {
        result = await reportService.updateReport(report._id, reportData)
      } else {
        result = await reportService.createReport(reportData)
      }

      setIsSubmitting(false)
      if (result?.success) {
        onSuccess()
      } else {
        console.error('Report save failed:', result)
        toast.error(result?.error || 'Error al guardar reporte')
      }
    } catch (err) {
      console.error('Unexpected error saving report:', err)
      toast.error('Error inesperado al guardar reporte')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={report ? 'Editar Reporte' : 'Nuevo Reporte'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            {...register('titulo', { required: 'Título requerido' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Reporte de Ventas Mensuales"
          />
          {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            {...register('descripcion')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Describe el propósito del reporte"
            rows="3"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Reporte
          </label>
          <select
            {...register('tipo', { required: 'Tipo requerido' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Seleccionar tipo</option>
            <option value="análisis">Análisis</option>
            <option value="demanda">Demanda</option>
            <option value="ingresos">Ingresos</option>
            <option value="ocupación">Ocupación</option>
            <option value="custom">Personalizado</option>
          </select>
          {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            {...register('estado', { required: 'Estado requerido' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Seleccionar estado</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
          {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>}
        </div>

        {/* Autor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Autor
          </label>
          <input
            {...register('autor')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nombre del autor"
          />
        </div>

        {/* Periodo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período (mes/año)
          </label>
          <input
            type="month"
            {...register('periodo')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            {isSubmitting ? 'Guardando...' : report ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/**
 * Modal para ver detalles del reporte
 */
const ReportDetailModal = ({ isOpen, onClose, report, onDownload }) => {
  if (!report) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalle: ${report.title}`}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 font-semibold">Descripción</p>
          <p className="text-gray-800">{report.description || 'N/A'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Tipo</p>
            <p className="text-gray-800">{REPORT_TYPE_LABELS[report.type] || report.type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Estado</p>
            <p className="text-gray-800">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                report.status === 'published' ? 'bg-green-100 text-green-800' :
                report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {REPORT_STATUS_LABELS[report.status] || report.status || 'N/A'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Autor</p>
            <p className="text-gray-800">{report.author || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Período</p>
            <p className="text-gray-800">{report.period || 'N/A'}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 font-semibold">Fecha de Creación</p>
          <p className="text-gray-800">
            {report.createdAt ? new Date(report.createdAt).toLocaleDateString('es-ES') : 'N/A'}
          </p>
        </div>

        <div className="flex gap-2 pt-4 justify-end flex-wrap">
          <button
            onClick={() => onDownload(report._id, 'pdf')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition inline-flex items-center gap-2"
          >
            <IconPdf className="h-4 w-4" /> Descargar PDF
          </button>
          <button
            onClick={() => onDownload(report._id, 'excel')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition inline-flex items-center gap-2"
          >
            <IconExcel className="h-4 w-4" /> Descargar Excel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * Tarjeta de Análisis
 */
const AnalysisCard = ({ title, description, icon, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="text-left p-6 bg-white rounded-lg shadow hover:shadow-lg hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="flex items-center gap-2">
      {loading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-600">Cargando...</span>
        </>
      ) : (
        <span className="text-sm text-blue-600 font-semibold">Cargar →</span>
      )}
    </div>
  </button>
)

export default ReportsPage
