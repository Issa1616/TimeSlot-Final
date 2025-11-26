import bcrypt from "bcryptjs";

const usuarios = [
  { email: 'admin@demo.com', password: 'admin123' },
  { email: 'jperez@medico.com', password: 'medico123' },
  { email: 'lmolina@medico.com', password: 'medico123' },
  { email: 'ana@demo.com', password: 'paciente123' },
  { email: 'lt@demo.com', password: 'paciente123' },
  { email: 'ms@demo.com', password: 'paciente123' },
  { email: 'jr@demo.com', password: 'paciente123' },
  { email: 'er@demo.com', password: 'paciente123' },
  { email: 'cl@demo.com', password: 'paciente123' },
  { email: 'sa@demo.com', password: 'paciente123' },
  { email: 'mz@demo.com', password: 'paciente123' },
  { email: 'vn@demo.com', password: 'paciente123' },
  { email: 'pd@demo.com', password: 'paciente123' },
  { email: 'co@demo.com', password: 'paciente123' },
  { email: 'dc@demo.com', password: 'paciente123' }
];

const generate = async () => {
  console.log("-- 🔐 HASHES GENERADOS Y COMANDOS UPDATE PARA MYSQL --\n");

  for (const user of usuarios) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${user.email}';`);
  }

  console.log("\n-- Listo: copialos y pegálos en MySQL --");
};

generate();
