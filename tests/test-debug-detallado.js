import axios from 'axios';

const BASE_URL = 'http://localhost:3002';

async function testConLogs() {
    console.log('\n🔍 === TEST DETALLADO DE INSCRIPCIONES ===\n');
    
    // Test 1: Inscripción con datos completos
    try {
        console.log('📝 Test 1: Inscripción con datos completos');
        const response1 = await axios.post(`${BASE_URL}/api/inscribir-multiple`, {
            alumno: {
                dni: '88888888',
                nombres: 'Test',
                apellido_paterno: 'Usuario',
                apellido_materno: 'Completo',
                fecha_nacimiento: '2010-01-01',
                sexo: 'Masculino',
                email: 'test1@test.com',
                telefono: '987654321',
                apoderado: 'Tutor Test',
                telefono_apoderado: '987654322'
            },
            horarios: [
                { horario_id: 1, deporte: 'Fútbol', plan: 'Económico', dia: 'Lunes', hora: '08:00 - 09:00' }
            ]
        });
        console.log('✅ Test 1 EXITOSO:', response1.data.codigo_operacion);
    } catch (error) {
        console.log('❌ Test 1 FALLIDO:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // Test 2: Inscripción con horario_id inválido
    try {
        console.log('📝 Test 2: Inscripción con horario_id inválido (999)');
        const response2 = await axios.post(`${BASE_URL}/api/inscribir-multiple`, {
            alumno: {
                dni: '77777777',
                nombres: 'Test',
                apellido_paterno: 'Horario',
                apellido_materno: 'Invalido',
                fecha_nacimiento: '2010-01-01',
                sexo: 'Masculino',
                email: 'test2@test.com',
                telefono: '987654321',
                apoderado: 'Tutor Test',
                telefono_apoderado: '987654322'
            },
            horarios: [
                { horario_id: 999, deporte: 'Fútbol', plan: 'Económico', dia: 'Lunes', hora: '08:00 - 09:00' }
            ]
        });
        console.log('✅ Test 2 EXITOSO:', response2.data.codigo_operacion);
    } catch (error) {
        console.log('❌ Test 2 ESPERADO FALLAR:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // Test 3: Inscripción sin horario_id
    try {
        console.log('📝 Test 3: Inscripción sin horario_id');
        const response3 = await axios.post(`${BASE_URL}/api/inscribir-multiple`, {
            alumno: {
                dni: '66666666',
                nombres: 'Test',
                apellido_paterno: 'Sin',
                apellido_materno: 'HorarioID',
                fecha_nacimiento: '2010-01-01',
                sexo: 'Masculino',
                email: 'test3@test.com',
                telefono: '987654321',
                apoderado: 'Tutor Test',
                telefono_apoderado: '987654322'
            },
            horarios: [
                { deporte: 'Fútbol', plan: 'Económico', dia: 'Lunes', hora: '08:00 - 09:00' }
            ]
        });
        console.log('✅ Test 3 EXITOSO:', response3.data.codigo_operacion);
    } catch (error) {
        console.log('❌ Test 3 ESPERADO FALLAR:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // Test 4: Obtener horarios disponibles
    try {
        console.log('📝 Test 4: Obtener lista de horarios disponibles');
        const response4 = await axios.get(`${BASE_URL}/api/horarios`);
        console.log('✅ Test 4 EXITOSO - Total horarios:', response4.data.length);
        console.log('Primeros 3 horarios:');
        response4.data.slice(0, 3).forEach(h => {
            console.log(`   - ID: ${h.horario_id}, Deporte: ${h.deporte}, Día: ${h.dia_semana}, Hora: ${h.hora_inicio}-${h.hora_fin}`);
        });
    } catch (error) {
        console.log('❌ Test 4 FALLIDO:', error.message);
    }
    
    console.log('\n=== FIN DE TESTS ===\n');
}

testConLogs();
