import { Attendance } from "../models/attendance.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.js";

// Create new attendance record
export const createAttendance = asyncHandler(async (req, res) => {
  const { employeeId, attendanceDate, attendanceStatus, clockInTime, clockOutTime, workLocation } = req.body;

  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // Check for existing attendance record for the same date
  const existingAttendance = await Attendance.findOne({ 
    employeeId,
    attendanceDate: new Date(attendanceDate).setHours(0, 0, 0, 0)
  });

  if (existingAttendance) {
    return res.status(409).json({ 
      message: "Attendance record already exists for this date",
      existingRecord: existingAttendance
    });
  }

  const newAttendance = new Attendance({
    employeeId,
    attendanceDate: new Date(attendanceDate),
    attendanceStatus,
    clockInTime: clockInTime ? new Date(clockInTime) : null,
    clockOutTime: clockOutTime ? new Date(clockOutTime) : null,
    workLocation
  });

  await newAttendance.save();

  res.status(201).json({ 
    message: "Attendance record created successfully",
    attendance: newAttendance
  });
});

// Get all attendance records with filtering and pagination
export const getAllAttendance = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    employeeId, 
    startDate, 
    endDate, 
    status, 
    location,
    approvalStatus,
    sortBy = "attendanceDate",
    sortOrder = "desc"
  } = req.query;

  const query = {};
  
  if (employeeId) query.employeeId = employeeId;
  if (status) query.attendanceStatus = status;
  if (location) query.workLocation = location;
  if (approvalStatus) query.approvalStatus = approvalStatus;

  // Date range filtering
  if (startDate || endDate) {
    query.attendanceDate = {};
    if (startDate) query.attendanceDate.$gte = new Date(startDate);
    if (endDate) query.attendanceDate.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [records, count] = await Promise.all([
    Attendance.find(query)
      .populate('employeeId', 'firstName lastName position department')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec(),
    Attendance.countDocuments(query)
  ]);

  res.status(200).json({
    records,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalRecords: count
  });
});

// Get single attendance record
export const getAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await Attendance.findById(id)
    .populate('employeeId', 'firstName lastName position department');

  if (!record) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  res.status(200).json(record);
});

// Update attendance record
export const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Prevent updates to restricted fields
  const restrictedFields = ["_id", "employeeId", "attendanceDate"];
  restrictedFields.forEach(field => delete updateData[field]);

  // Convert date strings to Date objects if present
  if (updateData.clockInTime) updateData.clockInTime = new Date(updateData.clockInTime);
  if (updateData.clockOutTime) updateData.clockOutTime = new Date(updateData.clockOutTime);

  const updatedRecord = await Attendance.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('employeeId', 'firstName lastName position department');

  if (!updatedRecord) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  res.status(200).json({
    message: "Attendance record updated successfully",
    record: updatedRecord
  });
});

// Approve/reject attendance record (for managers)
export const updateAttendanceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const update = { approvalStatus: status };
  if (status === "rejected" && rejectionReason) {
    update.rejectionReason = rejectionReason;
  }

  const updatedRecord = await Attendance.findByIdAndUpdate(
    id,
    update,
    { new: true }
  ).populate('employeeId', 'firstName lastName position department');

  if (!updatedRecord) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  res.status(200).json({
    message: `Attendance record ${status} successfully`,
    record: updatedRecord
  });
});

// Delete attendance record
export const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedRecord = await Attendance.findByIdAndDelete(id);

  if (!deletedRecord) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  res.status(200).json({ 
    message: "Attendance record deleted successfully",
    record: deletedRecord
  });
});

// Get employee's attendance summary
export const getEmployeeAttendanceSummary = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;

  // Validate employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // Calculate date range for the month
  const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : new Date().getMonth(), 1);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  const records = await Attendance.find({
    employeeId,
    attendanceDate: { $gte: startDate, $lte: endDate }
  }).sort({ attendanceDate: 1 });

  // Calculate summary statistics
  const presentDays = records.filter(r => r.attendanceStatus === 'present').length;
  const absentDays = records.filter(r => r.attendanceStatus === 'absent').length;
  const totalHours = records.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const pendingApproval = records.filter(r => r.approvalStatus === 'pending').length;

  res.status(200).json({
    summary: {
      totalDays: records.length,
      presentDays,
      absentDays,
      totalHours,
      pendingApproval,
      averageHoursPerDay: presentDays > 0 ? (totalHours / presentDays).toFixed(2) : 0
    },
    records
  });
});

// Bulk create attendance records (for admin)
export const bulkCreateAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body;

  if (!Array.isArray(records) {
    return res.status(400).json({ message: "Records must be an array" });
  }

  // Validate all employee IDs exist
  const employeeIds = [...new Set(records.map(r => r.employeeId))];
  const employeesCount = await Employee.countDocuments({ _id: { $in: employeeIds } });
  
  if (employeesCount !== employeeIds.length) {
    return res.status(400).json({ message: "One or more employee IDs are invalid" });
  }

  // Check for existing records to prevent duplicates
  const existingRecords = await Attendance.find({
    $or: records.map(record => ({
      employeeId: record.employeeId,
      attendanceDate: new Date(record.attendanceDate).setHours(0, 0, 0, 0)
    }))
  });

  if (existingRecords.length > 0) {
    return res.status(409).json({
      message: "Some attendance records already exist",
      conflicts: existingRecords
    });
  }

  // Create all records
  const createdRecords = await Attendance.insertMany(
    records.map(record => ({
      ...record,
      attendanceDate: new Date(record.attendanceDate),
      clockInTime: record.clockInTime ? new Date(record.clockInTime) : null,
      clockOutTime: record.clockOutTime ? new Date(record.clockOutTime) : null
    }))
  );

  res.status(201).json({
    message: `${createdRecords.length} attendance records created successfully`,
    createdCount: createdRecords.length,
    records: createdRecords
  });
});