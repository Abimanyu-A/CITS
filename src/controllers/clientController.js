import { Client } from "../models/clients.js";

// Fetch all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching clients", error: error.message });
  }
};

// Fetch a client by ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching client", error: error.message });
  }
};

// Create a new client
export const createClient = async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json({ success: true, message: "Client created successfully", data: newClient });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error creating client", error: error.message });
  }
};

// Update client details
export const updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedClient) return res.status(404).json({ success: false, message: "Client not found" });
    res.status(200).json({ success: true, message: "Client updated successfully", data: updatedClient });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error updating client", error: error.message });
  }
};

// Delete a client
export const deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) return res.status(404).json({ success: false, message: "Client not found" });
    res.status(200).json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting client", error: error.message });
  }
};
