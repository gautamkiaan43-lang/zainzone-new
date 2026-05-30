const db = require("../config/db");
const { companyFilter, companyScope } = require("../middleware/company");
const { successResponse, errorResponse } = require("../utils/helpers");
const { createNotification } = require("./notificationController");

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1`,
    [tableName, columnName],
  );
  return Array.isArray(rows) && rows.length > 0;
}

// --- PURCHASE REQUESTS ---
exports.getRequests = async (req, res) => {
  try {
    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cf;
    if (isSuperAdmin || isHQManagement) {
      cf = { clause: "", params: [] };
    } else if (roleNorm === "customer" || roleNorm === "client") {
      cf = { clause: " AND requester_id = ?", params: [req.user?.id] };
    } else {
      cf = companyFilter(req);
      if (!req.companyScope)
        cf = { clause: " AND company_id = -1", params: [] };
    }
    const [rows] = await db.query(
      `SELECT * FROM purchase_requests WHERE 1=1 ${cf.clause} ORDER BY created_at DESC`,
      cf.params,
    );
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, "Failed to fetch requests.", 500);
  }
};

exports.createRequest = async (req, res) => {
  try {
    const {
      item_name,
      items,
      category,
      quantity,
      estimated_cost,
      requester,
      requester_id,
      requesterId,
      priority,
      notes,
      department,
      status,
    } = req.body;
    let companyId = req.companyScope;

    // HQ Fix
    if (companyId == 1) companyId = null;
    const requestedRequesterId = Number(requester_id || requesterId || 0);
    const requesterIdFinal =
      Number.isFinite(requestedRequesterId) && requestedRequesterId > 0
        ? Math.trunc(requestedRequesterId)
        : req.user.id;
    const statusValue =
      status && String(status).trim() ? String(status).trim() : "Pending";

    let finalItemName = item_name;
    let finalQuantity = quantity;
    if (items && Array.isArray(items) && items.length > 0) {
      if (!finalItemName) finalItemName = items[0].name;
      if (!finalQuantity) finalQuantity = items[0].qty;
    }

    const [result] = await db.query(
      `INSERT INTO purchase_requests (company_id, item_name, items, category, quantity, estimated_cost, requester, requester_id, priority, notes, department, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        finalItemName || null,
        JSON.stringify(items || []),
        category || null,
        finalQuantity || null,
        estimated_cost || 0,
        requester || req.user.name,
        requesterIdFinal,
        priority || "Normal",
        notes || null,
        department || null,
        statusValue,
      ],
    );
    await createNotification({
      companyId,
      roleTarget: "procurement",
      type: "order",
      title: "New Purchase Request",
      message: `PR #${result.insertId} — "${finalItemName}" by ${req.user.name || "Staff"}`,
      link: "/dashboard/purchase-requests",
    });
    await createNotification({
      companyId,
      roleTarget: "admin",
      type: "order",
      title: "New Purchase Request",
      message: `PR #${result.insertId} — "${finalItemName}"`,
      link: "/dashboard/purchase-requests",
    });
    return successResponse(
      res,
      { id: result.insertId },
      "Purchase request created.",
      201,
    );
  } catch (err) {
    console.error("Create request error:", err);
    return errorResponse(res, "Failed to create request.", 500);
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const fields = req.body;
    const sets = [],
      values = [];

    const mapping = {
      item_name: "item_name",
      items: "items",
      category: "category",
      quantity: "quantity",
      estimated_cost: "estimated_cost",
      total: "estimated_cost",
      requester: "requester",
      requester_id: "requester_id",
      requesterId: "requester_id",
      priority: "priority",
      notes: "notes",
      status: "status",
      department: "department",
    };

    for (const [k, v] of Object.entries(fields)) {
      const dbField = mapping[k];
      if (!dbField) continue;

      sets.push(`${dbField} = ?`);
      values.push(dbField === "items" ? JSON.stringify(v) : v);
    }

    if (sets.length === 0)
      return successResponse(res, null, "No valid fields to update.");

    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }

    values.push(req.params.id, ...cs.params);
    await db.query(
      `UPDATE purchase_requests SET ${sets.join(", ")} WHERE id = ?${cs.clause}`,
      values,
    );

    const status = req.body.status;
    if (status) {
      await createNotification({
        companyId: req.companyScope,
        roleTarget: "procurement",
        type: "order",
        title: `Purchase Request ${status}`,
        message: `PR #${req.params.id} status → ${status}`,
        link: "/dashboard/purchase-requests",
      });
      await createNotification({
        companyId: req.companyScope,
        roleTarget: "admin",
        type: "order",
        title: `Purchase Request ${status}`,
        message: `PR #${req.params.id} updated to ${status}`,
        link: "/dashboard/purchase-requests",
      });
    }
    return successResponse(res, { id: req.params.id }, "Request updated.");
  } catch (err) {
    console.error("Update request error:", err);
    return errorResponse(res, "Failed to update request.", 500);
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }
    await db.query(`DELETE FROM purchase_requests WHERE id = ?${cs.clause}`, [
      req.params.id,
      ...cs.params,
    ]);
    return successResponse(res, null, "Request deleted.");
  } catch (err) {
    return errorResponse(res, "Failed to delete request.", 500);
  }
};

