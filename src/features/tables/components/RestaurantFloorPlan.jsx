import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const STORAGE_PREFIX = 'restaurant-floor-plan'
const BOARD_WIDTH = 1200
const BOARD_HEIGHT = 760

const getTableId = (table) => table?._id || table?.id

const getTableSize = (table) => {
  const capacity = Number(table?.table_capacity || 4)

  if (capacity <= 2) return { width: 120, height: 84 }
  if (capacity <= 4) return { width: 140, height: 96 }
  if (capacity <= 6) return { width: 156, height: 108 }

  return { width: 176, height: 120 }
}

const intersects = (a, b) => {
  return !(
    a.x + a.width <= b.x ||
    a.x >= b.x + b.width ||
    a.y + a.height <= b.y ||
    a.y >= b.y + b.height
  )
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const buildDefaultPositions = (tables) => {
  const positions = {}
  const columns = 4
  const gapX = 36
  const gapY = 34
  const startX = 28
  const startY = 28

  tables.forEach((table, index) => {
    const id = getTableId(table)
    const size = getTableSize(table)
    const column = index % columns
    const row = Math.floor(index / columns)

    positions[id] = {
      x: startX + column * (size.width + gapX),
      y: startY + row * (size.height + gapY),
    }
  })

  return positions
}

const readStoredPositions = (restaurantId) => {
  if (!restaurantId || typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${restaurantId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const buildMergedPositions = (tables, layoutFromApi, stored) => {
  const defaults = buildDefaultPositions(tables)
  const source = layoutFromApi && Object.keys(layoutFromApi).length > 0 ? layoutFromApi : stored || {}

  const merged = { ...defaults }
  tables.forEach((table) => {
    const id = getTableId(table)
    if (source[id]) {
      merged[id] = {
        x: Number(source[id].x) || 0,
        y: Number(source[id].y) || 0,
      }
    }
  })

  return merged
}

const RestaurantFloorPlan = ({
  restaurantId,
  restaurantName,
  tables,
  onEdit,
  onDelete,
  onCreate,
  layoutFromApi = {},
  onSaveLayout,
  readOnly = false,
}) => {
  const boardRef = useRef(null)
  const dragRef = useRef(null)
  const startPositionsRef = useRef({})
  const positionsRef = useRef({})
  const [positions, setPositions] = useState({})
  const [activeTableId, setActiveTableId] = useState(null)
  const [invalidDrop, setInvalidDrop] = useState(false)

  const storageKey = useMemo(() => {
    if (!restaurantId) return null
    return `${STORAGE_PREFIX}:${restaurantId}`
  }, [restaurantId])

  useEffect(() => {
    const stored = readStoredPositions(restaurantId)
    setPositions(buildMergedPositions(tables, layoutFromApi, stored))
  }, [restaurantId, tables, layoutFromApi])

  useEffect(() => {
    positionsRef.current = positions

    if (!storageKey) return

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(positions))
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }, [positions, storageKey])

  useEffect(() => {
    if (readOnly) return undefined

    const handlePointerMove = (event) => {
      if (!dragRef.current || !boardRef.current) return

      const { tableId, offsetX, offsetY } = dragRef.current
      const table = tables.find((item) => getTableId(item) === tableId)
      if (!table) return

      const boardRect = boardRef.current.getBoundingClientRect()
      const size = getTableSize(table)
      const nextX = clamp(event.clientX - boardRect.left - offsetX, 0, BOARD_WIDTH - size.width)
      const nextY = clamp(event.clientY - boardRect.top - offsetY, 0, BOARD_HEIGHT - size.height)

      const candidate = { x: nextX, y: nextY }

      const collides = tables.some((otherTable) => {
        const otherId = getTableId(otherTable)
        if (otherId === tableId) return false

        const otherPosition = positionsRef.current[otherId]
        if (!otherPosition) return false

        return intersects(
          {
            x: candidate.x,
            y: candidate.y,
            ...size,
          },
          {
            x: otherPosition.x,
            y: otherPosition.y,
            ...getTableSize(otherTable),
          }
        )
      })

      setInvalidDrop(collides)
      setPositions((prev) => ({
        ...prev,
        [tableId]: candidate,
      }))
    }

    const handlePointerUp = async () => {
      if (!dragRef.current) return

      if (invalidDrop) {
        setPositions(startPositionsRef.current)
        toast.error('No puedes poner una mesa encima de otra')
      } else if (onSaveLayout) {
        const payload = tables
          .map((table) => {
            const tableId = getTableId(table)
            const position = positionsRef.current[tableId]
            if (!position) return null

            const size = getTableSize(table)
            return {
              table_id: tableId,
              x: Math.round(position.x),
              y: Math.round(position.y),
              width: size.width,
              height: size.height,
            }
          })
          .filter(Boolean)

        const saveResult = await onSaveLayout(payload)
        if (!saveResult?.success) {
          toast.error(
            saveResult?.error
              ? `No se pudo guardar en servidor: ${saveResult.error}`
              : 'No se pudo guardar el layout en servidor. Se usará respaldo local.'
          )
        }
      }

      dragRef.current = null
      setActiveTableId(null)
      setInvalidDrop(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [invalidDrop, onSaveLayout, tables, readOnly])

  const handlePointerDown = (event, table) => {
    if (readOnly) return
    if (event.button !== 0) return
    if (event.target.closest('button, a, input, select, textarea')) return

    const tableId = getTableId(table)
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return

    const currentPosition = positionsRef.current[tableId] || { x: 0, y: 0 }

    dragRef.current = {
      tableId,
      offsetX: event.clientX - boardRect.left - currentPosition.x,
      offsetY: event.clientY - boardRect.top - currentPosition.y,
    }
    startPositionsRef.current = positionsRef.current
    setActiveTableId(tableId)

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#7F532C]/30 bg-[#5B300E]/10 p-10 text-center text-[#FCF0CA]">
        <div className="text-5xl mb-4">🪑</div>
        <h3 className="text-xl font-bold">No hay mesas para este restaurante</h3>
        <p className="text-[#946841] mt-2">Crea una mesa para comenzar a dibujar el plano.</p>
        {!readOnly && onCreate && (
          <button
            onClick={onCreate}
            className="mt-6 px-6 py-3 rounded-xl bg-[#7F532C] hover:bg-[#946841] transition-colors font-semibold"
          >
            + Crear mesa
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-[#FCF0CA]">Plano interactivo</h2>
          <p className="text-sm text-[#946841]">
            {readOnly
              ? 'Vista solo lectura de la distribucion de mesas.'
              : 'Arrastra las mesas dentro del espacio del restaurante. El sistema evita solapamientos básicos.'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#946841]">
          <span className="rounded-full border border-[#7F532C]/40 px-3 py-1">Restaurante: {restaurantName || restaurantId}</span>
          {!readOnly && onCreate && (
            <button
              onClick={onCreate}
              className="rounded-full bg-[#7F532C] px-4 py-2 text-[#FCF0CA] font-semibold hover:bg-[#946841] transition-colors"
            >
              + Nueva mesa
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-[2rem] border border-[#7F532C]/30 bg-[#241007] p-4 shadow-2xl shadow-black/30">
        <div
          ref={boardRef}
          className="relative mx-auto rounded-[1.75rem] border border-[#7F532C]/40 bg-[linear-gradient(rgba(252,240,202,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(252,240,202,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"
          style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
        >
          <div className="absolute left-4 top-4 rounded-full border border-[#7F532C]/40 bg-[#2E160C]/80 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[#946841]">
            Plano del restaurante
          </div>

          {tables.map((table) => {
            const tableId = getTableId(table)
            const size = getTableSize(table)
            const position = positions[tableId] || { x: 0, y: 0 }
            const isActive = activeTableId === tableId
            const isColliding = isActive && invalidDrop

            return (
              <div
                key={tableId}
                onPointerDown={(event) => handlePointerDown(event, table)}
                className={`absolute select-none rounded-2xl border-2 px-3 py-2 shadow-xl transition-all duration-150 ${
                  isActive ? 'scale-[1.02]' : !readOnly ? 'hover:scale-[1.01]' : ''
                } ${isColliding ? 'border-red-500 bg-red-950/80' : 'border-[#7F532C]/70 bg-[#5B300E]/85'} text-[#FCF0CA]`}
                style={{
                  width: size.width,
                  height: size.height,
                  left: position.x,
                  top: position.y,
                  cursor: readOnly ? 'default' : 'grab',
                  touchAction: readOnly ? 'auto' : 'none',
                }}
              >
                <div className="flex h-full flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{table.table_name}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#FCF0CA]/60">
                        Mesa {table.table_number}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#FCF0CA] px-2 py-0.5 text-[10px] font-bold text-[#2E160C]">
                      {table.table_state || 'Disponible'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#FCF0CA]/80">
                    <p>Capacidad: {table.table_capacity}</p>
                    <p className="truncate">{table.table_ubication}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10px] text-[#FCF0CA]/60">
                    <span>{readOnly ? 'Solo visualizacion' : 'Arrastra para mover'}</span>
                    {!readOnly && (
                      <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit?.(table)
                        }}
                        className="rounded-full border border-[#FCF0CA]/15 px-2 py-0.5 hover:bg-[#FCF0CA]/10"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete?.(tableId)
                        }}
                        className="rounded-full border border-[#FCF0CA]/15 px-2 py-0.5 hover:bg-red-900/30"
                      >
                        Borrar
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RestaurantFloorPlan
