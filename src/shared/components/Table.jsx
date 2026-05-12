const Table = ({ columns, data, onEdit, onDelete }) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-[var(--bg)] border-b border-[var(--accent-soft)]">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]"
            >
              {col.label}
            </th>
          ))}
          <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row._id} className="border-b border-[var(--accent-soft)] hover:bg-[var(--surface)]">
            {columns.map((col) => (
              <td key={col.key} className="px-6 py-4 text-[var(--text)]">
                {row[col.key]}
              </td>
            ))}
            <td className="px-6 py-4 flex gap-2">
              <button
                onClick={() => onEdit(row)}
                className="px-3 py-1 bg-[var(--primary-soft)] text-[var(--primary)] rounded hover:bg-[var(--primary)] hover:text-[var(--surface)] text-sm font-semibold transition"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(row._id)}
                className="px-3 py-1 bg-[#ffe5e5] text-[#b02020] rounded hover:bg-[#f1c2c2] text-sm font-semibold transition"
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