// --- QUOTES ---
exports.getQuotes = async (req, res) => {
  try {
    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cf;
    if (isSuperAdmin || isHQManagement) {
      cf = { clause: "", params: [] };
    } else {
      cf = companyFilter(req, "q");
    }
    const [rows] = await db.query(
      `SELECT q.*, v.name as vendor_name FROM quotes q LEFT JOIN vendors v ON q.vendor_id = v.id WHERE 1=1 ${cf.clause} ORDER BY q.created_at DESC`,
      cf.params,
    );
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, "Failed to fetch quotes.", 500);
  }
};

exports.createQuote = async (req, res) => {
  try {
    const {
      vendor_id,
      vendorId,
      purchase_request_id,
      purchaseRequestId,
      items,
      total_amount,
      total,
      totalAmount,
      validity_date,
      validity,
      validityDate,
      status,
      notes,
    } = req.body;

    const vId = vendor_id || vendorId;
    const prId = purchase_request_id || purchaseRequestId;
    const finalAmount = total_amount || total || totalAmount;
    const finalValidity = validity_date || validity || validityDate;
    let companyId = req.companyScope;

    // HQ Fix
    if (companyId == 1) companyId = null;

    const [result] = await db.query(
      `INSERT INTO quotes (company_id, vendor_id, purchase_request_id, items, total_amount, validity_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        vId,
        prId || null,
        JSON.stringify(items || []),
        finalAmount || 0,
        finalValidity || null,
        status || "Pending",
        notes || null,
      ],
    );
    await createNotification({
      companyId,
      roleTarget: "procurement",
      type: "order",
      title: "New Quote Received",
      message: `Quote #${result.insertId} — $${finalAmount || 0}`,
      link: "/dashboard/quotes",
    });
    await createNotification({
      companyId,
      roleTarget: "admin",
      type: "order",
      title: "New Quote Received",
      message: `Quote #${result.insertId} — $${finalAmount || 0}`,
      link: "/dashboard/quotes",
    });
    return successResponse(res, { id: result.insertId }, "Quote created.", 201);
  } catch (err) {
    console.error("Create quote error:", err);
    return errorResponse(res, "Failed to create quote.", 500);
  }
};

exports.updateQuote = async (req, res) => {
  try {
    const fields = req.body;
    const sets = [],
      values = [];
    const mapping = {
      vendorId: "vendor_id",
      purchaseRequestId: "purchase_request_id",
      totalAmount: "total_amount",
      total: "total_amount",
      validityDate: "validity_date",
      validity: "validity_date",
    };

    for (const [k, v] of Object.entries(fields)) {
      if (["id", "created_at", "company_id"].includes(k)) continue;
      const fieldName = mapping[k] || k;
      sets.push(`${fieldName} = ?`);
      values.push(k === "items" ? JSON.stringify(v) : v);
    }

    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }

    values.push(req.params.id, ...cs.params);
    await db.query(
      `UPDATE quotes SET ${sets.join(", ")} WHERE id = ?${cs.clause}`,
      values,
    );
    return successResponse(res, { id: req.params.id }, "Quote updated.");
  } catch (err) {
    console.error("Update quote error:", err);
    return errorResponse(res, "Failed to update quote.", 500);
  }
};

exports.deleteQuote = async (req, res) => {
  try {
    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }
    await db.query(`DELETE FROM quotes WHERE id = ?${cs.clause}`, [
      req.params.id,
      ...cs.params,
    ]);
    return successResponse(res, null, "Quote deleted.");
  } catch (err) {
    return errorResponse(res, "Failed to delete quote.", 500);
  }
};

