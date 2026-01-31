// Mock Client Service - No backend connection
import api from "./api";

// Mock applications data
let mockApplications = [
  {
    id: "1",
    userId: "1",
    serviceType: "commercial",
    partnerType: "sole",
    status: "submitted",
    projectEstimatedValue: 50000,
    familyMembers: "3",
    needVirtualOffice: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: "passport", fileUrl: "mock-passport-url" },
      { type: "idCard", fileUrl: "mock-id-url" }
    ],
    timeline: [
      { status: "submitted", note: "Application submitted", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "2",
    userId: "1", 
    serviceType: "engineering",
    partnerType: "withSaudiPartner",
    status: "approved",
    projectEstimatedValue: 100000,
    familyMembers: "2",
    needVirtualOffice: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    documents: [
      { type: "passport", fileUrl: "mock-passport-url-2" },
      { type: "commercial_registration", fileUrl: "mock-cr-url" }
    ],
    timeline: [
      { status: "submitted", note: "Application submitted", createdAt: new Date(Date.now() - 86400000).toISOString() },
      { status: "approved", note: "Application approved", createdAt: new Date().toISOString() }
    ]
  }
];

export const submitApplication = async (applicationData) => {
  console.log("Mock submitApplication:", applicationData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create new application
  const newApplication = {
    id: (mockApplications.length + 1).toString(),
    ...applicationData,
    status: "submitted",
    createdAt: new Date().toISOString(),
    documents: [],
    timeline: [
      {
        status: "submitted",
        note: "Application submitted by client",
        createdAt: new Date().toISOString()
      }
    ]
  };
  
  mockApplications.push(newApplication);
  
  return {
    success: true,
    message: "Application submitted successfully",
    data: {
      applicationId: newApplication.id,
      status: newApplication.status,
      submittedAt: newApplication.createdAt
    }
  };
};

// Mock helper functions
export const getMockApplications = () => mockApplications;
export const getMockApplicationById = (id) => mockApplications.find(app => app.id === id);
export const updateMockApplicationStatus = (id, status) => {
  const app = mockApplications.find(app => app.id === id);
  if (app) {
    app.status = status;
    app.timeline.push({
      status,
      note: `Status updated to ${status}`,
      createdAt: new Date().toISOString()
    });
  }
  return app;
};