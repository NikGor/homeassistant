// ChatInput - Advanced chat input component with settings and menus

// Models that accept image input (mirrored in archie-ai-agent app/config.py VISION_MODELS)
const VISION_MODELS = new Set([
    'gpt-5.6-luna', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
    'gpt-5.4', 'gpt-5.4-pro', 'gpt-5.4-mini', 'gpt-5.4-nano',
    'google/gemini-3.1-pro-preview', 'google/gemini-3-flash-preview', 'google/gemini-3.1-flash-lite-preview',
    'anthropic/claude-opus-4.6', 'anthropic/claude-sonnet-4.6',
    'anthropic/claude-opus-4.5', 'anthropic/claude-sonnet-4.5', 'anthropic/claude-haiku-4.5',
    'x-ai/grok-4.20-beta', 'x-ai/grok-4.1-fast',
]);
const MAX_IMAGES = 4;
const MAX_IMAGE_SIDE = 1568;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Downscale to MAX_IMAGE_SIDE and re-encode as JPEG to keep the WebSocket payload small.
// GIFs are flattened to their first frame.
const prepareImage = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            media_type: 'image/jpeg',
            data: dataUrl.split(',')[1],
            preview: dataUrl
        });
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Cannot read image: ${file.name}`));
    };
    img.src = url;
});

const ChatInput = ({
    value,
    onChange,
    onSubmit,
    disabled,
    isLoading,
    images = [],
    onImagesChange
}) => {
    const { useState, useRef, useEffect, useCallback } = React;
    
    // Menu states
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [formatMenuOpen, setFormatMenuOpen] = useState(false);
    const [settingsSubmenu, setSettingsSubmenu] = useState(null); // null, 'commandModel', 'responseModel'
    
    // Settings state
    const [demoMode, setDemoMode] = useState(() => {
        const stored = localStorage.getItem('demoMode');
        const value = stored === 'true';
        window.demoMode = value;
        return value;
    });
    const [debugMode, setDebugMode] = useState(() => {
        const stored = localStorage.getItem('debugMode');
        const value = stored === 'true';
        window.debugMode = value;
        return value;
    });
    const [noImage, setNoImage] = useState(() => {
        const stored = localStorage.getItem('noImage');
        const value = stored === 'true';
        window.noImage = value;
        return value;
    });
    const [selectedFormat, setSelectedFormat] = useState(() => {
        const stored = localStorage.getItem('selectedResponseFormat') || 'ui_answer';
        window.selectedResponseFormat = stored;
        return stored;
    });
    const [selectedCommandModel, setSelectedCommandModel] = useState(() => {
        const stored = localStorage.getItem('selectedCommandModel') || 'gpt-4.1-mini';
        window.selectedCommandModel = stored;
        return stored;
    });
    const [selectedResponseModel, setSelectedResponseModel] = useState(() => {
        const stored = localStorage.getItem('selectedFinalOutputModel') || 'gpt-4.1';
        window.selectedFinalOutputModel = stored;
        return stored;
    });
    
    // Speech-to-text (browser SpeechRecognition) — always Russian
    const SpeechRecognition = typeof window !== 'undefined'
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;
    const sttSupported = !!SpeechRecognition;
    const [isListening, setIsListening] = useState(false);

    // Refs
    const textareaRef = useRef(null);
    const containerRef = useRef(null);
    const addMenuRef = useRef(null);
    const settingsMenuRef = useRef(null);
    const formatMenuRef = useRef(null);
    const recognitionRef = useRef(null);
    const valueRef = useRef(value);
    valueRef.current = value;
    
    // Constants
    const MIN_HEIGHT = 48;
    const MAX_HEIGHT = 200;
    
    const formats = [
        { value: 'plain', label: 'Plain Text' },
        { value: 'formatted', label: 'Formatted Text' },
        { value: 'ui_answer', label: 'UI Answer' },
        { value: 'voice_answer', label: 'Voice Answer' }
    ];
    
    // All available models
    const openaiModels = [
        'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
        'gpt-5.4', 'gpt-5.4-pro', 'gpt-5.4-mini', 'gpt-5.4-nano',
        'gpt-5.6-luna',
    ];
    const openrouterModels = [
        'google/gemini-3.1-pro-preview', 'google/gemini-3-flash-preview', 'google/gemini-3.1-flash-lite-preview',
        'anthropic/claude-opus-4.6', 'anthropic/claude-sonnet-4.6',
        'anthropic/claude-opus-4.5', 'anthropic/claude-sonnet-4.5', 'anthropic/claude-haiku-4.5',
        'x-ai/grok-4.20-beta', 'x-ai/grok-4.1-fast',
    ];
    const allModels = [...openaiModels, ...openrouterModels];
    
    // Models depend on response format
    const getModelsForFormat = useCallback((_format) => {
        return {
            command: allModels,
            response: allModels
        };
    }, []);
    
    const currentModels = getModelsForFormat(selectedFormat);

    // Images are analyzed by the command model (Stage 1), so it decides availability
    const imagesSupported = VISION_MODELS.has(selectedCommandModel);
    const fileInputRef = useRef(null);
    const imagesRef = useRef(images);
    imagesRef.current = images;

    const addImageFiles = useCallback(async (files) => {
        const picked = Array.from(files).filter(f => ACCEPTED_IMAGE_TYPES.includes(f.type));
        const room = MAX_IMAGES - imagesRef.current.length;
        if (!picked.length || room <= 0 || !onImagesChange) return;
        try {
            const prepared = await Promise.all(picked.slice(0, room).map(prepareImage));
            onImagesChange([...imagesRef.current, ...prepared]);
        } catch (err) {
            console.error('ChatInput: image processing failed', err);
        }
    }, [onImagesChange]);

    const removeImage = useCallback((id) => {
        onImagesChange?.(imagesRef.current.filter(img => img.id !== id));
    }, [onImagesChange]);

    // Drop attachments when the selected model can't process them
    useEffect(() => {
        if (!imagesSupported && imagesRef.current.length && onImagesChange) {
            onImagesChange([]);
        }
    }, [imagesSupported, onImagesChange]);

    const handlePaste = useCallback((e) => {
        if (!imagesSupported) return;
        const files = Array.from(e.clipboardData?.files || []).filter(f => f.type.startsWith('image/'));
        if (files.length) {
            e.preventDefault();
            addImageFiles(files);
        }
    }, [imagesSupported, addImageFiles]);
    
    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = `${MIN_HEIGHT}px`;
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
        }
    }, [value]);
    
    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addMenuOpen && addMenuRef.current && !addMenuRef.current.contains(event.target)) {
                setAddMenuOpen(false);
            }
            if (settingsMenuOpen && settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
                setSettingsMenuOpen(false);
                setSettingsSubmenu(null);
            }
            if (formatMenuOpen && formatMenuRef.current && !formatMenuRef.current.contains(event.target)) {
                setFormatMenuOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [addMenuOpen, settingsMenuOpen, formatMenuOpen]);
    
    // Re-initialize Lucide icons after menu state changes
    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }, [addMenuOpen, settingsMenuOpen, formatMenuOpen, settingsSubmenu]);
    
    // Mutual exclusion of menus
    const openAddMenu = useCallback(() => {
        setSettingsMenuOpen(false);
        setSettingsSubmenu(null);
        setFormatMenuOpen(false);
        setAddMenuOpen(prev => !prev);
    }, []);
    
    const openSettingsMenu = useCallback(() => {
        setAddMenuOpen(false);
        setFormatMenuOpen(false);
        setSettingsMenuOpen(prev => !prev);
        if (settingsMenuOpen) {
            setSettingsSubmenu(null);
        }
    }, [settingsMenuOpen]);
    
    const openFormatMenu = useCallback(() => {
        setAddMenuOpen(false);
        setSettingsMenuOpen(false);
        setSettingsSubmenu(null);
        setFormatMenuOpen(prev => !prev);
    }, []);
    
    // Settings handlers
    const handleDemoModeToggle = useCallback(() => {
        const newValue = !demoMode;
        setDemoMode(newValue);
        localStorage.setItem('demoMode', String(newValue));
        window.demoMode = newValue;
    }, [demoMode]);

    const handleDebugModeToggle = useCallback(() => {
        const newValue = !debugMode;
        setDebugMode(newValue);
        localStorage.setItem('debugMode', String(newValue));
        window.debugMode = newValue;
    }, [debugMode]);

    const handleNoImageToggle = useCallback(() => {
        const newValue = !noImage;
        setNoImage(newValue);
        localStorage.setItem('noImage', String(newValue));
        window.noImage = newValue;
    }, [noImage]);

    const handleFormatSelect = useCallback((format) => {
        setSelectedFormat(format);
        localStorage.setItem('selectedResponseFormat', format);
        window.selectedResponseFormat = format;
        
        // Reset models to first available for new format
        const models = getModelsForFormat(format);
        if (!models.command.includes(selectedCommandModel)) {
            const newCommandModel = models.command[0];
            setSelectedCommandModel(newCommandModel);
            localStorage.setItem('selectedCommandModel', newCommandModel);
            window.selectedCommandModel = newCommandModel;
        }
        if (!models.response.includes(selectedResponseModel)) {
            const newResponseModel = models.response[0];
            setSelectedResponseModel(newResponseModel);
            localStorage.setItem('selectedFinalOutputModel', newResponseModel);
            window.selectedFinalOutputModel = newResponseModel;
        }
        
        setFormatMenuOpen(false);
    }, [selectedCommandModel, selectedResponseModel, getModelsForFormat]);
    
    const handleCommandModelSelect = useCallback((model) => {
        setSelectedCommandModel(model);
        localStorage.setItem('selectedCommandModel', model);
        window.selectedCommandModel = model;
        setSettingsSubmenu(null);
    }, []);
    
    const handleResponseModelSelect = useCallback((model) => {
        setSelectedResponseModel(model);
        localStorage.setItem('selectedFinalOutputModel', model);
        window.selectedFinalOutputModel = model;
        setSettingsSubmenu(null);
    }, []);
    
    // Form submit handler
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (value.trim() && !disabled && !isLoading) {
            onSubmit(e);
        }
    }, [value, disabled, isLoading, onSubmit]);
    
    // Handle Enter key (submit on Enter, new line on Shift+Enter)
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);
    
    // Voice input handler — dictates into the input field (Russian)
    const handleVoiceInput = useCallback(() => {
        if (!sttSupported) {
            console.warn('SpeechRecognition is not supported in this browser');
            return;
        }
        // Toggle: stop an active session
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(r => r[0]?.transcript || '')
                .join(' ')
                .trim();
            if (!transcript) return;
            const base = valueRef.current || '';
            onChange(base ? `${base} ${transcript}` : transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [sttSupported, isListening, SpeechRecognition, onChange]);

    // Stop recognition on unmount
    useEffect(() => {
        return () => recognitionRef.current?.abort?.();
    }, []);

    // Refresh Lucide icon when listening state toggles
    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 0);
        }
    }, [isListening]);

    const isSubmitDisabled = !value.trim() || disabled || isLoading;
    const currentFormatLabel = formats.find(f => f.value === selectedFormat)?.label || 'UI Answer';
    
    // Menu item component
    const MenuItem = ({ icon, label, onClick, isActive, hasSubmenu, disabled: itemDisabled, title }) => {
        return React.createElement('button', {
            type: 'button',
            disabled: itemDisabled,
            title: title,
            className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                itemDisabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : isActive
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-300 hover:bg-white/10'
            }`,
            onClick: onClick
        }, [
            React.createElement('i', {
                key: 'icon',
                'data-lucide': icon,
                className: 'w-4 h-4'
            }),
            React.createElement('span', {
                key: 'label',
                className: 'flex-1 text-left text-sm'
            }, label),
            hasSubmenu && React.createElement('i', {
                key: 'chevron',
                'data-lucide': 'chevron-right',
                className: 'w-4 h-4 text-gray-500'
            }),
            isActive && !hasSubmenu && React.createElement('i', {
                key: 'check',
                'data-lucide': 'check',
                className: 'w-4 h-4'
            })
        ]);
    };
    
    // Toggle switch component
    const ToggleSwitch = ({ checked, onChange, label }) => {
        return React.createElement('button', {
            className: 'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors',
            onClick: onChange
        }, [
            React.createElement('div', {
                key: 'label-container',
                className: 'flex items-center gap-3'
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'flask-conical',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', {
                    key: 'label',
                    className: 'text-sm'
                }, label)
            ]),
            React.createElement('div', {
                key: 'toggle',
                className: `w-10 h-5 rounded-full transition-colors relative ${
                    checked ? 'bg-cyan-500' : 'bg-gray-600'
                }`
            }, [
                React.createElement('div', {
                    key: 'toggle-knob',
                    className: `absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-5' : 'translate-x-0.5'
                    }`
                })
            ])
        ]);
    };
    
    // Render Add Menu
    const renderAddMenu = () => {
        if (!addMenuOpen) return null;
        
        return React.createElement('div', {
            ref: addMenuRef,
            className: 'absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px] z-50'
        }, [
            React.createElement('div', {
                key: 'menu-content',
                className: 'p-2'
            }, [
                React.createElement(MenuItem, {
                    key: 'attach-file',
                    icon: 'paperclip',
                    label: 'Attach file',
                    onClick: () => {
                        console.log('Attach file clicked');
                        setAddMenuOpen(false);
                    }
                }),
                React.createElement(MenuItem, {
                    key: 'add-image',
                    icon: 'image',
                    label: 'Add image',
                    disabled: !imagesSupported || images.length >= MAX_IMAGES,
                    title: !imagesSupported
                        ? 'The selected Command Model does not support images'
                        : images.length >= MAX_IMAGES ? `Up to ${MAX_IMAGES} images` : 'Add image',
                    onClick: () => {
                        fileInputRef.current?.click();
                        setAddMenuOpen(false);
                    }
                })
            ])
        ]);
    };
    
    // Render Settings Menu
    const renderSettingsMenu = () => {
        if (!settingsMenuOpen) return null;
        
        // Back button for submenus
        const BackButton = () => {
            return React.createElement('button', {
                className: 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/10 transition-colors border-t border-white/10 mt-2 pt-3',
                onClick: () => setSettingsSubmenu(null)
            }, [
                React.createElement('i', {
                    key: 'icon',
                    'data-lucide': 'arrow-left',
                    className: 'w-4 h-4'
                }),
                React.createElement('span', {
                    key: 'label',
                    className: 'text-sm'
                }, 'Back')
            ]);
        };
        
        // Main settings menu
        if (settingsSubmenu === null) {
            return React.createElement('div', {
                ref: settingsMenuRef,
                className: 'absolute bottom-full left-8 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[220px] z-50'
            }, [
                React.createElement('div', {
                    key: 'menu-content',
                    className: 'p-2'
                }, [
                    React.createElement(ToggleSwitch, {
                        key: 'demo-mode',
                        checked: demoMode,
                        onChange: handleDemoModeToggle,
                        label: 'Demo Mode'
                    }),
                    React.createElement(ToggleSwitch, {
                        key: 'debug-mode',
                        checked: debugMode,
                        onChange: handleDebugModeToggle,
                        label: 'Debug Mode'
                    }),
                    React.createElement(ToggleSwitch, {
                        key: 'no-image',
                        checked: noImage,
                        onChange: handleNoImageToggle,
                        label: 'No Image'
                    }),
                    React.createElement('div', {
                        key: 'divider',
                        className: 'h-px bg-white/10 my-2'
                    }),
                    React.createElement(MenuItem, {
                        key: 'command-model',
                        icon: 'cpu',
                        label: 'Command Model',
                        hasSubmenu: true,
                        onClick: () => setSettingsSubmenu('commandModel')
                    }),
                    React.createElement(MenuItem, {
                        key: 'response-model',
                        icon: 'brain',
                        label: 'Response Model',
                        hasSubmenu: true,
                        onClick: () => setSettingsSubmenu('responseModel')
                    })
                ])
            ]);
        }
        
        // Command Model submenu
        if (settingsSubmenu === 'commandModel') {
            return React.createElement('div', {
                ref: settingsMenuRef,
                className: 'absolute bottom-full left-8 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[220px] z-50'
            }, [
                React.createElement('div', {
                    key: 'header',
                    className: 'px-3 py-2 border-b border-white/10'
                }, [
                    React.createElement('span', {
                        key: 'title',
                        className: 'text-sm font-medium text-white'
                    }, 'Command Model')
                ]),
                React.createElement('div', {
                    key: 'menu-content',
                    className: 'p-2'
                }, [
                    ...currentModels.command.map(model => 
                        React.createElement(MenuItem, {
                            key: model,
                            icon: 'cpu',
                            label: model,
                            isActive: selectedCommandModel === model,
                            onClick: () => handleCommandModelSelect(model)
                        })
                    ),
                    React.createElement(BackButton, { key: 'back' })
                ])
            ]);
        }
        
        // Response Model submenu
        if (settingsSubmenu === 'responseModel') {
            return React.createElement('div', {
                ref: settingsMenuRef,
                className: 'absolute bottom-full left-8 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[220px] z-50'
            }, [
                React.createElement('div', {
                    key: 'header',
                    className: 'px-3 py-2 border-b border-white/10'
                }, [
                    React.createElement('span', {
                        key: 'title',
                        className: 'text-sm font-medium text-white'
                    }, 'Response Model')
                ]),
                React.createElement('div', {
                    key: 'menu-content',
                    className: 'p-2'
                }, [
                    ...currentModels.response.map(model => 
                        React.createElement(MenuItem, {
                            key: model,
                            icon: 'brain',
                            label: model,
                            isActive: selectedResponseModel === model,
                            onClick: () => handleResponseModelSelect(model)
                        })
                    ),
                    React.createElement(BackButton, { key: 'back' })
                ])
            ]);
        }
        
        return null;
    };
    
    // Render Format Menu
    const renderFormatMenu = () => {
        if (!formatMenuOpen) return null;
        
        return React.createElement('div', {
            ref: formatMenuRef,
            className: 'absolute bottom-full right-12 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px] z-50'
        }, [
            React.createElement('div', {
                key: 'menu-content',
                className: 'p-2'
            }, formats.map(format => 
                React.createElement(MenuItem, {
                    key: format.value,
                    icon: format.value === 'plain' ? 'file-text' : format.value === 'formatted' ? 'file-code' : format.value === 'voice_answer' ? 'mic' : 'layout-grid',
                    label: format.label,
                    isActive: selectedFormat === format.value,
                    onClick: () => handleFormatSelect(format.value)
                })
            ))
        ]);
    };
    
    return React.createElement('div', {
        ref: containerRef,
        className: 'w-full max-w-[60rem] mx-auto px-4'
    }, [
        React.createElement('div', {
            key: 'input-wrapper',
            className: 'relative'
        }, [
            // Background blur
            React.createElement('div', {
                key: 'bg',
                className: 'absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl'
            }),
            
            // Form - vertical layout: textarea on top, toolbar on bottom
            React.createElement('form', {
                key: 'form',
                className: 'relative flex flex-col p-3',
                onSubmit: handleSubmit
            }, [
                // Attached image previews
                images.length > 0 && React.createElement('div', {
                    key: 'image-previews',
                    className: 'flex flex-wrap gap-2 pb-2'
                }, images.map(img => React.createElement('div', {
                    key: img.id,
                    className: 'relative w-16 h-16 rounded-lg overflow-hidden border border-white/20'
                }, [
                    React.createElement('img', {
                        key: 'thumb',
                        src: img.preview,
                        alt: 'Attached image',
                        className: 'w-full h-full object-cover'
                    }),
                    React.createElement('button', {
                        key: 'remove',
                        type: 'button',
                        title: 'Remove image',
                        'aria-label': 'Remove image',
                        onClick: () => removeImage(img.id),
                        className: 'absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center hover:bg-black'
                    }, '\u00d7')
                ]))),
                React.createElement('input', {
                    key: 'image-input',
                    ref: fileInputRef,
                    type: 'file',
                    accept: ACCEPTED_IMAGE_TYPES.join(','),
                    multiple: true,
                    className: 'hidden',
                    onChange: (e) => {
                        addImageFiles(e.target.files);
                        e.target.value = '';
                    }
                }),

                // Textarea (top)
                React.createElement('div', {
                    key: 'textarea-container',
                    className: 'w-full'
                }, [
                    React.createElement('textarea', {
                        key: 'textarea',
                        ref: textareaRef,
                        placeholder: 'Transform thought into motion',
                        className: 'w-full bg-transparent text-white placeholder-gray-500 border-none outline-none focus:ring-0 resize-none py-2 px-1',
                        style: {
                            minHeight: `${MIN_HEIGHT}px`,
                            maxHeight: `${MAX_HEIGHT}px`
                        },
                        value: value,
                        onChange: (e) => onChange(e.target.value),
                        onKeyDown: handleKeyDown,
                        onPaste: handlePaste,
                        disabled: disabled || isLoading,
                        rows: 1
                    })
                ]),
                
                // Toolbar (bottom) - horizontal layout
                React.createElement('div', {
                    key: 'toolbar',
                    className: 'flex items-center justify-between mt-2'
                }, [
                    // Left toolbar
                    React.createElement('div', {
                        key: 'left-toolbar',
                        className: 'flex items-center gap-1'
                    }, [
                        // Add button with menu
                        React.createElement('div', {
                            key: 'add-container',
                            className: 'relative'
                        }, [
                            React.createElement('button', {
                                key: 'add-btn',
                                type: 'button',
                                className: `p-2 rounded-lg transition-colors border ${
                                    addMenuOpen 
                                        ? 'bg-white/20 text-white border-white/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/10 border-white/20'
                                }`,
                                onClick: openAddMenu,
                                title: 'Add'
                            }, [
                                React.createElement('i', {
                                    key: 'icon',
                                    'data-lucide': 'plus',
                                    className: 'w-4 h-4'
                                })
                            ]),
                            renderAddMenu()
                        ]),
                        
                        // Settings button with menu
                        React.createElement('div', {
                            key: 'settings-container',
                            className: 'relative'
                        }, [
                            React.createElement('button', {
                                key: 'settings-btn',
                                type: 'button',
                                className: `p-2 rounded-lg transition-colors border ${
                                    settingsMenuOpen 
                                        ? 'bg-white/20 text-white border-white/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/10 border-white/20'
                                }`,
                                onClick: openSettingsMenu,
                                title: 'Settings'
                            }, [
                                React.createElement('i', {
                                    key: 'icon',
                                    'data-lucide': 'sliders-horizontal',
                                    className: 'w-4 h-4'
                                })
                            ]),
                            renderSettingsMenu()
                        ])
                    ]),
                    
                    // Right toolbar
                    React.createElement('div', {
                        key: 'right-toolbar',
                        className: 'flex items-center gap-2'
                    }, [
                        // Format selector
                        React.createElement('div', {
                            key: 'format-container',
                            className: 'relative'
                        }, [
                            React.createElement('button', {
                                key: 'format-btn',
                                type: 'button',
                                className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                                    formatMenuOpen 
                                        ? 'bg-white/20 text-white' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`,
                                onClick: openFormatMenu,
                                title: 'Response format'
                            }, [
                                React.createElement('span', {
                                    key: 'label'
                                }, currentFormatLabel),
                                React.createElement('i', {
                                    key: 'chevron',
                                    'data-lucide': 'chevron-down',
                                    className: 'w-3 h-3'
                                })
                            ]),
                            renderFormatMenu()
                        ]),
                        
                        // Voice input button — browser speech-to-text (Russian)
                        sttSupported && React.createElement('button', {
                            key: 'voice-btn',
                            type: 'button',
                            className: `p-2 rounded-lg transition-colors border ${
                                isListening
                                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10 border-white/20'
                            }`,
                            onClick: handleVoiceInput,
                            title: isListening ? 'Stop listening' : 'Voice input'
                        }, [
                            React.createElement('i', {
                                key: 'icon',
                                'data-lucide': isListening ? 'mic-off' : 'mic',
                                className: 'w-4 h-4'
                            })
                        ]),

                        // Send button
                        React.createElement('button', {
                            key: 'send-btn',
                            type: 'submit',
                            disabled: isSubmitDisabled,
                            className: `p-2 rounded-lg transition-all border ${
                                isSubmitDisabled
                                    ? 'text-gray-600 border-white/10 cursor-not-allowed'
                                    : 'bg-white text-black border-white hover:bg-gray-200'
                            }`,
                            title: 'Send message'
                        }, [
                            React.createElement('i', {
                                key: 'icon',
                                'data-lucide': isLoading ? 'loader-2' : 'arrow-up',
                                className: `w-4 h-4 ${isLoading ? 'animate-spin' : ''}`
                            })
                        ])
                    ])
                ])
            ])
        ])
    ]);
};