// --- PURCHASE ORDERS ---
exports.getPOs = async (req, res) => {
  try {
    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cf;
    if (isSuperAdmin || isHQManagement) {
      cf = { clause: "", params: [] };
    } else {
      cf = companyFilter(req, "po");
    }
    const [rows] = await db.query(
      `SELECT po.*, MAX(v.name) as vendor_name FROM purchase_orders po LEFT JOIN vendors v ON po.vendor_id = v.id WHERE 1=1 ${cf.clause} GROUP BY po.id ORDER BY po.created_at DESC`,
      cf.params,
    );
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, "Failed to fetch POs.", 500);
  }
};

exports.createPO = async (req, res) => {
  try {
    const {
      vendorId,
      vendor_id,
      items,
      total_amount,
      total,
      totalAmount,
      notes,
      payment_terms,
      paymentTerms,
    } = req.body;
    let companyId = req.companyScope;

    // HQ Fix
    if (companyId == 1) companyId = null;
    const vId = vendor_id || vendorId;
    const finalAmount = total_amount || total || totalAmount || 0;
    const paymentTermsValue = payment_terms || paymentTerms || null;

    const hasPaymentTerms = await columnExists(
      "purchase_orders",
      "payment_terms",
    );
    const insertColumns = [
      "company_id",
      "vendor_id",
      "items",
      "total_amount",
      "notes",
    ];
    const insertPlaceholders = ["?", "?", "?", "?", "?"];
    const insertValues = [
      companyId,
      vId,
      JSON.stringify(items || []),
      finalAmount,
      notes || null,
    ];
    let finalNotes = notes ? String(notes) : "";

    if (paymentTermsValue && hasPaymentTerms) {
      insertColumns.push("payment_terms");
      insertPlaceholders.push("?");
      insertValues.push(paymentTermsValue);
    } else if (paymentTermsValue) {
      finalNotes = `${finalNotes ? `${finalNotes} | ` : ""}Payment Terms: ${paymentTermsValue}`;
      insertValues[4] = finalNotes || null;
    }

    const [result] = await db.query(
      `INSERT INTO purchase_orders (${insertColumns.join(", ")}) VALUES (${insertPlaceholders.join(", ")})`,
      insertValues,
    );
    await createNotification({
      companyId,
      roleTarget: "procurement",
      type: "order",
      title: "Purchase Order Created",
      message: `PO #${result.insertId} — $${finalAmount}`,
      link: "/dashboard/purchase-orders",
    });
    await createNotification({
      companyId,
      roleTarget: "admin",
      type: "order",
      title: "New Purchase Order",
      message: `PO #${result.insertId} — $${finalAmount}`,
      link: "/dashboard/purchase-orders",
    });
    await createNotification({
      companyId,
      roleTarget: "inventory",
      type: "alert",
      title: "Incoming PO",
      message: `PO #${result.insertId} created — prepare for receiving`,
      link: "/dashboard/purchase-orders",
    });
    return successResponse(res, { id: result.insertId }, "PO created.", 201);
  } catch (err) {
    return errorResponse(res, "Failed to create PO.", 500);
  }
};

exports.updatePO = async (req, res) => {
  try {
    const fields = req.body;
    const sets = [],
      values = [];
    const hasPaymentTerms = await columnExists(
      "purchase_orders",
      "payment_terms",
    );

    // Map camelCase frontend keys → DB snake_case columns (only columns that exist in purchase_orders)
    const mapping = {
      vendorId: "vendor_id",
      vendor_id: "vendor_id",
      totalAmount: "total_amount",
      total_amount: "total_amount",
      total: "total_amount",
      notes: "notes",
      status: "status",
      items: "items",
      paymentTerms: "payment_terms",
      payment_terms: "payment_terms",
    };

    for (const [k, v] of Object.entries(fields)) {
      const dbField = mapping[k];
      if (!dbField) continue; // ignore unknown / read-only fields
      if (dbField === "payment_terms" && !hasPaymentTerms) continue;
      sets.push(`${dbField} = ?`);
      values.push(
        dbField === "items" ? JSON.stringify(Array.isArray(v) ? v : []) : v,
      );
    }

    if (sets.length === 0)
      return successResponse(res, { id: req.params.id }, "Nothing to update.");

    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }

    values.push(req.params.id, ...cs.params);
    await db.query(
      `UPDATE purchase_orders SET ${sets.join(", ")} WHERE id = ?${cs.clause}`,
      values,
    );
    return successResponse(res, { id: req.params.id }, "PO updated.");
  } catch (err) {
    console.error("Update PO error:", err.message);
    return errorResponse(res, `Failed to update PO: ${err.message}`, 500);
  }
};

