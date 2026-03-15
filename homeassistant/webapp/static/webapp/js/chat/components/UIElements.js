// UI Elements Components

// Custom marked renderer for pill-style links
const createCustomMarkedRenderer = () => {
    if (typeof marked === 'undefined') return null;
    const renderer = new marked.Renderer();
    renderer.link = (linkData) => {
        // marked v5+ passes object: { href, title, text }
        // older versions pass (href, title, text) separately
        const href = typeof linkData === 'object' ? linkData.href : linkData;
        const title = typeof linkData === 'object' ? linkData.title : arguments[1];
        const text = typeof linkData === 'object' ? linkData.text : arguments[2];
        
        const pillClass = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200 cursor-pointer no-underline';
        const titleAttr = title ? ` title="${title}"` : '';
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${pillClass}"${titleAttr}><span class="mr-1">🔗</span>${text}</a>`;
    };
    return renderer;
};

// Parse markdown with custom link styling
const parseMarkdownWithPillLinks = (text) => {
    if (typeof marked === 'undefined') return text;
    const renderer = createCustomMarkedRenderer();
    return marked.parse(text, { renderer });
};

// Frontend button command handlers
const handleFrontendCommand = (command, cardData, button) => {
    switch (command) {
        case 'open_map': {
            const address = cardData.address || cardData.title || '';
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            window.open(url, '_blank');
            break;
        }
        case 'open_on_youtube_video': {
            const query = cardData.title || '';
            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
            break;
        }
        case 'open_on_youtube_music': {
            const query = cardData.track_title 
                ? `${cardData.track_title} ${cardData.artist || ''}`.trim()
                : cardData.title || '';
            const url = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
            break;
        }
        case 'check_amazon': {
            const query = cardData.title || '';
            const url = `https://www.amazon.de/s?k=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
            break;
        }
        case 'url_to': {
            if (button.url) {
                window.open(button.url, '_blank');
            }
            break;
        }
        default:
            console.log('Unhandled frontend command:', command);
    }
};

const ChatButton = ({ button, onExecute, cardData }) => {
    const handleClick = () => {
        if (button.type === 'assistant_button') {
            onExecute(button.assistant_request);
        } else if (button.type === 'frontend_button') {
            handleFrontendCommand(button.command, cardData || {}, button);
        }
    };

    return React.createElement('button', {
        onClick: handleClick,
        className: `px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${getButtonStyle(button.style)}`
    }, [
        button.icon && React.createElement('i', {
            key: 'icon',
            'data-lucide': button.icon,
            className: 'w-4 h-4 inline-block mr-2'
        }),
        React.createElement('span', {
            key: 'text'
        }, button.text)
    ]);
};

// Form helper to convert form data to YAML
const formDataToYaml = (formType, data) => {
    const lines = [`${formType}:`];
    for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined && value !== '') {
            lines.push(`  ${key}: "${value}"`);
        } else {
            lines.push(`  ${key}: null`);
        }
    }
    return lines.join('\n');
};

// Common form input component
const FormInput = ({ label, name, type, value, onChange, placeholder, required }) => {
    return React.createElement('div', {
        className: 'mb-4'
    }, [
        React.createElement('label', {
            key: 'label',
            className: 'block text-sm font-medium text-white/80 mb-1'
        }, label + (required ? ' *' : '')),
        React.createElement('input', {
            key: 'input',
            type: type || 'text',
            name: name,
            value: value || '',
            onChange: (e) => onChange(name, e.target.value),
            placeholder: placeholder,
            className: 'w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all'
        })
    ]);
};

// Common form textarea component
const FormTextarea = ({ label, name, value, onChange, placeholder, rows }) => {
    return React.createElement('div', {
        className: 'mb-4'
    }, [
        React.createElement('label', {
            key: 'label',
            className: 'block text-sm font-medium text-white/80 mb-1'
        }, label),
        React.createElement('textarea', {
            key: 'textarea',
            name: name,
            value: value || '',
            onChange: (e) => onChange(name, e.target.value),
            placeholder: placeholder,
            rows: rows || 3,
            className: 'w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-none'
        })
    ]);
};

// Event Form Component
const ChatEventForm = ({ content, onExecute }) => {
    const [formData, setFormData] = React.useState({
        title: content.title || '',
        date: content.date || '',
        time: content.time || '',
        duration_minutes: content.duration_minutes || '',
        location: content.location || '',
        description: content.description || ''
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const yaml = formDataToYaml('event_form', formData);
        const request = `Создать событие в календаре:\n\`\`\`yaml\n${yaml}\n\`\`\``;
        onExecute(request);
    };

    const handleCancel = () => {
        onExecute('Отмена создания события в календаре');
    };

    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border-2 border-indigo-500 shadow-xl shadow-indigo-500/20'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'flex items-center gap-3 mb-4'
        }, [
            React.createElement('i', {
                key: 'icon',
                'data-lucide': 'calendar-plus',
                className: 'w-6 h-6 text-indigo-400'
            }),
            React.createElement('h3', {
                key: 'title',
                className: 'text-lg font-semibold text-white'
            }, 'Новое событие')
        ]),
        React.createElement('div', {
            key: 'form',
            className: 'space-y-1'
        }, [
            React.createElement(FormInput, {
                key: 'title',
                label: 'Название',
                name: 'title',
                value: formData.title,
                onChange: handleChange,
                placeholder: 'Введите название события',
                required: true
            }),
            React.createElement('div', {
                key: 'datetime-row',
                className: 'grid grid-cols-2 gap-4'
            }, [
                React.createElement(FormInput, {
                    key: 'date',
                    label: 'Дата',
                    name: 'date',
                    value: formData.date,
                    onChange: handleChange,
                    placeholder: 'ДД.ММ.ГГГГ',
                    required: true
                }),
                React.createElement(FormInput, {
                    key: 'time',
                    label: 'Время',
                    name: 'time',
                    value: formData.time,
                    onChange: handleChange,
                    placeholder: 'ЧЧ:ММ'
                })
            ]),
            React.createElement('div', {
                key: 'duration-location-row',
                className: 'grid grid-cols-2 gap-4'
            }, [
                React.createElement(FormInput, {
                    key: 'duration',
                    label: 'Длительность (мин)',
                    name: 'duration_minutes',
                    type: 'number',
                    value: formData.duration_minutes,
                    onChange: handleChange,
                    placeholder: '60'
                }),
                React.createElement(FormInput, {
                    key: 'location',
                    label: 'Место',
                    name: 'location',
                    value: formData.location,
                    onChange: handleChange,
                    placeholder: 'Где будет событие'
                })
            ]),
            React.createElement(FormTextarea, {
                key: 'description',
                label: 'Описание',
                name: 'description',
                value: formData.description,
                onChange: handleChange,
                placeholder: 'Дополнительные заметки',
                rows: 2
            })
        ]),
        React.createElement('div', {
            key: 'buttons',
            className: 'flex gap-3 mt-6'
        }, [
            React.createElement('button', {
                key: 'submit',
                onClick: handleSubmit,
                className: 'flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300 flex items-center justify-center gap-2'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'check',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', { key: 'text' }, 'Создать')
            ]),
            React.createElement('button', {
                key: 'cancel',
                onClick: handleCancel,
                className: 'px-4 py-2 rounded-full text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 flex items-center justify-center gap-2'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'x',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', { key: 'text' }, 'Отмена')
            ])
        ])
    ]);
};

