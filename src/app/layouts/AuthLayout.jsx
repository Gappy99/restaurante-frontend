/**
 * Layout para páginas de autenticación
 * Sin sidebar ni navbar
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

export default AuthLayout
