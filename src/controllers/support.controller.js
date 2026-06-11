import * as supportService from '../services/support.service.js';
import { sendResponse } from '../utils/response.js';

const handleRequest = async (req, res, next, serviceFn, successMsg) => {
  try {
    const isSuperAdmin = req.user.role?.name === 'SUPER_ADMIN';
    let tenantId;
    
    if (req.method === 'GET') {
      tenantId = isSuperAdmin && !req.query.tenantId ? null : (req.query.tenantId ? Number(req.query.tenantId) : req.user.tenantId);
      const result = await serviceFn(tenantId);
      sendResponse(res, 200, successMsg, result);
    } else if (req.method === 'POST') {
      tenantId = isSuperAdmin ? (req.body.tenantId || req.user.tenantId || 1) : (req.user.tenantId || 1);
      const result = await serviceFn(req.body, req.user.id, tenantId);
      sendResponse(res, 201, successMsg, result);
    } else if (req.method === 'PUT') {
      tenantId = isSuperAdmin ? null : req.user.tenantId;
      const result = await serviceFn(req.params.id, req.body, tenantId, req.user.id);
      sendResponse(res, 200, successMsg, result);
    } else if (req.method === 'DELETE') {
      tenantId = isSuperAdmin ? null : req.user.tenantId;
      await serviceFn(req.params.id, tenantId, req.user.id);
      sendResponse(res, 200, successMsg, null);
    }
  } catch (error) {
    next(error);
  }
};

// Tickets
export const createTicket = (req, res, next) => handleRequest(req, res, next, supportService.createTicket, 'Ticket created');
export const getTickets = (req, res, next) => handleRequest(req, res, next, supportService.getTickets, 'Tickets fetched');
export const updateTicket = (req, res, next) => handleRequest(req, res, next, supportService.updateTicket, 'Ticket updated');
export const updateTicketStatus = (req, res, next) => handleRequest(req, res, next, supportService.updateTicket, 'Ticket updated');
export const deleteTicket = (req, res, next) => handleRequest(req, res, next, supportService.deleteTicket, 'Ticket deleted');

// Events
export const createEvent = (req, res, next) => handleRequest(req, res, next, supportService.createEvent, 'Event created');
export const getEvents = (req, res, next) => handleRequest(req, res, next, supportService.getEvents, 'Events fetched');
export const updateEvent = (req, res, next) => handleRequest(req, res, next, supportService.updateEvent, 'Event updated');
export const deleteEvent = (req, res, next) => handleRequest(req, res, next, supportService.deleteEvent, 'Event deleted');

// Guest Requests
export const createGuestRequest = (req, res, next) => handleRequest(req, res, next, supportService.createGuestRequest, 'Request logged');
export const getGuestRequests = (req, res, next) => handleRequest(req, res, next, supportService.getGuestRequests, 'Requests fetched');
export const updateGuestRequest = (req, res, next) => handleRequest(req, res, next, supportService.updateGuestRequest, 'Request updated');
export const deleteGuestRequest = (req, res, next) => handleRequest(req, res, next, supportService.deleteGuestRequest, 'Request deleted');