// Email Form Component
const ChatEmailForm = ({ content, onExecute }) => {
    const [formData, setFormData] = React.useState({
        to: content.to || '',
        subject: content.subject || '',
        body: content.body || ''
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const yaml = formDataToYaml('email_form', formData);
        const request = `Отправить email:\n\`\`\`yaml\n${yaml}\n\`\`\``;
        onExecute(request);
    };

    const handleCancel = () => {
        onExecute('Отмена отправки email');
    };

    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border-2 border-sky-500 shadow-xl shadow-sky-500/20'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'flex items-center gap-3 mb-4'
        }, [
            React.createElement('i', {
                key: 'icon',
                'data-lucide': 'mail',
                className: 'w-6 h-6 text-sky-400'
            }),
            React.createElement('h3', {
                key: 'title',
                className: 'text-lg font-semibold text-white'
            }, 'Новое письмо')
        ]),
        React.createElement('div', {
            key: 'form',
            className: 'space-y-1'
        }, [
            React.createElement(FormInput, {
                key: 'to',
                label: 'Кому',
                name: 'to',
                type: 'email',
                value: formData.to,
                onChange: handleChange,
                placeholder: 'email@example.com',
                required: true
            }),
            React.createElement(FormInput, {
                key: 'subject',
                label: 'Тема',
                name: 'subject',
                value: formData.subject,
                onChange: handleChange,
                placeholder: 'Тема письма'
            }),
            React.createElement(FormTextarea, {
                key: 'body',
                label: 'Текст письма',
                name: 'body',
                value: formData.body,
                onChange: handleChange,
                placeholder: 'Введите текст письма...',
                rows: 5
            })
        ]),
        React.createElement('div', {
            key: 'buttons',
            className: 'flex gap-3 mt-6'
        }, [
            React.createElement('button', {
                key: 'submit',
                onClick: handleSubmit,
                className: 'flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all duration-300 flex items-center justify-center gap-2'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'send',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', { key: 'text' }, 'Отправить')
            ]),
            React.createElement('button', {
                key: 'cancel',
                onClick: handleCancel,
                className: 'px-4 py-2 rounded-full text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 flex items-center justify-center gap-2'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'x',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', { key: 'text' }, 'Отмена')
            ])
        ])
    ]);
};

// Internal Note Form Component
const ChatNoteForm = ({ content, onExecute }) => {
    const [formData, setFormData] = React.useState({
        title: content.title || '',
        content: content.content || ''
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const yaml = formDataToYaml('note_form', formData);
        const request = `Сохранить заметку:\n\`\`\`yaml\n${yaml}\n\`\`\``;
        onExecute(request);
    };

    const handleCancel = () => {
        onExecute('Отмена создания заметки');
    };

    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border-2 border-amber-500 shadow-xl shadow-amber-500/20'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'flex items-center gap-3 mb-4'
        }, [
            React.createElement('i', {
                key: 'icon',
                'data-lucide': 'sticky-note',
                className: 'w-6 h-6 text-amber-400'
            }),
            React.createElement('h3', {
                key: 'title',
                className: 'text-lg font-semibold text-white'
            }, 'Новая заметка')
        ]),
        React.createElement('div', {
            key: 'form',
            className: 'space-y-1'
        }, [
            React.createElement(FormInput, {
                key: 'title',
                label: 'Заголовок',
                name: 'title',
                value: formData.title,
                onChange: handleChange,
                placeholder: 'Название заметки'
            }),
            React.createElement(FormTextarea, {
                key: 'content',
                label: 'Содержание',
                name: 'content',
                value: formData.content,
                onChange: handleChange,
                placeholder: 'Текст заметки...',
                rows: 5
            })
        ]),
        React.createElement('div', {
            key: 'buttons',
            className: 'flex gap-3 mt-6'
        }, [
            React.createElement('button', {
                key: 'submit',
                onClick: handleSubmit,
                className: 'flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all duration-300 flex items-center justify-center gap-2'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'save',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', { key: 'text' }, 'Сохранить')
            ]),
            React.createElement('button', {
                key: 'cancel',
                onClick: handleCancel,
                className: 'px-4 py-2 rounded-full text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 flex items-center justify-center gap-2'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'x',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', { key: 'text' }, 'Отмена')
            ])
        ])
    ]);
};

