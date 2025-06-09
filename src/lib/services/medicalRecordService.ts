
// Mock types for frontend-only demo
export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  description: string;
  recordType?: string;
  recordDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecordCreateInput {
  patientId: string;
  title: string;
  description: string;
  recordType?: string;
  recordDate?: Date;
}

export interface MedicalRecordUpdateInput {
  title?: string;
  description?: string;
  recordType?: string;
  recordDate?: Date;
}

export const medicalRecordService = {
  async create(data: MedicalRecordCreateInput): Promise<MedicalRecord> {
    // Mock implementation
    return {
      id: `record_${Date.now()}`,
      patientId: data.patientId,
      title: data.title,
      description: data.description,
      recordType: data.recordType,
      recordDate: data.recordDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async findById(id: string): Promise<MedicalRecord | null> {
    // Mock implementation
    return null;
  },

  async getById(id: string): Promise<MedicalRecord | null> {
    return this.findById(id);
  },

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    // Mock implementation
    return [];
  },

  async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return this.findByPatientId(patientId);
  },

  async findMany(filters?: {
    patientId?: string;
    recordType?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<MedicalRecord[]> {
    // Mock implementation
    return [];
  },

  async getAll(): Promise<MedicalRecord[]> {
    return this.findMany();
  },

  async update(id: string, data: MedicalRecordUpdateInput): Promise<MedicalRecord> {
    // Mock implementation
    return {
      id,
      patientId: 'mock_patient',
      title: data.title || 'Mock Record',
      description: data.description || 'Mock description',
      recordType: data.recordType,
      recordDate: data.recordDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async delete(id: string): Promise<MedicalRecord> {
    // Mock implementation
    return {
      id,
      patientId: 'mock_patient',
      title: 'Deleted Record',
      description: 'Mock description',
      recordDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
};
