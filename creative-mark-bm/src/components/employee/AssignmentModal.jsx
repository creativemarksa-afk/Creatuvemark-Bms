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
import { assignRequest, getAllEmployees } from '../../services/employeeApi';

const AssignmentModal = ({ request, onClose, onAssigned }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [formData, setFormData] = useState({
    assignedTo: '',
    teamMembers: [],
    note: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since we don't have the employee endpoint
      // In a real app, you'd call: const response = await getAllEmployees();
      const mockEmployees = [
        { _id: '1', name: 'John Smith', email: 'john@company.com', department: 'Legal' },
        { _id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Business' },
        { _id: '3', name: 'Mike Davis', email: 'mike@company.com', department: 'Operations' },
        { _id: '4', name: 'Lisa Chen', email: 'lisa@company.com', department: 'Finance' },
        { _id: '5', name: 'Ahmed Ali', email: 'ahmed@company.com', department: 'Legal' }
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!formData.assignedTo) {
      alert('Please select an employee to assign this request to.');
      return;
    }

    try {
      setAssigning(true);
      
      const assignmentData = {
        assignedTo: formData.assignedTo,
        teamMembers: formData.teamMembers,
        note: formData.note || `Request assigned via dashboard`
      };

      const response = await assignRequest(request._id, assignmentData);
      
      if (response.success) {
        alert('Request assigned successfully!');
        onAssigned();
      }
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Error assigning request. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleTeamMemberToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(employeeId)
        ? prev.teamMembers.filter(id => id !== employeeId)
        : [...prev.teamMembers, employeeId]
    }));
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Assign Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Assign request #{request.requestNumber} to an employee
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Request Summary */}
          <div className="bg-gray-50 p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Request Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{request.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className="ml-2 font-medium">{request.priority}</span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="ml-2 font-medium">{request.client?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium">{request.status}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-2xl text-green-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FaUser className="inline mr-2" />
                  Primary Assignee *
                </label>
                <div className="grid gap-2 max-h-48 overflow-y-auto border border-gray-300 p-3">
                  {employees.map((employee) => (
                    <label
                      key={employee._id}
                      className={`flex items-center p-3 border cursor-pointer transition-colors ${
                        formData.assignedTo === employee._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="assignedTo"
                        value={employee._id}
                        checked={formData.assignedTo === employee._id}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.email}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                      {formData.assignedTo === employee._id && (
                        <FaCheck className="text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FaUsers className="inline mr-2" />
                  Additional Team Members (Optional)
                </label>
                <div className="grid gap-2 max-h-48 overflow-y-auto border border-gray-300 p-3">
                  {employees
                    .filter(employee => employee._id !== formData.assignedTo)
                    .map((employee) => (
                    <label
                      key={employee._id}
                      className={`flex items-center p-3 border cursor-pointer transition-colors ${
                        formData.teamMembers.includes(employee._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.teamMembers.includes(employee._id)}
                        onChange={() => handleTeamMemberToggle(employee._id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.email}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                      {formData.teamMembers.includes(employee._id) && (
                        <FaCheck className="text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add any special instructions or notes for the assignee..."
                />
              </div>

              {/* Assignment Summary */}
              {formData.assignedTo && (
                <div className="bg-green-50 border border-green-200 p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Assignment Summary</h4>
                  <div className="text-sm text-green-800">
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
        <div className="sticky bottom-0 bg-white border-t border-gray-300 p-6">
          <div className="flex space-x-3">
            <button
              onClick={handleAssign}
              disabled={assigning || !formData.assignedTo || loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {assigning ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {assigning ? 'Assigning...' : 'Assign Request'}
            </button>
            <button
              onClick={onClose}
              disabled={assigning}
              className="flex-1 px-4 py-3 bg-gray-600 text-white font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;

