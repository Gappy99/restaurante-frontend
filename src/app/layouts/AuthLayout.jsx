/**
 * Layout para páginas de autenticación
 * Sin sidebar ni navbar
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#517360_0%,#E2DFCE_55%,#DDB7A2_100%)] flex items-center justify-center p-4">
      <div className="absolute -left-20 -top-16 h-48 w-48 rounded-full bg-[#517360]/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[#517360]/20 blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  )
}

export default AuthLayout
