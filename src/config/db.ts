import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import mysql, { Pool } from 'mysql2/promise';

dotenv.config();

// 1. Unfiltered Ventures: Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://wsspdslieucsqodbewie.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzc3Bkc2xpZXVjc3FvZGJld2llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzA3NzQzNiwiZXhwIjoyMTA4NjUzNDM2fQ.boc5rPd-8DA-qzv9M8n_2vmd6bg8HuxoEGRJN6xI39o';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// 2. Naik's Unfiltered Bakes: Hostking MySQL Connection Pool
export const bakesDbPool: Pool = mysql.createPool({
  host: process.env.HOSTKING_MYSQL_HOST,
  user: process.env.HOSTKING_MYSQL_USER,
  password: process.env.HOSTKING_MYSQL_PASSWORD,
  database: process.env.HOSTKING_MYSQL_DATABASE,
  port: Number(process.env.HOSTKING_MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to test database connectivity on startup
export async function testConnections(): Promise<void> {
  // Test Supabase
  try {
    const { error: supabaseError } = await supabase.from('_health_check').select('*').limit(1);
    if (supabaseError && supabaseError.code !== 'PGRST116') {
      console.warn('⚠️ Supabase Warning:', supabaseError.message);
    } else {
      console.log('✅ Connected to Unfiltered Ventures (Supabase)');
    }
  } catch (err: any) {
    console.error('❌ Supabase Connection Error:', err.message || err);
  }

  // Test Hostking MySQL (Graceful check)
  try {
    const connection = await bakesDbPool.getConnection();
    console.log('✅ Connected to Naik\'s Unfiltered Bakes (Hostking MySQL)');
    connection.release();
  } catch (err: any) {
    console.warn('⚠️ Hostking MySQL Remote Access Pending (Support Whitelist):', err.message || err);
  }
}