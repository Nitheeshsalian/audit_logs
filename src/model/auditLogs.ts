export interface AuditLogs {
  _id: string
  domain: string
  audit_category: string
  activity_type: string
  template_id: string
  user: string
  time: string
  notes_embedding: string[]
  attributes_map: {
    noteText: string
    applicationName: string
  }
  additional_details: {
    Notes: string
  }
}