const ChatCardGrid = ({ cardGrid, onExecute }) => {
    const gridClass = cardGrid.grid_dimensions === '2_columns' 
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' 
        : 'grid grid-cols-1 gap-4 mb-4';
    
    const isTwoColumns = cardGrid.grid_dimensions === '2_columns';

    const getCardStyle = (type) => {
        const baseStyle = 'backdrop-blur-lg bg-white/10 rounded-2xl p-4 shadow-xl transition-all duration-300';
        
        switch (type) {
            case 'location_card': 
                return `${baseStyle} border-2 border-emerald-500 hover:border-emerald-400 shadow-emerald-500/20`;
            case 'product_card': 
                return `${baseStyle} border-2 border-orange-500 hover:border-orange-400 shadow-orange-500/20`;
            case 'movie_card': 
            case 'series_card': 
                return `${baseStyle} border-2 border-violet-500 hover:border-violet-400 shadow-violet-500/20`;
            case 'music_card': 
                return `${baseStyle} border-2 border-pink-500 hover:border-pink-400 shadow-pink-500/20`;
            case 'article_card': 
                return `${baseStyle} border-2 border-sky-500 hover:border-sky-400 shadow-sky-500/20`;
            case 'shopping_list_card': 
                return `${baseStyle} border-2 border-yellow-500 hover:border-yellow-400 shadow-yellow-500/20`;
            case 'weather_card': 
                return `${baseStyle} border-2 border-cyan-500 hover:border-cyan-400 shadow-cyan-500/20`;
            case 'contact_card': 
                return `${baseStyle} border-2 border-indigo-500 hover:border-indigo-400 shadow-indigo-500/20`;
            case 'card':
            default: 
                return `${baseStyle} border border-white/20 hover:border-white/40`;
        }
    };

    const renderCardContent = (card, isTwoColumns) => {
        const elements = [];
        
        // Contact Card
        if (card.type === 'contact_card') {
            card.name && elements.push(React.createElement('h3', {
                key: 'name',
                className: 'font-semibold text-white mb-1'
            }, card.name));
            card.role && elements.push(React.createElement('p', {
                key: 'role',
                className: 'text-sm text-white/70 mb-1'
            }, card.role));
            card.company && elements.push(React.createElement('p', {
                key: 'company',
                className: 'text-xs text-white/60 mb-2'
            }, card.company));
            if (card.email || card.phone) {
                elements.push(React.createElement('div', {
                    key: 'contact-info',
                    className: 'text-sm text-white/80 mb-2 space-y-1'
                }, [
                    card.email && React.createElement('div', { key: 'email' }, `📧 ${card.email}`),
                    card.phone && React.createElement('div', { key: 'phone' }, `📞 ${card.phone}`)
                ]));
            }
            card.availability && elements.push(React.createElement('p', {
                key: 'availability',
                className: 'text-xs text-white/60 mb-3'
            }, card.availability));
        }
        // Location Card
        else if (card.type === 'location_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white mb-2'
            }, card.title));
            card.description && elements.push(React.createElement('p', {
                key: 'description',
                className: 'text-sm text-white/80 mb-2'
            }, card.description));
            card.address && elements.push(React.createElement('p', {
                key: 'address',
                className: 'text-xs text-white/60 mb-3'
            }, card.address));
        }
        // Movie Card
        else if (card.type === 'movie_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white text-lg mb-2'
            }, card.title));
            
            const metadata = [];
            card.year && metadata.push(`${card.year}`);
            card.director && metadata.push(`реж. ${card.director}`);
            if (metadata.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'metadata',
                    className: 'text-sm text-white/70 mb-2'
                }, metadata.join(' • ')));
            }
            
            card.genre && elements.push(React.createElement('p', {
                key: 'genre',
                className: 'text-xs text-white/60 mb-2'
            }, `🎬 ${card.genre}`));
            
            if (card.cast && card.cast.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'cast',
                    className: 'text-xs text-white/60 mb-2'
                }, `⭐ ${card.cast.join(', ')}`));
            }
            
            card.description && elements.push(React.createElement('p', {
                key: 'description',
                className: 'text-sm text-white/80 mb-3'
            }, card.description));
            
            if (card.rating || card.duration) {
                const extraInfo = [];
                card.rating && extraInfo.push(card.rating);
                card.duration && extraInfo.push(card.duration);
                elements.push(React.createElement('p', {
                    key: 'extra',
                    className: 'text-xs text-white/50'
                }, extraInfo.join(' • ')));
            }
        }
        // Series Card
        else if (card.type === 'series_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white text-lg mb-2'
            }, card.title));
            
            const metadata = [];
            card.years && metadata.push(card.years);
            card.status && metadata.push(card.status);
            if (metadata.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'metadata',
                    className: 'text-sm text-white/70 mb-2'
                }, metadata.join(' • ')));
            }
            
            card.network && elements.push(React.createElement('p', {
                key: 'network',
                className: 'text-xs text-white/60 mb-2'
            }, `📺 ${card.network}`));
            
            if (card.seasons || card.episodes) {
                const seriesInfo = [];
                card.seasons && seriesInfo.push(`${card.seasons} сезонов`);
                card.episodes && seriesInfo.push(`${card.episodes} эпизодов`);
                elements.push(React.createElement('p', {
                    key: 'series-info',
                    className: 'text-xs text-white/60 mb-2'
                }, seriesInfo.join(', ')));
            }
            
            card.genre && elements.push(React.createElement('p', {
                key: 'genre',
                className: 'text-xs text-white/60 mb-2'
            }, `🎭 ${card.genre}`));
            
            card.description && elements.push(React.createElement('p', {
                key: 'description',
                className: 'text-sm text-white/80 mb-3'
            }, card.description));
            
            card.rating && elements.push(React.createElement('p', {
                key: 'rating',
                className: 'text-xs text-white/50'
            }, card.rating));
        }
        // Music Card
        else if (card.type === 'music_card') {
            card.track_title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white text-lg mb-1'
            }, card.track_title));
            
            card.artist && elements.push(React.createElement('p', {
                key: 'artist',
                className: 'text-sm text-white/70 mb-2'
            }, `🎤 ${card.artist}`));
            
            if (card.album_title) {
                const albumInfo = [card.album_title];
                card.album_year && albumInfo.push(`${card.album_year}`);
                elements.push(React.createElement('p', {
                    key: 'album',
                    className: 'text-xs text-white/60 mb-2'
                }, `💿 ${albumInfo.join(' • ')}`));
            }
            
            const trackDetails = [];
            card.genre && trackDetails.push(card.genre);
            card.duration && trackDetails.push(card.duration);
            if (trackDetails.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'details',
                    className: 'text-xs text-white/50'
                }, trackDetails.join(' • ')));
            }
        }
        // Article Card
        else if (card.type === 'article_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white text-lg mb-2'
            }, card.title));
            
            const metadata = [];
            card.source && metadata.push(card.source);
            card.published_date && metadata.push(card.published_date);
            if (metadata.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'metadata',
                    className: 'text-xs text-white/60 mb-2'
                }, `📰 ${metadata.join(' • ')}`));
            }
            
            card.summary && elements.push(React.createElement('p', {
                key: 'summary',
                className: 'text-sm text-white/80 mb-3'
            }, card.summary));
        }
        // Document Card
        else if (card.type === 'document_card') {
            card.filename && elements.push(React.createElement('h3', {
                key: 'filename',
                className: 'font-semibold text-white text-lg mb-1'
            }, card.filename));
            
            card.title && elements.push(React.createElement('p', {
                key: 'title',
                className: 'text-sm text-white/70 mb-2'
            }, card.title));
            
            const docMeta = [];
            card.document_type && docMeta.push(card.document_type);
            card.date && docMeta.push(card.date);
            if (docMeta.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'doc-meta',
                    className: 'text-xs text-white/60 mb-2'
                }, `📄 ${docMeta.join(' • ')}`));
            }
            
            card.snippet && elements.push(React.createElement('p', {
                key: 'snippet',
                className: 'text-sm text-white/80 mb-2 italic border-l-2 border-white/30 pl-3'
            }, card.snippet));
            
            const docDetails = [];
            card.amount && docDetails.push(`💰 ${card.amount}`);
            card.relevance_score && docDetails.push(`🎯 ${Math.round(card.relevance_score * 100)}%`);
            if (docDetails.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'doc-details',
                    className: 'text-xs text-white/50'
                }, docDetails.join(' • ')));
            }
        }
        // Shopping List Card
        else if (card.type === 'shopping_list_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white text-lg mb-3'
            }, card.title));
            
            if (card.items_by_department) {
                const deptElements = Object.entries(card.items_by_department).map(([dept, items], idx) => 
                    React.createElement('div', {
                        key: `dept-${idx}`,
                        className: 'mb-3'
                    }, [
                        React.createElement('p', {
                            key: 'dept-name',
                            className: 'text-sm font-semibold text-white/90 mb-1'
                        }, dept),
                        React.createElement('ul', {
                            key: 'items',
                            className: 'text-sm text-white/70 ml-4 space-y-1'
                        }, items.map((item, itemIdx) => 
                            React.createElement('li', {
                                key: `item-${itemIdx}`,
                                className: 'list-disc'
                            }, item)
                        ))
                    ])
                );
                elements.push(React.createElement('div', {
                    key: 'departments',
                    className: 'mb-3'
                }, deptElements));
            }
            
            card.total_cost && elements.push(React.createElement('p', {
                key: 'total',
                className: 'text-sm font-semibold text-white/90 pt-2 border-t border-white/20'
            }, `💰 Общая стоимость: ~${card.total_cost}€`));
        }
        // Weather Card
        else if (card.type === 'weather_card') {
            card.location && elements.push(React.createElement('h3', {
                key: 'location',
                className: 'font-semibold text-white text-lg mb-3'
            }, `📍 ${card.location}`));
            
            const tempDisplay = [];
            card.current_temp && tempDisplay.push(card.current_temp);
            card.feels_like && tempDisplay.push(`ощущается ${card.feels_like}`);
            elements.push(React.createElement('p', {
                key: 'temp',
                className: 'text-2xl font-bold text-white mb-2'
            }, tempDisplay.join(', ')));
            
            card.condition && elements.push(React.createElement('p', {
                key: 'condition',
                className: 'text-sm text-white/80 mb-3'
            }, `${card.condition_icon ? '🌤️' : ''} ${card.condition}`));
            
            const details = [];
            card.humidity && details.push(`💧 ${card.humidity}`);
            card.wind && details.push(`💨 ${card.wind}`);
            if (details.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'details',
                    className: 'text-xs text-white/60 mb-2'
                }, details.join(' • ')));
            }
            
            card.daily_forecast && elements.push(React.createElement('p', {
                key: 'forecast',
                className: 'text-sm text-white/70 mb-2'
            }, card.daily_forecast));
            
            card.clothing_advice && elements.push(React.createElement('p', {
                key: 'advice',
                className: 'text-xs text-white/60 italic'
            }, `👔 ${card.clothing_advice}`));
        }
        // Product Card
        else if (card.type === 'product_card') {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white text-lg mb-1'
            }, card.title));
            
            card.brand && elements.push(React.createElement('p', {
                key: 'brand',
                className: 'text-sm text-white/70 mb-2'
            }, card.brand));
            
            const priceRating = [];
            card.price && priceRating.push(`💰 ${card.price}`);
            card.rating && priceRating.push(`⭐ ${card.rating}`);
            if (priceRating.length > 0) {
                elements.push(React.createElement('p', {
                    key: 'price-rating',
                    className: 'text-sm text-white/80 mb-3'
                }, priceRating.join(' • ')));
            }
            
            if (card.specifications && card.specifications.length > 0) {
                elements.push(React.createElement('ul', {
                    key: 'specs',
                    className: 'text-xs text-white/70 mb-3 ml-4 space-y-1'
                }, card.specifications.map((spec, idx) => 
                    React.createElement('li', {
                        key: `spec-${idx}`,
                        className: 'list-disc'
                    }, spec)
                )));
            }
        }
        // Generic Card
        else {
            card.title && elements.push(React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-white mb-2'
            }, card.title));
            card.subtitle && elements.push(React.createElement('p', {
                key: 'subtitle',
                className: 'text-sm text-white/70 mb-2'
            }, card.subtitle));
            
            // Render image from image_prompt (base64) or placeholder while loading
            if (card.image_prompt) {
                if (card.image_prompt.length < 1000) {
                    // Still a text prompt — image not yet generated, show placeholder
                    const aspectRatio = isTwoColumns ? '1/1' : '16/9';
                    elements.push(React.createElement(ImagePlaceholder, {
                        key: 'image',
                        aspectRatio,
                        className: 'mb-3',
                        prompt: card.image_prompt
                    }));
                } else {
                    // 2_columns: 1:1 aspect ratio, show full image
                    // 1_column: 16:9 aspect ratio, can use object-cover
                    const imageClass = isTwoColumns
                        ? 'w-full h-auto rounded-lg mb-3 object-contain aspect-square'
                        : 'w-full h-auto rounded-lg mb-3 object-cover aspect-video';

                    elements.push(React.createElement('img', {
                        key: 'image',
                        src: `data:image/png;base64,${card.image_prompt}`,
                        alt: card.title || 'Card image',
                        className: imageClass
                    }));
                }
            }
            
            card.text && elements.push(React.createElement('div', {
                key: 'text',
                className: 'text-white/80 text-sm mb-3',
                dangerouslySetInnerHTML: { __html: card.text }
            }));
        }
        
        // Buttons (common for all types)
        if (card.buttons && card.buttons.length > 0) {
            elements.push(React.createElement('div', {
                key: 'buttons',
                className: 'flex flex-wrap gap-2 mt-3'
            }, card.buttons.map((button, buttonIndex) => 
                React.createElement(ChatButton, {
                    key: `button-${buttonIndex}`,
                    button: button,
                    onExecute: onExecute,
                    cardData: card
                })
            )));
        }
        
        return elements;
    };

    return React.createElement('div', {
        className: gridClass
    }, cardGrid.cards.map((card, index) => 
        React.createElement('div', {
            key: `card-${index}`,
            className: getCardStyle(card.type)
        }, renderCardContent(card, isTwoColumns))
    ));
};

