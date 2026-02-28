import React, { useEffect, useState } from 'react';
import mapImage from '../../assets/Map.png';
import logoutImage from '../../assets/Logout.png';
import login from '../../assets/images/Login.png';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem("role");
        setIsLogin(role != null);
        setAdmin(role === "ADMIN");
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        if (isLogin) {
            localStorage.removeItem("role");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setAdmin(false);
            setIsLogin(false);
            console.log('Logged out');
            alert("Logged Out Successfully!");
            navigate('/', { replace: true });
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            navigate('/login', { replace: true });
        }
    };

    return (
        <nav className="bg-gradient-to-r from-emerald-700 to-teal-800 border-b-2 border-emerald-900 sticky top-0 z-50 shadow-lg">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src={mapImage} className="h-8 brightness-0 invert" alt="RoadGuard Logo" />
                    <span className="self-center text-2xl font-bold whitespace-nowrap text-white tracking-wide">RoadGuard</span>
                </a>
                <button
                    onClick={toggleMenu}
                    data-collapse-toggle="navbar-default"
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-emerald-200 rounded-lg md:hidden hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    aria-controls="navbar-default"
                    aria-expanded={isOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-emerald-600 rounded-lg bg-emerald-800 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent">
                        <li>
                            <a href="/" className="block py-2 px-3 text-white rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 md:p-0 transition-colors" aria-current="page">Home</a>
                        </li>
                        <li>
                            <a href="/contact" className="block py-2 px-3 text-emerald-100 rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 md:p-0 transition-colors">Contact</a>
                        </li>
                        <li>
                            <a href="/map/search" className="block py-2 px-3 text-emerald-100 rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 md:p-0 transition-colors">Map</a>
                        </li>
                        {admin && (
                            <li>
                                <a href="/admin" className="block py-2 px-3 text-yellow-300 rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-yellow-200 md:p-0 font-semibold transition-colors">Admin</a>
                            </li>
                        )}
                        {isLogin && !admin && (
                            <>
                                <li>
                                    <a href="/my-reports" className="block py-2 px-3 text-emerald-100 rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 md:p-0 transition-colors">My Reports</a>
                                </li>
                                <li>
                                    <a href="/profile" className="block py-2 px-3 text-emerald-100 rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 md:p-0 transition-colors">Profile</a>
                                </li>
                            </>
                        )}
                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-emerald-100 rounded hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 md:p-0 transition-colors">
                                {isLogin ? <img src={logoutImage} className="h-8 w-8 brightness-0 invert" alt="Logout Icon" /> : <img src={login} className="h-7 w-7 brightness-0 invert" alt="Login" />}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
