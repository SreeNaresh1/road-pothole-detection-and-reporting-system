import React from 'react'

export default function RightBar() {
    return (
        <div className="w-full lg:w-1/4 p-6 bg-white rounded-xl shadow-lg">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold mb-2"> Step 1</h3>
                <p className="text-md text-emerald-600 font-medium mt-2">
                    Capture Photo
                </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold mb-2">Step 2</h3>
                <p className="text-md text-emerald-600 font-medium mt-2">
                    Get Current Location
                </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Step 3</h3>
                <p className="text-md text-emerald-600 font-medium mt-2">Upload Photo</p>
            </div>
        </div>
    )
}
