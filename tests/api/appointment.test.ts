import request from 'supertest';
import app from '../../src/test-app';
import mongoose from 'mongoose';
import DoctorProfile from '../../src/models/doctor.model';
import PatientProfile from '../../src/models/patient.model';
import Appointment from '../../src/models/appointment.model';

describe('Appointment API Endpoints', () => {
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let doctorUserId: string;
  let patientUserId: string;
  let doctorProfileId: string;
  let patientProfileId: string;
  let appointmentId: string;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@test.com',
    phone: '+1234567891',
    password: 'Admin@123',
    confirmPassword: 'Admin@123',
    role: 'admin',
  };

  const doctorUser = {
    name: 'Dr. John Doe',
    email: 'doctor@test.com',
    phone: '+1234567892',
    password: 'Doctor@123',
    confirmPassword: 'Doctor@123',
    role: 'doctor',
  };

  const patientUser = {
    name: 'Jane Patient',
    email: 'patient@test.com',
    phone: '+1234567893',
    password: 'Patient@123',
    confirmPassword: 'Patient@123',
    role: 'patient',
  };

  beforeAll(async () => {
    try {
      // Register and login admin
      await request(app).post('/api/auth/sign-up').send(adminUser);
      const adminSignIn = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: adminUser.email,
          phone: adminUser.phone,
          password: adminUser.password,
        });
      adminToken = adminSignIn.body.data.accessToken;

      // Register and login doctor
      const doctorResponse = await request(app)
        .post('/api/auth/sign-up')
        .send(doctorUser);
      doctorUserId = doctorResponse.body.data.id;

      const doctorSignIn = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: doctorUser.email,
          phone: doctorUser.phone,
          password: doctorUser.password,
        });
      doctorToken = doctorSignIn.body.data.accessToken;

      // Register and login patient
      const patientResponse = await request(app)
        .post('/api/auth/sign-up')
        .send(patientUser);
      patientUserId = patientResponse.body.data.id;

      const patientSignIn = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: patientUser.email,
          phone: patientUser.phone,
          password: patientUser.password,
        });
      patientToken = patientSignIn.body.data.accessToken;

      // Create doctor profile directly in database
      const doctorProfile = await DoctorProfile.create({
        userId: doctorUserId,
        specialization: 'General Physician',
        qualifications: ['MBBS', 'MD'],
        licenseNumber: 'DOC123456',
        yearsOfExperience: 5,
        clinicLocation: 'New York',
        consultationFee: 100,
        bio: 'Experienced general physician',
        isActive: true,
      });
      doctorProfileId = doctorProfile.id.toString();

      // Create patient profile directly in database
      const patientProfile = await PatientProfile.create({
        userId: patientUserId,
        age: 30,
        height: 170,
        weight: 70,
        bloodGroup: 'O+',
        address: '123 Main St, New York',
        gender: 'female',
        emergencyContact: {
          name: 'John Doe',
          relation: 'Spouse',
          phone: '+1234567894',
        },
        medicalHistory: ['No major illnesses'],
      });
      patientProfileId = patientProfile.id.toString();

      console.log('Setup complete:', { doctorProfileId, patientProfileId });
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await DoctorProfile.deleteMany({});
    await PatientProfile.deleteMany({});
    await Appointment.deleteMany({});
  });

  describe('POST /api/appointment', () => {
    it('should create a new appointment (Admin only)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patientId: patientProfileId,
          doctorId: doctorProfileId,
          scheduledAt: futureDate.toISOString(),
          reason: 'Regular checkup',
          status: 'scheduled',
          notes: 'First appointment',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.reason).toBe('Regular checkup');
      expect(response.body.data.status).toBe('scheduled');

      appointmentId = response.body.data.id;
    });

    it('should fail to create appointment without authentication', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post('/api/appointment')
        .send({
          patientId: patientProfileId,
          doctorId: doctorProfileId,
          scheduledAt: futureDate.toISOString(),
          reason: 'Regular checkup',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create appointment as patient (forbidden)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          patientId: patientProfileId,
          doctorId: doctorProfileId,
          scheduledAt: futureDate.toISOString(),
          reason: 'Regular checkup',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patientId: 'invalid-id',
          doctorId: doctorProfileId,
          scheduledAt: 'invalid-date',
          reason: 'abc',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/appointment/:appointmentId', () => {
    it('should update appointment as admin', async () => {
      const response = await request(app)
        .patch(`/api/appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed',
          notes: 'Appointment confirmed',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
      expect(response.body.data.notes).toBe('Appointment confirmed');
    });

    it('should update appointment as assigned doctor', async () => {
      const response = await request(app)
        .patch(`/api/appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'in-progress',
          notes: 'Patient checked in',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in-progress');
    });

    it('should fail to update appointment as patient', async () => {
      const response = await request(app)
        .patch(`/api/appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          status: 'completed',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail to update non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .patch(`/api/appointment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointment/doctor/me', () => {
    it('should get appointments for logged-in doctor', async () => {
      const response = await request(app)
        .get('/api/appointment/doctor/me')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should filter appointments by status', async () => {
      const response = await request(app)
        .get('/api/appointment/doctor/me')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ page: 1, limit: 10, status: 'in-progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        expect(response.body.data[0].status).toBe('in-progress');
      }
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/appointment/doctor/me')
        .query({ page: 1, limit: 10 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail as non-doctor user', async () => {
      const response = await request(app)
        .get('/api/appointment/doctor/me')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ page: 1, limit: 10 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required query parameters', async () => {
      const response = await request(app)
        .get('/api/appointment/doctor/me')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointment/patient/me', () => {
    it('should get appointments for logged-in patient', async () => {
      const response = await request(app)
        .get('/api/appointment/patient/me')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should filter appointments by scheduled date', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get('/api/appointment/patient/me')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ page: 1, limit: 10, scheduledDate: today })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/appointment/patient/me')
        .query({ page: 1, limit: 10 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail as non-patient user', async () => {
      const response = await request(app)
        .get('/api/appointment/patient/me')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ page: 1, limit: 10 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointment/admin/all', () => {
    it('should get all appointments as admin', async () => {
      const response = await request(app)
        .get('/api/appointment/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should filter by patient name', async () => {
      const response = await request(app)
        .get('/api/appointment/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10, patientName: 'Jane' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by doctor name', async () => {
      const response = await request(app)
        .get('/api/appointment/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10, doctorName: 'John' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/appointment/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10, status: 'in-progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail as non-admin user', async () => {
      const response = await request(app)
        .get('/api/appointment/admin/all')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ page: 1, limit: 10 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/appointment/admin/all')
        .query({ page: 1, limit: 10 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointment/:appointmentId', () => {
    it('should get appointment by ID as patient', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.reason).toBe('Regular checkup');
    });

    it('should get appointment by ID as doctor', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should get appointment by ID as admin', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should fail with non-existent appointment ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/appointment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointment/:appointmentId/audit-logs', () => {
    it('should get audit logs for appointment as admin', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}/audit-logs`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('entityType');
        expect(response.body.data[0]).toHaveProperty('action');
        expect(response.body.data[0]).toHaveProperty('timestamp');
        expect(response.body.data[0]).toHaveProperty('performedBy');
      }
    });

    it('should fail to get audit logs as doctor', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}/audit-logs`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail to get audit logs as patient', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}/audit-logs`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/appointment/${appointmentId}/audit-logs`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent appointment ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/appointment/${fakeId}/audit-logs`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});