const ChatTable = ({ table }) => {
    return React.createElement('div', {
        className: 'backdrop-blur-lg bg-white/10 rounded-lg border border-white/20 shadow-xl overflow-hidden mb-4'
    }, [
        table.title && React.createElement('div', {
            key: 'table-header',
            className: 'p-4 bg-slate-800/80 border-b border-slate-700/50'
        }, React.createElement('h3', {
            className: 'font-semibold text-white'
        }, table.title)),
        React.createElement('div', {
            key: 'table-wrapper',
            className: 'overflow-x-auto'
        }, React.createElement('table', {
            className: 'w-full'
        }, [
            React.createElement('thead', {
                key: 'thead',
                className: 'bg-slate-800/50'
            }, React.createElement('tr', {}, 
                table.headers.map((header, index) => 
                    React.createElement('th', {
                        key: `header-${index}`,
                        className: 'px-4 py-3 text-left text-white font-semibold'
                    }, header)
                )
            )),
            React.createElement('tbody', {
                key: 'tbody'
            }, table.rows.map((row, rowIndex) =>
                React.createElement('tr', {
                    key: `row-${rowIndex}`,
                    className: 'border-t border-white/10 hover:bg-white/5'
                }, row.map((cell, cellIndex) =>
                    React.createElement('td', {
                        key: `cell-${cellIndex}`,
                        className: 'px-4 py-3 text-white/80'
                    }, cell)
                ))
            ))
        ]))
    ]);
};

