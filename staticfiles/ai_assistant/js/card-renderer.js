// Card rendering functionality
class CardRenderer {
    static renderCard(messageDiv, card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card mt-2';
        cardDiv.style.backgroundColor = '#1e1e1e';
        cardDiv.style.borderColor = '#333';
        cardDiv.style.color = '#e0e0e0';
        
        let cardContent = '';
        
        if (card.image_url) {
            cardContent += `<img src="${card.image_url}" class="card-img-top" alt="${card.title || ''}">`;
        }
        
        cardContent += '<div class="card-body">';
        
        if (card.title) {
            cardContent += `<h5 class="card-title" style="color: #3498db;">${card.title}</h5>`;
        }
        
        if (card.subtitle) {
            cardContent += `<p class="card-text">${card.subtitle}</p>`;
        }
        
        cardContent += '</div>';
        
        cardDiv.innerHTML = cardContent;
        
        // Add card options
        if (card.options) {
            UIElementsRenderer.renderUIElements(cardDiv, card.options);
        }
        
        messageDiv.appendChild(cardDiv);
    }

    static renderNavigationCard(messageDiv, navCard) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card mt-2';
        cardDiv.style.backgroundColor = '#2c3e50';
        cardDiv.style.borderColor = '#34495e';
        cardDiv.style.color = '#e0e0e0';
        cardDiv.style.cursor = 'pointer';
        
        let cardContent = '';
        
        if (navCard.image_url) {
            cardContent += `<img src="${navCard.image_url}" class="card-img-top" alt="${navCard.title}">`;
        }
        
        cardContent += `
            <div class="card-body">
                <h5 class="card-title" style="color: #3498db;">
                    <i class="bi bi-arrow-right-circle"></i> ${navCard.title}
                </h5>
                ${navCard.description ? `<p class="card-text">${navCard.description}</p>` : ''}
            </div>
        `;
        
        cardDiv.innerHTML = cardContent;
        
        if (navCard.url) {
            cardDiv.onclick = () => window.open(navCard.url, '_blank');
        }
        
        messageDiv.appendChild(cardDiv);
    }

    static renderToolCard(messageDiv, toolCard) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card mt-2';
        cardDiv.style.backgroundColor = '#1e1e1e';
        cardDiv.style.borderColor = '#333';
        cardDiv.style.color = '#e0e0e0';
        
        let cardContent = `
            <div class="card-body d-flex align-items-center">
                ${toolCard.icon_url ? 
                    `<img src="${toolCard.icon_url}" alt="${toolCard.name}" style="width: 40px; height: 40px; margin-right: 15px;">` : 
                    `<i class="bi bi-tools" style="font-size: 2rem; margin-right: 15px; color: #f39c12;"></i>`
                }
                <div>
                    <h6 class="card-title mb-1" style="color: #3498db;">${toolCard.name}</h6>
                    ${toolCard.description ? `<small class="text-muted">${toolCard.description}</small>` : ''}
                </div>
            </div>
        `;
        
        cardDiv.innerHTML = cardContent;
        messageDiv.appendChild(cardDiv);
    }
}
