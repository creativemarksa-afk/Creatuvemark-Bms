import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";

// Invoice model is working correctly

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Validate required fields
    if (!invoiceData.clientName || !invoiceData.invoiceNumber || !invoiceData.dueDate) {
      return res.status(400).json({ 
        message: "Missing required fields: clientName, invoiceNumber, and dueDate are required" 
      });
    }

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber: invoiceData.invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ 
        message: "Invoice number already exists. Please use a different invoice number." 
      });
    }

    // Set createdBy if not provided (optional for now)
    if (!invoiceData.createdBy && req.user?.id) {
      invoiceData.createdBy = req.user.id;
    }

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    
    // Skip populate for now since we don't have User model set up
    // await newInvoice.populate('createdBy', 'name email');
    
    res.status(201).json({ 
      message: "Invoice created successfully", 
      invoice: newInvoice 
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: "Server error while creating invoice",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const { status, clientName, limit = 50, page = 1 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (clientName) {
      filter.clientName = { $regex: clientName, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Invoice.countDocuments(filter);

    res.json({
      invoices: invoices || [],
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: invoices.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ 
      message: "Failed to fetch invoices",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single invoice
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid invoice ID format" });
    }
    
    res.status(500).json({ 
      message: "Error fetching invoice",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;

    const invoice = await Invoice.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ 
      message: "Invoice updated successfully", 
      invoice 
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid invoice ID format" });
    }
    
    res.status(500).json({ 
      message: "Error updating invoice",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByIdAndDelete(id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ 
      message: "Invoice deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid invoice ID format" });
    }
    
    res.status(500).json({ 
      message: "Error deleting invoice",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
