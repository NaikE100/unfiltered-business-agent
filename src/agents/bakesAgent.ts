import { bakesDbPool } from '../config/db.js';
import { logAgentAction } from '../services/logger.js';
import type { RowDataPacket } from 'mysql2/promise';

export interface BakesOrder extends RowDataPacket {
  id: number;
  customer_name: string;
  order_details: string;
  status: string;
  created_at: Date;
}

export async function processPendingBakesOrders(): Promise<number> {
  let connection;
  try {
    connection = await bakesDbPool.getConnection();
    
    // Fetch recent orders from Hostking MySQL
    const [rows] = await connection.query<BakesOrder[]>(
      'SELECT * FROM orders ORDER BY id DESC LIMIT 5'
    );

    await logAgentAction('BakesAgent', 'Polled Recent Orders', 'info', {
      count: rows.length,
      orders: rows,
    });

    return rows.length;
  } catch (err: any) {
    await logAgentAction('BakesAgent', 'Order Query Warning', 'warning', {
      message: err.message || err,
    });
    return 0;
  } finally {
    if (connection) connection.release();
  }
}