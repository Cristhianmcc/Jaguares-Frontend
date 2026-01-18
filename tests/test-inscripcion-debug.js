import axios from 'axios';

const BASE_URL = 'http://localhost:3002';

async function testInscripcion() {
    try {
        console.log('🧪 Probando inscripción...\n');
        
        const datosInscripcion = {
            alumno: {
                dni: '12345678',
                nombres: 'Juan',
                apellido_paterno: 'Pérez',
                apellido_materno: 'García',
                fecha_nacimiento: '2010-01-01',
                sexo: 'Masculino',
                email: 'juan@test.com',
                telefono: '987654321',
                apoderado: 'María García',
                telefono_apoderado: '987654322'
            },
            horarios: [
                {
                    horario_id: 1,
                    deporte: 'Fútbol',
                    plan: 'Económico',
                    dia: 'Lunes',
                    hora: '08:00 - 09:00'
                }
            ]
        };
        
        console.log('📤 Enviando datos:', JSON.stringify(datosInscripcion, null, 2));
        
        const response = await axios.post(`${BASE_URL}/api/inscribir-multiple`, datosInscripcion);
        
        console.log('✅ ÉXITO!');
        console.log('📥 Respuesta:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ ERROR');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Respuesta:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

testInscripcion();