const ImagePlaceholder = ({ aspectRatio = '16/9', className = '', prompt = '' }) => {
    return React.createElement('div', {
        className: `image-placeholder ${className}`,
        style: { aspectRatio }
    }, prompt
        ? React.createElement('span', { className: 'image-placeholder__prompt' }, prompt)
        : null
    );
};

const ChatAdvancedAnswerItem = ({ item, onExecute }) => {
    switch (item.type) {
        case 'text_answer':
            const processedText = item.content.type === 'markdown' && typeof marked !== 'undefined'
                ? parseMarkdownWithPillLinks(item.content.text)
                : item.content.text;
            
            return React.createElement('div', {
                className: 'prose prose-invert max-w-none mb-4',
                dangerouslySetInnerHTML: { __html: processedText }
            });
        
        case 'card_grid':
            return React.createElement(ChatCardGrid, {
                cardGrid: item.content,
                onExecute: onExecute
            });
        
        case 'table':
            return React.createElement(ChatTable, {
                table: item.content
            });
        
        case 'chart':
            return React.createElement(ChatChartComponent, {
                chart: item.content,
                order: item.order
            });
        
        case 'image':
            const imagePrompt = item.content?.image_prompt;
            const widthClass = item.layout_hint === 'half_width' ? 'w-full md:w-1/2' :
                               item.layout_hint === 'inline' ? 'w-full md:w-1/3' :
                               'w-full';

            if (!imagePrompt) return null;

            // base64 data is hundreds of KB; text prompts are always < 1000 chars
            if (imagePrompt.length < 1000) {
                return React.createElement('div', {
                    className: `${widthClass} mx-auto mb-4`
                }, React.createElement(ImagePlaceholder, { aspectRatio: '16/9', prompt: imagePrompt }));
            }

            return React.createElement('div', {
                className: `${widthClass} mx-auto mb-4`
            }, React.createElement('img', {
                src: `data:image/png;base64,${imagePrompt}`,
                alt: item.content.alt || 'Generated image',
                className: 'w-full h-auto rounded-xl shadow-2xl'
            }));
        
        case 'event_form':
            return React.createElement(ChatEventForm, {
                content: item.content,
                onExecute: onExecute
            });
        
        case 'email_form':
            return React.createElement(ChatEmailForm, {
                content: item.content,
                onExecute: onExecute
            });
        
        case 'note_form':
            return React.createElement(ChatNoteForm, {
                content: item.content,
                onExecute: onExecute
            });
        
        default:
            return React.createElement('div', {
                className: 'text-white/70 mb-4'
            }, `Неподдерживаемый тип элемента: ${item.type}`);
    }
};

