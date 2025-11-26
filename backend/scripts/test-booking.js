import axios from 'axios';

async function main() {
  try {
    console.log('Testing booking for Octane (slug=octane)...');
    
    // 1. Get Barbers to find IDs
    const barbersRes = await axios.get('http://localhost:4000/barberos?slug=octane');
    const barber = barbersRes.data[0];
    if (!barber) throw new Error('No barbers found');
    console.log('Found barber:', barber.nombre, 'ID:', barber.id);

    // 2. Get Services
    const servicesRes = await axios.get('http://localhost:4000/servicios?slug=octane');
    const service = servicesRes.data[0];
    if (!service) throw new Error('No services found');
    console.log('Found service:', service.nombre, 'ID:', service.id);

    // 3. Try to book
    const payload = {
      barberoId: barber.id,
      servicioId: service.id,
      cliente: 'Test User 2',
      telefono: '1234567890',
      fecha: '2025-12-01', // Future date
      hora: '12:00',
      slug: 'octane'
    };

    console.log('Sending payload:', payload);
    const res = await axios.post('http://localhost:4000/citas', payload);
    
    console.log('Booking success:', res.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