// PUT /api/procurement/po/:id/receive
exports.receiveGoods = async (req, res) => {
  try {
    const { id } = req.params;
    const packingSlip =
      req.body.packingSlip ||
      req.body.packing_slip ||
      req.body.packingSlipRef ||
      req.body.packing_slip_ref ||
      null;
    const adminApproved =
      req.body.adminApproved === true ||
      String(req.body.adminApproved || "").toLowerCase() === "true";

    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin";
    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      [
        "admin",
        "concierge",
        "operations",
        "operation",
        "procurement",
        "super_admin",
        "superadmin",
      ].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }

    const [pos] = await db.query(
      `SELECT * FROM purchase_orders WHERE id = ?${cs.clause}`,
      [id, ...cs.params],
    );
    if (pos.length === 0) return errorResponse(res, "PO not found.", 404);

    let poItems =
      typeof pos[0].items === "string"
        ? JSON.parse(pos[0].items)
        : pos[0].items;
    const parsedReceivedItems = Array.isArray(req.body)
      ? req.body
      : req.body.items || [];

    let allReceived = true;
    let anyPending = false;
    for (const received of parsedReceivedItems) {
      const item = poItems.find(
        (i) => i.id === received.id || i.name === received.name,
      );
      if (item) {
        const qtyReceivedNow = Number(
          received.receivedQty || received.receivedNow || 0,
        );
        
        if (qtyReceivedNow > 0) {
          if (adminApproved && isSuperAdmin) {
            // Apply instantly
            item.received_qty = (item.received_qty || 0) + qtyReceivedNow;
            item.pending_receive_qty = 0;
            
            // Auto-sync with Inventory Stock
            const [existing] = await db.query(
              "SELECT id, quantity FROM inventory WHERE name = ? AND company_id = ?",
              [item.name, pos[0].company_id],
            );
            if (existing.length > 0) {
              const newQty = existing[0].quantity + qtyReceivedNow;
              const invStatus = newQty > 10 ? "in_stock" : "low_stock";
              await db.query(
                "UPDATE inventory SET quantity = ?, status = ? WHERE id = ?",
                [newQty, invStatus, existing[0].id],
              );
            } else {
              await db.query(
                "INSERT INTO inventory (company_id, name, category, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  pos[0].company_id,
                  item.name,
                  item.category || "General",
                  item.price || 0,
                  qtyReceivedNow,
                  qtyReceivedNow > 10 ? "in_stock" : "low_stock",
                ],
              );
            }
          } else {
            // Pending approval
            item.pending_receive_qty = (item.pending_receive_qty || 0) + qtyReceivedNow;
            anyPending = true;
          }
        }
        
        if ((item.received_qty || 0) < (item.quantity || item.orderedQty)) {
          allReceived = false;
        }
      }
    }

    let newStatus = allReceived ? "Received" : "Partially Received";
    if (anyPending) {
      newStatus = "Pending Receipt Approval";
    }
    const hasPackingSlipColumn = await columnExists(
      "purchase_orders",
      "packing_slip",
    );
    const hasAdminApprovedColumn = await columnExists(
      "purchase_orders",
      "admin_approved",
    );
    const originalNotes = pos[0].notes ? String(pos[0].notes).trim() : "";
    const noteItems = [];
    if (originalNotes) noteItems.push(originalNotes);
    if (packingSlip) noteItems.push(`Packing Slip: ${packingSlip}`);
    if (adminApproved && isSuperAdmin)
      noteItems.push(`Admin approved by ${req.user.name || "Admin"}`);
    const updatedNotes =
      noteItems.length > 0 ? noteItems.join(" | ") : originalNotes;

    const updateFields = ["items = ?", "status = ?"];
    const updateValues = [JSON.stringify(poItems), newStatus];
    if (hasPackingSlipColumn && packingSlip) {
      updateFields.push("packing_slip = ?");
      updateValues.push(packingSlip);
    }
    if (hasAdminApprovedColumn && adminApproved && isSuperAdmin) {
      updateFields.push("admin_approved = ?");
      updateValues.push(1);
    }
    if (updatedNotes !== originalNotes) {
      updateFields.push("notes = ?");
      updateValues.push(updatedNotes);
    }

    await db.query(
      `UPDATE purchase_orders SET ${updateFields.join(", ")} WHERE id = ?${cs.clause}`,
      [...updateValues, id, ...cs.params],
    );

    await createNotification({
      companyId: pos[0].company_id,
      roleTarget: "procurement",
      type: "delivery",
      title: `PO #${id} — ${newStatus}`,
      message: `Goods ${newStatus.toLowerCase()} and inventory updated`,
      link: "/dashboard/purchase-orders",
    });
    await createNotification({
      companyId: pos[0].company_id,
      roleTarget: "inventory",
      type: "delivery",
      title: "Inventory Updated from PO",
      message: `Stock updated from PO #${id}`,
      link: "/dashboard/inventory",
    });
    await createNotification({
      companyId: pos[0].company_id,
      roleTarget: "admin",
      type: "delivery",
      title: `PO #${id} — ${newStatus}`,
      message: `Goods received and inventory synced`,
      link: "/dashboard/purchase-orders",
    });

    return successResponse(
      res,
      { id, status: newStatus },
      "Goods received and inventory auto-updated.",
    );
  } catch (err) {
    console.error("Receive goods error:", err);
    return errorResponse(
      res,
      "Failed to receive goods or update inventory.",
      500,
    );
  }
};

