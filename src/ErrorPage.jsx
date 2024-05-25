import { Link } from "react-router-dom";

function ErrorPage() {
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
        <h1 className="text-3xl font-semibold mb-5">We hit a big wall.</h1>
        <h1 className="text-center text-lg text-white/50">The page you&apos;re trying to find doesn&apos;t exists or was moved in another place.</h1>
        <Link className="hover:text-sky-500 transition-colors duration-200 mt-4" to="/home">Back to Home.</Link>
        <h1 className="text-sm mt-8 text-white/30">Error 404 - Page Not Found.</h1>
      </main>
    )
}

export default ErrorPage;