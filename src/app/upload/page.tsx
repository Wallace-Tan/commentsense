'use client';

import React, { useState } from 'react';
import { Home, BarChart2, Settings, UploadCloud, FileText } from 'lucide-react';

// --- REUSABLE COMPONENTS (Copied from dashboard page for consistency) --- //
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card = ({ children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-semibold text-gray-800 mb-4">{children}</h2>
);

// This sidebar is specific to the upload page to show the active link
const Sidebar = () => (
    <aside className="w-64 bg-white p-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-blue-600 mb-10">L'ORÉAL</h1>
        <nav className="space-y-4">
            <a href="/" className="flex items-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Home className="h-5 w-5 mr-3" /> Dashboard
            </a>
            <a href="/upload" className="flex items-center p-2 text-gray-700 bg-blue-50 rounded-lg">
                <UploadCloud className="h-5 w-5 mr-3" /> Upload Data
            </a>
        </nav>
    </aside>
);

// --- CSV UPLOAD COMPONENT --- //
const CsvUploader = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Basic validation for CSV type
            if (e.dataTransfer.files[0].type === "text/csv") {
                setFile(e.dataTransfer.files[0]);
            } else {
                alert("Only .csv files are allowed.");
            }
        }
    };
    
    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }
        
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate file upload progress
        const interval = setInterval(() => {
            setUploadProgress(prevProgress => {
                const newProgress = prevProgress + Math.floor(Math.random() * 10) + 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                         alert(`Upload complete for: ${file.name}`);
                         setIsUploading(false);
                         setFile(null);
                    }, 500);
                    return 100;
                }
                return newProgress;
            });
        }, 300);
    };

    return (
        <Card>
            <CardTitle>Upload CSV File</CardTitle>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                </label>
            </div>
            {file && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-700">Selected File:</h3>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-2">
                        <div className="flex items-center min-w-0">
                            <FileText className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                        </div>
                        <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 text-sm font-semibold ml-4">Remove</button>
                    </div>
                </div>
            )}
            <div className="mt-6 text-right">
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Upload File
                </button>
            </div>
        </Card>
    );
};


// --- Main Page Component --- //
export default function UploadPage() {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-grow p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Data Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload your CSV data files to update the dashboard</p>
                </header>
                
                <main>
                   <CsvUploader />
                </main>
            </div>
        </div>
    );
}
