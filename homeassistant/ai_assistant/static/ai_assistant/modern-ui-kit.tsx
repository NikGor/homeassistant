import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
    Zap, ArrowRightCircle, CheckCircle, AlertTriangle, Trash2, Settings, User, Power,
    Play, Map, ParkingCircle, Phone, Mail, Calendar, PhoneCall, Send, Star, Check,
    Search, Store, GitCompareArrows, Youtube, Clapperboard, Tv2, Music, Guitar,
    Save, MessageSquareQuote, PlusCircle, CloudSun, CalendarDays, Clock, Sparkles, MoreHorizontal
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Helper component for Lucide icons to avoid repetition
// In a real app, you'd just use the components directly,
// but this matches the "i" tag replacement.
// On second thought, it's better to replace them directly.

const App: React.FC = () => {

    // Chart.js Configuration
    const chartData: ChartData<'bar'> = {
        labels: ["Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь"],
        datasets: [{
            label: "MAU",
            data: [1200, 1500, 1400, 1800, 2200, 2500],
            backgroundColor: "rgba(99, 102, 241, 0.6)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1,
            borderRadius: 4
        }]
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#e2e8f0"
                }
            },
            tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#e2e8f0",
                bodyColor: "#cbd5e1"
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#94a3b8"
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.1)"
                }
            },
            x: {
                ticks: {
                    color: "#94a3b8"
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.05)"
                }
            }
        }
    };


    // We apply the background to the root div instead of the body
    return (
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-gray-200 p-4 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <header className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        Modern UI Set
                    </h1>
                    <p className="text-xl text-indigo-400 mt-2">Component Showcase (2025)</p>
                </header>

                {/* 1. Buttons */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">1. Buttons</h2>
                    
                    {/* Button Styles */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Button Styles</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Primary */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <Zap size={18} />
                                Primary Action
                            </button>
                            
                            {/* Secondary */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <ArrowRightCircle size={18} />
                                Secondary
                            </button>
                            
                            {/* Success */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <CheckCircle size={18} />
                                Success
                            </button>
                            
                            {/* Warning */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-slate-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <AlertTriangle size={18} />
                                Warning
                            </button>
                            
                            {/* Danger */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <Trash2 size={18} />
                                Danger
                            </button>
                        </div>
                    </div>
                    
                    {/* Icon Only */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Icon Buttons</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <button className="inline-flex items-center justify-center h-11 w-11 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <Settings size={20} />
                            </button>
                            <button className="inline-flex items-center justify-center h-11 w-11 rounded-full font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <User size={20} />
                            </button>
                            <button className="inline-flex items-center justify-center h-11 w-11 rounded-full font-semibold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <Power size={20} />
                            </button>
                        </div>
                    </div>
                </section>
                
                {/* 2. Cards */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">2. Cards</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Base Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Base Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Начните свой проект</p>
                                <p className="text-gray-300 mt-2 text-sm">Это универсальная карточка. Используйте ее для общей информации, подтверждений или сводок.</p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Play size={16} />
                                        Начать
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        Узнать больше
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Location Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Location Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Эйфелева башня</p>
                                <p className="text-gray-300 mt-2 text-sm">Примерно 6 ч 15 мин езды (590 км)</p>
                                <p className="text-gray-400 mt-3 text-sm">
                                    Champ de Mars, 5 Av. Anatole France<br />
                                    75007 Paris, France
                                </p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Map size={16} />
                                        Открыть карту
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <ParkingCircle size={16} />
                                        Найти парковку
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Contact Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Dr. Elena Reed</p>
                                <p className="text-gray-300 mt-1 text-sm">Ведущий AI-исследователь @ FutureTech</p>
                                
                                <div className="space-y-2 mt-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Phone className="w-4 h-4 text-indigo-400" />
                                        <span>+49 123 4567890</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Mail className="w-4 h-4 text-indigo-400" />
                                        <span>e.reed@futuretech.de</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Calendar className="w-4 h-4 text-indigo-400" />
                                        <span>Доступна: Пн-Пт, 10:00-16:00 CET</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <PhoneCall size={16} />
                                        Позвонить
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Send size={16} />
                                        Email
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col md:col-span-2 lg:col-span-3">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/3">
                                    <img src="https://placehold.co/600x400/1e293b/94a3b8?text=MacBook+Pro" 
                                         onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=Image+Error')}
                                         alt="MacBook Pro" 
                                         className="object-cover h-48 w-full md:h-full" />
                                </div>
                                <div className="md:w-2/3 flex flex-col">
                                    <div className="p-6">
                                        <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Product Card</h3>
                                        <p className="text-xl font-bold text-white mt-1">MacBook M3 Max Pro 36Gb</p>
                                        <p className="text-gray-300 mt-1 text-sm">Brand: Apple</p>

                                        <div className="flex items-baseline gap-4 mt-3">
                                            <span className="text-2xl font-bold text-white">3.499,00 €</span>
                                            <span className="text-sm text-yellow-400 flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-current" />
                                                4.9 (128 обзоров)
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-300 font-semibold mt-4 mb-2">Ключевые характеристики:</p>
                                        <ul className="space-y-1.5 text-sm text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                Чип Apple M3 Max
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                36 ГБ объединенной памяти
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                1 ТБ SSD-накопитель
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                16-дюймовый дисплей Liquid Retina XDR
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-auto p-6 pt-0">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                                <Search size={16} />
                                                Показать детали
                                            </button>
                                            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                                <Store size={16} />
                                                Найти ритейлеров
                                            </button>
                                            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                                <GitCompareArrows size={16} />
                                                Сравнить цены
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Movie Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Movie Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Дюна: Часть вторая (2024)</p>
                                
                                <div className="space-y-2 mt-3 text-sm">
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Режиссер:</span> Дени Вильнёв</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">В ролях:</span> Тимоти Шаламе, Зендея, Ребекка Фергюсон</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Жанр:</span> Научная фантастика, Драма</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Рейтинг:</span> 8.9/10 (IMDb)</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Длительность:</span> 2ч 46м</p>
                                </div>
                                
                                <p className="text-gray-300 mt-4 text-sm border-t border-slate-700 pt-3">
                                    Пол Атрейдес объединяется с фременами, чтобы отомстить заговорщикам, уничтожившим его семью.
                                </p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Youtube size={16} />
                                        Смотреть трейлер
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Clapperboard size={16} />
                                        Где посмотреть
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Series Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Series Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Пространство (The Expanse)</p>
                                <p className="text-gray-300 mt-1 text-sm">2015–2022 (Завершен)</p>
                                
                                <div className="space-y-2 mt-3 text-sm">
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-24 inline-block">Платформа:</span> Prime Video</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-24 inline-block">Сезонов:</span> 6 (62 эпизода)</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-24 inline-block">Жанр:</span> Научная фантастика, Драма, Триллер</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-24 inline-block">Рейтинг:</span> 8.5/10 (IMDb)</p>
                                </div>
                                
                                <p className="text-gray-300 mt-4 text-sm border-t border-slate-700 pt-3">
                                    В 24 веке команда космического корабля "Росинант" оказывается втянутой в заговор, угрожающий всей Солнечной системе.
                                </p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Youtube size={16} />
                                        Трейлер
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Tv2 size={16} />
                                        Гид по эпизодам
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Music Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Music Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Stairway to Heaven</p>
                                <p className="text-gray-300 mt-1 text-sm">Led Zeppelin</p>
                                
                                <div className="space-y-2 mt-3 text-sm">
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Альбом:</span> Led Zeppelin IV (1971)</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Длительность:</span> 8:02</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Жанр:</span> Прогрессивный рок, Фолк-рок</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Страна:</span> Великобритания</p>
                                </div>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Music size={16} />
                                        Слушать
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Guitar size={16} />
                                        Похожий рок
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Article Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Article Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Будущее ИИ в 2025 году: Новые горизонты</p>
                                <p className="text-gray-300 mt-1 text-sm">Источник: TechHorizon Weekly <span className="text-gray-400">| 1 ноября 2025</span></p>
                                
                                <p className="text-gray-300 mt-4 text-sm border-t border-slate-700 pt-3">
                                    Эксперты прогнозируют взрывной рост мультимодальных моделей и их интеграцию в повседневные инструменты. Ожидается, что автономные агенты станут более способными, выполняя сложные задачи с минимальным вмешательством человека.
                                </p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Save size={16} />
                                        В заметки
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <MessageSquareQuote size={16} />
                                        Суммаризировать
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Shopping List Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Shopping List Card</h3>
                                <div className="flex justify-between items-baseline">
                                     <p className="text-xl font-bold text-white mt-1">Покупки на неделю</p>
                                     <span className="text-lg font-semibold text-gray-200">~ 28 €</span>
                                </div>
                               
                                <div className="space-y-3 mt-4 text-sm max-h-60 overflow-y-auto pr-2">
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-1.5">Obst & Gemüse</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>2 кг Kartoffeln</li>
                                            <li>1 Bund Petersilie</li>
                                            <li>2 Packungen Salat</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-1.5">Molkerei (verpackt)</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>1 Flasche Milch (1 L)</li>
                                            <li>1 Packung Eier (6 Stück)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-1.5">Getränke</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>6 Flaschen Wasser (1.5 L)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Save size={16} />
                                        В заметки
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <PlusCircle size={16} />
                                        Добавить
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Weather Card */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Weather Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Бад Мергентхайм</p>
                                
                                <div className="flex items-center gap-4 my-3">
                                    <CloudSun className="w-20 h-20 text-yellow-300" />
                                    <div>
                                        <p className="text-5xl font-bold text-white">12°C</p>
                                        <p className="text-gray-300">Ощущается как 10°C</p>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-200 font-medium">Переменная облачность</p>
                                <p className="text-sm text-gray-300 mt-2">Рекомендация: Возьмите легкую куртку.</p>
                                
                                <div className="grid grid-cols-2 gap-3 mt-4 text-sm border-t border-slate-700 pt-3">
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Прогноз:</span> 15° / 7°</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Влажность:</span> 65%</p>
                                    <p className="text-gray-300"><span className="font-semibold text-gray-400 w-20 inline-block">Ветер:</span> 10 км/ч (СЗ)</p>
                                </div>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <CalendarDays size={16} />
                                        7-дневный
                                    </button>
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <Clock size={16} />
                                        Почасовой
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 3. Card Grid */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">3. Card Grid (2 Columns)</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Re-using Weather Card for demo */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Weather Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Бад Мергентхайм</p>
                                
                                <div className="flex items-center gap-4 my-3">
                                    <CloudSun className="w-20 h-20 text-yellow-300" />
                                    <div>
                                        <p className="text-5xl font-bold text-white">12°C</p>
                                        <p className="text-gray-300">Ощущается как 10°C</p>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-200 font-medium">Переменная облачность</p>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <CalendarDays size={16} />
                                        7-дневный
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Re-using Contact Card for demo */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Contact Card</h3>
                                <p className="text-xl font-bold text-white mt-1">Dr. Elena Reed</p>
                                <p className="text-gray-300 mt-1 text-sm">Ведущий AI-исследователь @ FutureTech</p>
                                
                                <div className="space-y-2 mt-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Phone className="w-4 h-4 text-indigo-400" />
                                        <span>+49 123 4567890</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Mail className="w-4 h-4 text-indigo-400" />
                                        <span>e.reed@futuretech.de</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto p-6 pt-0">
                                <div className="flex gap-3">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors">
                                        <PhoneCall size={16} />
                                        Позвонить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Table */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">4. Table</h2>
                    
                    <div className="bg-slate-800/70 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-xl overflow-hidden">
                        <div className="p-4 bg-slate-800/80 border-b border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white">Сравнение Cloud-хостинга (План 'Pro')</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-850/80">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">Провайдер</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">vCPUs</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">Память</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">SSD</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">Цена/мес.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">DigitalOcean</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">4</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">8 GB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">160 GB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">$80</td>
                                    </tr>
                                    {/* Highlighted Row Example (based on highlight_column) */}
                                    <tr className="bg-slate-850/80">
                                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">Hetzner</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-indigo-300 font-medium">6</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-indigo-300 font-medium">16 GB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-indigo-300 font-medium">240 GB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-indigo-300 font-medium">€45</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">Vultr</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">4</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">8 GB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">160 GB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">$80</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
                
                {/* 5. Text Answer */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">5. Text Answer</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plain Text */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-slate-700/50">
                            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-2">type: "plain"</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Это простой текстовый ответ. Он идеально подходит для коротких, прямых сообщений, не требующих сложного форматирования. Используйте его для подтверждений или простых пояснений.
                            </p>
                        </div>
                        
                        {/* Markdown */}
                        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-slate-700/50">
                            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-2">type: "markdown"</h3>
                            {/* For React, you'd use a library like 'react-markdown' to render this, but for this demo we simulate it with Tailwind prose */}
                            <div className="prose prose-invert text-gray-300 max-w-none">
                                <p>Это ответ в формате <strong className="text-white">Markdown</strong>. Он обеспечивает лучшую читаемость.</p>
                                <p>Вы можете использовать:</p>
                                <ul>
                                    <li>Списки для перечислений.</li>
                                    <li><code className="text-sm bg-slate-700 rounded px-1.5 py-0.5 font-mono">inline code</code> для примеров.</li>
                                    <li><strong>Жирный</strong> или <em>курсивный</em> текст для выделения.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Chart */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">6. Chart</h2>
                    
                    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-slate-700/50">
                        {/* Title and Description from model */}
                        <div>
                            <h3 className="text-xl font-bold text-white">Ежемесячные активные пользователи (MAU)</h3>
                            <p className="text-gray-300 mt-1 text-sm">График показывает рост MAU за последние 6 месяцев, с пиком в октябре.</p>
                        </div>
                        
                        {/* Canvas for Chart.js */}
                        <div className="mt-4" style={{ height: '300px' }}>
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>
                </section>

                {/* 7. Quick Action Buttons */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-slate-700">7. Quick Action Buttons</h2>

                    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-slate-700/50">
                        <p className="text-center text-gray-400 mb-4 text-sm">Постоянная панель действий для следующих шагов</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {/* Primary */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-y-0.5">
                                <Sparkles size={18} />
                                Что дальше?
                            </button>
                            
                            {/* Secondary */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-Y-0.5">
                                <MessageSquareQuote size={18} />
                                Суммаризируй это
                            </button>
                            
                            {/* Secondary */}
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-zinc-800 shadow-lg transition-transform transform hover:-translate-Y-0.5">
                                <MoreHorizontal size={18} />
                                Больше опций
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default App;
