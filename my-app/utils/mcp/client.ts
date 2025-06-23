import { createClient } from '@supabase/supabase-js'

export class SupabaseMCPClient {
  private supabaseClient: any

  constructor() {
    this.supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async queryTable(tableName: string, query: string = '*') {
    const { data, error } = await this.supabaseClient
      .from(tableName)
      .select(query)
    
    if (error) {
      throw new Error(`Query failed: ${error.message}`)
    }
    
    return data
  }

  async insertRecord(tableName: string, record: any) {
    const { data, error } = await this.supabaseClient
      .from(tableName)
      .insert(record)
      .select()
    
    if (error) {
      throw new Error(`Insert failed: ${error.message}`)
    }
    
    return data
  }

  async updateRecord(tableName: string, record: any, conditions: any) {
    const { data, error } = await this.supabaseClient
      .from(tableName)
      .update(record)
      .match(conditions)
      .select()
    
    if (error) {
      throw new Error(`Update failed: ${error.message}`)
    }
    
    return data
  }

  async deleteRecord(tableName: string, conditions: any) {
    const { data, error } = await this.supabaseClient
      .from(tableName)
      .delete()
      .match(conditions)
      .select()
    
    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
    
    return data
  }

  async getTables() {
    const { data: tables, error } = await this.supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`)
    }
    
    return tables?.map((table: any) => table.table_name) || []
  }

  async getTableSchema(tableName: string) {
    const { data: columns, error } = await this.supabaseClient
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
    
    if (error) {
      throw new Error(`Failed to fetch schema: ${error.message}`)
    }
    
    return columns
  }
} 