// UI Elements rendering (buttons, dropdowns, checklists)
class UIElementsRenderer {
    static renderUIElements(messageDiv, options, archieChat) {
        const uiContainer = document.createElement('div');
        uiContainer.className = 'ui-elements';

        // Render buttons
        if (options.buttons && options.buttons.length > 0) {
            UIElementsRenderer.renderButtons(uiContainer, options.buttons, archieChat);
        }

        // Render dropdown
        if (options.dropdown && options.dropdown.length > 0) {
            UIElementsRenderer.renderDropdown(uiContainer, options.dropdown, archieChat);
        }

        // Render checklist
        if (options.checklist && options.checklist.length > 0) {
            UIElementsRenderer.renderChecklist(uiContainer, options.checklist, archieChat);
        }

        if (uiContainer.children.length > 0) {
            messageDiv.appendChild(uiContainer);
        }
    }

    static renderButtons(container, buttons, archieChat) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'message-buttons';
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = 'message-btn';
            btn.textContent = button.text;
            btn.onclick = () => {
                if (button.command) {
                    archieChat.sendMessage(button.command);
                } else if (button.url) {
                    window.open(button.url, '_blank');
                }
            };
            buttonsDiv.appendChild(btn);
        });
        
        container.appendChild(buttonsDiv);
    }

    static renderDropdown(container, dropdown, archieChat) {
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'dropdown-container mt-2';
        
        const select = document.createElement('select');
        select.className = 'form-select form-select-sm';
        select.style.backgroundColor = '#252525';
        select.style.borderColor = '#444';
        select.style.color = '#e0e0e0';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Выберите опцию...';
        select.appendChild(defaultOption);
        
        dropdown.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });
        
        select.onchange = (e) => {
            const selectedOption = dropdown.find(opt => opt.value === e.target.value);
            if (selectedOption) {
                if (selectedOption.command) {
                    archieChat.sendMessage(selectedOption.command);
                } else if (selectedOption.url) {
                    window.open(selectedOption.url, '_blank');
                }
            }
        };
        
        dropdownDiv.appendChild(select);
        container.appendChild(dropdownDiv);
    }

    static renderChecklist(container, checklist, archieChat) {
        const checklistDiv = document.createElement('div');
        checklistDiv.className = 'checklist-container mt-2';
        
        checklist.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'form-check';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.checked = item.checked;
            checkbox.style.backgroundColor = item.checked ? '#3498db' : '#252525';
            checkbox.style.borderColor = '#444';
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.textContent = item.label;
            label.style.color = '#e0e0e0';
            
            checkbox.onchange = (e) => {
                if (item.command) {
                    archieChat.sendMessage(`${item.command}:${e.target.checked}`);
                } else if (item.url) {
                    window.open(item.url, '_blank');
                }
            };
            
            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            checklistDiv.appendChild(itemDiv);
        });
        
        container.appendChild(checklistDiv);
    }
}
