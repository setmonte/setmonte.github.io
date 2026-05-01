// Validação e formatação de campos
document.addEventListener('DOMContentLoaded', function() {
    const telefoneInput = document.getElementById('telefone');
    const emailInput = document.getElementById('email');
    
    // Formatação automática do telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 6) {
                value = value.replace(/(\d{2})(\d{0,4})/, '($1)$2');
            } else if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1)$2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
            }
        }
        
        e.target.value = value;
    });
    
    // Validação do email em tempo real
    emailInput.addEventListener('blur', function(e) {
        const email = e.target.value;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (email && !emailRegex.test(email)) {
            e.target.setCustomValidity('Por favor, insira um email válido (ex: usuario@email.com)');
        } else {
            e.target.setCustomValidity('');
        }
    });
    
    // Validação do telefone em tempo real
    telefoneInput.addEventListener('blur', function(e) {
        const telefone = e.target.value;
        const telefoneRegex = /^\([0-9]{2}\)[0-9]{4,5}-[0-9]{4}$/;
        
        if (telefone && !telefoneRegex.test(telefone)) {
            e.target.setCustomValidity('Por favor, insira um telefone válido (ex: (11)99999-9999)');
        } else {
            e.target.setCustomValidity('');
        }
    });
});