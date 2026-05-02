import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const businessId = 1;
  const businessName = 'Olimpo';

  const citas = await prisma.cita.findMany({
    where: { businessId },
    select: {
      cliente: true,
      telefono: true
    }
  });

  const uniqueCustomers = new Map();

  citas.forEach(cita => {
    let rawPhone = cita.telefono.replace(/\D/g, '');
    let phone = rawPhone;
    
    if (phone.length === 10) {
      phone = '52' + phone;
    } else if (phone.length === 11 && phone.startsWith('1')) {
      phone = '52' + phone.substring(1);
    } else if (phone.length === 12 && phone.startsWith('521')) {
      phone = '52' + phone.substring(3); // Remove 521 -> keep 10 digits
      phone = '52' + phone;
    } else if (phone.length === 13 && phone.startsWith('521')) {
       // already has country code + 1 + 10 digits
       phone = '52' + phone.substring(3);
    }
    
    // Fallback: if it doesn't start with 52, prependTime it
    if (!phone.startsWith('52')) {
        phone = '52' + phone;
    }
    
    // Ensure 12 digits (52 + 10)
    if (phone.length > 12) {
        phone = '52' + phone.slice(-10);
    }

    uniqueCustomers.set(phone, cita.cliente);
  });

  const data = Array.from(uniqueCustomers.entries()).map(([number, name]) => ({
    name: name,
    number: number,
    email: '',
    birthDate: '',
    tags: businessName,
    carteira: businessName
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync('clientes_olimpo.xlsx', buf);

  console.log(`Exportado ${data.length} clientes únicos a clientes_olimpo.xlsx`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