const ChatUIAnswer = ({ uiAnswer, onExecute }) => {
    console.log('ChatUIAnswer: Rendering ui_answer', uiAnswer);
    console.log('ChatUIAnswer: items count', uiAnswer?.items?.length);
    
    const processIntroText = (introText) => {
        if (!introText) return null;
        
        const processedText = introText.type === 'markdown' && typeof marked !== 'undefined'
            ? parseMarkdownWithPillLinks(introText.text)
            : introText.text;
        
        return React.createElement('div', {
            key: 'intro',
            className: 'prose prose-invert max-w-none mb-4',
            dangerouslySetInnerHTML: { __html: processedText }
        });
    };

    const items = uiAnswer?.items || [];
    console.log('ChatUIAnswer: Processing items', items);

    return React.createElement('div', {
        className: 'space-y-6'
    }, [
        // Intro text
        processIntroText(uiAnswer.intro_text),

        // Items
        React.createElement('div', {
            key: 'items'
        }, items.sort((a, b) => a.order - b.order).map((item, index) => {
            console.log(`ChatUIAnswer: Rendering item ${index}`, item);
            return React.createElement('div', {
                key: `item-${index}`,
                className: getSpacingClass(item.spacing)
            }, React.createElement(ChatAdvancedAnswerItem, {
                item: item,
                onExecute: onExecute
            }));
        })),

        // Quick action buttons
        uiAnswer.quick_action_buttons && React.createElement('div', {
            key: 'quick-actions',
            className: 'flex flex-wrap gap-3 pt-4 border-t border-white/20'
        }, uiAnswer.quick_action_buttons.buttons.map((button, index) =>
            React.createElement(ChatButton, {
                key: `quick-${index}`,
                button: button,
                onExecute: onExecute
            })
        ))
    ]);
};

const StreamingStatusInline = ({ message, step }) => {
    const { useEffect } = React;

    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 0);
        }
    }, [step]);

    const toolIconMap = {
        'web_search': 'search', 'google': 'search', 'search': 'search',
        'llm': 'brain', 'think': 'brain', 'reason': 'brain',
        'image': 'image', 'fetch': 'globe', 'browse': 'globe', 'web': 'globe',
        'memory': 'database', 'plan': 'list-checks', 'tool': 'wrench',
        'code': 'code-2', 'file': 'file-text',
    };
    const getIcon = (s) => {
        if (!s) return 'zap';
        const lower = s.toLowerCase();
        for (const [key, icon] of Object.entries(toolIconMap)) {
            if (lower.includes(key)) return icon;
        }
        return 'zap';
    };

    return React.createElement('div', {
        className: 'flex items-center gap-2 mb-4 pb-3 border-b border-white/10'
    }, [
        React.createElement('div', {
            key: 'pulse',
            className: 'relative flex-shrink-0 w-2 h-2'
        }, [
            React.createElement('div', { key: 'ring', className: 'absolute inset-0 rounded-full bg-blue-400/50 animate-ping' }),
            React.createElement('div', { key: 'dot', className: 'absolute inset-0 rounded-full bg-blue-400' })
        ]),
        React.createElement('i', {
            key: 'icon',
            'data-lucide': getIcon(step),
            className: 'w-3.5 h-3.5 text-white/40 flex-shrink-0'
        }),
        React.createElement('span', {
            key: 'text',
            className: 'text-white/50 text-xs truncate'
        }, message || 'Обрабатываю...')
    ]);
};

const StreamingPlaceholder = ({ reasoning, statusMessage, statusStep }) => {
    return React.createElement('div', {
        className: 'space-y-4'
    }, [
        statusMessage && React.createElement(StreamingStatusInline, {
            key: 'status',
            message: statusMessage,
            step: statusStep
        }),
        reasoning && React.createElement('div', {
            key: 'reasoning',
            className: 'text-white/50 text-xs italic border-l-2 border-white/20 pl-3 mb-3'
        }, reasoning),
        React.createElement('div', {
            key: 'skeleton-lines',
            className: 'space-y-2'
        }, [
            React.createElement('div', { key: 's1', className: 'skeleton-line', style: { width: '75%' } }),
            React.createElement('div', { key: 's2', className: 'skeleton-line', style: { width: '100%' } }),
            React.createElement('div', { key: 's3', className: 'skeleton-line', style: { width: '83%' } }),
        ]),
        React.createElement('div', {
            key: 'skeleton-cards',
            className: 'grid grid-cols-2 gap-3 mt-3'
        }, [
            React.createElement('div', { key: 'c1', className: 'skeleton-card', style: { height: '6rem' } }),
            React.createElement('div', { key: 'c2', className: 'skeleton-card', style: { height: '6rem' } }),
        ])
    ]);
};

