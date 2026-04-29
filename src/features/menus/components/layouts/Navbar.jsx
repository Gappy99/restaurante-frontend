import { Typography } from "@material-tailwind/react";

export const Navbar = () => {
    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Typography variant="h5" className="font-bold text-main-blue">
                        Restaurante
                    </Typography>
                </div>
            </div>
        </nav>
    )
}