/**
 * Componente Table reutilizable
 * Muestra datos en tabla con acciones
 */
const Table = ({ columns, data, onEdit, onDelete }) => {
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
        {data.map((row) => (
          <tr key={row._id} className="border-b border-gray-200 hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="px-6 py-4 text-gray-700">
                {row[col.key]}
              </td>
            ))}
            <td className="px-6 py-4 flex gap-2">
              <button
                onClick={() => onEdit(row)}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-semibold transition"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(row._id)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-semibold transition"
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

export default Table
