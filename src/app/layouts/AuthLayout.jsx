import backgroundImage from '../../shared/assets/img/logo-restaurant.jpeg'

const AuthLayout = ({ children }) => {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(91,48,14,0.75) 0%, rgba(91,48,14,0.75) 100%), url(${backgroundImage})`,
        backgroundSize: '96% auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative w-full max-w-xs sm:max-w-sm">{children}</div>
    </div>
  )
}

export default AuthLayout
