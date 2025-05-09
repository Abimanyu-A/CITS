import express from 'express';
import {
  createAttendance,
  getAllAttendance,
  getAttendance,
  updateAttendance,
  updateAttendanceStatus,
  deleteAttendance,
  getEmployeeAttendanceSummary,
  bulkCreateAttendance
} from '../controllers/attendanceController.js';

const attendenceRouter = express.Router();

attendenceRouter.post('/', createAttendance);
attendenceRouter.post('/bulk', bulkCreateAttendance);
attendenceRouter.get('/', getAllAttendance);
attendenceRouter.get('/:id', getAttendance);
attendenceRouter.get('/employee/:employeeId/summary', getEmployeeAttendanceSummary);
attendenceRouter.put('/:id', updateAttendance);
attendenceRouter.patch('/:id/status', updateAttendanceStatus);
attendenceRouter.delete('/:id', deleteAttendance);

export default attendenceRouter;