// PUT /api/procurement/po/:id/approve-receipt
exports.approveReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const roleNorm = String(req.user?.role || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isSuperAdmin =
      roleNorm === "super_admin" || roleNorm === "superadmin" || roleNorm === "admin";
      
    if (!isSuperAdmin) {
      return errorResponse(res, "Access denied. Only admins can approve receipts.", 403);
    }

    const isHQ =
      req.user?.company_id == 1 ||
      !req.user?.company_id ||
      req.companyScope == 1;
    const isHQManagement =
      isHQ &&
      ["admin", "super_admin", "superadmin"].includes(roleNorm);
    let cs;
    if (isSuperAdmin || isHQManagement) {
      cs = { clause: "", params: [] };
    } else {
      cs = companyScope(req);
    }

    const [pos] = await db.query(
      `SELECT * FROM purchase_orders WHERE id = ?${cs.clause}`,
      [id, ...cs.params],
    );
    if (pos.length === 0) return errorResponse(res, "PO not found.", 404);

    let poItems =
      typeof pos[0].items === "string"
        ? JSON.parse(pos[0].items)
        : pos[0].items;

    let allReceived = true;
    for (const item of poItems) {
      const pendingQty = Number(item.pending_receive_qty || 0);
      if (pendingQty > 0) {
        item.received_qty = (item.received_qty || 0) + pendingQty;
        item.pending_receive_qty = 0;

        // Auto-sync with Inventory Stock
        const [existing] = await db.query(
          "SELECT id, quantity FROM inventory WHERE name = ? AND company_id = ?",
          [item.name, pos[0].company_id],
        );
        if (existing.length > 0) {
          const newQty = existing[0].quantity + pendingQty;
          const invStatus = newQty > 10 ? "in_stock" : "low_stock";
          await db.query(
            "UPDATE inventory SET quantity = ?, status = ? WHERE id = ?",
            [newQty, invStatus, existing[0].id],
          );
        } else {
          await db.query(
            "INSERT INTO inventory (company_id, name, category, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)",
            [
              pos[0].company_id,
              item.name,
              item.category || "General",
              item.price || 0,
              pendingQty,
              pendingQty > 10 ? "in_stock" : "low_stock",
            ],
          );
        }
      }

      if ((item.received_qty || 0) < (item.quantity || item.orderedQty)) {
        allReceived = false;
      }
    }

    const newStatus = allReceived ? "Received" : "Partially Received";
    const updateFields = ["items = ?", "status = ?", "admin_approved = ?"];
    const updateValues = [JSON.stringify(poItems), newStatus, 1];

    await db.query(
      `UPDATE purchase_orders SET ${updateFields.join(", ")} WHERE id = ?${cs.clause}`,
      [...updateValues, id, ...cs.params],
    );

    await createNotification({
      companyId: pos[0].company_id,
      roleTarget: "procurement",
      type: "delivery",
      title: `PO #${id} — Receipt Approved`,
      message: `Goods ${newStatus.toLowerCase()} and inventory updated`,
      link: "/dashboard/purchase-orders",
    });

    return successResponse(
      res,
      { id, status: newStatus },
      "Receipt approved and inventory auto-updated.",
    );
  } catch (err) {
    console.error("Approve receipt error:", err);
    return errorResponse(
      res,
      "Failed to approve receipt or update inventory.",
      500,
    );
  }
};
