import React from 'react';
import Footer from "../Home/Footer"

const teamMembers = [
    {
        name: "Abrar",
        role: "Project Lead",
        rollNumber: "24BEE406",
        photo: "https://cdn-icons-png.flaticon.com/512/4042/4042356.png",
        highlight: false,
    },
    {
        name: "Sree Naresh A",
        role: "Technical Lead",
        rollNumber: "24BCS278",
        photo: "https://cdn-icons-png.flaticon.com/512/4042/4042356.png",
        highlight: true, // Main contributor
    },
    {
        name: "Saranesh",
        role: "Application Lead",
        rollNumber: "24BEC157",
        photo: "https://cdn-icons-png.flaticon.com/512/4042/4042356.png",
        highlight: false,
    },
    {
        name: "Induja",
        role: "Dashboard Lead",
        rollNumber: "24BTT009",
        photo: "https://cdn-icons-png.flaticon.com/512/4042/4042356.png",
        highlight: false,
    },
    {
        name: "Suhita",
        role: "Communication & Documentation Lead",
        rollNumber: "24BEI063",
        photo: "https://cdn-icons-png.flaticon.com/512/4042/4042356.png",
        highlight: false,
    },
];

export default function Contact() {
    return (
        <div className="p-2 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            {/* Team Section */}
            <div className="w-full bg-white rounded-lg shadow-md p-8 mb-10">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Meet the RoadGuard Team</h2>
                <p className="text-gray-500 text-center mb-6 text-sm">The minds behind smarter, safer roads.</p>

                {/* Technical Lead — highlighted prominently */}
                {teamMembers.filter(m => m.highlight).map((member) => (
                    <div key={member.rollNumber} className="max-w-md mx-auto mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl shadow-lg border-2 border-emerald-400 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">★ Lead Developer</div>
                        <img
                            src={member.photo}
                            alt={member.name}
                            className="w-32 h-32 object-cover rounded-full mx-auto mb-3 ring-4 ring-emerald-400 shadow-md"
                        />
                        <h3 className="text-xl font-bold text-emerald-800">{member.name}</h3>
                        <p className="text-emerald-600 font-semibold text-sm">{member.role}</p>
                        <p className="text-gray-500 text-xs mt-1">ID: {member.rollNumber}</p>
                        <p className="text-gray-400 text-xs mt-2 italic">Full-stack development, ML integration & system architecture</p>
                    </div>
                ))}

                {/* Other team members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.filter(m => !m.highlight).map((member) => (
                        <div key={member.rollNumber} className="bg-gray-50 p-5 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
                            <img
                                src={member.photo}
                                alt={member.name}
                                className="w-24 h-24 object-cover rounded-full mx-auto mb-3 ring-2 ring-gray-200"
                            />
                            <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                            <p className="text-emerald-600 text-sm font-medium">{member.role}</p>
                            <p className="text-gray-400 text-xs mt-1">ID: {member.rollNumber}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Company Information Section */}
            <div className="w-full bg-white rounded-lg shadow-md">
                <Footer />
            </div>
        </div>
    );
}
