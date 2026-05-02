const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#2E160C] px-4 py-8">
      {/* Corte exacto al centro entre café oscuro y café claro */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#5B300E_0%,#5B300E_50%,#946841_50%,#946841_100%)]" />

      {/* Acentos sutiles para profundidad sin recargar */}
      <div className="absolute left-8 top-10 h-16 w-16 rounded-full border border-[#FCF0CA]/25" />
      <div className="absolute bottom-12 right-10 h-20 w-20 rounded-full bg-[#FCF0CA]/12" />

      {/* División central suave para mantener estilo minimalista */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#FCF0CA]/20" />

      <div className="relative w-full max-w-md sm:max-w-lg">{children}</div>
    </div>
  )
}

export default AuthLayout
