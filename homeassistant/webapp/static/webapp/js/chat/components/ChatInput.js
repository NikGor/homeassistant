// ChatInput - Advanced chat input component with settings and menus
const ChatInput = ({
    value,
    onChange,
    onSubmit,
    disabled,
    isLoading
}) => {
    const { useState, useRef, useEffect, useCallback } = React;
    
    // Menu states
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [formatMenuOpen, setFormatMenuOpen] = useState(false);
    const [settingsSubmenu, setSettingsSubmenu] = useState(null); // null, 'commandModel', 'responseModel', 'style'
    
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
    const [selectedStyle, setSelectedStyle] = useState(() => {
        return localStorage.getItem('selectedStyle') || 'Butler';
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
    
    // Refs
    const textareaRef = useRef(null);
    const containerRef = useRef(null);
    const addMenuRef = useRef(null);
    const settingsMenuRef = useRef(null);
    const formatMenuRef = useRef(null);
    
    // Constants
    const MIN_HEIGHT = 48;
    const MAX_HEIGHT = 200;
    
    const styles = ['Business', 'Bro', 'Flirty', 'Futurebot', 'Butler'];
    const formats = [
        { value: 'plain', label: 'Plain Text' },
        { value: 'formatted', label: 'Formatted Text' },
        { value: 'ui_answer', label: 'UI Answer' }
    ];
    
    // All available models
    const openaiModels = [
        'gpt-4o', 'gpt-4o-mini', 
        'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
        'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-pro', 'gpt-5.1',
        'o1', 'o1-pro', 'o3', 'o3-mini', 'o3-pro'
    ];
    const openrouterModels = [
        'x-ai/grok-4', 'x-ai/grok-4-fast', 'x-ai/grok-4.1-fast',
        'deepseek/deepseek-v3.2-exp',
        'meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout'
    ];
    const allModels = [...openaiModels, ...openrouterModels];
    
    // Models depend on response format
    const getModelsForFormat = useCallback((format) => {
        if (format === 'plain') {
            // Plain text: all models available
            return {
                command: allModels,
                response: allModels
            };
        } else {
            // formatted and ui_answer: only OpenAI models (structured output required)
            return {
                command: openaiModels,
                response: openaiModels
            };
        }
    }, []);
    
    const currentModels = getModelsForFormat(selectedFormat);
    
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
    
    const handleStyleSelect = useCallback(async (style) => {
        setSelectedStyle(style);
        localStorage.setItem('selectedStyle', style);
        window.selectedStyle = style;
        
        // Update user persona via API
        try {
            const userName = window.CURRENT_USER_NAME || 'guest';
            await fetch('/api/user/state/', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: userName,
                    persona: style
                })
            });
        } catch (error) {
            console.error('Failed to update user style:', error);
        }
        
        setSettingsSubmenu(null);
    }, []);
    
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
    
    const isSubmitDisabled = !value.trim() || disabled || isLoading;
    const currentFormatLabel = formats.find(f => f.value === selectedFormat)?.label || 'UI Answer';
    
    // Menu item component
    const MenuItem = ({ icon, label, onClick, isActive, hasSubmenu }) => {
        return React.createElement('button', {
            className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
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
                    onClick: () => {
                        console.log('Add image clicked');
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
                    }),
                    React.createElement(MenuItem, {
                        key: 'style',
                        icon: 'palette',
                        label: 'Use style',
                        hasSubmenu: true,
                        onClick: () => setSettingsSubmenu('style')
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
        
        // Style submenu
        if (settingsSubmenu === 'style') {
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
                    }, 'Use style')
                ]),
                React.createElement('div', {
                    key: 'menu-content',
                    className: 'p-2'
                }, [
                    ...styles.map(style => 
                        React.createElement(MenuItem, {
                            key: style,
                            icon: 'sparkles',
                            label: style,
                            isActive: selectedStyle === style,
                            onClick: () => handleStyleSelect(style)
                        })
                    ),
                    React.createElement('div', {
                        key: 'divider',
                        className: 'h-px bg-white/10 my-2'
                    }),
                    React.createElement(MenuItem, {
                        key: 'create-edit',
                        icon: 'edit-3',
                        label: 'Create & edit styles',
                        onClick: () => {
                            console.log('Create & edit styles clicked');
                            setSettingsSubmenu(null);
                        }
                    }),
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
                    icon: format.value === 'plain' ? 'file-text' : format.value === 'formatted' ? 'file-code' : 'layout-grid',
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
