import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 1. Supabase Client Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wsspdslieucsqodbewie.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzc3Bkc2xpZXVjc3FvZGJld2llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzA3NzQzNiwiZXhwIjoyMTA4NjUzNDM2fQ.boc5rPd-8DA-qzv9M8n_2vmd6bg8HuxoEGRJN6xI39o';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Hostking MySQL Pool Configuration
export const bakesDbPool: mysql.Pool = mysql.createPool({
  host: process.env.HOSTKING_MYSQL_HOST || '',
  user: process.env.HOSTKING_MYSQL_USER || '',
  password: process.env.HOSTKING_MYSQL_PASSWORD || '',
  database: process.env.HOSTKING_MYSQL_DATABASE || '',
  port: Number(process.env.HOSTKING_MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to test database connectivity on startup
export async function testConnections(): Promise<void> {
  // Test Supabase
  try {
    const { error: supabaseError } = await supabase.from('agent_tasks').select('*').limit(1);
    if (supabaseError && supabaseError.code !== 'PGRST116') {
      console.warn('⚠️ Supabase Warning:', supabaseError.message);
    } else {
      console.log('✅ Connected to Unfiltered Ventures (Supabase)');
    }
  } catch (err: any) {
    console.error('❌ Supabase Connection Error:', err.message || err);
  }

  // Test Hostking MySQL
  try {
    const connection = await bakesDbPool.getConnection();
    console.log("✅ Connected to Naik's Unfiltered Bakes (Hostking MySQL)");
    connection.release();
  } catch (err: any) {
    console.error('❌ Hostking MySQL Connection Error:', err.message || err);
  }
}