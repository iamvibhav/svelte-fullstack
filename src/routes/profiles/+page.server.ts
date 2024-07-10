import { createPool, sql } from '@vercel/postgres'
import { POSTGRES_URL } from '$env/static/private'
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

interface User {
  id: number;
  name: string;
  email: string;
}

export const load: PageServerLoad = async () => {
  const db = createPool({ connectionString: POSTGRES_URL })

  try {
    const { rows: names } = await db.query('SELECT * FROM names order by id')
    return {
      names: names as User[],
    }
  } catch (error: unknown) {
    console.log(
      'Table does not exist, creating and seeding it with dummy data now...'
    )
    // Table is not created yet
    await seed()
    const { rows: names } = await db.query('SELECT * FROM names order by id')
    return {
      names: names as User[],
    }
  } 
}

async function seed() {
  const db = createPool({ connectionString: POSTGRES_URL })
  const client = await db.connect();
  const createTable = await client.sql`CREATE TABLE IF NOT EXISTS names (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `

  console.log(`Created "users" table`)

  const users = await Promise.all([
    client.sql`
          INSERT INTO names (name, email)
          VALUES ('Rohan', 'rohan@tcl.com')
          ON CONFLICT (email) DO NOTHING;
      `,
    client.sql`
          INSERT INTO names (name, email)
          VALUES ('Rebecca', 'rebecca@tcl.com')
          ON CONFLICT (email) DO NOTHING;
      `,
    client.sql`
          INSERT INTO names (name, email)
          VALUES ('Vivek', 'vivek@gmail.com')
          ON CONFLICT (email) DO NOTHING;
      `,
  ])
  console.log(`Seeded ${users.length} users`)

  return {
    createTable,
    users,
  }
}

async function updateUser(user: User) {
  console.log('user', user);
  const db = createPool({ connectionString: POSTGRES_URL })
  const client = await db.connect();

  const result = await client.sql`UPDATE names SET name = ${user.name}, email = ${user.email} WHERE id = ${user.id}`

  return {
    result
  }
}

export const actions: Actions = {
  update: async ({ request }) => {
    const req = await request.formData();

    const id = req.get('id');
    const name = req.get('name');
    const email = req.get('email');

    if (typeof id !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
      throw new Error('Invalid input types');
    }

    const data: User = {
      id: parseInt(id, 10),
      name,
      email
    }

    let updateRes = {
      error: false,
      email: email,
      name,
      message: ''
    }

    try {
      const res = await updateUser(data);
      console.log('api request ran');
      console.log(res);
    } catch (error: unknown) {
      console.log('api request errored');
      console.log(error)
      updateRes.error = true;
      updateRes.message = error instanceof Error ? error.message : 'An unknown error occurred';
    } finally {
      return updateRes
    }
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const db = createPool({ connectionString: POSTGRES_URL })
    const client = await db.connect();

    const id = data.get('id');

    if (typeof id !== 'string') {
      throw new Error('Invalid input type');
    }

    const deleteUser = await client.sql`
    DELETE FROM names
    WHERE id = ${id};`
  
    return { deleted: true };
  },

  create: async ({request}) => {
    const data = await request.formData();
    const db = createPool({ connectionString: POSTGRES_URL })
    const client = await db.connect();

    const email = data.get('email');
    const name = data.get('name');

    if (typeof email !== 'string' || typeof name !== 'string') {
      throw new Error('Invalid input types');
    }

    const createUser = await client.sql`
      INSERT INTO names (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO NOTHING;
    `
    return { success: true };
  }
};