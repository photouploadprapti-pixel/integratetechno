/**
 * Applies the Integrate schema migration to Supabase Postgres.
 * Requires DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local.
 *
 * Connection examples:
 *   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-....pooler.supabase.com:6543/postgres
 *   SUPABASE_DB_PASSWORD=your-database-password
 */
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const loadEnv = () => {
  const raw = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i), line.slice(i + 1)]
      }),
  )
}

const buildConnectionString = (env) => {
  if (env.DATABASE_URL) return env.DATABASE_URL

  const password = env.SUPABASE_DB_PASSWORD
  if (!password) {
    throw new Error(
      'Missing DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local. ' +
        'Get the DB password from Supabase → Project Settings → Database.',
    )
  }

  const ref = 'txudruypdlhejtmvnihe'
  const encoded = encodeURIComponent(password)
  return `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
}

const main = async () => {
  const env = loadEnv()
  const sqlPath = path.join(
    process.cwd(),
    'supabase/migrations/20260711223000_init_bubble_tables.sql',
  )
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const connectionString = buildConnectionString(env)

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log('connected')
  await client.query(sql)
  console.log('migration_applied')

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'users',
        'products',
        'bank_stat',
        'cash_book',
        'mom_report',
        's_i_s_report',
        'carosol_images',
        'clients_images',
        'income_per_annum',
        'sales_commission'
      )
    order by table_name
  `)

  console.log('tables', tables.rows.map((row) => row.table_name))

  const users = await client.query(
    `select email, name, role from public.users order by created_at`,
  )
  console.log('users_rows', users.rows)

  await client.end()
}

main().catch((error) => {
  console.error('migration_failed', error.message)
  process.exit(1)
})
