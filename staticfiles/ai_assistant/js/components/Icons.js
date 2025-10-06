/**
 * Icons - коллекция SVG иконок для интерфейса
 * Все иконки экспортируются как React компоненты
 */

// Основные иконки интерфейса
export const SendIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('line', { key: 'line1', x1: "22", y1: "2", x2: "11", y2: "13" }),
    React.createElement('polygon', { key: 'polygon', points: "22,2 15,22 11,13 2,9 22,2" })
]);

export const MenuIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('line', { key: 'line1', x1: "3", y1: "6", x2: "21", y2: "6" }),
    React.createElement('line', { key: 'line2', x1: "3", y1: "12", x2: "21", y2: "12" }),
    React.createElement('line', { key: 'line3', x1: "3", y1: "18", x2: "21", y2: "18" })
]);

export const SearchIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('circle', { key: 'circle', cx: "11", cy: "11", r: "8" }),
    React.createElement('path', { key: 'path', d: "M21 21l-4.35-4.35" })
]);

export const PlusIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('line', { key: 'line1', x1: "12", y1: "5", x2: "12", y2: "19" }),
    React.createElement('line', { key: 'line2', x1: "5", y1: "12", x2: "19", y2: "12" })
]);

export const WifiIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path1', d: "M5 12.55a11 11 0 0 1 14.08 0" }),
    React.createElement('path', { key: 'path2', d: "M1.42 9a16 16 0 0 1 21.16 0" }),
    React.createElement('path', { key: 'path3', d: "M8.53 16.11a6 6 0 0 1 6.95 0" }),
    React.createElement('line', { key: 'line', x1: "12", y1: "20", x2: "12.01", y2: "20" })
]);

export const ArrowLeftIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('line', { key: 'line', x1: "19", y1: "12", x2: "5", y2: "12" }),
    React.createElement('polyline', { key: 'polyline', points: "12,19 5,12 12,5" })
]);

// Иконки пользователей
export const UserIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
    React.createElement('circle', { key: 'circle', cx: "12", cy: "7", r: "4" })
]);

export const BotIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('rect', { key: 'rect', x: "3", y: "11", width: "18", height: "10", rx: "2", ry: "2" }),
    React.createElement('circle', { key: 'circle', cx: "12", cy: "5", r: "2" }),
    React.createElement('path', { key: 'path', d: "M12 7v4" }),
    React.createElement('line', { key: 'line1', x1: "8", y1: "16", x2: "8", y2: "16" }),
    React.createElement('line', { key: 'line2', x1: "16", y1: "16", x2: "16", y2: "16" })
]);

// Функциональные иконки
export const CopyIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('rect', { key: 'rect1', x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
    React.createElement('path', { key: 'path', d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
]);

export const QuoteIcon = () => React.createElement('svg', {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path1', d: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" }),
    React.createElement('path', { key: 'path2', d: "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" })
]);

export const MessageCircleIcon = () => React.createElement('svg', {
    width: "64", height: "64", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "1.5", opacity: "0.3"
}, [
    React.createElement('path', { key: 'path', d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
]);
