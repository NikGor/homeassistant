import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingCart, Bell, Search, Heart, Star, ArrowRight, X, MapPin, FileText, Download, ExternalLink, Copy, Eye, ChevronRight, Sparkles } from 'lucide-react';

export default function ModernUIKit() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cards');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'map' && mapRef.current && !mapInstanceRef.current) {
      // Загружаем Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Загружаем Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        // Инициализация карты
        const L = window.L;
        const map = L.map(mapRef.current).setView([55.7558, 37.6173], 12);

        // Темная тема для карты
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        // Кастомная иконка маркера
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: linear-gradient(135deg, #475569, #64748b); width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.5);"><div style="transform: rotate(45deg); color: white; font-size: 20px;">📍</div></div>',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        // Добавление маркеров
        L.marker([55.7558, 37.6173], { icon: customIcon }).addTo(map)
          .bindPopup('<div style="color: #1e293b; font-weight: 600;">Красная площадь<br><span style="color: #64748b; font-size: 12px;">Москва, Россия</span></div>');

        L.marker([55.7520, 37.6175], { icon: customIcon }).addTo(map)
          .bindPopup('<div style="color: #1e293b; font-weight: 600;">Кремль<br><span style="color: #64748b; font-size: 12px;">Исторический центр</span></div>');

        L.marker([55.7539, 37.6208], { icon: customIcon }).addTo(map)
          .bindPopup('<div style="color: #1e293b; font-weight: 600;">ГУМ<br><span style="color: #64748b; font-size: 12px;">Торговый центр</span></div>');

        mapInstanceRef.current = map;

        // Анимация при загрузке
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      };
      document.body.appendChild(script);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-950 p-8">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 rounded-2xl p-6 mb-8 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-slate-500/50 active:scale-95"
            >
              <Menu className="text-white" size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Modern UI Kit</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all w-64"
              />
              <Search className="absolute left-4 top-3.5 text-white/60" size={20} />
            </div>
            
            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 relative hover:shadow-lg hover:shadow-red-500/30 active:scale-95">
              <Bell className="text-white" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
            
            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-500/30 active:scale-95">
              <ShoppingCart className="text-white" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="backdrop-blur-md bg-white/10 w-80 p-6 border-r border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
            
            <nav className="space-y-2">
              {['Dashboard', 'Projects', 'Analytics', 'Settings', 'Profile'].map((item, i) => (
                <button 
                  key={i}
                  className="w-full text-left px-6 py-4 rounded-xl bg-white/5 hover:bg-white/20 text-white transition-all duration-300 hover:translate-x-2 border border-white/10"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {['cards', 'buttons', 'text', 'forms', 'map', 'docs', 'widgets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-md text-white/70 hover:text-white border border-white/20 hover:bg-white/15 hover:scale-105 active:scale-95'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards Section */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-slate-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
            <div className="w-full h-48 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl mb-4 flex items-center justify-center">
              <Heart className="text-white" size={64} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Glassmorphism</h3>
            <p className="text-white/70 mb-4">Modern glass effect with backdrop blur and transparency</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">$299</span>
              <button className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-slate-500/50 hover:scale-105 active:scale-95">
                Buy Now <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Product Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl group hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                <Star className="text-white group-hover:scale-125 transition-transform duration-300" size={64} />
              </div>
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-30%</div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-white/70 text-sm ml-2">(128)</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Premium Product</h3>
            <p className="text-white/70 mb-4">High quality item with amazing features</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">$199</span>
              <span className="text-white/50 line-through">$289</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">John Doe</h3>
                <p className="text-white/70">UI/UX Designer</p>
              </div>
            </div>
            <p className="text-white/70 mb-4">Creating beautiful digital experiences with modern design principles</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">142</div>
                <div className="text-white/60 text-sm">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2.8k</div>
                <div className="text-white/60 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">892</div>
                <div className="text-white/60 text-sm">Following</div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-700 rounded-full text-white font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/50 hover:scale-105 active:scale-95">
              Follow
            </button>
          </div>
        </div>
      )}

      {/* Buttons Section */}
      {activeTab === 'buttons' && (
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Button Styles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Primary</h3>
              <button className="w-full py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95">
                Default
              </button>
              <button className="w-full py-3 px-6 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-full text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/70 active:scale-95">
                Success
              </button>
              <button className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/70 active:scale-95">
                Danger
              </button>
              <button className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-700 rounded-full text-white font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/70 active:scale-95">
                Warning
              </button>
              <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/70 active:scale-95">
                Info
              </button>
            </div>

            {/* Outline Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Outline</h3>
              <button className="w-full py-3 px-6 border-2 border-slate-500 text-slate-300 rounded-full font-semibold hover:bg-slate-600 hover:text-white transition-all duration-300 hover:scale-105 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-500/50 active:scale-95">
                Default
              </button>
              <button className="w-full py-3 px-6 border-2 border-emerald-600 text-emerald-400 rounded-full font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95">
                Success
              </button>
              <button className="w-full py-3 px-6 border-2 border-red-500 text-red-400 rounded-full font-semibold hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 active:scale-95">
                Danger
              </button>
              <button className="w-full py-3 px-6 border-2 border-amber-600 text-amber-400 rounded-full font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50 active:scale-95">
                Warning
              </button>
              <button className="w-full py-3 px-6 border-2 border-blue-500 text-blue-400 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95">
                Info
              </button>
            </div>

            {/* Glass Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Glass</h3>
              <button className="w-full py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/30 active:scale-95">
                Default
              </button>
              <button className="w-full py-3 px-6 backdrop-blur-md bg-emerald-600/20 border border-emerald-600/30 text-emerald-200 rounded-full font-semibold hover:bg-emerald-600/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95">
                Success
              </button>
              <button className="w-full py-3 px-6 backdrop-blur-md bg-red-600/20 border border-red-600/30 text-red-200 rounded-full font-semibold hover:bg-red-600/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 active:scale-95">
                Danger
              </button>
              <button className="w-full py-3 px-6 backdrop-blur-md bg-amber-600/20 border border-amber-600/30 text-amber-200 rounded-full font-semibold hover:bg-amber-600/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50 active:scale-95">
                Warning
              </button>
              <button className="w-full py-3 px-6 backdrop-blur-md bg-blue-600/20 border border-blue-600/30 text-blue-200 rounded-full font-semibold hover:bg-blue-600/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95">
                Info
              </button>
            </div>

            {/* Solid Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/80 mb-3">Solid</h3>
              <button className="w-full py-3 px-6 bg-slate-600 text-white rounded-full font-semibold hover:bg-slate-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/50 active:scale-95">
                Default
              </button>
              <button className="w-full py-3 px-6 bg-emerald-700 text-white rounded-full font-semibold hover:bg-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/50 active:scale-95">
                Success
              </button>
              <button className="w-full py-3 px-6 bg-red-600 text-white rounded-full font-semibold hover:bg-red-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/50 active:scale-95">
                Danger
              </button>
              <button className="w-full py-3 px-6 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/50 active:scale-95">
                Warning
              </button>
              <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50 active:scale-95">
                Info
              </button>
            </div>
          </div>

          {/* Sizes Section */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Button Sizes</h3>
            <div className="flex gap-4 flex-wrap items-end">
              <button className="py-2 px-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white text-sm font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95">
                Small
              </button>
              <button className="py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95">
                Medium
              </button>
              <button className="py-4 px-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white text-lg font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95">
                Large
              </button>
              <button className="py-5 px-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white text-xl font-bold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95">
                Extra Large
              </button>
            </div>
          </div>

          {/* Icon Buttons */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Icon Buttons</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="p-3 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-slate-500/70 active:scale-95">
                <Heart className="text-white" size={20} />
              </button>
              <button className="p-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-amber-500/70 active:scale-95">
                <Star className="text-white" size={24} />
              </button>
              <button className="p-5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-emerald-500/70 active:scale-95">
                <ShoppingCart className="text-white" size={28} />
              </button>
              <button className="p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/30 active:scale-95">
                <Bell className="text-white" size={20} />
              </button>
              <button className="p-4 rounded-full backdrop-blur-md bg-red-600/20 border border-red-600/30 hover:bg-red-600/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 active:scale-95">
                <X className="text-red-300" size={24} />
              </button>
              <button className="p-5 rounded-full backdrop-blur-md bg-blue-600/20 border border-blue-600/30 hover:bg-blue-600/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95">
                <Search className="text-blue-300" size={28} />
              </button>
            </div>
          </div>

          {/* Button with Icons */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Buttons with Icons</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95 flex items-center gap-2">
                <Heart size={20} /> Like
              </button>
              <button className="py-3 px-6 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-full text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/70 active:scale-95 flex items-center gap-2">
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button className="py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-700 rounded-full text-white font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/70 active:scale-95 flex items-center gap-2">
                Continue <ArrowRight size={20} />
              </button>
              <button className="py-3 px-6 border-2 border-slate-500 text-slate-300 rounded-full font-semibold hover:bg-slate-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-500/50 active:scale-95 flex items-center gap-2">
                <Search size={20} /> Search
              </button>
            </div>
          </div>

          {/* Disabled State */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Disabled State</h3>
            <div className="flex gap-4 flex-wrap">
              <button disabled className="py-3 px-6 bg-slate-700/50 text-slate-500 rounded-full font-semibold cursor-not-allowed opacity-50">
                Disabled
              </button>
              <button disabled className="py-3 px-6 border-2 border-slate-700 text-slate-600 rounded-full font-semibold cursor-not-allowed opacity-50">
                Disabled Outline
              </button>
              <button disabled className="py-3 px-6 backdrop-blur-md bg-white/5 border border-white/10 text-white/40 rounded-full font-semibold cursor-not-allowed opacity-50">
                Disabled Glass
              </button>
            </div>
          </div>

          {/* Loading State */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Loading State</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full text-white font-semibold shadow-lg flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </button>
              <button className="py-3 px-6 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-full text-white font-semibold shadow-lg flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Section */}
      {activeTab === 'text' && (
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="space-y-8">
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-300 via-stone-200 to-neutral-400 bg-clip-text text-transparent mb-4">
                Huge Heading
              </h1>
              <p className="text-white/70 text-lg">Large, expressive typography is trending in 2025</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-white mb-3">Section Title</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Modern design emphasizes readability with generous spacing and clear hierarchy. 
                Typography plays a crucial role in creating engaging user experiences.
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-3">Quote Block</h3>
              <blockquote className="text-white/70 text-xl italic border-l-4 border-slate-500 pl-6">
                "Design is not just what it looks like and feels like. Design is how it works."
              </blockquote>
              <p className="text-white/50 mt-3">— Steve Jobs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-md bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-2xl p-6 border border-slate-500/30">
                <h4 className="text-xl font-bold text-white mb-2">Feature Title</h4>
                <p className="text-white/70">Short description of an amazing feature that will blow your mind</p>
              </div>
              <div className="backdrop-blur-md bg-gradient-to-br from-emerald-700/20 to-teal-800/20 rounded-2xl p-6 border border-emerald-600/30">
                <h4 className="text-xl font-bold text-white mb-2">Another Feature</h4>
                <p className="text-white/70">More incredible functionality that users will love</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms Section */}
      {activeTab === 'forms' && (
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Modern Form</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Full Name</label>
              <input 
                type="text"
                placeholder="John Doe"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Email Address</label>
              <input 
                type="email"
                placeholder="john@example.com"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Message</label>
              <textarea 
                placeholder="Your message here..."
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Choose Option</label>
              <select className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all">
                <option className="bg-slate-800">Option 1</option>
                <option className="bg-slate-800">Option 2</option>
                <option className="bg-slate-800">Option 3</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="terms"
                className="w-6 h-6 rounded-lg bg-white/10 border-2 border-white/20 checked:bg-slate-600 focus:ring-2 focus:ring-slate-500"
              />
              <label htmlFor="terms" className="text-white/80">I agree to the terms and conditions</label>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl text-white font-bold text-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/70 active:scale-95">
              Submit Form
            </button>
          </div>
        </div>
      )}

      {/* Map Section */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          {/* Map Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-white" size={32} />
              <div>
                <h2 className="text-3xl font-bold text-white">Interactive Map</h2>
                <p className="text-white/70">Leaflet + OpenStreetMap - No API key needed!</p>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl" style={{ height: '500px' }}>
              <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="backdrop-blur-md bg-slate-600/20 rounded-xl p-4 border border-slate-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Free & Open</h4>
                    <p className="text-white/60 text-sm">No API key required</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-emerald-700/20 rounded-xl p-4 border border-emerald-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-700 to-teal-800 rounded-full flex items-center justify-center">
                    <Star className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Dark Theme</h4>
                    <p className="text-white/60 text-sm">Matches your design</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-amber-600/20 rounded-xl p-4 border border-amber-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center">
                    <Heart className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Customizable</h4>
                    <p className="text-white/60 text-sm">Add markers & popups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">✅ Advantages</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Полностью бесплатно</li>
                <li>• Не нужна регистрация</li>
                <li>• Легкая интеграция</li>
                <li>• Темная тема из коробки</li>
                <li>• Кастомные маркеры</li>
                <li>• Popup с информацией</li>
              </ul>
            </div>

            <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">🗺️ Map Providers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Leaflet + OSM</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm font-semibold">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Google Maps</span>
                  <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-sm font-semibold">$200/mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Mapbox</span>
                  <span className="px-3 py-1 bg-slate-600 text-white rounded-full text-sm font-semibold">API Key</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Section */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">RAG Search Results</h2>
          
          {/* Document Card 1 */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-emerald-500/30 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-700 to-teal-800 rounded-xl">
                  <FileText className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Product Requirements Document</h3>
                    <span className="px-2 py-1 bg-emerald-600/30 text-emerald-300 text-xs rounded-full border border-emerald-500/50">PDF</span>
                    <span className="px-2 py-1 bg-amber-600/30 text-amber-300 text-xs rounded-full border border-amber-500/50 flex items-center gap-1">
                      <Sparkles size={12} /> 95% match
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">requirements/product-spec-2024.pdf • 2.4 MB • Updated 3 days ago</p>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <div className="text-white/90 text-sm leading-relaxed">
                  <p className="mb-2">
                    <span className="bg-amber-500/30 px-1 rounded">The authentication system</span> must support OAuth 2.0 and JWT tokens with a minimum session duration of 24 hours. All API endpoints require authentication except for the public documentation pages.
                  </p>
                  <p className="text-white/70">
                    Security requirements include rate limiting (100 requests per minute), HTTPS enforcement, and SQL injection prevention through parameterized queries...
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                  <span>Page 12, Section 3.2</span>
                  <span>•</span>
                  <span>Authentication & Security</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="backdrop-blur-md bg-slate-600/20 rounded-xl p-4 border border-slate-500/30">
                  <div className="aspect-[4/5] bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mb-3 overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <FileText className="text-white/60 mb-2" size={48} />
                      <div className="w-full space-y-2">
                        <div className="h-2 bg-white/20 rounded w-3/4 mx-auto"></div>
                        <div className="h-2 bg-white/20 rounded w-full"></div>
                        <div className="h-2 bg-white/20 rounded w-2/3 mx-auto"></div>
                        <div className="h-2 bg-amber-500/40 rounded w-full"></div>
                        <div className="h-2 bg-white/20 rounded w-4/5 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-xs text-center">Document Preview</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="py-3 px-4 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-xl text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/50 active:scale-95 flex items-center justify-center gap-2">
                    <Eye size={18} /> Open Full
                  </button>
                  <button className="py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/50 active:scale-95 flex items-center justify-center gap-2">
                    <Download size={18} /> Download
                  </button>
                  <button className="py-3 px-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Copy size={18} /> Copy Text
                  </button>
                  <button className="py-3 px-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <ExternalLink size={18} /> Share
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#authentication</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#security</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#api</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#oauth</span>
              </div>
            </div>
          </div>

          {/* Document Card 2 - Excel */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-emerald-500/30 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-700 to-teal-800 rounded-xl">
                  <FileText className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Q4 Sales Report 2024</h3>
                    <span className="px-2 py-1 bg-emerald-600/30 text-emerald-300 text-xs rounded-full border border-emerald-500/50">XLSX</span>
                    <span className="px-2 py-1 bg-amber-600/30 text-amber-300 text-xs rounded-full border border-amber-500/50 flex items-center gap-1">
                      <Sparkles size={12} /> 87% match
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">reports/sales-q4-2024.xlsx • 1.2 MB • Updated 1 week ago</p>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <div className="text-white/90 text-sm leading-relaxed">
                  <p className="mb-2">
                    Total revenue for Q4 reached <span className="bg-emerald-500/30 px-1 rounded font-semibold">$2.4M</span>, representing a <span className="bg-emerald-500/30 px-1 rounded font-semibold">23% increase</span> compared to Q3. The EMEA region showed the strongest growth at 31%, driven primarily by enterprise contracts.
                  </p>
                  <p className="text-white/70">
                    Key performance indicators: Customer acquisition cost decreased by 15%, average deal size increased to $45K...
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                  <span>Sheet: Summary</span>
                  <span>•</span>
                  <span>Cells A1:E25</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="backdrop-blur-md bg-slate-600/20 rounded-xl p-4 border border-slate-500/30">
                  <div className="aspect-[4/5] bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 p-2 text-[8px] font-mono text-white/40">
                      <div className="grid grid-cols-4 gap-1">
                        <div className="bg-emerald-600/30 p-1 rounded">Region</div>
                        <div className="bg-emerald-600/30 p-1 rounded">Q3</div>
                        <div className="bg-emerald-600/30 p-1 rounded">Q4</div>
                        <div className="bg-emerald-600/30 p-1 rounded">Growth</div>
                        <div className="bg-white/10 p-1 rounded">EMEA</div>
                        <div className="bg-white/10 p-1 rounded">$780K</div>
                        <div className="bg-white/10 p-1 rounded">$1.02M</div>
                        <div className="bg-emerald-500/40 p-1 rounded">+31%</div>
                        <div className="bg-white/10 p-1 rounded">AMER</div>
                        <div className="bg-white/10 p-1 rounded">$890K</div>
                        <div className="bg-white/10 p-1 rounded">$1.05M</div>
                        <div className="bg-emerald-500/40 p-1 rounded">+18%</div>
                        <div className="bg-white/10 p-1 rounded">APAC</div>
                        <div className="bg-white/10 p-1 rounded">$285K</div>
                        <div className="bg-white/10 p-1 rounded">$330K</div>
                        <div className="bg-emerald-500/40 p-1 rounded">+16%</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-xs text-center mt-2">Spreadsheet Preview</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="py-3 px-4 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-xl text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/50 active:scale-95 flex items-center justify-center gap-2">
                    <Eye size={18} /> Open Full
                  </button>
                  <button className="py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/50 active:scale-95 flex items-center justify-center gap-2">
                    <Download size={18} /> Download
                  </button>
                  <button className="py-3 px-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Copy size={18} /> Copy Data
                  </button>
                  <button className="py-3 px-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <ExternalLink size={18} /> Share
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#sales</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#q4-2024</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#revenue</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#analytics</span>
              </div>
            </div>
          </div>

          {/* Document Card 3 - Code */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-emerald-500/30 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl">
                  <FileText className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Authentication Module</h3>
                    <span className="px-2 py-1 bg-amber-600/30 text-amber-300 text-xs rounded-full border border-amber-500/50">PY</span>
                    <span className="px-2 py-1 bg-amber-600/30 text-amber-300 text-xs rounded-full border border-amber-500/50 flex items-center gap-1">
                      <Sparkles size={12} /> 92% match
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">backend/auth/oauth_handler.py • 845 lines • Updated yesterday</p>
                </div>
              </div>

              <div className="backdrop-blur-md bg-slate-900/50 rounded-2xl p-4 mb-4 border border-white/10 font-mono text-sm">
                <div className="text-emerald-400 mb-1"># OAuth2 Token Validation</div>
                <div className="text-white/90">
                  <span className="text-purple-400">def</span> <span className="text-blue-400">validate_token</span>(<span className="text-amber-400">token</span>):
                </div>
                <div className="text-white/90 pl-4">
                  <span className="text-slate-400">"""Validates JWT token and returns user data"""</span>
                </div>
                <div className="text-white/90 pl-4">
                  <span className="text-purple-400">try</span>:
                </div>
                <div className="text-white/90 pl-8 bg-amber-500/20 -mx-4 px-4">
                  decoded = jwt.decode(token, SECRET_KEY)
                </div>
                <div className="text-white/90 pl-8">
                  <span className="text-purple-400">return</span> User.get(decoded[<span className="text-green-400">'user_id'</span>])
                </div>
                <div className="flex items-center gap-2 mt-3 text-white/50 text-xs font-sans">
                  <span>Lines 145-152</span>
                  <span>•</span>
                  <span>Function: validate_token</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="backdrop-blur-md bg-slate-600/20 rounded-xl p-4 border border-slate-500/30">
                  <div className="aspect-[4/5] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 overflow-hidden font-mono text-[7px] text-white/60">
                    <div className="text-emerald-400">import jwt</div>
                    <div className="text-emerald-400">from flask import request</div>
                    <div className="mt-2 text-purple-400">class AuthHandler:</div>
                    <div className="pl-2 text-slate-400">"""OAuth2 Handler"""</div>
                    <div className="pl-2 mt-1">def __init__(self):</div>
                    <div className="pl-4">self.secret = KEY</div>
                    <div className="mt-2 bg-amber-500/20 -mx-3 px-3 py-1">def validate(token):</div>
                    <div className="pl-4">return decode()</div>
                    <div className="mt-2">def refresh(token):</div>
                    <div className="pl-4">return new_token</div>
                  </div>
                  <p className="text-white/70 text-xs text-center mt-2">Code Preview</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl text-white font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/50 active:scale-95 flex items-center justify-center gap-2">
                    <Eye size={18} /> View Code
                  </button>
                  <button className="py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl text-white font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/50 active:scale-95 flex items-center justify-center gap-2">
                    <Download size={18} /> Download
                  </button>
                  <button className="py-3 px-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Copy size={18} /> Copy Code
                  </button>
                  <button className="py-3 px-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <ChevronRight size={18} /> Go to Repo
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#python</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#authentication</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#backend</span>
                <span className="px-3 py-1 backdrop-blur-md bg-slate-600/20 text-slate-300 text-xs rounded-full border border-slate-500/30">#jwt</span>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-400" size={24} />
              RAG Search Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="backdrop-blur-md bg-emerald-700/20 rounded-xl p-4 border border-emerald-600/30">
                <h4 className="font-semibold text-white mb-2">Semantic Search</h4>
                <p className="text-white/70 text-sm">AI-powered relevance matching with confidence scores</p>
              </div>
              <div className="backdrop-blur-md bg-slate-600/20 rounded-xl p-4 border border-slate-500/30">
                <h4 className="font-semibold text-white mb-2">Rich Previews</h4>
                <p className="text-white/70 text-sm">Visual document previews with highlighted matches</p>
              </div>
              <div className="backdrop-blur-md bg-amber-600/20 rounded-xl p-4 border border-amber-600/30">
                <h4 className="font-semibold text-white mb-2">Quick Actions</h4>
                <p className="text-white/70 text-sm">Download, share, copy, and open documents instantly</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}