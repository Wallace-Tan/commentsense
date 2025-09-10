'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChevronDown, X, Home, UploadCloud } from 'lucide-react';

// Define interfaces for your data structure for type safety
interface CQSData {
    id: number;
    title: string;
    cqs: number;
    timestamp: string;
}

interface CQSHistory {
    [key: string]: { t: string; cqs: number }[];
}

interface ChartData {
    name: string;
    value: number;
}

interface FocusData {
    title: string;
    metric: string;
}

interface DashboardData {
    videoCqsData: CQSData[];
    videoCqsHistory: CQSHistory;
    productDiscussionData: ChartData[];
    videoTypeData: ChartData[];
    nextMonthFocusData: {
        topQualityCommentVideo: FocusData;
        mostDiscussedProduct: FocusData;
    };
}


// --- HELPER COMPONENTS (No changes needed here) --- //
type CardProps = { children: React.ReactNode; className?: string; };
const Card = ({ children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg ${className}`}>{children}</div>
);

type CardTitleProps = { children: React.ReactNode; };
const CardTitle = ({ children }: CardTitleProps) => (
    <h2 className="text-xl font-semibold text-gray-800 mb-4">{children}</h2>
);

const COLORS = ['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];


// --- DASHBOARD COMPONENTS (Updated to receive data as props) --- //

type VideoTrendChartModalProps = {
    video: CQSData;
    historyData: { t: string; cqs: number }[];
    onClose: () => void;
};

const VideoTrendChartModal = ({ video, historyData, onClose }: VideoTrendChartModalProps) => {
    const formatXAxis = (tickItem: string) => new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    {/* FIX: Removed the 'truncate' class to allow the full title to show */}
                    <h3 className="text-xl font-bold text-gray-800 pr-4">{video.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={historyData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            
                            {/* FIX: Added a label for the X-axis */}
                            <XAxis dataKey="t" tickFormatter={formatXAxis}>
                                <label value="Date" position="insideBottom" offset={-15} />
                            </XAxis>

                            {/* FIX: Added a label for the Y-axis */}
                            <YAxis domain={[85, 100]} >
                                <label value="CQS" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>

                            <Tooltip />
                            <Line type="monotone" dataKey="cqs" name="CQS" stroke={COLORS[0]} strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

type VideoCQSRankingProps = {
    data: CQSData[];
    onVideoSelect: (video: CQSData) => void;
};

const VideoCQSRanking = ({ data, onVideoSelect }: VideoCQSRankingProps) => {
    const [sortOrder, setSortOrder] = useState('cqs');
    const sortedData = useMemo(() => {
        return [...data]
            .sort((a, b) => {
                if (sortOrder === 'timestamp') {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                }
                return b.cqs - a.cqs;
            })
            .slice(0, 5);
    }, [sortOrder, data]);

    return (
        <Card className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <CardTitle>Video CQS Ranking</CardTitle>
                <div className="relative">
                    <select
                        onChange={(e) => setSortOrder(e.target.value)}
                        value={sortOrder}
                        className="appearance-none bg-gray-100 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="cqs">Sort by CQS</option>
                        <option value="timestamp">Sort by Date</option>
                    </select>
                    <ChevronDown className="h-5 w-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
            <div className="flex-grow">
                <ul className="space-y-3">
                    {sortedData.map((item, index) => (
                        <li key={item.id} onClick={() => onVideoSelect(item)} className="flex items-center justify-between p-2 rounded-lg transition-all hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center min-w-0 mr-4">
                                <span className="text-lg font-bold text-blue-600 w-8 text-center flex-shrink-0">{index + 1}</span>
                                <p className="text-sm font-medium text-gray-600 ml-4" title={item.title}>{item.title}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{item.cqs.toFixed(1)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};

type DonutChartCardProps = {
    title: string;
    data: ChartData[];
    colors: string[];
    description: string;
};

const DonutChartCard = ({ title, data, colors, description }: DonutChartCardProps) => {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value);
    }, [data]);

    return (
        <Card>
            <CardTitle>{title}</CardTitle>
            <div style={{ width: '100%', height: '85%' }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie 
                            data={sortedData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            fill="#8884d8" 
                            paddingAngle={3} 
                            dataKey="value" 
                            nameKey="name" 
                            labelLine={false} 
                            label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''}
                        >
                            {sortedData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} ${description}`, name]}/>
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ marginBottom: '0px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

type NextMonthFocusProps = {
    data: {
        topQualityCommentVideo: FocusData;
        mostDiscussedProduct: FocusData;
    };
};

const NextMonthFocus = ({ data }: NextMonthFocusProps) => (
    <Card>
        <CardTitle>Next Month's Focus</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg text-center">
                <h3 className="font-semibold text-gray-500">Top CQS Video Type</h3>
                <p className="text-2xl font-bold text-gray-800 truncate mt-2">{data.topQualityCommentVideo.title}</p>
                <p className="text-sm text-gray-500">{data.topQualityCommentVideo.metric}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg text-center">
                <h3 className="font-semibold text-gray-500">Most Discussed Product</h3>
                <p className="text-2xl font-bold text-gray-800 truncate mt-2">{data.mostDiscussedProduct.title}</p>
                <p className="text-sm text-gray-500">{data.mostDiscussedProduct.metric}</p>
            </div>
        </div>
    </Card>
);

const Sidebar = () => (
    <aside className="w-64 bg-white p-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-blue-600 mb-10">L'ORÉAL</h1>
        <nav className="space-y-4">
            <a href="/" className="flex items-center p-2 text-gray-700 bg-blue-50 rounded-lg">
                <Home className="h-5 w-5 mr-3" /> Dashboard
            </a>
            <a href="/upload" className="flex items-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <UploadCloud className="h-5 w-5 mr-3" /> Upload Data
            </a>
        </nav>
    </aside>
);

// --- Main Page Component --- //
export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<CQSData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/output.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const jsonData: DashboardData = await response.json();
                setData(jsonData);
            } catch (error) {
                setError('Failed to fetch dashboard data. Please ensure output.json exists in the /public folder.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); 

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>;
    }

    if (error || !data) {
        return <div className="flex items-center justify-center min-h-screen text-red-500">{error || 'No data available.'}</div>;
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-grow p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Performance Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                </header>
                
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <VideoCQSRanking data={data.videoCqsData} onVideoSelect={setSelectedVideo} />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DonutChartCard title="Product Discussion" data={data.productDiscussionData} colors={COLORS} description={'mentions'}/>
                        <DonutChartCard title="Video Type Distribution" data={data.videoTypeData} colors={COLORS.slice().reverse()} description={'videos'}/>
                    </div>
                    <div className="lg:col-span-3">
                       <NextMonthFocus data={data.nextMonthFocusData} />
                    </div>
                </main>
            </div>
            
            {selectedVideo && <VideoTrendChartModal video={selectedVideo} historyData={data.videoCqsHistory[String(selectedVideo.id)] || []} onClose={() => setSelectedVideo(null)} />}
        </div>
    );
}