const ChatContent = ({ content, onExecute }) => {
    console.log('ChatContent: Rendering content', content);
    console.log('ChatContent: content.text', content?.text);
    console.log('ChatContent: content.ui_answer', content?.ui_answer);
    console.log('ChatContent: content.content_format', content?.content_format);

    if (content._streaming && !content._placeholder) {
        return React.createElement('div', { className: 'space-y-0' }, [
            content._statusMessage && React.createElement(StreamingStatusInline, {
                key: 'status',
                message: content._statusMessage,
                step: content._statusStep || ''
            }),
            React.createElement('div', {
                key: 'text',
                className: 'prose prose-invert max-w-none'
            }, [
                React.createElement('span', { key: 'text' }, content.text || ''),
                React.createElement('span', { key: 'cursor', className: 'streaming-cursor' })
            ])
        ]);
    }

    if (content._placeholder) {
        return React.createElement(StreamingPlaceholder, {
            key: 'placeholder',
            reasoning: content._reasoning || '',
            statusMessage: content._statusMessage || '',
            statusStep: content._statusStep || ''
        });
    }

    // Check for ui_answer first, regardless of content_format
    if (content.ui_answer) {
        console.log('ChatContent: Rendering ui_answer');
        return React.createElement(ChatUIAnswer, {
            uiAnswer: content.ui_answer,
            onExecute: onExecute
        });
    }
    
    // Check for level3_answer (text + widget + quick actions)
    if (content.level3_answer) {
        console.log('ChatContent: Rendering level3_answer');
        const l3 = content.level3_answer;
        return React.createElement('div', {
            className: 'space-y-6'
        }, [
            // Text
            l3.text && React.createElement('div', {
                key: 'text',
                className: 'prose prose-invert max-w-none',
                dangerouslySetInnerHTML: { 
                    __html: l3.text.type === 'markdown' && typeof marked !== 'undefined'
                        ? parseMarkdownWithPillLinks(l3.text.text)
                        : l3.text.text
                }
            }),
            // Widget placeholder (TODO: render actual widget)
            l3.widget && React.createElement('div', {
                key: 'widget',
                className: 'text-white/50 text-sm'
            }, `[Widget: ${l3.widget.type || l3.widget.widget_type}]`),
            // Quick action buttons
            l3.quick_action_buttons && React.createElement('div', {
                key: 'quick-actions',
                className: 'flex flex-wrap gap-3 pt-4 border-t border-white/20'
            }, l3.quick_action_buttons.buttons.map((button, index) =>
                React.createElement(ChatButton, {
                    key: `quick-${index}`,
                    button: button,
                    onExecute: onExecute
                })
            ))
        ]);
    }
    
    // Check for level2_answer (text + quick actions)
    if (content.level2_answer) {
        console.log('ChatContent: Rendering level2_answer');
        const l2 = content.level2_answer;
        return React.createElement('div', {
            className: 'space-y-6'
        }, [
            // Text
            l2.text && React.createElement('div', {
                key: 'text',
                className: 'prose prose-invert max-w-none',
                dangerouslySetInnerHTML: { 
                    __html: l2.text.type === 'markdown' && typeof marked !== 'undefined'
                        ? parseMarkdownWithPillLinks(l2.text.text)
                        : l2.text.text
                }
            }),
            // Quick action buttons
            l2.quick_action_buttons && React.createElement('div', {
                key: 'quick-actions',
                className: 'flex flex-wrap gap-3 pt-4 border-t border-white/20'
            }, l2.quick_action_buttons.buttons.map((button, index) =>
                React.createElement(ChatButton, {
                    key: `quick-${index}`,
                    button: button,
                    onExecute: onExecute
                })
            ))
        ]);
    }
    
    // Then check for text content
    if (content.text) {
        // Simple text content - check if it needs markdown processing
        const processedText = content.content_format === 'markdown' && typeof marked !== 'undefined'
            ? parseMarkdownWithPillLinks(content.text)
            : content.text;
        
        return React.createElement('div', {
            className: 'prose prose-invert max-w-none',
            dangerouslySetInnerHTML: { __html: processedText }
        });
    }

    console.error('ChatContent: Unsupported content format', content);
    return React.createElement('div', {
        className: 'text-white/70'
    }, 'Неподдерживаемый формат контента');
};

