"use client";

import { useState, useEffect } from 'react';
import {
  FaTimes,
  FaUser,
  FaUsers,
  FaSpinner,
  FaCheck,
  FaPlus,
  FaSave
} from 'react-icons/fa';
import { assignApplicationToEmployees } from '../../services/applicationService';
import { getAllEmployees } from '../../services/employeeApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/TranslationContext';
import Swal from 'sweetalert2';

const AssignmentModal = ({ request, onClose, onAssigned }) => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [formData, setFormData] = useState({
    selectedEmployees: [],
    note: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      console.log('Loading employees from API...');
      
      const response = await getAllEmployees();
      console.log('Employees API response:', response);
      
      if (response.success && response.data) {
        setEmployees(response.data);
        console.log(`Loaded ${response.data.length} employees`);
      } else {
        console.error('Failed to load employees:', response.message);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!formData.selectedEmployees || formData.selectedEmployees.length === 0) {
      Swal.fire({
        title: t('admin.requests.alerts.noEmployeesSelected'),
        text: t('admin.requests.alerts.noEmployeesSelectedMessage'),
        icon: 'warning',
        confirmButtonColor: '#059669',
        confirmButtonText: t('admin.requests.alerts.ok'),
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-gray-900 font-semibold',
          content: 'text-gray-600',
          confirmButton: 'rounded-lg font-medium px-6 py-3'
        }
      });
      return;
    }

    // Get selected employee names for confirmation
    const selectedEmployeeNames = formData.selectedEmployees
      .map(empId => employees.find(emp => emp.id === empId)?.fullName || empId)
      .join(', ');

    const result = await Swal.fire({
      title: t('admin.requests.alerts.assignApplication'),
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">
            Are you sure you want to assign this <strong>${request.serviceDetails?.serviceType || 'application'}</strong> request?
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p class="text-blue-800 font-semibold mb-2">📋 Assignment Details:</p>
            <ul class="text-blue-700 text-sm space-y-1">
              <li><strong>Application ID:</strong> ${request.applicationId || request._id}</li>
              <li><strong>Client:</strong> ${request.client?.name || 'N/A'}</li>
              <li><strong>Service Type:</strong> ${request.serviceDetails?.serviceType || 'N/A'}</li>
              <li><strong>Assigned to:</strong> ${selectedEmployeeNames}</li>
              ${formData.note ? `<li><strong>Note:</strong> ${formData.note}</li>` : ''}
            </ul>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('admin.requests.actions.assignRequest'),
      cancelButtonText: t('admin.requests.alerts.cancel'),
      reverseButtons: true,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-gray-900 font-semibold',
        content: 'text-gray-600',
        confirmButton: 'rounded-lg font-medium px-6 py-3',
        cancelButton: 'rounded-lg font-medium px-6 py-3'
      }
    });

    if (result.isConfirmed) {
      try {
        setAssigning(true);
        
        // Check if current user is available
        if (!currentUser || !currentUser._id) {
          Swal.fire({
            title: t('admin.requests.alerts.authenticationError'),
            text: t('admin.requests.alerts.authenticationErrorMessage'),
            icon: 'error',
            confirmButtonColor: '#dc2626',
            confirmButtonText: t('admin.requests.alerts.ok'),
            background: '#ffffff',
            customClass: {
              popup: 'rounded-2xl shadow-2xl',
              title: 'text-gray-900 font-semibold',
              content: 'text-gray-600',
              confirmButton: 'rounded-lg font-medium px-6 py-3'
            }
          });
          return;
        }
        
        const applicationId = request.applicationId || request._id;
        console.log('Assigning application:', applicationId, 'to employees:', formData.selectedEmployees);
        
        // Show loading alert
        Swal.fire({
          title: 'Assigning Application...',
          text: 'Please wait while we assign the application to employees.',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold'
          },
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await assignApplicationToEmployees(
          applicationId,
          formData.selectedEmployees,
          currentUser._id, // assignedBy
          formData.note || `Application assigned via dashboard`
        );
        
        console.log('Assignment response:', response);
        
        if (response.success) {
          // Show success alert
          Swal.fire({
            title: 'Successfully Assigned!',
            html: `
              <div class="text-left">
                <p class="text-gray-700 mb-3">The application has been assigned to:</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p class="text-green-800 font-medium">${selectedEmployeeNames}</p>
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#059669',
            confirmButtonText: t('admin.requests.alerts.ok'),
            background: '#ffffff',
            customClass: {
              popup: 'rounded-2xl shadow-2xl',
              title: 'text-gray-900 font-semibold',
              content: 'text-gray-600',
              confirmButton: 'rounded-lg font-medium px-6 py-3'
            }
          }).then(() => {
            onAssigned();
            onClose();
          });
        } else {
          Swal.fire({
            title: t('admin.requests.alerts.assignmentFailed'),
            text: t('admin.requests.alerts.assignmentFailedMessage'),
            icon: 'error',
            confirmButtonColor: '#dc2626',
            confirmButtonText: t('admin.requests.alerts.ok'),
            background: '#ffffff',
            customClass: {
              popup: 'rounded-2xl shadow-2xl',
              title: 'text-gray-900 font-semibold',
              content: 'text-gray-600',
              confirmButton: 'rounded-lg font-medium px-6 py-3'
            }
          });
        }
      } catch (error) {
        console.error('Error assigning application:', error);
        const errorMessage = error.message || 'Error assigning application. Please try again.';
        Swal.fire({
          title: t('admin.requests.alerts.assignmentError'),
          text: t('admin.requests.alerts.assignmentErrorMessage'),
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: t('admin.requests.alerts.ok'),
          background: '#ffffff',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-gray-900 font-semibold',
            content: 'text-gray-600',
            confirmButton: 'rounded-lg font-medium px-6 py-3'
          }
        });
      } finally {
        setAssigning(false);
      }
    }
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? employee.name : t('admin.requests.labels.unknown');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full mx-4 max-h-screen overflow-y-auto rounded-xl shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t('admin.requests.actions.assignRequest')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-gray-600 mt-2 font-medium">
            Assign application {request.applicationId || request._id} to employees
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Request Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 mb-6 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Request Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Service Type:</span>
                <span className="ml-2 font-medium">{request.serviceDetails?.serviceType || t('admin.requests.serviceTypes.businessRegistration')}</span>
              </div>
              <div>
                <span className="text-gray-500">Partner Type:</span>
                <span className="ml-2 font-medium">{request.serviceDetails?.partnerType || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="ml-2 font-medium">{request.client?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium">{request.status?.current || request.status || 'N/A'}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaSpinner className="animate-spin text-white text-xl" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{t('admin.requests.loadingEmployees')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FaUsers className="inline mr-2" />
                  Select Employees to Assign *
                </label>
                <div className="grid gap-2 max-h-48 overflow-y-auto border border-gray-200 p-3 rounded-lg">
                  {employees.map((employee) => (
                    <label
                      key={employee._id}
                      className={`flex items-center p-3 border cursor-pointer transition-all duration-200 rounded-lg ${
                        formData.selectedEmployees.includes(employee._id)
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedEmployees.includes(employee._id)}
                        onChange={() => handleEmployeeToggle(employee._id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.email}</div>
                        <div className="text-sm text-gray-500">{employee.role || t('admin.requests.labels.employee')} • {employee.department}</div>
                      </div>
                      {formData.selectedEmployees.includes(employee._id) && (
                        <FaCheck className="text-emerald-600" />
                      )}
                    </label>
                  ))}
                </div>
                {formData.selectedEmployees.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {formData.selectedEmployees.length} employee(s)
                  </div>
                )}
              </div>


              {/* Assignment Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Add any special instructions or notes for the assignee..."
                />
              </div>

              {/* Assignment Summary */}
              {formData.assignedTo && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4 rounded-lg">
                  <h4 className="font-bold text-emerald-900 mb-2">Assignment Summary</h4>
                  <div className="text-sm text-emerald-800">
                    <p><strong>Primary Assignee:</strong> {getEmployeeName(formData.assignedTo)}</p>
                    {formData.teamMembers.length > 0 && (
                      <p><strong>Team Members:</strong> {formData.teamMembers.map(getEmployeeName).join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex space-x-3">
          <button
  onClick={handleAssign}
  disabled={assigning || formData.selectedEmployees.length === 0 || loading}
  className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
>
  {assigning ? (
    <FaSpinner className="animate-spin mr-2" />
  ) : (
    <FaSave className="mr-2" />
  )}
  {assigning ? t('admin.requests.actions.assigning') : t('admin.requests.actions.assignRequest')}
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
