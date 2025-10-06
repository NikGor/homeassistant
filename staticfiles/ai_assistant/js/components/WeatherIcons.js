/**
 * WeatherIcons - коллекция иконок для погодного виджета
 */

export const SunIcon = () => React.createElement('svg', {
    width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "5" }),
    React.createElement('line', { key: 'line1', x1: "12", y1: "1", x2: "12", y2: "3" }),
    React.createElement('line', { key: 'line2', x1: "12", y1: "21", x2: "12", y2: "23" }),
    React.createElement('line', { key: 'line3', x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
    React.createElement('line', { key: 'line4', x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
    React.createElement('line', { key: 'line5', x1: "1", y1: "12", x2: "3", y2: "12" }),
    React.createElement('line', { key: 'line6', x1: "21", y1: "12", x2: "23", y2: "12" }),
    React.createElement('line', { key: 'line7', x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
    React.createElement('line', { key: 'line8', x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })
]);

export const CloudIcon = () => React.createElement('svg', {
    width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" })
]);

export const RainIcon = () => React.createElement('svg', {
    width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('line', { key: 'line1', x1: "16", y1: "13", x2: "16", y2: "21" }),
    React.createElement('line', { key: 'line2', x1: "8", y1: "13", x2: "8", y2: "21" }),
    React.createElement('line', { key: 'line3', x1: "12", y1: "15", x2: "12", y2: "23" }),
    React.createElement('path', { key: 'path', d: "M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" })
]);

export const SnowIcon = () => React.createElement('svg', {
    width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" }),
    React.createElement('line', { key: 'line1', x1: "8", y1: "16", x2: "8.01", y2: "16" }),
    React.createElement('line', { key: 'line2', x1: "8", y1: "20", x2: "8.01", y2: "20" }),
    React.createElement('line', { key: 'line3', x1: "12", y1: "18", x2: "12.01", y2: "18" }),
    React.createElement('line', { key: 'line4', x1: "12", y1: "22", x2: "12.01", y2: "22" }),
    React.createElement('line', { key: 'line5', x1: "16", y1: "16", x2: "16.01", y2: "16" }),
    React.createElement('line', { key: 'line6', x1: "16", y1: "20", x2: "16.01", y2: "20" })
]);

// Маленькие иконки для деталей погоды
export const ThermometerIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" })
]);

export const DropletIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" })
]);

export const WindIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path1', d: "M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" }),
    React.createElement('path', { key: 'path2', d: "M9.6 4.6A2 2 0 1 1 11 8H2" }),
    React.createElement('path', { key: 'path3', d: "M12.6 19.4A2 2 0 1 0 14 16H2" })
]);

export const EyeIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
    React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "3" })
]);

export const CompassIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
    React.createElement('polygon', { key: 'polygon', points: "16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" })
]);

export const SunriseIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M17 18a5 5 0 0 0-10 0" }),
    React.createElement('line', { key: 'line1', x1: "12", y1: "2", x2: "12", y2: "9" }),
    React.createElement('line', { key: 'line2', x1: "4.22", y1: "10.22", x2: "5.64", y2: "11.64" }),
    React.createElement('line', { key: 'line3', x1: "1", y1: "18", x2: "3", y2: "18" }),
    React.createElement('line', { key: 'line4', x1: "21", y1: "18", x2: "23", y2: "18" }),
    React.createElement('line', { key: 'line5', x1: "18.36", y1: "11.64", x2: "19.78", y2: "10.22" }),
    React.createElement('line', { key: 'line6', x1: "23", y1: "22", x2: "1", y2: "22" }),
    React.createElement('polyline', { key: 'polyline', points: "8,6 12,2 16,6" })
]);

export const SunsetIcon = () => React.createElement('svg', {
    width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", 
    stroke: "currentColor", strokeWidth: "2"
}, [
    React.createElement('path', { key: 'path', d: "M17 18a5 5 0 0 0-10 0" }),
    React.createElement('line', { key: 'line1', x1: "12", y1: "9", x2: "12", y2: "2" }),
    React.createElement('line', { key: 'line2', x1: "4.22", y1: "10.22", x2: "5.64", y2: "11.64" }),
    React.createElement('line', { key: 'line3', x1: "1", y1: "18", x2: "3", y2: "18" }),
    React.createElement('line', { key: 'line4', x1: "21", y1: "18", x2: "23", y2: "18" }),
    React.createElement('line', { key: 'line5', x1: "18.36", y1: "11.64", x2: "19.78", y2: "10.22" }),
    React.createElement('line', { key: 'line6', x1: "23", y1: "22", x2: "1", y2: "22" }),
    React.createElement('polyline', { key: 'polyline', points: "16,5 12,9 8,5" })
]);