const ChatMessage = ({ message, onExecute }) => {
    const { useState } = React;
    const isUser = message.role === 'user';
    const isStreaming = !isUser && (message.content?._streaming || message.content?._placeholder);
    const [debugOpen, setDebugOpen] = useState(false);
    const hasDebugData = message.llm_trace || (message.pipeline_steps && message.pipeline_steps.length > 0) || message.pipeline_trace;
    const showDebugButton = window.debugMode && hasDebugData;

    const renderDebugPanel = () => {
        const pt = message.pipeline_trace;
        const topTrace = message.llm_trace;
        const hasTopTraceData = topTrace && (topTrace.total_tokens > 0 || topTrace.total_cost > 0);

        // Aggregate LLM trace from stages when top-level is empty (frontend fallback, not new data)
        const stageLlmTraces = pt
            ? ['command_call', 'tool_execution', 'create_output']
                .filter(k => pt[k]?.llm_trace)
                .map(k => ({ stage: k, trace: pt[k].llm_trace }))
            : [];
        const aggregated = stageLlmTraces.length > 0
            ? stageLlmTraces.reduce((acc, { trace }) => ({
                model: acc.model || trace.model,
                input_tokens: (acc.input_tokens || 0) + (trace.input_tokens || 0),
                input_tokens_details: {
                    cached_tokens: ((acc.input_tokens_details?.cached_tokens) || 0) + ((trace.input_tokens_details?.cached_tokens) || 0),
                },
                output_tokens: (acc.output_tokens || 0) + (trace.output_tokens || 0),
                output_tokens_details: {
                    reasoning_tokens: ((acc.output_tokens_details?.reasoning_tokens) || 0) + ((trace.output_tokens_details?.reasoning_tokens) || 0),
                },
                total_tokens: (acc.total_tokens || 0) + (trace.total_tokens || 0),
                total_cost: (acc.total_cost || 0) + (trace.total_cost || 0),
            }), {})
            : null;
        const effectiveLlmTrace = hasTopTraceData ? topTrace : (aggregated || topTrace);
        // model may be missing from top-level trace — fall back to stage model
        const effectiveModel = effectiveLlmTrace?.model || aggregated?.model || stageLlmTraces[0]?.trace?.model || '—';

        // ── helpers ─────────────────────────────────────────────────────────────
        const H = (key, label) => React.createElement('div', {
            key,
            className: 'uppercase tracking-wider text-[10px] mt-3 mb-1'
        }, label);

        const Row = (key, label, value) => React.createElement('div', {
            key,
            className: 'flex justify-between gap-4 leading-[1.6]'
        }, [
            React.createElement('span', { key: 'l' }, label),
            React.createElement('span', { key: 'r' }, value),
        ]);

        const Sub = (key, value) => React.createElement('div', {
            key,
            className: 'text-right leading-[1.4] -mt-0.5 mb-0.5 text-[11px]'
        }, value);

        const HR = (key) => React.createElement('div', {
            key, className: 'border-t border-white/10 mt-2 mb-2'
        });

        const sec = (n) => `${(n / 1000).toFixed(2)}s`;

        // ── LLM TRACE ──────────────────────────────────────────────────────────
        const lm = effectiveLlmTrace;
        const cached = lm?.input_tokens_details?.cached_tokens || 0;
        const reasoning = lm?.output_tokens_details?.reasoning_tokens || 0;
        const llmSection = lm && [
            H('llm-hdr', 'LLM Trace'),
            Row('lm-model',  'model',  effectiveModel),
            Row('lm-input',  'input',  `${lm.input_tokens || 0} tokens`),
            cached > 0   && Sub('lm-cached',    `↳ cached: ${cached}`),
            Row('lm-output', 'output', `${lm.output_tokens || 0} tokens`),
            reasoning > 0 && Sub('lm-reasoning', `↳ reasoning: ${reasoning}`),
            Row('lm-total',  'total',  `${lm.total_tokens || 0} tokens`),
            Row('lm-cost',   'cost',   `$${(lm.total_cost || 0).toFixed(6)}`),
        ].filter(Boolean);

        // ── TIMELINE  (command_call → tool_execution → create_output) ──────────
        const traceSection = pt && [
            HR('div1'),
            H('tl-hdr', 'Timeline'),
            ...['command_call', 'tool_execution', 'create_output'].map(k => {
                const stage = pt[k];
                if (!stage) return Row(k, k, '—');
                const stageLm = stage.llm_trace;
                const hasLm = stageLm && stageLm.total_tokens > 0;
                return [
                    Row(k, k, sec(stage.duration_ms)),
                    stage.ttft_ms != null && Row(`${k}-ttft`, 'ttft', sec(stage.ttft_ms)),
                    hasLm && Sub(`${k}-lm`, `↳ ${stageLm.input_tokens}→${stageLm.output_tokens} tok · $${(stageLm.total_cost || 0).toFixed(6)}`),
                ].filter(Boolean);
            }).flat(),
            HR('div2'),
            Row('total', 'total', sec(pt.total_ms)),
        ];

        // ── STEPS  (deduplicated: group by name, sum durations) ────────────────
        const rawSteps = message.pipeline_steps || [];
        const stepsMap = rawSteps.reduce((acc, s) => {
            const name = s.step || s.status || '?';
            acc[name] = (acc[name] || 0) + (s.duration_ms || 0);
            return acc;
        }, {});
        const dedupedSteps = Object.entries(stepsMap);
        const stepsSection = dedupedSteps.length > 0 && [
            HR('div3'),
            H('steps-hdr', 'Steps'),
            ...dedupedSteps.map(([name, dur], i) => Row(`step-${i}`, name, sec(dur))),
        ];

        return React.createElement('div', {
            key: 'debug-panel',
            className: 'mt-2 bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono'
        }, [
            ...(llmSection   || []),
            ...(traceSection || []),
            ...(stepsSection || []),
        ]);
    };

    return React.createElement('div', {
        className: `mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`
    }, [
        React.createElement('div', {
            key: 'message-container',
            className: `${isStreaming ? 'w-[85%]' : 'max-w-[85%]'} ${isUser ? 'order-2' : 'order-1'}`
        }, [
            React.createElement('div', {
                key: 'message-bubble',
                className: `backdrop-blur-lg rounded-3xl p-6 border shadow-2xl relative group ${
                    isUser
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 text-white'
                        : 'bg-white/10 border-white/20 text-white'
                }`
            }, [
                React.createElement('div', {
                    key: 'message-header',
                    className: 'flex items-center gap-2 mb-3'
                }, [
                    React.createElement('div', {
                        key: 'avatar',
                        className: `w-8 h-8 rounded-full flex items-center justify-center ${
                            isUser ? 'bg-slate-500' : 'bg-blue-500'
                        }`
                    }, [
                        React.createElement('i', {
                            key: 'avatar-icon',
                            'data-lucide': isUser ? 'user' : 'bot',
                            className: 'w-4 h-4'
                        })
                    ]),
                    React.createElement('span', {
                        key: 'role',
                        className: 'font-semibold'
                    }, isUser ? 'Вы' : 'Archie'),
                    React.createElement('span', {
                        key: 'time',
                        className: 'text-xs opacity-70'
                    }, formatTime(message.created_at))
                ]),
                React.createElement('div', {
                    key: 'message-content',
                    className: 'message-content'
                }, React.createElement(ChatContent, {
                    content: message.content,
                    onExecute: onExecute
                }))
            ]),
            showDebugButton && React.createElement('div', {
                key: 'debug-toggle',
                className: `flex ${isUser ? 'justify-end' : 'justify-start'} mt-1`
            }, React.createElement('button', {
                className: 'text-white/30 hover:text-white/60 transition-colors text-xs flex items-center gap-1 px-2 py-0.5',
                onClick: () => setDebugOpen(prev => !prev)
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': debugOpen ? 'chevron-down' : 'chevron-right',
                    className: 'w-3 h-3'
                }),
                React.createElement('span', { key: 'label' }, 'debug')
            ])),
            showDebugButton && debugOpen && renderDebugPanel()
        ])
    ]);
};
