'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChevronDown,X, Home, UploadCloud} from 'lucide-react';

// --- MOCK DATA (Using existing L'Oréal themed data) --- //
const videoCqsData = [
    { id: 1, title: "Unlocking the Benefits of Face Masks for Skin Health", cqs: 98.5, timestamp: "2025-09-08T10:00:00Z" },
    { id: 2, title: "Skincare for Rosacea: Managing and Soothing Redness", cqs: 97.2, timestamp: "2025-09-07T14:30:00Z" },
    { id: 3, title: "The Science of Sheet Masks: Instantly Revitalize Your Skin", cqs: 95.8, timestamp: "2025-09-08T11:00:00Z" },
    { id: 4, title: "The Benefits of Clay Masks: Purify and Detoxify Your Skin", cqs: 94.1, timestamp: "2025-09-06T09:00:00Z" },
    { id: 5, title: "GRWM: Girls Night Out!! ", cqs: 92.7, timestamp: "2025-09-08T12:00:00Z" },
];

const videoCqsHistory: { [key: string]: { t: string; cqs: number }[] } = {
    1: [{ t: "2025-09-01", cqs: 95.2 }, { t: "2025-09-03", cqs: 96.1 }, { t: "2025-09-05", cqs: 97.5 }, { t: "2025-09-08", cqs: 98.5 }],
    2: [{ t: "2025-09-01", cqs: 94.5 }, { t: "2025-09-03", cqs: 95.8 }, { t: "2025-09-05", cqs: 96.2 }, { t: "2025-09-07", cqs: 97.2 }],
    3: [{ t: "2025-09-02", cqs: 93.1 }, { t: "2025-09-04", cqs: 94.0 }, { t: "2025-09-06", cqs: 94.9 }, { t: "2025-09-08", cqs: 95.8 }],
    4: [{ t: "2025-08-30", cqs: 92.0 }, { t: "2025-09-02", cqs: 92.8 }, { t: "2025-09-04", cqs: 93.5 }, { t: "2025-09-06", cqs: 94.1 }],
    5: [{ t: "2025-09-01", cqs: 90.5 }, { t: "2025-09-03", cqs: 91.1 }, { t: "2025-09-06", cqs: 91.8 }, { t: "2025-09-08", cqs: 92.7 }],
};

const productDiscussionData = [
    { name: 'Skincare', value: 450 }, { name: 'Makeup', value: 300 },
    { name: 'Haircare', value: 250 }, { name: 'Fragrances', value: 200 },
];

const videoTypeData = [
    { name: 'GRWM', value: 40 }, { name: 'Product Review', value: 25 },
    { name: 'Makeup Tutorial', value: 15 }, { name: 'Lifestyle', value: 10 },
];

const nextMonthFocusData = {
    topQualityCommentVideo: { title: "GRWM", metric: "Avg. CQS 95.5" },
    mostDiscussedProduct: { title: "Skincare", metric: "450 Mentions" },
};

// --- NEW VIBRANT CHART COLORS --- //
const COLORS = ['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

// --- HELPER COMPONENTS --- //
type CardProps = { children: React.ReactNode; className?: string; };
const Card = ({ children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg ${className}`}>{children}</div>
);

type CardTitleProps = { children: React.ReactNode; };
const CardTitle = ({ children }: CardTitleProps) => (
    <h2 className="text-xl font-semibold text-gray-800 mb-4">{children}</h2>
);

// --- DASHBOARD COMPONENTS --- //

type VideoTrendChartModalProps = {
    video: { id: number; title: string; cqs: number; timestamp: string };
    onClose: () => void;
};

const VideoTrendChartModal = ({ video, onClose }: VideoTrendChartModalProps) => {
    const historyData = videoCqsHistory[String(video.id)] || [];
    const formatXAxis = (tickItem: string) => new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate pr-4" title={video.title}>{video.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={historyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="t" tickFormatter={formatXAxis} />
                            <YAxis domain={[85, 100]} />
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
    onVideoSelect: (video: { id: number; title: string; cqs: number; timestamp: string }) => void;
};

const VideoCQSRanking = ({ onVideoSelect }: VideoCQSRankingProps) => {
    const [sortOrder, setSortOrder] = useState('cqs');

    const sortedData = useMemo(() => {
        return [...videoCqsData]
            .sort((a, b) => {
                if (sortOrder === 'timestamp') {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                }
                return b.cqs - a.cqs;
            })
            .slice(0, 5);
    }, [sortOrder]);

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
    data: { name: string; value: number }[];
    colors: string[];
    description: string;
};

const DonutChartCard = ({ title, data, colors, description }: DonutChartCardProps) => (
        <Card>
            <CardTitle>{title}</CardTitle>
            <div style={{ width: '100%', height: '85%' }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={3} dataKey="value" nameKey="name" labelLine={false} label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} ${description}`, name]}/>
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ marginBottom: '0px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

const NextMonthFocus = () => (
    <Card>
        <CardTitle>Next Month's Focus</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg text-center">
                <h3 className="font-semibold text-gray-500">Top CQS Video Type</h3>
                <p className="text-2xl font-bold text-gray-800 truncate mt-2">{nextMonthFocusData.topQualityCommentVideo.title}</p>
                <p className="text-sm text-gray-500">{nextMonthFocusData.topQualityCommentVideo.metric}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg text-center">
                <h3 className="font-semibold text-gray-500">Most Discussed Product</h3>
                <p className="text-2xl font-bold text-gray-800 truncate mt-2">{nextMonthFocusData.mostDiscussedProduct.title}</p>
                <p className="text-sm text-gray-500">{nextMonthFocusData.mostDiscussedProduct.metric}</p>
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
    const [selectedVideo, setSelectedVideo] = useState<{
        id: number;
        title: string;
        cqs: number;
        timestamp: string;
    } | null>(null);
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
                        <VideoCQSRanking onVideoSelect={setSelectedVideo} />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DonutChartCard title="Product Discussion" data={productDiscussionData} colors={COLORS} description={'mentions'}/>
                        <DonutChartCard title="Video Type Distribution" data={videoTypeData} colors={COLORS.slice().reverse()} description={'videos'}/>
                    </div>
                    <div className="lg:col-span-3">
                       <NextMonthFocus />
                    </div>
                </main>
            </div>
            
            {selectedVideo && <VideoTrendChartModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </div>
    );
}

