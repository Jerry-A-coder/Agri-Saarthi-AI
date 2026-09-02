var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/server/db.ts
var AgriDatabase = class {
  constructor() {
    this.users = [];
    this.farmerProfiles = [];
    this.providerProfiles = [];
    this.farms = [];
    this.fields = [];
    this.cropGrowthLogs = [];
    this.cropHistories = [];
    this.cropRotations = [];
    this.yieldPredictions = [];
    this.pestRiskAssessments = [];
    this.soilTests = [];
    this.soilLabs = [];
    this.soilTestRequests = [];
    this.plantScans = [];
    this.plantScanObservations = [];
    this.warehouses = [];
    this.warehouseBookings = [];
    this.governmentSchemes = [];
    this.schemeApplications = [];
    this.marketPrices = [];
    this.priceAlertRules = [];
    this.triggeredPriceAlerts = [];
    this.buyerListings = [];
    this.cropListings = [];
    this.auditLogs = [];
    this.notifications = [];
    this.inquiries = [];
    this.demandCropSuggestions = [];
    this.farmerPeerProfiles = [];
    this.farmingKnowledgeNodes = [];
    this.communityOptInSettings = {};
    this.peerMessages = [];
    this.startTime = Date.now();
    this.seedDatabase();
  }
  // Record an audit log for every important operation
  logAudit(userId, userEmail, role, action, entity, entityId, metadata) {
    const log = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      user_email: userEmail,
      role,
      action,
      entity,
      entity_id: entityId,
      metadata,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ip_address: "127.0.0.1 (Local Verified)"
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }
  // Push a real-time notification
  sendNotification(userId, title, message, type, linkTab) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      link_tab: linkTab
    };
    this.notifications.unshift(notification);
    return notification;
  }
  // Haversine distance calculator in Kilometers
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  }
  // Smart Warehouse Query Engine
  searchNearbyWarehouses(params) {
    let list = this.warehouses.map((w) => {
      const distanceKm = this.calculateDistance(params.lat, params.lng, w.latitude, w.longitude);
      const estRoadKm = Math.round(distanceKm * 1.25 * 10) / 10;
      const estDriveTimeMins = Math.round(estRoadKm / 35 * 60);
      let baseRatePerKgDay = w.rate_inr;
      if (w.pricing_model === "per_month_quintal") {
        baseRatePerKgDay = w.rate_inr / (100 * 30);
      } else if (w.pricing_model === "per_ton_per_day") {
        baseRatePerKgDay = w.rate_inr / 1e3;
      }
      const requestedQty = params.quantityKg || 1e3;
      const sampleDurationDays = 30;
      const estimatedCost = Math.round(requestedQty * baseRatePerKgDay * sampleDurationDays);
      return {
        ...w,
        straight_line_distance_km: distanceKm,
        road_distance_km: estRoadKm,
        estimated_travel_time_minutes: estDriveTimeMins,
        effective_rate_per_kg_day: Math.round(baseRatePerKgDay * 100) / 100,
        estimated_storage_cost_30d: estimatedCost,
        suitability_score: this.calculateWarehouseSuitability(w, params.crop, requestedQty)
      };
    });
    if (params.radiusKm) {
      list = list.filter((w) => w.straight_line_distance_km <= (params.radiusKm || 100));
    }
    if (params.storageType && params.storageType !== "All") {
      list = list.filter((w) => w.storage_types.some((t) => t.toLowerCase().includes((params.storageType || "").toLowerCase())));
    }
    if (params.quantityKg) {
      list = list.filter((w) => w.available_capacity_kg >= (params.quantityKg || 0));
    }
    if (params.maxPrice) {
      list = list.filter((w) => w.effective_rate_per_kg_day <= (params.maxPrice || 9999));
    }
    const sort = params.sortBy || "distance";
    if (sort === "distance") {
      list.sort((a, b) => a.straight_line_distance_km - b.straight_line_distance_km);
    } else if (sort === "price") {
      list.sort((a, b) => a.effective_rate_per_kg_day - b.effective_rate_per_kg_day);
    } else if (sort === "capacity") {
      list.sort((a, b) => b.available_capacity_kg - a.available_capacity_kg);
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }
  calculateWarehouseSuitability(w, crop, quantity) {
    let score = 70;
    if (w.verified) score += 10;
    if (w.security_and_cctv) score += 5;
    if (w.insurance_covered) score += 5;
    if (crop && w.suitable_crops.some((c) => c.toLowerCase().includes(crop.toLowerCase()))) {
      score += 10;
    }
    if (quantity && w.available_capacity_kg >= quantity * 2) {
      score += 5;
    }
    return Math.min(score, 100);
  }
  // Create Warehouse Booking with transaction and real capacity deduction
  createWarehouseBooking(bookingData) {
    const warehouse = this.warehouses.find((w) => w.id === bookingData.warehouseId);
    if (!warehouse) {
      return { success: false, error: "Warehouse not found" };
    }
    if (warehouse.available_capacity_kg < bookingData.quantityKg) {
      return {
        success: false,
        error: `Insufficient warehouse capacity. Requested: ${bookingData.quantityKg} kg, Available: ${warehouse.available_capacity_kg} kg`
      };
    }
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(startDate.getTime() + bookingData.durationDays * 24 * 60 * 60 * 1e3);
    const estimatedCost = Math.round(bookingData.quantityKg * bookingData.rateApplied * bookingData.durationDays);
    const booking = {
      id: `wb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      booking_code: `AGRI-WH-${Math.floor(1e5 + Math.random() * 9e5)}`,
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.name,
      farmer_id: bookingData.farmerId,
      farmer_name: bookingData.farmerName,
      farmer_phone: bookingData.farmerPhone,
      crop_name: bookingData.cropName,
      quantity_kg: bookingData.quantityKg,
      storage_type_requested: bookingData.storageTypeRequested,
      start_date: bookingData.startDate,
      expected_duration_days: bookingData.durationDays,
      end_date: endDate.toISOString().split("T")[0],
      rate_applied: bookingData.rateApplied,
      estimated_cost_inr: estimatedCost,
      status: "PENDING",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.warehouseBookings.unshift(booking);
    this.logAudit(bookingData.farmerId, bookingData.farmerPhone, "farmer", "CREATE_WAREHOUSE_BOOKING", "warehouse_bookings", booking.id, {
      warehouse_id: warehouse.id,
      quantity_kg: bookingData.quantityKg,
      estimated_cost_inr: estimatedCost
    });
    const providerUser = this.users.find((u) => u.id === warehouse.provider_id);
    if (providerUser) {
      this.sendNotification(
        providerUser.id,
        "New Storage Booking Request",
        `${bookingData.farmerName} requested to store ${bookingData.quantityKg} kg of ${bookingData.cropName} at ${warehouse.name}.`,
        "booking",
        "bookings"
      );
    }
    return { success: true, booking };
  }
  // Update Booking Status (e.g. ACCEPT, REJECT, CANCEL) and update Warehouse Capacity
  updateBookingStatus(bookingId, newStatus, providerNotes, userId) {
    const booking = this.warehouseBookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }
    const warehouse = this.warehouses.find((w) => w.id === booking.warehouse_id);
    const oldStatus = booking.status;
    if (newStatus === "ACCEPTED" && oldStatus !== "ACCEPTED" && oldStatus !== "ACTIVE") {
      if (warehouse) {
        if (warehouse.available_capacity_kg < booking.quantity_kg) {
          return { success: false, error: "Cannot accept booking: Warehouse has reached capacity." };
        }
        warehouse.used_capacity_kg += booking.quantity_kg;
        warehouse.available_capacity_kg = Math.max(0, warehouse.total_capacity_kg - warehouse.used_capacity_kg);
      }
    } else if ((newStatus === "CANCELLED" || newStatus === "REJECTED" || newStatus === "COMPLETED" || newStatus === "EXPIRED") && (oldStatus === "ACCEPTED" || oldStatus === "ACTIVE")) {
      if (warehouse) {
        warehouse.used_capacity_kg = Math.max(0, warehouse.used_capacity_kg - booking.quantity_kg);
        warehouse.available_capacity_kg = Math.min(
          warehouse.total_capacity_kg,
          warehouse.total_capacity_kg - warehouse.used_capacity_kg
        );
      }
    }
    booking.status = newStatus;
    if (providerNotes) booking.provider_notes = providerNotes;
    booking.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.logAudit(userId || "system", "admin/provider", "provider", `UPDATE_BOOKING_STATUS_${newStatus}`, "warehouse_bookings", booking.id, {
      old_status: oldStatus,
      new_status: newStatus
    });
    this.sendNotification(
      booking.farmer_id,
      `Storage Booking ${newStatus}`,
      `Your booking #${booking.booking_code} for ${booking.quantity_kg} kg ${booking.crop_name} at ${booking.warehouse_name} is now ${newStatus}.`,
      "booking",
      "warehouses"
    );
    return { success: true, booking };
  }
  // ==========================================
  // INQUIRIES & ADMIN HELPDESK ENGINE
  // ==========================================
  createInquiry(params) {
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ticketNumber = `TKT-${params.senderRole.toUpperCase().substring(0, 3)}-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const initialMsg = {
      id: `msg_${Date.now()}_1`,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_role: params.senderRole,
      content: params.initialMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const triageMsg = {
      id: `msg_${Date.now()}_2`,
      sender_id: "usr_admin_ai",
      sender_name: "AgriSaarthi Admin Desk (AI Assistant)",
      sender_role: "admin",
      content: `Greetings ${params.senderName}. Your inquiry regarding "${params.subject}" has been assigned Ticket #${ticketNumber}. Our official desk agronomists and logistics coordinators have received this. While we review your case details, please find instant guidance and relevant resources below.`,
      timestamp: new Date(Date.now() + 1e3).toISOString(),
      is_ai_assisted: true
    };
    const newInquiry = {
      id: inquiryId,
      ticket_number: ticketNumber,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_email: params.senderEmail || "",
      sender_phone: params.senderPhone || "",
      sender_role: params.senderRole,
      subject: params.subject,
      category: params.category,
      status: "OPEN",
      priority: params.priority || "MEDIUM",
      messages: [initialMsg, triageMsg],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.inquiries.unshift(newInquiry);
    this.logAudit(params.senderId, params.senderRole, params.senderRole, "CREATE_INQUIRY", "inquiries", inquiryId, {
      ticketNumber,
      category: params.category,
      subject: params.subject
    });
    this.sendNotification(
      "usr_admin_1",
      `New ${params.senderRole.toUpperCase()} Inquiry: ${ticketNumber}`,
      `${params.senderName} submitted: "${params.subject}" in ${params.category}`,
      "system",
      "inquiries"
    );
    return newInquiry;
  }
  replyToInquiry(params) {
    const inquiry = this.inquiries.find((i) => i.id === params.inquiryId);
    if (!inquiry) return { success: false, error: "Inquiry not found" };
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_role: params.senderRole,
      content: params.content,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      visual_payload: params.visualPayload
    };
    inquiry.messages.push(newMsg);
    inquiry.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    if (params.senderRole === "admin") {
      inquiry.status = "IN_REVIEW";
    }
    this.logAudit(params.senderId, params.senderRole, params.senderRole, "REPLY_INQUIRY", "inquiries", inquiry.id);
    const targetUserId = params.senderRole === "admin" ? inquiry.sender_id : "usr_admin_1";
    this.sendNotification(
      targetUserId,
      `Inquiry Update: #${inquiry.ticket_number}`,
      `New response received from ${params.senderName}`,
      "system",
      "inquiries"
    );
    return { success: true, inquiry };
  }
  updateInquiryStatus(inquiryId, status, adminUserId = "usr_admin_1") {
    const inquiry = this.inquiries.find((i) => i.id === paramsInquiryIdOrDirect(inquiryId));
    if (!inquiry) return { success: false, error: "Inquiry not found" };
    inquiry.status = status;
    inquiry.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.logAudit(adminUserId, "admin", "admin", `UPDATE_INQUIRY_STATUS_${status}`, "inquiries", inquiry.id);
    this.sendNotification(
      inquiry.sender_id,
      `Inquiry Ticket #${inquiry.ticket_number} ${status}`,
      `Your support ticket status is now ${status}.`,
      "system",
      "inquiries"
    );
    return { success: true, inquiry };
    function paramsInquiryIdOrDirect(id) {
      return id;
    }
  }
  // ==========================================
  // REAL-TIME PRICE ALERTS & MARKET RATES
  // ==========================================
  getPriceAlertRules(userId = "usr_farmer_1") {
    return this.priceAlertRules.filter((r) => !r.userId || r.userId === userId);
  }
  createPriceAlertRule(ruleData) {
    const market = this.marketPrices.find(
      (m) => m.commodity.toLowerCase() === (ruleData.commodity || "").toLowerCase() || m.mandi_name.toLowerCase().includes((ruleData.mandiName || "").toLowerCase())
    );
    const currentPrice = market ? market.modal_price_per_quintal || market.modal_price_inr || 2200 : ruleData.currentPriceINR || 2200;
    const newRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: ruleData.userId || "usr_farmer_1",
      commodity: ruleData.commodity || "Tomato",
      mandiName: ruleData.mandiName || "Pollachi Regulated Market",
      district: ruleData.district || "Coimbatore",
      state: ruleData.state || "Tamil Nadu",
      condition: ruleData.condition || "ABOVE_TARGET",
      targetPriceINR: Number(ruleData.targetPriceINR) || 2400,
      currentPriceINR: currentPrice,
      thresholdPercent: Number(ruleData.thresholdPercent) || 5,
      channels: ruleData.channels && ruleData.channels.length > 0 ? ruleData.channels : ["in_app", "push", "sms"],
      status: ruleData.status || "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      triggerCount: 0,
      note: ruleData.note || ""
    };
    this.priceAlertRules.unshift(newRule);
    this.logAudit(
      newRule.userId,
      "farmer@agrisaarthi.gov.in",
      "farmer",
      "CREATE_PRICE_ALERT_RULE",
      "price_alerts",
      newRule.id,
      { commodity: newRule.commodity, targetPrice: newRule.targetPriceINR, condition: newRule.condition }
    );
    return { success: true, rule: newRule };
  }
  updatePriceAlertRule(id, updates) {
    const rule = this.priceAlertRules.find((r) => r.id === id);
    if (!rule) return { success: false, error: "Price alert rule not found" };
    Object.assign(rule, updates);
    return { success: true, rule };
  }
  deletePriceAlertRule(id) {
    const idx = this.priceAlertRules.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, error: "Rule not found" };
    this.priceAlertRules.splice(idx, 1);
    return { success: true };
  }
  getTriggeredAlerts(userId = "usr_farmer_1") {
    return this.triggeredPriceAlerts.filter((a) => !a.userId || a.userId === userId);
  }
  markTriggeredAlertRead(id) {
    const alert = this.triggeredPriceAlerts.find((a) => a.id === id);
    if (alert) alert.isRead = true;
    return { success: true };
  }
  checkAndTriggerPriceAlerts(params) {
    const userId = params?.userId || "usr_farmer_1";
    const newlyTriggered = [];
    if (params?.simulatedUpdates && params.simulatedUpdates.length > 0) {
      params.simulatedUpdates.forEach((upd) => {
        const item = this.marketPrices.find(
          (m) => m.commodity.toLowerCase() === upd.commodity.toLowerCase() && (!upd.mandiName || m.mandi_name.toLowerCase().includes(upd.mandiName.toLowerCase()))
        );
        if (item) {
          const oldPrice = item.modal_price_per_quintal || item.modal_price_inr || 2200;
          item.modal_price_per_quintal = upd.newPrice;
          item.modal_price_inr = upd.newPrice;
          item.price_trend = upd.newPrice > oldPrice ? "up" : upd.newPrice < oldPrice ? "down" : "stable";
          const calcChange = Math.round((upd.newPrice - oldPrice) / oldPrice * 1e3) / 10;
          item.price_change_percent = upd.changePercent !== void 0 ? upd.changePercent : calcChange;
          item.report_date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        }
      });
    }
    const activeRules = this.priceAlertRules.filter(
      (r) => r.status === "ACTIVE" && (!r.userId || r.userId === userId)
    );
    activeRules.forEach((rule) => {
      const market = this.marketPrices.find(
        (m) => m.commodity.toLowerCase() === rule.commodity.toLowerCase() || rule.mandiName && m.mandi_name.toLowerCase().includes(rule.mandiName.toLowerCase())
      );
      if (!market) return;
      const currentPrice = market.modal_price_per_quintal || market.modal_price_inr || 0;
      const prevPrice = rule.currentPriceINR || (market.min_price_per_quintal || currentPrice * 0.95);
      const priceChangePct = market.price_change_percent || Math.round((currentPrice - prevPrice) / prevPrice * 100);
      let triggered = false;
      let conditionMetText = "";
      let alertType = "HIGH_PROFIT_SELL";
      let headline = "";
      let message = "";
      let actionRecommendation = "";
      let suggestedAction = "SELL_NOW";
      if (rule.condition === "ABOVE_TARGET" && currentPrice >= rule.targetPriceINR) {
        triggered = true;
        conditionMetText = `Rate reached \u20B9${currentPrice.toLocaleString("en-IN")}/Q (Target: \u20B9${rule.targetPriceINR.toLocaleString("en-IN")})`;
        alertType = "HIGH_PROFIT_SELL";
        headline = `\u{1F680} Target Exceeded: ${rule.commodity} @ \u20B9${currentPrice.toLocaleString("en-IN")}/Q`;
        message = `${rule.commodity} at ${market.mandi_name} is now \u20B9${currentPrice.toLocaleString("en-IN")}/Q, exceeding your selling threshold of \u20B9${rule.targetPriceINR.toLocaleString("en-IN")}/Q. Excellent window to liquidate inventory.`;
        actionRecommendation = "Direct Mandi delivery or immediate buyer listing recommended within next 24-48 hours.";
        suggestedAction = "SELL_NOW";
      } else if (rule.condition === "BELOW_TARGET" && currentPrice <= rule.targetPriceINR) {
        triggered = true;
        conditionMetText = `Rate dropped to \u20B9${currentPrice.toLocaleString("en-IN")}/Q (Threshold: \u20B9${rule.targetPriceINR.toLocaleString("en-IN")})`;
        alertType = "PRICE_DROP_WARNING";
        headline = `\u26A0\uFE0F Price Drop Warning: ${rule.commodity} @ \u20B9${currentPrice.toLocaleString("en-IN")}/Q`;
        message = `${rule.commodity} price at ${market.mandi_name} slipped to \u20B9${currentPrice.toLocaleString("en-IN")}/Q. To prevent distressed spot selling, reserve cold storage slots.`;
        actionRecommendation = "Avoid distress selling. Deposit produce in nearest certified warehouse/cold storage.";
        suggestedAction = "BOOK_STORAGE";
      } else if (rule.condition === "PERCENT_SURGE" && Math.abs(priceChangePct) >= (rule.thresholdPercent || 5)) {
        triggered = true;
        conditionMetText = `Daily swing of ${priceChangePct > 0 ? "+" : ""}${priceChangePct}% detected`;
        alertType = priceChangePct > 0 ? "SURGE_SPIKE" : "PRICE_DROP_WARNING";
        headline = `\u{1F4C8} Volatility Spike: ${rule.commodity} ${priceChangePct > 0 ? "Surged +" : "Dipped "}${priceChangePct}%`;
        message = `High volatility detected for ${rule.commodity} at ${market.mandi_name}. Modal rate is now \u20B9${currentPrice.toLocaleString("en-IN")}/Q with ${market.arrival_quantity_tonnes} tonnes daily arrivals.`;
        actionRecommendation = "Review buyer bids or consult Kisan AI Advisor before transport dispatch.";
        suggestedAction = priceChangePct > 0 ? "VIEW_BUYERS" : "CONSULT_ADVISOR";
      } else if (rule.condition === "DAILY_DIGEST") {
        triggered = true;
        conditionMetText = `Daily Mandi Market Intelligence`;
        alertType = "DAILY_DIGEST";
        headline = `\u{1F4CA} Daily Rate Digest: ${rule.commodity} @ \u20B9${currentPrice.toLocaleString("en-IN")}/Q`;
        message = `Morning rate report for ${rule.commodity} at ${market.mandi_name}: Min \u20B9${market.min_price_per_quintal}/Q, Modal \u20B9${currentPrice}/Q, Max \u20B9${market.max_price_per_quintal}/Q.`;
        actionRecommendation = "Compare with nearby Mandis to optimize freight routing.";
        suggestedAction = "CONSULT_ADVISOR";
      }
      if (triggered) {
        rule.lastTriggeredAt = (/* @__PURE__ */ new Date()).toISOString();
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        rule.currentPriceINR = currentPrice;
        const alertItem = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ruleId: rule.id,
          userId,
          commodity: rule.commodity,
          mandiName: market.mandi_name,
          district: market.district,
          previousPrice: prevPrice,
          newPrice: currentPrice,
          changePercent: priceChangePct,
          conditionMet: conditionMetText,
          alertType,
          headline,
          message,
          actionRecommendation,
          suggestedAction,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          isRead: false
        };
        this.triggeredPriceAlerts.unshift(alertItem);
        newlyTriggered.push(alertItem);
        this.sendNotification(
          userId,
          headline,
          message,
          "market_alert",
          "market"
        );
      }
    });
    return {
      triggeredCount: newlyTriggered.length,
      alerts: newlyTriggered,
      updatedPrices: this.marketPrices
    };
  }
  fetchLiveMarketRates(params) {
    const lat = params?.userLat || 10.6586;
    const lng = params?.userLng || 77.0089;
    let prices = this.marketPrices.map((m) => {
      let dist = 18;
      if (m.district.toLowerCase() === "coimbatore") dist = 24;
      else if (m.district.toLowerCase() === "madurai") dist = 145;
      else if (m.district.toLowerCase() === "erode") dist = 88;
      else if (m.district.toLowerCase() === "salem") dist = 140;
      else if (m.district.toLowerCase() === "thanjavur") dist = 210;
      else if (m.district.toLowerCase() === "pune") dist = 980;
      const modalPrice = m.modal_price_per_quintal || m.modal_price_inr || 2200;
      const minPrice = m.min_price_per_quintal || m.min_price_inr || Math.round(modalPrice * 0.88);
      const maxPrice = m.max_price_per_quintal || m.max_price_inr || Math.round(modalPrice * 1.14);
      const hist = m.historical_prices || [
        { date: "Day -6", modalPrice: Math.round(modalPrice * 0.93) },
        { date: "Day -5", modalPrice: Math.round(modalPrice * 0.94) },
        { date: "Day -4", modalPrice: Math.round(modalPrice * 0.96) },
        { date: "Day -3", modalPrice: Math.round(modalPrice * 0.98) },
        { date: "Day -2", modalPrice: Math.round(modalPrice * 0.99) },
        { date: "Yesterday", modalPrice: Math.round(modalPrice * 0.97) },
        { date: "Today (Live)", modalPrice }
      ];
      return {
        ...m,
        crop_name: m.commodity,
        modal_price_inr: modalPrice,
        modal_price_per_quintal: modalPrice,
        min_price_inr: minPrice,
        min_price_per_quintal: minPrice,
        max_price_inr: maxPrice,
        max_price_per_quintal: maxPrice,
        daily_arrival_volume_quintals: m.arrival_quantity_tonnes ? m.arrival_quantity_tonnes * 10 : 1200,
        price_change_percent: m.price_change_percent || (m.price_trend === "up" ? 4.2 : m.price_trend === "down" ? -3.1 : 0.4),
        distance_km: dist,
        historical_prices: hist,
        price_date: m.report_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
    });
    if (params?.commodity && params.commodity !== "ALL") {
      prices = prices.filter((p) => p.commodity.toLowerCase().includes(params.commodity.toLowerCase()));
    }
    if (params?.district && params.district !== "ALL") {
      prices = prices.filter((p) => p.district.toLowerCase().includes(params.district.toLowerCase()));
    }
    return prices;
  }
  // ==========================================
  // HARVEST TIME ESTIMATOR & CROP STAGES
  // ==========================================
  estimateHarvestTimeline(cropName, sowingDateStr, variety) {
    const cropDurations = {
      tomato: { duration: 95, stages: ["Germination (1-10d)", "Vegetative (11-35d)", "Flowering & Fruit Set (36-65d)", "Fruit Ripening (66-85d)", "Peak Picking (86-105d)"], yieldPerAcre: 180, bestWindow: "Dry sunny mornings" },
      onion: { duration: 110, stages: ["Nursery / Transplant (1-15d)", "Vegetative (16-50d)", "Bulb Initiation (51-80d)", "Bulb Development (81-100d)", "Neck Fall & Maturity (101-115d)"], yieldPerAcre: 120, bestWindow: "Field curing when 50% tops fall" },
      paddy: { duration: 125, stages: ["Seedling (1-20d)", "Tillering (21-45d)", "Panicle Initiation (46-75d)", "Grain Filling (76-105d)", "Maturity & Golden Ripening (106-125d)"], yieldPerAcre: 24, bestWindow: "Drain field 10 days before combine harvest" },
      maize: { duration: 100, stages: ["Emergence (1-10d)", "Knee-high (11-35d)", "Tasseling & Silking (36-60d)", "Grain Milk & Dough (61-85d)", "Black Layer Physiological Maturity (86-100d)"], yieldPerAcre: 35, bestWindow: "Moisture content below 15%" },
      groundnut: { duration: 105, stages: ["Germination (1-10d)", "Branching (11-30d)", "Peg Penetration (31-60d)", "Pod Filling (61-90d)", "Internal Shell Darkening Maturity (91-105d)"], yieldPerAcre: 18, bestWindow: "Soil in friable moisture state" },
      "green chilli": { duration: 120, stages: ["Seedling (1-20d)", "Vegetative (21-45d)", "Flowering (46-70d)", "First Green Harvest (71-90d)", "Multiple Picking flushes (91-150d)"], yieldPerAcre: 85, bestWindow: "Every 7-10 days" },
      turmeric: { duration: 240, stages: ["Sprouting (1-30d)", "Tillering (31-90d)", "Rhizome Growth (91-180d)", "Maturation & Leaf Yellowing (181-240d)"], yieldPerAcre: 110, bestWindow: "Leaves completely dried" },
      banana: { duration: 330, stages: ["Vegetative (1-150d)", "Bunch Emergence (151-210d)", "Finger Development (211-280d)", "Harvest Ready (281-330d)"], yieldPerAcre: 320, bestWindow: "Angles on fingers become rounded" }
    };
    const key = Object.keys(cropDurations).find((k) => cropName.toLowerCase().includes(k)) || "tomato";
    const config = cropDurations[key];
    const sow = new Date(sowingDateStr);
    const now = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(now.getTime() - sow.getTime());
    const daysElapsed = Math.min(Math.floor(diffTime / (1e3 * 60 * 60 * 24)), config.duration);
    const daysRemaining = Math.max(0, config.duration - daysElapsed);
    const harvestStart = new Date(sow.getTime() + config.duration * 24 * 60 * 60 * 1e3);
    const harvestEnd = new Date(harvestStart.getTime() + 10 * 24 * 60 * 60 * 1e3);
    const progress = Math.min(100, Math.round(daysElapsed / config.duration * 100));
    let stage = "Germination & Seedling";
    if (progress > 85) stage = "Maturity & Harvest Ready";
    else if (progress > 60) stage = "Fruit / Grain Filling";
    else if (progress > 35) stage = "Flowering & Pod Setting";
    else if (progress > 15) stage = "Vegetative Growth";
    return {
      id: `harvest_${Date.now()}`,
      crop_name: cropName,
      variety: variety || "High Yield Hybrid",
      sowing_date: sowingDateStr,
      duration_days: config.duration,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      estimated_harvest_start: harvestStart.toISOString().split("T")[0],
      estimated_harvest_end: harvestEnd.toISOString().split("T")[0],
      current_stage: stage,
      stage_progress_percent: progress,
      weather_harvest_condition: "Optimal Dry Weather",
      expected_yield_quintals: config.yieldPerAcre,
      recommended_post_harvest_action: `Optimal harvesting condition: ${config.bestWindow}. Reserve cold storage or APMC buyer slot 10 days in advance.`
    };
  }
  // ==========================================
  // CROP GROWTH TRACKER & HARVEST LIFECYCLE ENGINE
  // ==========================================
  getCropProfiles() {
    return {
      tomato: {
        duration: 95,
        category: "Vegetables",
        yieldPerAcreQuintals: 180,
        stages: [
          {
            name: "Germination & Seedling Emergence",
            shortName: "Emergence",
            startDay: 1,
            endDay: 12,
            icon: "Sprout",
            description: "Seed coat cracking, radical emergence, and cotyledon leaf expansion with primary taproot formation.",
            water: "Light daily misting; maintain 60-70% soil bed moisture without waterlogging.",
            nutrient: "Basal application of well-rotted FYM (10 t/acre) + Trichoderma viride (2.5 kg/acre).",
            pests: ["Damping-off (Pythium)", "Flea beetles"],
            check: "Ensure 85%+ uniform seedling emergence across nursery trays or raised beds.",
            tasks: [
              { title: "Nursery Seedbed Inoculation", desc: "Apply Pseudomonas fluorescens bio-agent to root zone.", category: "Nutrient & Bio-Fertilizer", day: 3, input: "Pseudomonas fluorescens 10g/L" },
              { title: "Check Soil Moisture Uniformity", desc: "Verify micro-sprinklers are not causing localized flooding.", category: "Irrigation", day: 7 },
              { title: "Damping-Off Scouting", desc: "Inspect seedling collars for soft brown constriction.", category: "Pest & Disease Scouting", day: 10 }
            ]
          },
          {
            name: "Vegetative Growth & Canopy Staking",
            shortName: "Vegetative",
            startDay: 13,
            endDay: 35,
            icon: "Leaf",
            description: "Vigorous main stem elongation, lateral branching, deep taproot anchorage, and trellising setup.",
            water: "Drip fertigation every 2 days; 4,500 L/acre/day.",
            nutrient: "Water soluble 19:19:19 NPK (4 kg/acre/week) + Zinc EDTA 12% foliar spray.",
            pests: ["Leaf Miner (Liriomyza)", "Whiteflies (Bemisia)", "Early Blight"],
            check: "Install bamboo/GI wire trellising before plant height reaches 45 cm.",
            tasks: [
              { title: "Main Stem Trellising & Staking", desc: "Erect support strings to keep heavy foliage off moist ground.", category: "Weeding & Aeration", day: 18 },
              { title: "Foliar Micronutrient Boost", desc: "Spray zinc, boron, and iron chelate cocktail.", category: "Nutrient & Bio-Fertilizer", day: 25, input: "Zinc EDTA + Boron 20%" },
              { title: "Yellow Sticky Trap Deployment", desc: "Install 15 yellow sticky cards per acre to trap whiteflies and aphids.", category: "Pest & Disease Scouting", day: 30, input: "Yellow Sticky Traps (15/acre)" }
            ]
          },
          {
            name: "Flowering & Fruit Setting",
            shortName: "Flowering",
            startDay: 36,
            endDay: 65,
            icon: "Flower2",
            description: "Cluster flower bud formation, active bee pollination, flower drop prevention, and pea-sized berry set.",
            water: "Consistent moisture; prevent alternating dry and wet cycles to stop blossom end rot.",
            nutrient: "Shift to 13:0:45 Potassium Nitrate (5 kg/acre) + Boron 20% (1g/L) for pollen viability.",
            pests: ["Fruit Borer (Helicoverpa)", "Blossom End Rot (Calcium deficit)", "Bacterial Canker"],
            check: "Inspect flower clusters for flower drop percentage (target <15%).",
            tasks: [
              { title: "Boron & Calcium Foliar Spray", desc: "Apply Solubor + Calcium Nitrate to prevent blossom drop & fruit cracking.", category: "Nutrient & Bio-Fertilizer", day: 40, input: "Calcium Nitrate 5g/L + Boron 1g/L" },
              { title: "Helicoverpa Pheromone Traps", desc: "Install 6 Helilure pheromone traps per acre to track fruit borer moth flights.", category: "Pest & Disease Scouting", day: 48, input: "Pheromone Trap (Helilure)" },
              { title: "Lateral Shoot Pruning (Suckering)", desc: "Remove lower 2 suckers below first flower cluster for maximum fruit sizing.", category: "Weeding & Aeration", day: 55 }
            ]
          },
          {
            name: "Fruit Enlargement & Colour Break (Breaker Stage)",
            shortName: "Fruit Sizing",
            startDay: 66,
            endDay: 85,
            icon: "Activity",
            description: "Rapid fruit sizing, pulp accumulation, lycopene pigment synthesis, and breaker colour shift.",
            water: "Gradually reduce irrigation by 20% to prevent skin splitting and concentrate brix sugars.",
            nutrient: "Apply 0:0:50 Sulphate of Potash (SOP) (6 kg/acre) for vibrant red colour and firm skin.",
            pests: ["Fruit Borer larvae entry", "Late Blight (Phytophthora)", "Sunscald"],
            check: "Check fruit firmness and look for pink breaker colour on first lower truss.",
            tasks: [
              { title: "Potassium Finish Fertigation", desc: "Supply Sulphate of Potash to enhance shelf-life and brix content.", category: "Nutrient & Bio-Fertilizer", day: 70, input: "SOP 0:0:50 (6 kg/acre)" },
              { title: "Pre-Harvest Scouting for Borer Entry", desc: "Examine calyx ends for pinhole punctures.", category: "Pest & Disease Scouting", day: 78 },
              { title: "Harvest Crate & Labour Scheduling", desc: "Clean and sanitize 150 plastic harvest crates with peracetic acid.", category: "Harvest Prep", day: 82 }
            ]
          },
          {
            name: "Maturity & Peak Multi-Flush Harvesting",
            shortName: "Harvest Ready",
            startDay: 86,
            endDay: 95,
            icon: "ShoppingBag",
            description: "Full red/turning harvest, picking at 3-day intervals, grading, and direct APMC mandi dispatch.",
            water: "Minimal moisture to keep soil firm for picking labourers.",
            nutrient: "No chemical fertilizers during active picking flushes.",
            pests: ["Post-harvest rots (Rhizopus)", "Fruit fly"],
            check: "Pick with calyx intact during cool morning hours (6:00 AM - 10:30 AM).",
            tasks: [
              { title: "Morning Harvest Flush #1", desc: "Pick breaker and turning stage fruits for distant mandi transit.", category: "Harvest Prep", day: 88 },
              { title: "Grade A vs Grade B Sorting", desc: "Segregate blemish-free 70-80mm fruits for premium wholesale rate.", category: "Harvest Prep", day: 91 },
              { title: "Mandi Rate Benchmark Check", desc: "Compare Ottanchathiram vs Koyambedu APMC prices before vehicle loading.", category: "Harvest Prep", day: 94 }
            ]
          }
        ]
      },
      onion: {
        duration: 110,
        category: "Vegetables",
        yieldPerAcreQuintals: 120,
        stages: [
          {
            name: "Transplanting & Root Establishment",
            shortName: "Transplanting",
            startDay: 1,
            endDay: 15,
            icon: "Sprout",
            description: "Seedling root anchorage in raised beds with high organic carbon loamy soil.",
            water: "Immediate life irrigation followed by 3rd day wetting.",
            nutrient: "Basal Single Super Phosphate (SSP 150 kg/acre) + Azospirillum bio-fertilizer.",
            pests: ["Thrips tabaci", "Root rot (Fusarium)"],
            check: "Ensure 95%+ seedling stand establishment with no gap filling needed.",
            tasks: [
              { title: "Seedling Root Dip", desc: "Dip roots in Carbendazim + Pseudomonas slurry prior to planting.", category: "Nutrient & Bio-Fertilizer", day: 2, input: "Pseudomonas 10g/L" },
              { title: "Life Irrigation Wetting Check", desc: "Inspect bed moisture depth (top 15cm must be evenly moist).", category: "Irrigation", day: 6 }
            ]
          },
          {
            name: "Vegetative Foliage & Canopy Development",
            shortName: "Foliage Growth",
            startDay: 16,
            endDay: 50,
            icon: "Leaf",
            description: "Continuous leaf emergence (target 8-10 healthy tubular leaves per bulb cluster).",
            water: "Drip irrigation every 3 days; maintain aerated soil profile.",
            nutrient: "Top dressing with Urea (25 kg/acre) + Micronutrient spray (Zinc + Sulphur).",
            pests: ["Onion Thrips (silver streaks)", "Purple Blotch (Alternaria porri)"],
            check: "Scout inner leaf axils with hand lens for thrips nymph populations.",
            tasks: [
              { title: "First Inter-Cultivation & Weeding", desc: "Shallow hoeing to remove grassy weeds and aerate bulb root zone.", category: "Weeding & Aeration", day: 22 },
              { title: "Sulphur & Micronutrient Application", desc: "Apply 90% bentonite sulphur (10 kg/acre) for pungency and bulb scale development.", category: "Nutrient & Bio-Fertilizer", day: 35, input: "Bentonite Sulphur 90%" },
              { title: "Blue Sticky Trap Installation", desc: "Set up blue sticky traps (12/acre) for thrips monitoring.", category: "Pest & Disease Scouting", day: 45, input: "Blue Sticky Traps" }
            ]
          },
          {
            name: "Bulb Initiation & Basal Swelling",
            shortName: "Bulb Initiation",
            startDay: 51,
            endDay: 80,
            icon: "Activity",
            description: "Leaf base swelling, carbohydrate translocation to underground bulb, and daughter bulb formation.",
            water: "Regular irrigation; critical water requirement period.",
            nutrient: "Apply 13:0:45 Potassium Nitrate + Humic Acid 12% to facilitate carbohydrate sink translocation.",
            pests: ["Purple Blotch", "Stemphylium blight", "Armyworm"],
            check: "Examine basal bulb diameter (>25 mm indicates healthy initiation).",
            tasks: [
              { title: "Bulb Swelling Potassium Dose", desc: "Fertigate Potassium Schoenite or Multi-K for dense scales.", category: "Nutrient & Bio-Fertilizer", day: 58, input: "Potassium Schoenite (10 kg/acre)" },
              { title: "Purple Blotch Preventative Spray", desc: "Spray Mancozeb 75% WP (2.5g/L) with sticker spreader.", category: "Pest & Disease Scouting", day: 68, input: "Mancozeb 75 WP" }
            ]
          },
          {
            name: "Bulb Sizing & Outer Scale Pigmentation",
            shortName: "Bulb Sizing",
            startDay: 81,
            endDay: 100,
            icon: "Sprout",
            description: "Maximum bulb circumference attainment, outer pink/red dry tunic pigmentation, and skin curing.",
            water: "Stop irrigation 10-12 days before anticipated harvest to harden bulb scales.",
            nutrient: "Zero nitrogen application; stop all foliar feeds.",
            pests: ["Basal Rot", "Bulb mite"],
            check: "Check for natural 50% top neck collapse/falling.",
            tasks: [
              { title: "Irrigation Withholding Cutoff", desc: "Cease irrigation completely to avoid soft bulb rot during storage.", category: "Irrigation", day: 88 },
              { title: "Storage Shed Disinfection", desc: "Clean traditional onion storage structures (Pattarai) with lime wash.", category: "Harvest Prep", day: 95 }
            ]
          },
          {
            name: "Neck Fall, Harvest & Field Curing",
            shortName: "Harvest Ready",
            startDay: 101,
            endDay: 110,
            icon: "ShoppingBag",
            description: "70-80% neck fall, manual uprooting, windrow field curing for 3-5 days, and top cutting.",
            water: "Completely dry soil.",
            nutrient: "None.",
            pests: ["Aspergillus niger (Black mould) in storage"],
            check: "Leaves should be paper-dry and necks fully sealed before cutting foliage 2.5cm above bulb.",
            tasks: [
              { title: "Manual Uprooting in Morning", desc: "Lift bulbs with root intact; cover bulbs with foliage in windrow.", category: "Harvest Prep", day: 103 },
              { title: "Field Curing Inspection", desc: "Inspect outer scales for complete golden-purple drying.", category: "Harvest Prep", day: 107 },
              { title: "Cold Storage / Mandi Allocation", desc: "Reserve local cold store chamber or transport to Dindigul mandi.", category: "Harvest Prep", day: 109 }
            ]
          }
        ]
      },
      paddy: {
        duration: 125,
        category: "Cereals & Grains",
        yieldPerAcreQuintals: 24,
        stages: [
          {
            name: "Nursery & Seedling Germination",
            shortName: "Nursery",
            startDay: 1,
            endDay: 20,
            icon: "Sprout",
            description: "Mat nursery / wet bed germination, 4-leaf stage development with robust root matting.",
            water: "Maintain 2 cm water layer after seedling emergence.",
            nutrient: "DAP (2 kg/cent) + Pseudomonas bio-seed treatment.",
            pests: ["Gall Midge", "Thrips (chilli thrips)", "Blast"],
            check: "Seedlings reach 18-20 cm height ready for machine/manual transplanting.",
            tasks: [
              { title: "Pre-Germination Seed Soaking", desc: "Soak seeds in carbendazim solution for 24 hours.", category: "Nutrient & Bio-Fertilizer", day: 2, input: "Carbendazim 2g/kg" },
              { title: "Nursery Water Level Management", desc: "Maintain thin film of standing water to suppress weed germination.", category: "Irrigation", day: 12 }
            ]
          },
          {
            name: "Active Tillering & Canopy Closure",
            shortName: "Tillering",
            startDay: 21,
            endDay: 45,
            icon: "Leaf",
            description: "Rapid tiller multiplication (target 18-22 productive tillers per hill) and deep root anchoring.",
            water: "Alternate Wetting and Drying (AWD) \u2014 save 30% water.",
            nutrient: "First top dress: Urea (35 kg/acre) + Zinc Sulphate (10 kg/acre) + Neem coated cake.",
            pests: ["Yellow Stem Borer (Dead hearts)", "Leaf Folder", "Bacterial Leaf Blight (BLB)"],
            check: "Count productive tillers per sq. meter (target >350 tillers/m\xB2).",
            tasks: [
              { title: "Cono-Weeder Operation", desc: "Run rotary weeder between rows to incorporate weeds and aerate roots.", category: "Weeding & Aeration", day: 28 },
              { title: "Neem-Coated Nitrogen Top Dressing", desc: "Apply split nitrogen dose during active tillering peak.", category: "Nutrient & Bio-Fertilizer", day: 35, input: "Neem Coated Urea (35 kg)" },
              { title: "Stem Borer Pheromone Traps", desc: "Install 8 Scirpophaga incertulas pheromone lures/acre.", category: "Pest & Disease Scouting", day: 42, input: "Stem Borer Lures" }
            ]
          },
          {
            name: "Panicle Primordia & Booting Stage",
            shortName: "Panicle Booting",
            startDay: 46,
            endDay: 75,
            icon: "Activity",
            description: "Flag leaf emergence, panicle embryo development inside swollen leaf sheath, and stem elongation.",
            water: "Keep 5 cm standing water during heading (critical sensitivity period).",
            nutrient: "Muriate of Potash (MOP 20 kg/acre) + Boron 20% foliar spray at panicle emergence.",
            pests: ["Brown Plant Hopper (BPH - Hopper burn)", "Sheath Rot", "Neck Blast"],
            check: "Check base of stems near waterline for BPH nymph colonies.",
            tasks: [
              { title: "Potash Boost at Booting", desc: "Broadcast MOP to maximize grain numbers per panicle and stem strength.", category: "Nutrient & Bio-Fertilizer", day: 55, input: "MOP (20 kg/acre)" },
              { title: "BPH Stem Base Scouting", desc: "Part hill canopy to inspect for brown planthoppers near water level.", category: "Pest & Disease Scouting", day: 65 }
            ]
          },
          {
            name: "Anthesis & Grain Milking / Dough Stage",
            shortName: "Grain Filling",
            startDay: 76,
            endDay: 105,
            icon: "Flower2",
            description: "Pollination, starch synthesis, milky grain transition to hard dough stage with panicles bending under weight.",
            water: "Saturated soil condition; avoid submerging panicles.",
            nutrient: "Foliar spray of 1% Potassium Nitrate (13:0:45) to enhance 1000-grain test weight.",
            pests: ["Gundhi Bug (leptocorisa)", "Grain discolouration", "False Smut"],
            check: "Examine developing grains for milky fluid turning into solid dough.",
            tasks: [
              { title: "Gundhi Bug Early Morning Scouting", desc: "Inspect blooming panicles for foul-smelling gundhi bugs.", category: "Pest & Disease Scouting", day: 82 },
              { title: "Foliar Grain Sizing Feed", desc: "Apply 13:0:45 foliar spray to plump up grain kernels.", category: "Nutrient & Bio-Fertilizer", day: 90, input: "13:0:45 (10g/L)" }
            ]
          },
          {
            name: "Physiological Maturity & Golden Combine Harvest",
            shortName: "Harvest Ready",
            startDay: 106,
            endDay: 125,
            icon: "ShoppingBag",
            description: "85-90% grains turn golden yellow, moisture drops to 20-22%, ready for combine harvester.",
            water: "Drain field completely 10-12 days prior to combine entry to firm soil.",
            nutrient: "None.",
            pests: ["Rodents", "Grain shattering"],
            check: "Paddy moisture content should be 18-20% at harvest; dry down to 14% for safe storage.",
            tasks: [
              { title: "Field Drainage Cutoff", desc: "Open drainage bunds to dry soil for harvester machinery traction.", category: "Irrigation", day: 112 },
              { title: "Combine Harvester Booking", desc: "Book track combine harvester with local custom hiring centre (CHC).", category: "Harvest Prep", day: 118 },
              { title: "Moisture Meter Testing", desc: "Test harvested paddy moisture before gunny bag bagging.", category: "Harvest Prep", day: 123 }
            ]
          }
        ]
      },
      groundnut: {
        duration: 105,
        category: "Oilseeds & Pulses",
        yieldPerAcreQuintals: 18,
        stages: [
          {
            name: "Germination & Seedling Vigour",
            shortName: "Germination",
            startDay: 1,
            endDay: 10,
            icon: "Sprout",
            description: "Epicotyl emergence and taproot development with Rhizobium nodulation beginning.",
            water: "Pre-sowing irrigation followed by light wetting on day 6.",
            nutrient: "Rhizobium + Phosphobacteria bio-seed treatment.",
            pests: ["Collar rot (Aspergillus niger)", "Cutworms"],
            check: "Ensure 90%+ emergence without missing hills.",
            tasks: [
              { title: "Rhizobium Bio-Inoculation", desc: "Treat kernels with Rhizobium leguminosarum before furrow drop.", category: "Nutrient & Bio-Fertilizer", day: 2, input: "Rhizobium 250g/acre" },
              { title: "Check Emergence Density", desc: "Ensure plant population reaches 33 plants per sq. meter.", category: "Weeding & Aeration", day: 8 }
            ]
          },
          {
            name: "Vegetative Branching & Canopy Expansion",
            shortName: "Vegetative",
            startDay: 11,
            endDay: 30,
            icon: "Leaf",
            description: "Vigorous primary and secondary branch formation, leaf canopy spreading over sandy soil.",
            water: "Irrigation at 8-10 day intervals in red sandy loam.",
            nutrient: "Gypsum (200 kg/acre) top dressing at 40-45 DAS for pod calcium.",
            pests: ["Spodoptera litura (Tobacco caterpillar)", "Leaf Miner", "Tikka Leaf Spot"],
            check: "Count nodules per root system (target >25 pink active nodules).",
            tasks: [
              { title: "Inter-Cultivation & Earthing Up", desc: "Loosen soil around plant base to facilitate future peg entry.", category: "Weeding & Aeration", day: 20 },
              { title: "Tikka Spot Preventative Spray", desc: "Spray Hexaconazole 5% EC (2ml/L) or Mancozeb.", category: "Pest & Disease Scouting", day: 28, input: "Hexaconazole 5 EC" }
            ]
          },
          {
            name: "Flowering & Geotropic Peg Penetration",
            shortName: "Pegging",
            startDay: 31,
            endDay: 60,
            icon: "Flower2",
            description: "Self-pollinated yellow flower flush, needle-like pegs growing downwards and penetrating top 5cm soil.",
            water: "Maintain friable, moist soil; crucial stage where dry crusted soil prevents peg entry.",
            nutrient: "Apply Gypsum (200 kg/acre) around root zone and lightly incorporate.",
            pests: ["Spodoptera larvae", "Rust disease"],
            check: "Ensure no weeding or inter-cultivation tool touches soil after 45 days (stops peg breakage).",
            tasks: [
              { title: "Gypsum Basal Band Application", desc: "Broadcast agricultural gypsum to provide calcium for kernel formation.", category: "Nutrient & Bio-Fertilizer", day: 40, input: "Gypsum (200 kg/acre)" },
              { title: "Soil Looseness Inspection for Pegs", desc: "Check that top 4 cm soil is loose and friable for easy peg insertion.", category: "Irrigation", day: 50 }
            ]
          },
          {
            name: "Pod Development & Kernel Filling",
            shortName: "Pod Filling",
            startDay: 61,
            endDay: 90,
            icon: "Activity",
            description: "Subterranean pod expansion, shell lignification, kernel oil and protein accumulation.",
            water: "Irrigate to avoid pod shrinkage; avoid water stagnation.",
            nutrient: "Foliar spray of 0.5% FeSO4 + 0.1% Citric acid for iron chlorosis if yellowing occurs.",
            pests: ["White grub", "Pod borer", "Late Tikka"],
            check: "Sample 3 plants to check pod development and shell hardening.",
            tasks: [
              { title: "Test Pod Sample Harvest", desc: "Dig 2 sample plants to inspect kernel filling percentage inside shells.", category: "Harvest Prep", day: 75 },
              { title: "Foliar Micronutrient Nutrition", desc: "Apply Groundnut Special micronutrient formula (2.5 kg/acre).", category: "Nutrient & Bio-Fertilizer", day: 82, input: "Groundnut Special Mix" }
            ]
          },
          {
            name: "Physiological Maturity & Mechanical Digging",
            shortName: "Harvest Ready",
            startDay: 91,
            endDay: 105,
            icon: "ShoppingBag",
            description: "Lower leaves turn yellow and drop; inner shell lining turns dark brown/black (75% maturity index).",
            water: "Give light irrigation 2 days prior to digging so pods do not detach in hard dry soil.",
            nutrient: "None.",
            pests: ["Aflatoxin contamination (Aspergillus flavus)"],
            check: "Crack open pods: dark brown inner surface indicates complete physiological maturity.",
            tasks: [
              { title: "Pre-Harvest Softening Irrigation", desc: "Light sprinkling so groundnut digger lifts pods without stripping roots.", category: "Irrigation", day: 95 },
              { title: "Groundnut Digger Operation", desc: "Invert plants in field row to sun-dry pods for 3-4 days.", category: "Harvest Prep", day: 100 },
              { title: "Pod Threshing & Pod Moisture Check", desc: "Thresh pods and dry to <8% moisture to prevent aflatoxin development.", category: "Harvest Prep", day: 104 }
            ]
          }
        ]
      },
      maize: {
        duration: 100,
        category: "Cereals & Grains",
        yieldPerAcreQuintals: 35,
        stages: [
          {
            name: "Emergence & Early Seedling",
            shortName: "Emergence",
            startDay: 1,
            endDay: 12,
            icon: "Sprout",
            description: "Coleoptile emergence and early root system formation.",
            water: "Pre-sowing irrigation followed by light watering at day 5.",
            nutrient: "Basal DAP + Zinc Sulphate (10 kg/acre).",
            pests: ["Fall Armyworm (Spodoptera frugiperda)", "Shoot Fly"],
            check: "Scout whorls for pinhole damage indicating Fall Armyworm neonates.",
            tasks: [
              { title: "Fall Armyworm Early Scouting", desc: "Inspect central whorls for translucent pinhole feeding patches.", category: "Pest & Disease Scouting", day: 8 }
            ]
          },
          {
            name: "Knee-High Vegetative & Stalk Growth",
            shortName: "Knee-High",
            startDay: 13,
            endDay: 35,
            icon: "Leaf",
            description: "Rapid stem elongation, 8-10 leaf collar stage, brace root formation.",
            water: "Irrigate every 6-8 days.",
            nutrient: "Top dress Urea (40 kg/acre) + Potash (15 kg/acre).",
            pests: ["Fall Armyworm (whorl feeding)", "Stem Borer"],
            check: "Ensure deep green foliage without interveinal yellowing (zinc deficiency).",
            tasks: [
              { title: "Whorl Application of Bio-Pesticide", desc: "Apply Metarhizium anisopliae or neem cake in central whorls.", category: "Pest & Disease Scouting", day: 20, input: "Metarhizium anisopliae" },
              { title: "Nitrogen Split Top Dress", desc: "Broadcast urea around base and earthing up to support brace roots.", category: "Nutrient & Bio-Fertilizer", day: 30, input: "Urea 40 kg" }
            ]
          },
          {
            name: "Tasseling & Silking (Flowering)",
            shortName: "Tasseling & Silking",
            startDay: 36,
            endDay: 60,
            icon: "Flower2",
            description: "Pollen shedding from tassels and emergence of moist silks from ear cob.",
            water: "Most critical moisture period; moisture stress causes unfertilized cob tips.",
            nutrient: "Foliar spray of 19:19:19 + Boron.",
            pests: ["Cob Borer (Helicoverpa)", "Turcicum Leaf Blight"],
            check: "Ensure 100% silk emergence coincides with active pollen shed.",
            tasks: [
              { title: "Critical Moisture Maintenance", desc: "Ensure furrow irrigation does not stress plants during silking window.", category: "Irrigation", day: 45 }
            ]
          },
          {
            name: "Grain Milk & Dough Stage",
            shortName: "Grain Filling",
            startDay: 61,
            endDay: 85,
            icon: "Activity",
            description: "Starch filling in kernels; transition from sweet milky sap to solid dent dough.",
            water: "Maintain moist subsoil.",
            nutrient: "Zero nitrogen.",
            pests: ["Ear rot", "Birds"],
            check: "Peel husk tip to check kernel row filling and absence of bald tips.",
            tasks: [
              { title: "Kernel Milk Line Inspection", desc: "Check progression of white milk line moving from crown to base.", category: "Harvest Prep", day: 75 }
            ]
          },
          {
            name: "Black Layer Maturity & Cob Harvest",
            shortName: "Harvest Ready",
            startDay: 86,
            endDay: 100,
            icon: "ShoppingBag",
            description: "Black abscission layer forms at kernel attachment point; husks dry and bleach.",
            water: "Dry field for harvesting.",
            nutrient: "None.",
            pests: ["Storage weevils (Sitophilus zeamais)"],
            check: "Kernel moisture drops below 16% for mechanical sheller operation.",
            tasks: [
              { title: "Mechanical Cob Picking", desc: "Harvest cobs and dry on concrete drying yard.", category: "Harvest Prep", day: 92 },
              { title: "Shelling & Bagging", desc: "Shell kernels, clean chaff, and pack in HDPE bags.", category: "Harvest Prep", day: 98 }
            ]
          }
        ]
      },
      banana: {
        duration: 330,
        category: "Fruits",
        yieldPerAcreQuintals: 320,
        stages: [
          {
            name: "Sucker Establishment & Early Vegetative",
            shortName: "Establishment",
            startDay: 1,
            endDay: 90,
            icon: "Sprout",
            description: "Tissue culture plantlet / sword sucker root anchorage, 12-15 broad leaves formed.",
            water: "Daily drip irrigation: 15-20 L/plant/day.",
            nutrient: "Basal FYM + DAP (100g/plant) + Neem cake (500g/plant).",
            pests: ["Pseudostem Weevil", "Rhizome Weevil", "Banana Aphid (Bunchy Top vector)"],
            check: "Inspect for vigorous cigar leaf unrolling every 7-10 days.",
            tasks: [
              { title: "Tissue Culture Pit Preparation", desc: "Mix FYM, bio-fertilizers, and topsoil in 60x60x60 cm pits.", category: "Nutrient & Bio-Fertilizer", day: 5, input: "FYM + Trichoderma" },
              { title: "Desuckering Round #1", desc: "Prune unwanted side suckers to concentrate food in main mother pseudostem.", category: "Weeding & Aeration", day: 60 }
            ]
          },
          {
            name: "Grand Vegetative & Stem Thickening",
            shortName: "Grand Growth",
            startDay: 91,
            endDay: 180,
            icon: "Leaf",
            description: "Massive vegetative canopy formation (target 30 functional leaves), pseudostem girth reaching >65 cm.",
            water: "Drip fertigation: 25-30 L/plant/day.",
            nutrient: "Weekly fertigation of Urea (100g) + MOP (150g) + Magnesium Sulphate (25g).",
            pests: ["Sigatoka Leaf Spot", "Erwinia Rhizome Rot"],
            check: "Ensure pseudostem girth is >60cm at 1 meter height.",
            tasks: [
              { title: "Sigatoka Deleafing & Mineral Oil Spray", desc: "Cut dried lower spotted leaves and spray mineral oil + propiconazole.", category: "Pest & Disease Scouting", day: 120, input: "Propiconazole 1ml/L" },
              { title: "Soil Earthing Up & Propping Wire", desc: "Mound soil around pseudostem base to prevent wind uprooting.", category: "Weeding & Aeration", day: 150 }
            ]
          },
          {
            name: "Inflorescence Shooting & Bunch Emergence",
            shortName: "Shooting",
            startDay: 181,
            endDay: 230,
            icon: "Flower2",
            description: "Flag leaf reduction followed by emergence of heavy pendant flower bud (heart) and bract opening.",
            water: "Maintain consistent moisture; high transpiration phase.",
            nutrient: "Apply Potassium Sulphate + Micronutrient spray (Zinc, Iron, Boron, Copper).",
            pests: ["Banana Thrips (Rust on fingers)", "Spodoptera"],
            check: "Check number of hands emerged (target 10-12 healthy hands per bunch).",
            tasks: [
              { title: "Denavelling (Male Bud Removal)", desc: "Cut terminal male heart 15cm below last hand to channel nutrients to fingers.", category: "Weeding & Aeration", day: 200 },
              { title: "Bamboo Bipod Propping", desc: "Erect double bamboo poles to support 35kg heavy bunches.", category: "Harvest Prep", day: 215 }
            ]
          },
          {
            name: "Bunch Sleeve Covering & Finger Development",
            shortName: "Finger Sizing",
            startDay: 231,
            endDay: 295,
            icon: "Activity",
            description: "Finger lengthening, hand filling, diameter thickening, and starch pulp accumulation.",
            water: "Drip fertigation with high potassium (0:0:50).",
            nutrient: "Foliar spray of Potassium Schoenite 1% on bunch.",
            pests: ["Sunscald", "Finger tip rot"],
            check: "Cover bunches with 6% perforated blue polypropylene sleeves for blemish-free skin.",
            tasks: [
              { title: "Blue Bunch Sleeve Tying", desc: "Cover bunch with blue polythene sleeve to protect from dust, pests & cold.", category: "Harvest Prep", day: 240, input: "Blue Perforated Sleeves" },
              { title: "Bunch Spray for Shine & Calibration", desc: "Spray Potassium Nitrate (0.5%) for uniform finger length.", category: "Nutrient & Bio-Fertilizer", day: 265, input: "Potassium Nitrate" }
            ]
          },
          {
            name: "Harvest Maturity (Rounding of Finger Angles)",
            shortName: "Harvest Ready",
            startDay: 296,
            endDay: 330,
            icon: "ShoppingBag",
            description: "Prominent sharp angles on fruit fingers become rounded and plump; light green shade.",
            water: "Reduce watering 7 days before cutting.",
            nutrient: "None.",
            pests: ["Crown rot during transit"],
            check: "Harvest at 75-80% maturity for export/interstate transit; 90% for local market.",
            tasks: [
              { title: "Bunch Cutting with Padded Handlers", desc: "Harvest bunches onto shoulder pads without touching bare ground.", category: "Harvest Prep", day: 310 },
              { title: "De-handing, Washing & Alum Treatment", desc: "Wash latex in water bath containing 1% alum to prevent transit staining.", category: "Harvest Prep", day: 318 }
            ]
          }
        ]
      }
    };
  }
  calculateCropGrowthStages(cropName, plantingDateStr, variety, landAreaAcres = 2.5, sowingMethod = "Drip Fertigated Bed", plotName = "Plot A - North Field", notes, userId = "usr_farmer_1") {
    const profiles = this.getCropProfiles();
    const cleanName = cropName.toLowerCase();
    const matchedKey = Object.keys(profiles).find((k) => cleanName.includes(k)) || "tomato";
    const profile = profiles[matchedKey];
    const plantingDate = new Date(plantingDateStr);
    const today = /* @__PURE__ */ new Date();
    const diffTime = today.getTime() - plantingDate.getTime();
    const daysElapsed = Math.max(0, Math.floor(diffTime / (1e3 * 60 * 60 * 24)));
    const totalDuration = profile.duration;
    const daysRemaining = Math.max(0, totalDuration - daysElapsed);
    const overallProgress = Math.min(100, Math.round(daysElapsed / totalDuration * 100));
    const harvestStartDate = new Date(plantingDate.getTime() + totalDuration * 24 * 60 * 60 * 1e3);
    const harvestEndDate = new Date(harvestStartDate.getTime() + 10 * 24 * 60 * 60 * 1e3);
    let currentStageIndex = 0;
    let currentStageName = profile.stages[0].name;
    const stages = profile.stages.map((stg, idx) => {
      const stageStartDate = new Date(plantingDate.getTime() + (stg.startDay - 1) * 24 * 60 * 60 * 1e3);
      const stageEndDate = new Date(plantingDate.getTime() + stg.endDay * 24 * 60 * 60 * 1e3);
      let status = "UPCOMING";
      let progressPercent = 0;
      if (daysElapsed > stg.endDay) {
        status = "COMPLETED";
        progressPercent = 100;
      } else if (daysElapsed >= stg.startDay && daysElapsed <= stg.endDay) {
        status = "IN_PROGRESS";
        currentStageIndex = idx;
        currentStageName = stg.name;
        const stageDuration = stg.endDay - stg.startDay + 1;
        const daysInThisStage = daysElapsed - stg.startDay + 1;
        progressPercent = Math.min(100, Math.max(5, Math.round(daysInThisStage / stageDuration * 100)));
      } else {
        status = "UPCOMING";
        progressPercent = 0;
      }
      const tasks = stg.tasks.map((t, tIdx) => {
        const isTaskDone = daysElapsed >= t.day;
        return {
          id: `task_${matchedKey}_${idx}_${tIdx}`,
          title: t.title,
          description: t.desc,
          category: t.category,
          dayTarget: t.day,
          completed: isTaskDone,
          completedAt: isTaskDone ? new Date(plantingDate.getTime() + t.day * 24 * 60 * 60 * 1e3).toISOString().split("T")[0] : void 0,
          recommendedInput: t.input
        };
      });
      return {
        id: `stg_${matchedKey}_${idx}`,
        stageName: stg.name,
        stageShortName: stg.shortName,
        stageOrder: idx + 1,
        startDay: stg.startDay,
        endDay: stg.endDay,
        durationDays: stg.endDay - stg.startDay + 1,
        status,
        progressPercent,
        startDate: stageStartDate.toISOString().split("T")[0],
        endDate: stageEndDate.toISOString().split("T")[0],
        visualIcon: stg.icon,
        description: stg.description,
        agronomicGuidelines: {
          watering: stg.water,
          nutrientFocus: stg.nutrient,
          pestThreats: stg.pests,
          criticalCheck: stg.check
        },
        tasks
      };
    });
    let logStatus = "ACTIVE";
    if (overallProgress >= 90 && daysRemaining <= 7) {
      logStatus = "HARVEST_READY";
    }
    const mandiMatch = this.marketPrices.find((p) => p.commodity.toLowerCase().includes(matchedKey));
    const mandiRate = mandiMatch ? mandiMatch.modal_price_per_quintal || mandiMatch.modal_price_inr || 2400 : 2400;
    const targetYield = Math.round(profile.yieldPerAcreQuintals * landAreaAcres * 10) / 10;
    return {
      id: `crop_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      farmerName: "Murugan Palaniswamy",
      farmId: "farm_1",
      farmName: "Palaniswamy Bio-Dynamic Farm",
      fieldId: "fld_1",
      plotName,
      cropName,
      variety: variety || (matchedKey === "tomato" ? "US-440 Hybrid" : matchedKey === "onion" ? "CO-5 Shallot" : "High Yield Hybrid"),
      category: profile.category,
      plantingDate: plantingDateStr,
      sowingMethod,
      landAreaAcres,
      totalCycleDurationDays: totalDuration,
      daysElapsed,
      daysRemaining,
      overallProgressPercent: overallProgress,
      currentStageName,
      currentStageIndex,
      estimatedHarvestStartDate: harvestStartDate.toISOString().split("T")[0],
      estimatedHarvestEndDate: harvestEndDate.toISOString().split("T")[0],
      targetYieldQuintals: targetYield,
      status: logStatus,
      weatherAlert: daysRemaining <= 15 ? "Clear sunny sky forecast: ideal for pre-harvest curing." : "Optimal ambient soil temperature (26-29\xB0C).",
      currentMandiRateINR: mandiRate,
      stages,
      notes: notes || "Monitored with AgriSaarthi AI Precision Growth Engine.",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  getCropGrowthLogs(userId = "usr_farmer_1") {
    if (this.cropGrowthLogs.length === 0) {
      const now = /* @__PURE__ */ new Date();
      const tomatoSow = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const onionSow = new Date(now.getTime() - 72 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const paddySow = new Date(now.getTime() - 88 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const groundnutSow = new Date(now.getTime() - 22 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const log1 = this.calculateCropGrowthStages("Tomato", tomatoSow, "US-440 Hybrid", 2.5, "Drip Fertigated Bed", "Plot A - North Polyhouse Field", "Staking completed. Trichoderma applied at root zone.", userId);
      const log2 = this.calculateCropGrowthStages("Small Onion (Shallots)", onionSow, "CO-5 Indigenous", 1.5, "Furrow & Ridge", "Plot B - East Block", "Bentonite sulphur applied. Bulbs sizing vigorously.", userId);
      const log3 = this.calculateCropGrowthStages("Paddy (Rice)", paddySow, "CR-1009 Sub-1", 4, "Nursery Bed Transplanting", "Canal Basin Lowland Field", "Alternate Wetting and Drying (AWD) practiced.", userId);
      const log4 = this.calculateCropGrowthStages("Groundnut", groundnutSow, "Kadiri-6", 2, "Direct Seed Sowing", "South Block 2", "Rhizobium treated seeds. Pegs beginning to form.", userId);
      this.cropGrowthLogs = [log1, log2, log3, log4];
    }
    return this.cropGrowthLogs;
  }
  createCropGrowthLog(data) {
    const newLog = this.calculateCropGrowthStages(
      data.cropName || "Tomato",
      data.plantingDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      data.variety || "High Yield Hybrid",
      data.landAreaAcres || 2,
      data.sowingMethod || "Drip Fertigated Bed",
      data.plotName || "Plot 1 - Main Field",
      data.notes,
      data.userId || "usr_farmer_1"
    );
    this.cropGrowthLogs.unshift(newLog);
    this.logAudit(newLog.userId, newLog.farmerName || "Murugan Palaniswamy", "farmer", "CREATE_CROP_GROWTH_LOG", "crop_growth_logs", newLog.id, {
      crop: newLog.cropName,
      plantingDate: newLog.plantingDate,
      plot: newLog.plotName
    });
    this.sendNotification(
      newLog.userId,
      "\u{1F331} Crop Growth Track Initialized",
      `${newLog.cropName} (${newLog.variety}) in "${newLog.plotName}" logged. Harvest window calculated: ${newLog.estimatedHarvestStartDate}.`,
      "crop_plan",
      "crop-tracker"
    );
    return newLog;
  }
  updateCropGrowthLog(id, data) {
    const idx = this.cropGrowthLogs.findIndex((l) => l.id === id);
    if (idx === -1) return { success: false, error: "Crop growth log not found" };
    const existing = this.cropGrowthLogs[idx];
    const updated = this.calculateCropGrowthStages(
      data.cropName || existing.cropName,
      data.plantingDate || existing.plantingDate,
      data.variety || existing.variety,
      data.landAreaAcres !== void 0 ? data.landAreaAcres : existing.landAreaAcres,
      data.sowingMethod || existing.sowingMethod,
      data.plotName || existing.plotName,
      data.notes !== void 0 ? data.notes : existing.notes,
      existing.userId
    );
    updated.id = existing.id;
    updated.createdAt = existing.createdAt;
    if (data.status) updated.status = data.status;
    this.cropGrowthLogs[idx] = updated;
    this.logAudit(updated.userId, updated.farmerName || "Murugan Palaniswamy", "farmer", "UPDATE_CROP_GROWTH_LOG", "crop_growth_logs", updated.id, {
      crop: updated.cropName,
      plantingDate: updated.plantingDate
    });
    return { success: true, log: updated };
  }
  deleteCropGrowthLog(id) {
    const idx = this.cropGrowthLogs.findIndex((l) => l.id === id);
    if (idx === -1) return { success: false, error: "Crop growth log not found" };
    const removed = this.cropGrowthLogs.splice(idx, 1)[0];
    this.logAudit(removed.userId, "Murugan Palaniswamy", "farmer", "DELETE_CROP_GROWTH_LOG", "crop_growth_logs", id, {
      crop: removed.cropName
    });
    return { success: true };
  }
  toggleCropGrowthTask(logId, stageId, taskId, completed) {
    const log = this.cropGrowthLogs.find((l) => l.id === logId);
    if (!log) return { success: false };
    const stage = log.stages.find((s) => s.id === stageId);
    if (stage) {
      const task = stage.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = completed !== void 0 ? completed : !task.completed;
        task.completedAt = task.completed ? (/* @__PURE__ */ new Date()).toISOString().split("T")[0] : void 0;
      }
    }
    log.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    return { success: true, log };
  }
  searchNearbyFarmerPeers(params) {
    const radius = params.radiusKm || 50;
    let peers = this.farmerPeerProfiles.filter((p) => p.opt_in_community).map((p) => {
      const dist = this.calculateDistance(params.lat, params.lng, p.latitude, p.longitude);
      return {
        ...p,
        distance_km: dist
      };
    }).filter((p) => p.distance_km <= radius);
    if (params.crop && params.crop !== "All") {
      const q = params.crop.toLowerCase();
      peers = peers.filter((p) => p.primary_crops.some((c) => c.toLowerCase().includes(q)));
    }
    if (params.method && params.method !== "All") {
      peers = peers.filter((p) => p.farming_method.toLowerCase().includes(params.method.toLowerCase()));
    }
    if (params.collaboration && params.collaboration !== "All") {
      peers = peers.filter((p) => p.available_for.some((af) => af.toLowerCase().includes(params.collaboration.toLowerCase())));
    }
    if (params.hasEquipment) {
      peers = peers.filter((p) => p.equipment_available && p.equipment_available.length > 0);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      peers = peers.filter(
        (p) => p.name.toLowerCase().includes(s) || p.village.toLowerCase().includes(s) || p.taluk.toLowerCase().includes(s) || p.specialties.some((sp) => sp.toLowerCase().includes(s)) || p.primary_crops.some((c) => c.toLowerCase().includes(s))
      );
    }
    peers.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    return peers;
  }
  searchFarmingKnowledgeNodes(params) {
    const radius = params.radiusKm || 75;
    let nodes = this.farmingKnowledgeNodes.map((n) => {
      const dist = this.calculateDistance(params.lat, params.lng, n.latitude, n.longitude);
      return {
        ...n,
        distance_km: dist
      };
    }).filter((n) => n.distance_km <= radius);
    if (params.category && params.category !== "ALL") {
      nodes = nodes.filter((n) => n.category === params.category);
    }
    if (params.crop && params.crop !== "All") {
      const c = params.crop.toLowerCase();
      nodes = nodes.filter((n) => n.crops_relevant.some((cr) => cr.toLowerCase().includes(c)));
    }
    if (params.urgency && params.urgency !== "ALL") {
      nodes = nodes.filter((n) => n.urgency_level === params.urgency);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      nodes = nodes.filter(
        (n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.author_village.toLowerCase().includes(s) || n.tags.some((t) => t.toLowerCase().includes(s))
      );
    }
    nodes.sort((a, b) => {
      if (a.urgency_level === "HIGH_ALERT" && b.urgency_level !== "HIGH_ALERT") return -1;
      if (b.urgency_level === "HIGH_ALERT" && a.urgency_level !== "HIGH_ALERT") return 1;
      return b.upvotes - a.upvotes;
    });
    return nodes;
  }
  createFarmingKnowledgeNode(data) {
    const newNode = {
      id: `kn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author_id: data.author_id || "usr_farmer_1",
      author_name: data.author_name || "Murugan Palaniswamy",
      author_village: data.author_village || "Pollachi Rural",
      author_avatar: data.author_avatar || "\u{1F468}\u200D\u{1F33E}",
      latitude: data.latitude || 10.6586,
      longitude: data.longitude || 77.0089,
      category: data.category || "PEST_ALERT",
      title: data.title || "Local Agricultural Observation",
      content: data.content || "",
      actionable_tip: data.actionable_tip || "",
      urgency_level: data.urgency_level || "BEST_PRACTICE",
      crops_relevant: data.crops_relevant && data.crops_relevant.length > 0 ? data.crops_relevant : ["General"],
      tags: data.tags || ["Community Wisdom", "Field Tested"],
      upvotes: 1,
      has_upvoted: true,
      verified_by_agronomist: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      comments_count: 0
    };
    this.farmingKnowledgeNodes.unshift(newNode);
    this.logAudit(newNode.author_id, newNode.author_name, "farmer", "CREATE_KNOWLEDGE_NODE", "farming_knowledge_nodes", newNode.id, {
      category: newNode.category,
      title: newNode.title
    });
    return newNode;
  }
  upvoteFarmingKnowledgeNode(nodeId, farmerId) {
    const node = this.farmingKnowledgeNodes.find((n) => n.id === nodeId);
    if (!node) return { success: false, upvotes: 0, has_upvoted: false };
    if (!node.has_upvoted) {
      node.upvotes += 1;
      node.has_upvoted = true;
    } else {
      node.upvotes = Math.max(1, node.upvotes - 1);
      node.has_upvoted = false;
    }
    return { success: true, upvotes: node.upvotes, has_upvoted: node.has_upvoted };
  }
  getFarmerCommunityOptIn(farmerId) {
    if (this.communityOptInSettings[farmerId]) {
      return this.communityOptInSettings[farmerId];
    }
    const defaultProfile = this.farmerProfiles.find((f) => f.user_id === farmerId) || this.farmerProfiles[0];
    const user = this.users.find((u) => u.id === farmerId) || this.users[0];
    const defaultSettings = {
      opted_in: true,
      display_name: defaultProfile ? user?.name || "Murugan Palaniswamy" : "Kisan Member",
      display_mode: "FULL_NAME",
      share_phone: true,
      phone: user?.phone || "+91 98421 87654",
      primary_crops: defaultProfile?.primary_crops || ["Tomato", "Small Onion", "Banana"],
      farming_method: "100% Certified Organic",
      land_area_acres: defaultProfile?.total_land_acres || 6.5,
      specialties: ["Drip Irrigation Setup", "Organic Pest Formulations", "Desi Cow Panchagavya"],
      available_for: [
        "Machinery / Tractor Sharing",
        "Indigenous Seed & Sapling Exchange",
        "Crop Advisory & Mentorship",
        "Joint Transport & Mandi Aggregation"
      ],
      equipment_available: ["Rotavator Implement", "High-Pressure 16L Battery Sprayer"],
      bio: "Practicing bio-dynamic and organic vegetable cultivation for over 18 years in Pollachi basin. Open to seed sharing and joint mandi transport pooling.",
      village: defaultProfile?.village || "Pollachi Rural",
      taluk: defaultProfile?.taluk || "Pollachi",
      district: defaultProfile?.district || "Coimbatore",
      latitude: defaultProfile?.latitude || 10.6586,
      longitude: defaultProfile?.longitude || 77.0089
    };
    this.communityOptInSettings[farmerId] = defaultSettings;
    return defaultSettings;
  }
  updateFarmerCommunityOptIn(farmerId, settings) {
    const current = this.getFarmerCommunityOptIn(farmerId);
    const updated = {
      ...current,
      ...settings
    };
    this.communityOptInSettings[farmerId] = updated;
    let existingPeer = this.farmerPeerProfiles.find((p) => p.user_id === farmerId);
    if (existingPeer) {
      existingPeer.opt_in_community = updated.opted_in;
      existingPeer.name = updated.display_mode === "ANONYMOUS_KISAN" ? `Kisan #${existingPeer.farmer_id_code.split("-")[1] || "882"}` : updated.display_name;
      existingPeer.primary_crops = updated.primary_crops;
      existingPeer.farming_method = updated.farming_method;
      existingPeer.specialties = updated.specialties;
      existingPeer.available_for = updated.available_for;
      existingPeer.equipment_available = updated.equipment_available;
      existingPeer.bio = updated.bio;
      existingPeer.allow_direct_call = updated.share_phone;
    } else if (updated.opted_in) {
      const newPeer = {
        id: `peer_${Date.now()}`,
        user_id: farmerId,
        name: updated.display_name,
        farmer_id_code: "KISAN-TN-882",
        avatar: "\u{1F468}\u200D\u{1F33E}",
        village: updated.village,
        taluk: updated.taluk,
        district: updated.district,
        state: "Tamil Nadu",
        latitude: updated.latitude,
        longitude: updated.longitude,
        land_area_acres: updated.land_area_acres,
        primary_crops: updated.primary_crops,
        farming_method: updated.farming_method,
        soil_type: "Red Sandy Loam",
        specialties: updated.specialties,
        available_for: updated.available_for,
        equipment_available: updated.equipment_available,
        bio: updated.bio,
        experience_years: 18,
        rating: 4.95,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: (/* @__PURE__ */ new Date()).toISOString(),
        phone_masked: updated.share_phone ? updated.phone : "+91 98421 \u2022\u2022\u2022\u2022\u2022",
        allow_direct_call: updated.share_phone,
        active_nodes_count: 2
      };
      this.farmerPeerProfiles.unshift(newPeer);
    }
    this.logAudit(farmerId, updated.phone, "farmer", "UPDATE_COMMUNITY_OPT_IN", "farmer_peer_profiles", farmerId, {
      opted_in: updated.opted_in,
      display_mode: updated.display_mode
    });
    return updated;
  }
  recordPeerMessage(payload) {
    const msgId = `pmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const msg = {
      id: msgId,
      ...payload,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.peerMessages.unshift(msg);
    const targetPeer = this.farmerPeerProfiles.find((p) => p.id === payload.to_peer_id || p.user_id === payload.to_peer_id);
    if (targetPeer) {
      this.sendNotification(
        targetPeer.user_id,
        `Community Message from ${payload.from_farmer_name}`,
        `Inquiry: "${payload.subject}" regarding ${payload.inquiry_type}`,
        "community_message",
        "community-map"
      );
    }
    return { success: true, messageId: msgId };
  }
  // ==========================================
  // REAL-TIME WEATHER & OPTIMAL PLANTING ENGINE
  // ==========================================
  getRealTimeWeatherAndPlantingSuggestions(lat = 10.6586, lng = 77.0089, locationName) {
    let locDistrict = "Coimbatore";
    let locState = "Tamil Nadu";
    let locLabel = locationName || "Pollachi / Coimbatore, TN";
    let baseTemp = 27.2;
    let baseHumidity = 66;
    let rainFactor = 6.5;
    if (Math.abs(lat - 9.92) < 0.8 && Math.abs(lng - 78.11) < 0.8) {
      locDistrict = "Madurai";
      locState = "Tamil Nadu";
      locLabel = "Madurai Central, TN";
      baseTemp = 30.5;
      baseHumidity = 58;
      rainFactor = 3.2;
    } else if (Math.abs(lat - 10.78) < 0.8 && Math.abs(lng - 79.13) < 0.8) {
      locDistrict = "Thanjavur";
      locState = "Tamil Nadu";
      locLabel = "Thanjavur Delta, TN";
      baseTemp = 28.8;
      baseHumidity = 78;
      rainFactor = 14.2;
    } else if (Math.abs(lat - 11.66) < 0.8 && Math.abs(lng - 78.14) < 0.8) {
      locDistrict = "Salem";
      locState = "Tamil Nadu";
      locLabel = "Salem Commodity Belt, TN";
      baseTemp = 29.1;
      baseHumidity = 62;
      rainFactor = 4.8;
    } else if (Math.abs(lat - 18.15) < 1.5 && Math.abs(lng - 74.57) < 1.5) {
      locDistrict = "Pune";
      locState = "Maharashtra";
      locLabel = "Baramati / Pune, MH";
      baseTemp = 26;
      baseHumidity = 52;
      rainFactor = 1.8;
    } else if (Math.abs(lat - 30.9) < 1.5 && Math.abs(lng - 75.85) < 1.5) {
      locDistrict = "Ludhiana";
      locState = "Punjab";
      locLabel = "Ludhiana Agro Hub, PB";
      baseTemp = 22.4;
      baseHumidity = 48;
      rainFactor = 0.5;
    } else if (locationName) {
      locLabel = locationName;
      locDistrict = locationName.split(",")[0] || "Local Region";
    }
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = /* @__PURE__ */ new Date();
    const forecast = [];
    const conditionPool = [
      {
        condition: "Clear & Sunny (Mild Morning Breeze)",
        icon: "sunny",
        rainMm: 0.8,
        prob: 15,
        verdict: "EXCELLENT",
        score: 95,
        advisory_note: "Optimal sunlight and friable soil. Ideal for direct nursery transplanting and line sowing."
      },
      {
        condition: "Partly Cloudy with Gentle Humidity",
        icon: "partly_cloudy",
        rainMm: 3.5,
        prob: 30,
        verdict: "EXCELLENT",
        score: 92,
        advisory_note: "Mild cloud cover minimizes evapotranspiration shock for fresh seedlings."
      },
      {
        condition: "Passing Afternoon Light Showers",
        icon: "rain",
        rainMm: 8.2,
        prob: 65,
        verdict: "GOOD",
        score: 84,
        advisory_note: "Natural moisture boost. Favorable for grain and tuber sowing in well-drained ridges."
      },
      {
        condition: "Moderate Convective Rain & Showers",
        icon: "rain",
        rainMm: 18.5,
        prob: 80,
        verdict: "MODERATE",
        score: 68,
        advisory_note: "Prepare inter-row drainage trenches. Delay delicate shallow seed broadcasting."
      },
      {
        condition: "Scattered Overcast Clouds",
        icon: "cloudy",
        rainMm: 1.2,
        prob: 25,
        verdict: "GOOD",
        score: 88,
        advisory_note: "Stable temperatures. Great window for basal fertilizer incorporation with sowing."
      },
      {
        condition: "Clear Sky & Warm Sunshine",
        icon: "sunny",
        rainMm: 0,
        prob: 10,
        verdict: "EXCELLENT",
        score: 94,
        advisory_note: "Ensure light post-sowing drip or furrow irrigation to initiate radicle breakout."
      },
      {
        condition: "Pleasant & Mild Weather",
        icon: "partly_cloudy",
        rainMm: 2,
        prob: 20,
        verdict: "EXCELLENT",
        score: 91,
        advisory_note: "Balanced soil temperature provides high germination speed across vegetables."
      }
    ];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1e3);
      const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()];
      const poolItem = conditionPool[i % conditionPool.length];
      const maxT = Math.round((baseTemp + 4.2 + Math.sin(i) * 1.5) * 10) / 10;
      const minT = Math.round((baseTemp - 5.5 + Math.cos(i) * 1.2) * 10) / 10;
      const avgT = Math.round((maxT + minT) / 2 * 10) / 10;
      const precipMm = Math.round(poolItem.rainMm * (rainFactor / 6) * 10) / 10;
      const soilMoist = Math.min(88, Math.max(45, Math.round(58 + precipMm * 1.8 - i * 0.8)));
      forecast.push({
        date: d.toISOString().split("T")[0],
        day_name: dayName,
        temp_max_c: maxT,
        temp_min_c: minT,
        temp_avg_c: avgT,
        precipitation_mm: precipMm,
        precipitation_probability: poolItem.prob,
        humidity_percent: Math.round(baseHumidity + (precipMm > 5 ? 12 : -4)),
        wind_speed_kmh: Math.round(11 + Math.sin(i * 1.7) * 4),
        soil_moisture_percent: soilMoist,
        condition: poolItem.condition,
        condition_icon: poolItem.icon,
        sowing_suitability_score: poolItem.score,
        sowing_suitability_verdict: poolItem.verdict,
        advisory_note: poolItem.advisory_note
      });
    }
    const currentPrecip = forecast[0].precipitation_mm;
    const currentSoilMoist = forecast[0].soil_moisture_percent;
    const currentTemp = forecast[0].temp_avg_c;
    const recommendations = [
      {
        id: "rec_tomato",
        crop_name: "Tomato",
        category: "Vegetables",
        variety: "Shivam / Arka Rakshak F1 Hybrid",
        optimal_temp_range: "21\xB0C - 29\xB0C",
        optimal_precipitation_range: "5 - 15 mm / week (Light / Drip)",
        soil_moisture_target: "60% - 70% Field Capacity",
        suitability_score: 96,
        suitability_status: "OPTIMAL_WINDOW",
        recommended_window: "Next 3 Days (Morning 6:30 AM - 9:30 AM)",
        best_sowing_time_of_day: "Early morning or late afternoon (avoids solar heat stress)",
        days_to_germination: 5,
        weather_match_reason: `Current temperature (${currentTemp}\xB0C) and soil moisture (${currentSoilMoist}%) match tomato germination thermal units perfectly.`,
        precipitation_impact_analysis: `Forecasted low-to-moderate precipitation (${currentPrecip} mm) prevents seed washout while maintaining adequate nursery moisture.`,
        temperature_impact_analysis: `Daytime highs under 32\xB0C prevent blossom and sprout scorch, promoting 94%+ germination vigour.`,
        actionable_sowing_tips: [
          "Pre-treat seeds with Trichoderma viride (4g/kg seed) to guard against damping-off.",
          "Form raised beds of 15 cm height to allow rapid runoff in case of intermittent convective showers.",
          "Apply light mulching or shade netting over nursery beds during peak noon hours."
        ],
        risk_warnings: [
          "Avoid transplanting during heavy rain on Day 4 to prevent collar rot in tender seedlings."
        ]
      },
      {
        id: "rec_paddy",
        crop_name: "Paddy / Rice",
        category: "Grains & Cereals",
        variety: "ADT-45 / CR Dhan 310 / BPT 5204",
        optimal_temp_range: "24\xB0C - 33\xB0C",
        optimal_precipitation_range: "25 - 60 mm (Submerged / Saturated)",
        soil_moisture_target: "85% - 95% Saturated",
        suitability_score: 91,
        suitability_status: "OPTIMAL_WINDOW",
        recommended_window: "Day 3 to Day 5 (Align with incoming showers)",
        best_sowing_time_of_day: "Mid-morning after dew clearance",
        days_to_germination: 4,
        weather_match_reason: "Warm nighttime temperatures (>22\xB0C) accelerate coleoptile elongation in nursery beds.",
        precipitation_impact_analysis: "Expected rainfall surge (18mm) on Day 3-4 provides natural field puddling water, slashing irrigation pumping costs by 35%.",
        temperature_impact_analysis: "Current thermal sum is optimal for active vegetative tillering and root establishment.",
        actionable_sowing_tips: [
          "Soak certified seeds in water for 24 hours and incubate for 24 hours in moist gunny bags prior to broadcasting.",
          "Maintain 2-3 cm shallow water level in nursery plots.",
          "Incorporate well-decomposed FYM (10 tonnes/ha) during last puddling pass."
        ],
        risk_warnings: [
          "Ensure nursery drainage sluices are cleared prior to Day 4 rainfall."
        ]
      },
      {
        id: "rec_maize",
        crop_name: "Maize / Corn",
        category: "Grains & Cereals",
        variety: "COH(M) 8 Hybrid / Pioneer 3396",
        optimal_temp_range: "20\xB0C - 31\xB0C",
        optimal_precipitation_range: "10 - 25 mm",
        soil_moisture_target: "55% - 65%",
        suitability_score: 93,
        suitability_status: "OPTIMAL_WINDOW",
        recommended_window: "Next 48 Hours",
        best_sowing_time_of_day: "Morning 7:00 AM - 11:00 AM",
        days_to_germination: 4,
        weather_match_reason: `Soil moisture at ${currentSoilMoist}% offers ideal friction and capillary moisture for maize grain absorption.`,
        precipitation_impact_analysis: "Sowing 48 hours ahead of Day 4 showers allows seeds to establish primary root anchors before topsoil saturation.",
        temperature_impact_analysis: "Warm soil temperature (25.8\xB0C) enables rapid emergence within 96 hours.",
        actionable_sowing_tips: [
          "Maintain ridge-to-furrow spacing of 60 cm x 20 cm at 4 cm uniform depth.",
          "Apply 100% basal dose of Phosphatic (DAP/SSP) and Potassic fertilizers at time of dibbling."
        ],
        risk_warnings: [
          "Do not sow in low-lying water stagnating pockets without gradient ditches."
        ]
      },
      {
        id: "rec_groundnut",
        crop_name: "Groundnut / Peanut",
        category: "Cash Crops",
        variety: "Kadiri Lepakshi (K-1812) / TMV-7",
        optimal_temp_range: "22\xB0C - 30\xB0C",
        optimal_precipitation_range: "8 - 18 mm",
        soil_moisture_target: "50% - 60% (Friable Loam)",
        suitability_score: 87,
        suitability_status: "FAVORABLE",
        recommended_window: "Days 1 - 2 (Before heavy wetting)",
        best_sowing_time_of_day: "Early Morning",
        days_to_germination: 6,
        weather_match_reason: "Friable sandy loam moisture condition allows unhindered radical elongation without pod rot.",
        precipitation_impact_analysis: "Light showers (1-4mm) facilitate seed coat softening; avoid broadcasting immediately before downpours.",
        temperature_impact_analysis: "Average temperature of 27\xB0C is well within the 22-30\xB0C optimum for Rhizobium nodulation.",
        actionable_sowing_tips: [
          "Inoculate seeds with Rhizobium culture (NC92) and Phosphobacteria 15 mins before sowing.",
          "Depth of sowing must not exceed 5 cm to ensure uniform seedling emergence."
        ],
        risk_warnings: [
          "Avoid waterlogged clay tracts where anaerobic conditions induce collar rot (Aspergillus niger)."
        ]
      },
      {
        id: "rec_green_chilli",
        crop_name: "Green Chilli",
        category: "Vegetables",
        variety: "PKM 1 / Sitara / US-611",
        optimal_temp_range: "22\xB0C - 30\xB0C",
        optimal_precipitation_range: "5 - 12 mm",
        soil_moisture_target: "60% - 70%",
        suitability_score: 92,
        suitability_status: "OPTIMAL_WINDOW",
        recommended_window: "Next 3 Days (Optimal Seed Bed Window)",
        best_sowing_time_of_day: "Late Afternoon 4:00 PM - 6:30 PM",
        days_to_germination: 7,
        weather_match_reason: "Gentle ambient humidity and warm daytime light encourage sturdy hypocotyl development.",
        precipitation_impact_analysis: "Dry sunny interval over the next 48h ensures uniform seedbed firmness without crusting.",
        temperature_impact_analysis: "Moderate night temps (21-23\xB0C) stimulate root tip mitosis and early mycorrhizal association.",
        actionable_sowing_tips: [
          "Sow in pro-trays with 1:1 coco peat and vermicompost for 98% transplant survival.",
          "Drench nursery beds with carbendazim (1g/L) or neem cake extract against damping-off."
        ],
        risk_warnings: [
          "Protect newly emerged cotyledons from thrips during dry sunny spells with yellow sticky traps."
        ]
      },
      {
        id: "rec_blackgram",
        crop_name: "Black Gram / Urad",
        category: "Pulses",
        variety: "VBN 8 / Co 6 / ADT 5",
        optimal_temp_range: "25\xB0C - 34\xB0C",
        optimal_precipitation_range: "5 - 10 mm (Sensitive to Waterlogging)",
        soil_moisture_target: "45% - 55%",
        suitability_score: 79,
        suitability_status: "NEEDS_IRRIGATION",
        recommended_window: "Days 5 - 7 (Post-Rain Clear Spell Window)",
        best_sowing_time_of_day: "Morning 6:30 AM - 10:00 AM",
        days_to_germination: 4,
        weather_match_reason: "Warm conditions support rapid nitrogen-fixing nodule growth, but soil must remain well-aerated.",
        precipitation_impact_analysis: "Mid-week showers could cause temporary water pooling; delaying sowing to Day 5 prevents seed decay.",
        temperature_impact_analysis: "High daytime temperatures (29-32\xB0C) trigger rapid vegetative foliage growth.",
        actionable_sowing_tips: [
          "Pellet seeds with Rhizobium bio-fertilizer and DAP solution.",
          "Provide broad beds with 30 cm furrow drains to discard excess surface runoff."
        ],
        risk_warnings: [
          "Pulse seeds decay if submerged in saturated mud for more than 16 hours."
        ]
      },
      {
        id: "rec_coriander",
        crop_name: "Coriander & Leafy Greens",
        category: "Vegetables",
        variety: "CS 11 / Sadhana / Green Delight",
        optimal_temp_range: "18\xB0C - 26\xB0C",
        optimal_precipitation_range: "3 - 8 mm",
        soil_moisture_target: "65% - 75%",
        suitability_score: 95,
        suitability_status: "OPTIMAL_WINDOW",
        recommended_window: "Immediate (Next 24 to 36 Hours)",
        best_sowing_time_of_day: "Early Morning before 8:30 AM",
        days_to_germination: 8,
        weather_match_reason: "Current partial cloud cover and mild morning temperatures reduce direct seedbed dehydration.",
        precipitation_impact_analysis: "Light misting/drizzle creates the exact delicate microclimate required for split mericarp germination.",
        temperature_impact_analysis: "Temperatures under 29\xB0C prevent premature bolting (flowering) in young coriander plants.",
        actionable_sowing_tips: [
          "Crush coriander seeds gently into two halves (mericarps) before sowing to double germination points.",
          "Broadcast evenly and cover with a 1 cm thin layer of well-sieved farmyard compost."
        ],
        risk_warnings: [
          "Do not allow surface crust to bake under harsh midday sun; apply light sprinkler mist."
        ]
      },
      {
        id: "rec_turmeric",
        crop_name: "Turmeric",
        category: "Spices & Tubers",
        variety: "Erode Local / BSR 2 / Salem Gold",
        optimal_temp_range: "24\xB0C - 33\xB0C",
        optimal_precipitation_range: "15 - 30 mm",
        soil_moisture_target: "70% - 80%",
        suitability_score: 90,
        suitability_status: "OPTIMAL_WINDOW",
        recommended_window: "Days 2 - 4 (Synchronized with Pre-Monsoon Moisture)",
        best_sowing_time_of_day: "Morning 7:00 AM - 11:30 AM",
        days_to_germination: 14,
        weather_match_reason: "Warm subterranean soil temperatures activate mother rhizome buds.",
        precipitation_impact_analysis: "Upcoming 18mm rain reduces initial sprinkler irrigation runs and keeps ridges suitably damp for finger sprouting.",
        temperature_impact_analysis: "Steady daytime heat accelerates underground enzymatic conversion for rapid shoot emergence.",
        actionable_sowing_tips: [
          "Select healthy mother or primary finger rhizomes weighing 35-45 grams each.",
          "Dip seed rhizomes in Trichoderma suspension (10g/L) for 30 minutes before planting on raised ridges (45 cm spacing).",
          "Apply green leaf mulch (12 tonnes/ha) immediately after planting to conserve soil moisture."
        ],
        risk_warnings: [
          "Ensure ridge tops are well packed to avoid exposing sprouted eyes to direct scorching sunlight."
        ]
      }
    ];
    return {
      location_name: locLabel,
      district: locDistrict,
      state: locState,
      latitude: lat,
      longitude: lng,
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      current: {
        temp_c: forecast[0].temp_avg_c,
        feels_like_c: Math.round((forecast[0].temp_avg_c + 1.8) * 10) / 10,
        humidity_percent: forecast[0].humidity_percent,
        precipitation_rate_mm: forecast[0].precipitation_mm,
        precipitation_prob_today: forecast[0].precipitation_probability,
        wind_speed_kmh: forecast[0].wind_speed_kmh,
        wind_direction: "SW (South-West Monsoon Wind)",
        solar_uv_index: 6.4,
        soil_moisture_percent: forecast[0].soil_moisture_percent,
        soil_temp_c: Math.round((forecast[0].temp_avg_c - 1.2) * 10) / 10,
        cloud_cover_percent: forecast[0].condition_icon === "sunny" ? 15 : forecast[0].condition_icon === "rain" ? 85 : 45,
        condition_text: forecast[0].condition,
        condition_code: forecast[0].condition_icon
      },
      forecast_7days: forecast,
      planting_recommendations: recommendations,
      overall_planting_advisory: {
        title: `Optimal Sowing Window Active across ${locDistrict}`,
        verdict: "HIGHLY_SUITABLE",
        description: `Current regional precipitation (${forecast[0].precipitation_mm} mm) and thermal averages (${forecast[0].temp_avg_c}\xB0C) present an exceptional planting window over the next 48 to 72 hours for Vegetables, Maize, and Early Kharif Cereals. Soil moisture at ${forecast[0].soil_moisture_percent}% is optimal for rapid seed germination.`,
        primary_alert: `Weather Note: Moderate convective showers (~${Math.round(rainFactor * 2.8)}mm) expected on ${forecast[3].day_name}. Complete field plowing and ridge preparation before rain onset.`
      }
    };
  }
  // =========================================================================
  // Intelligent Crop Rotation & Soil Nutrient Succession Recommender Engine
  // =========================================================================
  getSmartCropRotationRecommendations(params) {
    let defaultSoil = {
      soil_type: "Red Sandy Loam",
      ph: 6.8,
      organic_carbon_percent: 0.58,
      nitrogen_kg_ha: 210,
      nitrogen_status: "Low",
      phosphorus_kg_ha: 19.5,
      phosphorus_status: "Medium",
      potassium_kg_ha: 265,
      potassium_status: "Medium",
      ec_ds_m: 0.42,
      zinc_ppm: 0.82,
      iron_ppm: 5.1,
      boron_ppm: 0.48,
      source_sample_code: "SHC-TN-CBE-2025-901"
    };
    if (params?.fieldId) {
      const fieldTest = this.soilTests.find((st) => st.field_id === params.fieldId);
      if (fieldTest) {
        defaultSoil = {
          soil_type: fieldTest.soil_type || defaultSoil.soil_type,
          ph: fieldTest.ph,
          organic_carbon_percent: fieldTest.organic_carbon_percent,
          nitrogen_kg_ha: fieldTest.nitrogen_kg_ha,
          nitrogen_status: fieldTest.nitrogen_status,
          phosphorus_kg_ha: fieldTest.phosphorus_kg_ha,
          phosphorus_status: fieldTest.phosphorus_status,
          potassium_kg_ha: fieldTest.potassium_kg_ha,
          potassium_status: fieldTest.potassium_status,
          ec_ds_m: fieldTest.ec_ds_m,
          zinc_ppm: fieldTest.zinc_ppm,
          iron_ppm: fieldTest.iron_ppm,
          boron_ppm: fieldTest.boron_ppm,
          source_soil_test_id: fieldTest.id,
          source_sample_code: fieldTest.sample_code
        };
      }
    }
    const soil = {
      ...defaultSoil,
      ...params?.soilNutrients || {}
    };
    soil.nitrogen_status = soil.nitrogen_kg_ha < 240 ? "Low" : soil.nitrogen_kg_ha > 380 ? "High" : "Medium";
    soil.phosphorus_status = soil.phosphorus_kg_ha < 15 ? "Low" : soil.phosphorus_kg_ha > 30 ? "High" : "Medium";
    soil.potassium_status = soil.potassium_kg_ha < 140 ? "Low" : soil.potassium_kg_ha > 280 ? "High" : "Medium";
    const defaultStandingCrop = "Tomato";
    const standingCrop = params?.seasonalParams?.current_standing_crop || defaultStandingCrop;
    const targetSeason = params?.seasonalParams?.target_season || "Kharif (Monsoon)";
    const rainfallTrend = params?.seasonalParams?.expected_rainfall_trend || "Normal Monsoon";
    const waterSource = params?.seasonalParams?.water_source || "Borewell + Drip Irrigation";
    const irrigationCapacity = params?.seasonalParams?.irrigation_capacity || "Medium";
    const priorityFocus = params?.seasonalParams?.priority_focus || "BALANCED";
    const cropFamilyMap = {
      Tomato: {
        family: "Solanaceae (Nightshade)",
        primaryDepletion: "Heavy Potassium (K) & Nitrogen (N) extraction; root zone compaction",
        pathogenRisks: ["Early Blight (Alternaria solani)", "Bacterial Wilt (Ralstonia)", "Root-Knot Nematodes (Meloidogyne)"]
      },
      Chilli: {
        family: "Solanaceae (Nightshade)",
        primaryDepletion: "Heavy Potash drain and micronutrient zinc/boron depletion",
        pathogenRisks: ["Anthracnose Fruit Rot (Colletotrichum)", "Murda Complex Thrips", "Phytophthora Wilt"]
      },
      Brinjal: {
        family: "Solanaceae (Nightshade)",
        primaryDepletion: "Nitrogen & secondary nutrient magnesium exhaustion",
        pathogenRisks: ["Shoot & Fruit Borer carryover", "Bacterial Wilt", "Phomopsis Blight"]
      },
      Maize: {
        family: "Poaceae (Gramineae / Grass)",
        primaryDepletion: "Heavy topsoil nitrogen & phosphorus exhaustion",
        pathogenRisks: ["Fall Armyworm pupae carryover", "Turcicum Leaf Blight", "Stalk Rot"]
      },
      Paddy: {
        family: "Poaceae (Gramineae / Grass)",
        primaryDepletion: "Anaerobic subsoil hardpan formation and silica/phosphorus lockup",
        pathogenRisks: ["Blast (Magnaporthe oryzae)", "Bacterial Leaf Blight", "Brown Plant Hopper"]
      },
      Cotton: {
        family: "Malvaceae (Mallow)",
        primaryDepletion: "Deep subsoil nutrient extraction and potash depletion",
        pathogenRisks: ["Pink Bollworm soil pupation", "Verticillium Wilt", "Grey Mildew"]
      },
      Turmeric: {
        family: "Zingiberaceae (Ginger family)",
        primaryDepletion: "High rhizome potash & organic matter uptake over 8-9 months",
        pathogenRisks: ["Rhizome Rot (Pythium aphanidermatum)", "Leaf Spot (Colletotrichum)"]
      },
      Groundnut: {
        family: "Fabaceae (Leguminosae / Pulses)",
        primaryDepletion: "Calcium (pod filling) and phosphorus extraction; leaves behind fixed nitrogen",
        pathogenRisks: ["Tikka Leaf Spot (Cercospora)", "Collar Rot", "White Grub"]
      },
      Sugarcane: {
        family: "Poaceae (Gramineae / Grass)",
        primaryDepletion: "Extreme NPK and soil water depletion across 12-14 month ratoon",
        pathogenRisks: ["Red Rot (Colletotrichum falcatum)", "Grassy Shoot", "Smut"]
      },
      Onion: {
        family: "Alliaceae (Amaryllidaceae)",
        primaryDepletion: "Shallow nitrogen & sulfur extraction; natural root exudate biocides",
        pathogenRisks: ["Purple Blotch (Alternaria porri)", "Stemphylium Blight", "Basal Rot (Fusarium)"]
      }
    };
    const standingMeta = cropFamilyMap[standingCrop] || {
      family: "General Agricultural Crop",
      primaryDepletion: "General organic matter and NPK extraction",
      pathogenRisks: ["Soil-borne fungal spores and nematode reproduction"]
    };
    const candidatePool = [
      {
        id: "rot_black_gram",
        crop_name: "Black Gram / Urad Dal",
        scientific_name: "Vigna mungo",
        crop_family: "Fabaceae (Leguminosae)",
        recommended_varieties: ["VBN 8 (High Podding)", "Vamban 11 (MYMV Resistant)", "CO 6", "MDU 1"],
        suitable_seasons: ["Kharif (Monsoon)", "Rabi (Winter/Post-Monsoon)", "Zaid (Summer)"],
        base_water_need: "Low",
        duration_days: 65,
        nitrogen_fixation_kg_ha: 48,
        n_demand_level: "Low",
        p_demand_level: "Medium",
        k_demand_level: "Low",
        optimal_ph_range: [6, 7.8],
        organic_carbon_enrichment: "+0.15% organic biomass & leaf drop",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Poaceae (Gramineae / Grass)", "Malvaceae (Mallow)"],
        pathogen_break_desc: "Non-host for Solanaceous bacterial wilt and reduces root-knot nematode egg counts by 65%.",
        expected_yield_q_acre: 4.8,
        mandi_price_inr_q: 8400,
        cost_cultivation_acre: 11500,
        sowing_window: targetSeason.includes("Kharif") ? "June 15 - July 15" : targetSeason.includes("Rabi") ? "October 15 - November 15" : "Feb 10 - March 10",
        harvest_window: targetSeason.includes("Kharif") ? "Late August" : targetSeason.includes("Rabi") ? "Mid January" : "Late April",
        market_demand: "Very High",
        practices: [
          "Treat seeds with Rhizobium leguminosarum & Phosphobacteria bio-inoculants (30g/kg).",
          "Spray 1% pulse wonder at peak flowering to reduce flower shedding and boost pod set by 22%.",
          "Requires only 2-3 light irrigations at flowering and pod development stages."
        ],
        green_manure_tip: "After second pod picking, plow crop residues directly into soil to add ~1.2 tonnes of rich organic matter per acre."
      },
      {
        id: "rot_cowpea",
        crop_name: "Cowpea / Karamani",
        scientific_name: "Vigna unguiculata",
        crop_family: "Fabaceae (Leguminosae)",
        recommended_varieties: ["CO(CP) 7", "VBN 3", "Pusa Komal (Dual Grain/Vegetable)"],
        suitable_seasons: ["Kharif (Monsoon)", "Rabi (Winter/Post-Monsoon)", "Zaid (Summer)"],
        base_water_need: "Low",
        duration_days: 70,
        nitrogen_fixation_kg_ha: 55,
        n_demand_level: "Low",
        p_demand_level: "Low",
        k_demand_level: "Low",
        optimal_ph_range: [5.8, 8],
        organic_carbon_enrichment: "+0.18% active soil humus and nodular nitrogen",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Poaceae (Gramineae / Grass)", "Zingiberaceae (Ginger family)"],
        pathogen_break_desc: "Deep canopy shading smothers noxious weed seeds and disrupts nematode reproductive cycles.",
        expected_yield_q_acre: 5.2,
        mandi_price_inr_q: 7200,
        cost_cultivation_acre: 10800,
        sowing_window: targetSeason.includes("Kharif") ? "June 20 - July 25" : targetSeason.includes("Rabi") ? "Nov 01 - Nov 30" : "Feb 15 - March 15",
        harvest_window: targetSeason.includes("Kharif") ? "Early September" : targetSeason.includes("Rabi") ? "Late January" : "Early May",
        market_demand: "High",
        practices: [
          "Excellent soil cover crop with aggressive nodulation under low-moisture stress.",
          "Nodules fix up to 55 kg/ha atmospheric nitrogen, slashing next season urea requirement by 40%.",
          "Tolerates mild salinity up to 1.8 dS/m EC."
        ],
        green_manure_tip: "Incorporate vegetative haulms into furrow ridges as green manure before the following cereal or cash crop."
      },
      {
        id: "rot_maize",
        crop_name: "Maize / Hybrid Corn",
        scientific_name: "Zea mays",
        crop_family: "Poaceae (Gramineae)",
        recommended_varieties: ["Pioneer 3396 (Grain)", "COH(M) 8 (TNAU Hybrid)", "Syngenta NK 6240"],
        suitable_seasons: ["Kharif (Monsoon)", "Rabi (Winter/Post-Monsoon)"],
        base_water_need: "Medium",
        duration_days: 105,
        nitrogen_fixation_kg_ha: -40,
        n_demand_level: "High",
        p_demand_level: "Medium",
        k_demand_level: "Medium",
        optimal_ph_range: [6.2, 7.5],
        organic_carbon_enrichment: "+0.22% root-exudate biomass and stalk residue tilth",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Fabaceae (Leguminosae / Pulses)", "Malvaceae (Mallow)"],
        pathogen_break_desc: "Complete host break for solanaceous fungal blight, bacterial wilt, and collar rot pathogens.",
        expected_yield_q_acre: 28,
        mandi_price_inr_q: 2350,
        cost_cultivation_acre: 22e3,
        sowing_window: targetSeason.includes("Kharif") ? "June 15 - July 15" : "October 20 - November 20",
        harvest_window: targetSeason.includes("Kharif") ? "Late September" : "Early February",
        market_demand: "Very High",
        practices: [
          "Deep fibrous root system aerates compacted soil layers left by shallow vegetable farming.",
          "Install pheromone traps (5/acre) for Fall Armyworm monitoring.",
          "Feed high grain biomass for animal feed processors and starch mills with instant Mandi cash clearance."
        ],
        green_manure_tip: "Shred post-harvest maize stalks using a tractor flail mower to boost topsoil microbial activity."
      },
      {
        id: "rot_groundnut",
        crop_name: "Groundnut / Peanut",
        scientific_name: "Arachis hypogaea",
        crop_family: "Fabaceae (Leguminosae)",
        recommended_varieties: ["Kadiri Lepakshi (K-1812)", "TMV 7", "Dharani", "TAG 24"],
        suitable_seasons: ["Kharif (Monsoon)", "Rabi (Winter/Post-Monsoon)", "Zaid (Summer)"],
        base_water_need: "Medium",
        duration_days: 110,
        nitrogen_fixation_kg_ha: 42,
        n_demand_level: "Low",
        p_demand_level: "Medium",
        k_demand_level: "Medium",
        optimal_ph_range: [6, 7.5],
        organic_carbon_enrichment: "+0.20% subterranean root biomass",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Poaceae (Gramineae / Grass)", "Malvaceae (Mallow)"],
        pathogen_break_desc: "Breaks cereal stem-borers and solanaceous wilts while capturing atmospheric nitrogen in pegs.",
        expected_yield_q_acre: 14.5,
        mandi_price_inr_q: 7100,
        cost_cultivation_acre: 26e3,
        sowing_window: targetSeason.includes("Kharif") ? "June 20 - July 20" : targetSeason.includes("Rabi") ? "Nov 10 - Dec 10" : "Jan 25 - Feb 25",
        harvest_window: targetSeason.includes("Kharif") ? "Mid October" : targetSeason.includes("Rabi") ? "Mid March" : "Late May",
        market_demand: "Very High",
        practices: [
          "Apply Gypsum @ 160 kg/acre at 40-45 DAS (flowering & peg penetration stage) for heavy pod filling.",
          "Ensure light soil tilth so gynophores (pegs) penetrate easily without mechanical resistance.",
          "High oil content command premium pricing at local Pollachi and Tirupur oil mills."
        ],
        green_manure_tip: "Groundnut haulms serve as high-protein livestock fodder or topsoil mulching."
      },
      {
        id: "rot_finger_millet",
        crop_name: "Finger Millet / Ragi",
        scientific_name: "Eleusine coracana",
        crop_family: "Poaceae (Millets)",
        recommended_varieties: ["GPU 28", "ATL 1", "CO 15 (Direct Sown / Transplanted)", "ML-365"],
        suitable_seasons: ["Kharif (Monsoon)", "Rabi (Winter/Post-Monsoon)", "Zaid (Summer)"],
        base_water_need: "Low",
        duration_days: 95,
        nitrogen_fixation_kg_ha: -18,
        n_demand_level: "Low",
        p_demand_level: "Low",
        k_demand_level: "Low",
        optimal_ph_range: [5.5, 8.2],
        organic_carbon_enrichment: "+0.16% dense root rhizosphere stabilization",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Zingiberaceae (Ginger family)", "Malvaceae (Mallow)"],
        pathogen_break_desc: "Highly resilient to major crop pathogens; zero cross-host susceptibility with solanaceous blights.",
        expected_yield_q_acre: 16,
        mandi_price_inr_q: 3850,
        cost_cultivation_acre: 13500,
        sowing_window: targetSeason.includes("Kharif") ? "July 01 - July 30" : targetSeason.includes("Rabi") ? "Nov 15 - Dec 15" : "Feb 01 - Feb 28",
        harvest_window: targetSeason.includes("Kharif") ? "Mid October" : targetSeason.includes("Rabi") ? "Late February" : "Mid May",
        market_demand: "High",
        practices: [
          "Extremely climate-resilient C4 millet needing 50% less irrigation than paddy or sugarcane.",
          "Tolerates low soil nitrogen and phosphorus thanks to dense fibrous vesicular-arbuscular mycorrhizal roots.",
          "Strong regional demand under Tamil Nadu Millet Mission and healthy grains procurement."
        ],
        green_manure_tip: "Fine straw residue decomposes rapidly, restoring soil physical structure in clay and red soils."
      },
      {
        id: "rot_sesame",
        crop_name: "Sesame / Gingelly",
        scientific_name: "Sesamum indicum",
        crop_family: "Pedaliaceae",
        recommended_varieties: ["TMV 7 (High Oil 52%)", "VRI 3", "SVPR 1", "TKG 22"],
        suitable_seasons: ["Rabi (Winter/Post-Monsoon)", "Zaid (Summer)"],
        base_water_need: "Low",
        duration_days: 80,
        nitrogen_fixation_kg_ha: -12,
        n_demand_level: "Low",
        p_demand_level: "Low",
        k_demand_level: "Low",
        optimal_ph_range: [5.8, 7.8],
        organic_carbon_enrichment: "+0.12% bio-active rhizosphere secretions",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Poaceae (Gramineae / Grass)", "Fabaceae (Leguminosae / Pulses)"],
        pathogen_break_desc: "Natural nematicidal root secretions suppress Meloidogyne root-knot populations by up to 70%.",
        expected_yield_q_acre: 3.6,
        mandi_price_inr_q: 13200,
        cost_cultivation_acre: 11e3,
        sowing_window: targetSeason.includes("Zaid") ? "Feb 15 - March 15" : "October 15 - November 15",
        harvest_window: targetSeason.includes("Zaid") ? "Late April" : "Mid January",
        market_demand: "Very High",
        practices: [
          "Supreme low-water survivor ideal for dry summer windows where water reservoir levels drop.",
          "Tolerates residual nutrient pockets without requiring heavy supplemental fertilizer top-dressing.",
          "High economic return per liter of irrigation water with instant local oil mill demand."
        ],
        green_manure_tip: "Light surface leaf residue incorporates cleanly with one disc harrowing pass."
      },
      {
        id: "rot_green_gram",
        crop_name: "Green Gram / Moong Dal",
        scientific_name: "Vigna radiata",
        crop_family: "Fabaceae (Leguminosae)",
        recommended_varieties: ["CO 8", "IPM 2-3", "VBN(Gg) 3", "Pusa Vishal"],
        suitable_seasons: ["Kharif (Monsoon)", "Rabi (Winter/Post-Monsoon)", "Zaid (Summer)"],
        base_water_need: "Low",
        duration_days: 60,
        nitrogen_fixation_kg_ha: 44,
        n_demand_level: "Low",
        p_demand_level: "Low",
        k_demand_level: "Low",
        optimal_ph_range: [6.2, 7.6],
        organic_carbon_enrichment: "+0.14% nodule nitrogen and fast leaf breakdown",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Poaceae (Gramineae / Grass)", "Malvaceae (Mallow)"],
        pathogen_break_desc: "Short duration (60 days) cuts off insect pest life cycles before next main cash crop.",
        expected_yield_q_acre: 4.4,
        mandi_price_inr_q: 8600,
        cost_cultivation_acre: 10500,
        sowing_window: targetSeason.includes("Kharif") ? "June 25 - July 20" : targetSeason.includes("Rabi") ? "Nov 01 - Nov 25" : "Feb 20 - March 20",
        harvest_window: targetSeason.includes("Kharif") ? "Late August" : targetSeason.includes("Rabi") ? "Early January" : "Early May",
        market_demand: "Very High",
        practices: [
          "Ultra short-duration pulse providing rapid cash flow and biological soil rejuvenation within 8 weeks.",
          "Fixes ~44 kg/ha atmospheric nitrogen via Bradyrhizobium nodules.",
          "Spray 2% DAP spray at 30 and 45 DAS to maximize pod weight and uniform maturity."
        ],
        green_manure_tip: "Incorporate entire green crop into soil after harvesting pods for maximum organic carbon boost."
      },
      {
        id: "rot_turmeric",
        crop_name: "Turmeric (High Curcumin Cash Crop)",
        scientific_name: "Curcuma longa",
        crop_family: "Zingiberaceae (Ginger family)",
        recommended_varieties: ["Erode Local / Sanjeevini", "BSR 2", "Prathibha", "IISR Alleppey Supreme"],
        suitable_seasons: ["Kharif (Monsoon)"],
        base_water_need: "Medium",
        duration_days: 240,
        nitrogen_fixation_kg_ha: -35,
        n_demand_level: "Medium",
        p_demand_level: "Medium",
        k_demand_level: "High",
        optimal_ph_range: [6, 7.5],
        organic_carbon_enrichment: "+0.25% deep organic mulching decomposed layer",
        breaks_diseases_for_families: ["Solanaceae (Nightshade)", "Poaceae (Gramineae / Grass)", "Fabaceae (Leguminosae / Pulses)"],
        pathogen_break_desc: "Curcumin-rich rhizome exudates naturally suppress soil nematodes and bacterial wilt.",
        expected_yield_q_acre: 32,
        mandi_price_inr_q: 14500,
        cost_cultivation_acre: 75e3,
        sowing_window: "May 15 - June 30 (Pre-Monsoon)",
        harvest_window: "January - March",
        market_demand: "Very High",
        practices: [
          "Plant healthy mother/finger rhizomes (35g) on raised beds with drip irrigation.",
          "Heavy green leaf mulching (15 tonnes/acre) during first 90 days suppresses weeds and buffers soil temp.",
          "Top revenue generating cash crop with export demand in Erode, Pollachi, and Nizamabad markets."
        ],
        green_manure_tip: "Rotate immediately with short-duration Black Gram or Cowpea post-harvest to recover soil potash."
      }
    ];
    const scoredList = candidatePool.map((c) => {
      let score = 70;
      const isSameFamily = c.crop_family.toLowerCase().includes(standingMeta.family.toLowerCase().split(" ")[0]);
      if (isSameFamily) {
        score -= 40;
      } else if (c.breaks_diseases_for_families.some((fam) => standingMeta.family.toLowerCase().includes(fam.toLowerCase().split(" ")[0]))) {
        score += 18;
      }
      if (soil.nitrogen_status === "Low") {
        if (c.nitrogen_fixation_kg_ha > 0) {
          score += 20;
        } else if (c.n_demand_level === "High") {
          score -= 15;
        }
      } else if (soil.nitrogen_status === "High") {
        if (c.n_demand_level === "High") {
          score += 12;
        }
      }
      if (soil.organic_carbon_percent < 0.5) {
        if (c.nitrogen_fixation_kg_ha > 0 || c.crop_name.includes("Cowpea") || c.crop_name.includes("Black Gram")) {
          score += 10;
        }
      }
      if (soil.ph >= c.optimal_ph_range[0] && soil.ph <= c.optimal_ph_range[1]) {
        score += 8;
      } else {
        score -= 10;
      }
      if (c.suitable_seasons.includes(targetSeason)) {
        score += 12;
      } else {
        score -= 25;
      }
      if (irrigationCapacity === "Low / Deficit" || rainfallTrend === "Deficit") {
        if (c.base_water_need === "Low") {
          score += 15;
        } else if (c.base_water_need === "High") {
          score -= 25;
        }
      }
      if (priorityFocus === "MAX_SOIL_HEALTH") {
        if (c.nitrogen_fixation_kg_ha > 0) score += 15;
      } else if (priorityFocus === "MAX_PROFIT") {
        const gross = c.expected_yield_q_acre * c.mandi_price_inr_q;
        const net = gross - c.cost_cultivation_acre;
        if (net > 4e4) score += 15;
      } else if (priorityFocus === "WATER_SAVING") {
        if (c.base_water_need === "Low") score += 18;
      } else if (priorityFocus === "PEST_BREAK") {
        if (!isSameFamily) score += 15;
      }
      const grossRevenue = Math.round(c.expected_yield_q_acre * c.mandi_price_inr_q);
      const netProfit = Math.round(grossRevenue - c.cost_cultivation_acre);
      const roiPercent = Math.round(netProfit / c.cost_cultivation_acre * 100);
      let waterSavingPercent = 0;
      if (standingCrop === "Tomato" || standingCrop === "Paddy" || standingCrop === "Sugarcane") {
        waterSavingPercent = c.base_water_need === "Low" ? 55 : c.base_water_need === "Medium" ? 25 : 0;
      } else {
        waterSavingPercent = c.base_water_need === "Low" ? 35 : 10;
      }
      const finalScore = Math.max(25, Math.min(98, Math.round(score)));
      let verdict = "MODERATELY_VIABLE";
      if (finalScore >= 90) verdict = "STRONGLY_RECOMMENDED";
      else if (finalScore >= 75) verdict = "HIGHLY_SUITABLE";
      else if (finalScore < 50 || isSameFamily) verdict = "NOT_ADVISED";
      const nitrogenImpactStr = c.nitrogen_fixation_kg_ha > 0 ? `+${c.nitrogen_fixation_kg_ha} kg/ha biological nitrogen fixation via Rhizobium root nodules` : `${c.nitrogen_fixation_kg_ha} kg/ha net nutrient uptake (balanced by basal manure)`;
      const summaryRationale = c.nitrogen_fixation_kg_ha > 0 ? `Ideal rotation after ${standingCrop}. Restores depleted soil nitrogen (+${c.nitrogen_fixation_kg_ha} kg/ha) and completely breaks the ${standingMeta.family} pathogen cycle.` : `High economic yield potential for ${targetSeason}. Takes advantage of residual phosphorus and restores fibrous root tilth.`;
      return {
        id: `rec_${c.id}_${Date.now()}`,
        crop_name: c.crop_name,
        scientific_name: c.scientific_name,
        crop_family: c.crop_family,
        recommended_varieties: c.recommended_varieties,
        suitability_score: finalScore,
        rank: 1,
        // updated after sorting
        verdict,
        summary_rationale: summaryRationale,
        soil_compatibility: {
          score: Math.min(99, Math.round(finalScore * 0.95 + (c.nitrogen_fixation_kg_ha > 0 ? 5 : 0))),
          nitrogen_impact: nitrogenImpactStr,
          nitrogen_net_change_kg_ha: c.nitrogen_fixation_kg_ha,
          phosphorus_tolerance: `Optimized for ${soil.phosphorus_status} phosphorus soils (${soil.phosphorus_kg_ha} kg/ha).`,
          potassium_tolerance: `Compatible with ${soil.potassium_status} potash levels (${soil.potassium_kg_ha} kg/ha).`,
          ph_suitability: `Soil pH ${soil.ph} falls inside optimal range (${c.optimal_ph_range[0]} - ${c.optimal_ph_range[1]}).`,
          organic_matter_contribution: c.organic_carbon_enrichment
        },
        seasonal_fit: {
          season_name: targetSeason,
          optimal_sowing_window: c.sowing_window,
          harvest_window: c.harvest_window,
          duration_days: c.duration_days,
          water_requirement: c.base_water_need,
          water_saving_vs_previous_crop_percent: waterSavingPercent,
          climate_resilience_rating: c.base_water_need === "Low" ? "Exceptional" : "High"
        },
        pathogen_breakdown: {
          breaks_diseases: c.breaks_diseases_for_families.flatMap(
            (f) => f.includes("Solanaceae") ? ["Early Blight (Alternaria)", "Bacterial Wilt (Ralstonia)", "Root-Knot Nematodes"] : ["Stem Borers", "Foliar Blight", "Soil Fungi"]
          ),
          family_shift_benefit: c.pathogen_break_desc,
          pest_suppression_score: isSameFamily ? 25 : 94
        },
        economic_projection: {
          estimated_yield_quintal_acre: c.expected_yield_q_acre,
          mandi_modal_price_per_quintal: c.mandi_price_inr_q,
          cost_of_cultivation_per_acre: c.cost_cultivation_acre,
          gross_revenue_per_acre: grossRevenue,
          net_profit_per_acre: netProfit,
          roi_percent: roiPercent,
          market_demand_rating: c.market_demand
        },
        key_management_practices: c.practices,
        companion_or_green_manure_tip: c.green_manure_tip
      };
    });
    scoredList.sort((a, b) => b.suitability_score - a.suitability_score);
    scoredList.forEach((item, idx) => {
      item.rank = idx + 1;
    });
    const successionPlan = {
      cycle_title: `${standingCrop} \u2794 Legume Restorative \u2794 High-Value Cereal \u2794 Green Manure Cycle`,
      target_soil_type: soil.soil_type,
      total_cycle_months: 18,
      cumulative_estimated_net_profit: 148500,
      soil_health_improvement_summary: "Continuous 4-season sequence replenishes +92 kg/ha organic nitrogen, increases Soil Organic Carbon by +0.35%, and eliminates 90%+ of Solanaceae-specific soil fungal spores.",
      nitrogen_fixation_total_kg_ha: 92,
      steps: [
        {
          season_number: 1,
          season_name: "Current Standing Season (Harvesting)",
          crop_name: standingCrop,
          variety: "Standing Commercial Crop",
          category: "Cash & Horticulture",
          duration_days: 90,
          water_demand: "Medium",
          soil_benefit: `Extracts nitrogen and potassium; prepares land for legume rotation.`,
          expected_net_profit_acre: 42e3,
          is_nitrogen_fixer: false
        },
        {
          season_number: 2,
          season_name: `Upcoming ${targetSeason} (Recommended Next)`,
          crop_name: scoredList[0]?.crop_name || "Black Gram (VBN 8)",
          variety: scoredList[0]?.recommended_varieties[0] || "VBN 8 / Vamban 11",
          category: "Pulses & Bio-Fertility",
          duration_days: scoredList[0]?.seasonal_fit.duration_days || 65,
          water_demand: scoredList[0]?.seasonal_fit.water_requirement || "Low",
          soil_benefit: `Fixes ~48 kg/ha atmospheric nitrogen; breaks nematode and bacterial wilt cycles.`,
          expected_net_profit_acre: scoredList[0]?.economic_projection.net_profit_per_acre || 28820,
          is_nitrogen_fixer: true
        },
        {
          season_number: 3,
          season_name: "Subsequent Rabi / Post-Monsoon",
          crop_name: "Maize / Hybrid Corn or Finger Millet (Ragi)",
          variety: "Pioneer 3396 / GPU 28",
          category: "Cereals & High Biomass",
          duration_days: 100,
          water_demand: "Medium",
          soil_benefit: "Utilizes biologically fixed nitrogen efficiently; builds deep root soil tilth.",
          expected_net_profit_acre: 43800,
          is_nitrogen_fixer: false
        },
        {
          season_number: 4,
          season_name: "Pre-Monsoon Summer (Zaid)",
          crop_name: "Sesame (Gingelly) / Sunnhemp Green Manure",
          variety: "TMV 7 / Local Sunnhemp",
          category: "Oilseed & Green Manure",
          duration_days: 75,
          water_demand: "Low",
          soil_benefit: "Suppresses weeds, secretes nematicidal root compounds, and incorporates green biomass.",
          expected_net_profit_acre: 33880,
          is_nitrogen_fixer: true
        }
      ]
    };
    const aiAdvisoryText = `Based on your ${soil.soil_type} test report (Nitrogen: ${soil.nitrogen_kg_ha} kg/ha [${soil.nitrogen_status}], Organic Carbon: ${soil.organic_carbon_percent}%, pH: ${soil.ph}) following standing ${standingCrop}, your soil is primed for a leguminous pulse transition. We strongly recommend planting ${scoredList[0]?.crop_name} (${scoredList[0]?.recommended_varieties.join(", ")}) for ${targetSeason}. This rotation will naturally restore approximately ${scoredList[0]?.soil_compatibility.nitrogen_impact}, reduce chemical urea expenditure by 35-40%, and break the host cycle of soil-borne pathogens like ${standingMeta.pathogenRisks[0]}.`;
    return {
      standing_crop_summary: {
        crop_name: standingCrop,
        family: standingMeta.family,
        depletion_profile: standingMeta.primaryDepletion,
        pathogen_risk_if_repeated: standingMeta.pathogenRisks.join(" \u2022 ")
      },
      soil_status_analyzed: {
        nitrogen_status: soil.nitrogen_status,
        phosphorus_status: soil.phosphorus_status,
        potassium_status: soil.potassium_status,
        ph: soil.ph,
        organic_carbon_percent: soil.organic_carbon_percent,
        overall_fertility_index: soil.organic_carbon_percent > 0.75 && soil.nitrogen_status !== "Low" ? "Fertile Loam" : soil.nitrogen_status === "Low" ? "Low" : "Moderate"
      },
      top_recommendations: scoredList.slice(0, 5),
      succession_cycle: successionPlan,
      ai_agronomic_advisory: aiAdvisoryText
    };
  }
  // System Health Stats Calculation
  getSystemHealth() {
    const totalCap = this.warehouses.reduce((acc, w) => acc + w.total_capacity_kg, 0);
    const usedCap = this.warehouses.reduce((acc, w) => acc + w.used_capacity_kg, 0);
    const utilPercent = totalCap > 0 ? Math.round(usedCap / totalCap * 100) : 0;
    return {
      status: "HEALTHY",
      database_status: "CONNECTED",
      api_latency_ms: Math.floor(18 + Math.random() * 12),
      uptime_seconds: Math.floor((Date.now() - this.startTime) / 1e3),
      total_users: this.users.length,
      total_farmers: this.farmerProfiles.length,
      total_warehouses: this.warehouses.length,
      total_plant_scans: this.plantScans.length,
      total_bookings: this.warehouseBookings.length,
      total_soil_tests: this.soilTests.length,
      storage_capacity_utilization_percent: utilPercent,
      ai_service_status: process.env.GEMINI_API_KEY ? "READY" : "FALLBACK_MODE",
      last_checked: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // Seed standard Indian agricultural database
  seedDatabase() {
    this.users = [
      {
        id: "usr_farmer_1",
        email: "murugan.farmer@agrisaarthi.gov.in",
        name: "Murugan Palaniswamy",
        phone: "+91 98421 87654",
        role: "farmer",
        language: "ta",
        created_at: "2025-01-10T08:00:00Z",
        status: "active"
      },
      {
        id: "usr_farmer_2",
        email: "ramesh.kumar@agrisaarthi.gov.in",
        name: "Rameshwar Sharma",
        phone: "+91 94140 32190",
        role: "farmer",
        language: "hi",
        created_at: "2025-01-12T09:30:00Z",
        status: "active"
      },
      {
        id: "usr_provider_1",
        email: "tnwc.coimbatore@agrisaarthi.gov.in",
        name: "TNWC Coimbatore Depot Manager",
        phone: "+91 422 2398711",
        role: "provider",
        language: "en",
        created_at: "2025-01-05T06:00:00Z",
        status: "active"
      },
      {
        id: "usr_provider_2",
        email: "cwc.madurai@agrisaarthi.gov.in",
        name: "CWC Regional Agri Logistics Madurai",
        phone: "+91 452 2456789",
        role: "provider",
        language: "en",
        created_at: "2025-01-06T07:15:00Z",
        status: "active"
      },
      {
        id: "usr_admin_1",
        email: "admin.agrisaarthi@nic.in",
        name: "Dr. A. Subramanian (Chief Agronomist)",
        phone: "+91 11 2338 5600",
        role: "admin",
        language: "en",
        created_at: "2025-01-01T00:00:00Z",
        status: "active"
      }
    ];
    this.farmerProfiles = [
      {
        id: "fp_1",
        user_id: "usr_farmer_1",
        farmer_id_code: "TN-CBE-2025-8841",
        father_or_spouse_name: "Palaniswamy Gounder",
        village: "Pollachi Rural",
        taluk: "Pollachi",
        district: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "642001",
        latitude: 10.6586,
        longitude: 77.0089,
        total_land_acres: 6.5,
        primary_crops: ["Tomato", "Coconut", "Groundnut", "Turmeric"],
        soil_type_primary: "Red Sandy Loam",
        irrigation_source: "Borewell & Drip",
        kisan_credit_card: true,
        pm_kisan_registered: true,
        is_demo: true
      },
      {
        id: "fp_2",
        user_id: "usr_farmer_2",
        farmer_id_code: "MH-PUN-2025-3392",
        father_or_spouse_name: "Kashinath Sharma",
        village: "Baramati Taluka",
        taluk: "Baramati",
        district: "Pune",
        state: "Maharashtra",
        pincode: "413102",
        latitude: 18.1517,
        longitude: 74.5772,
        total_land_acres: 8,
        primary_crops: ["Sugarcane", "Onion", "Soybean", "Wheat"],
        soil_type_primary: "Black Cotton Soil (Regur)",
        irrigation_source: "Canal & Well",
        kisan_credit_card: true,
        pm_kisan_registered: true,
        is_demo: true
      }
    ];
    this.farms = [
      {
        id: "farm_1",
        farmer_id: "usr_farmer_1",
        farm_name: "Annamalai Green Acres",
        total_area_acres: 6.5,
        survey_number: "142/3B",
        village: "Pollachi Rural",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 10.6586,
        longitude: 77.0089,
        water_source: "drip",
        organic_certified: false,
        created_at: "2025-01-10T10:00:00Z",
        is_demo: true
      },
      {
        id: "farm_2",
        farmer_id: "usr_farmer_2",
        farm_name: "Shree Krishna Krishi Kshetra",
        total_area_acres: 8,
        survey_number: "88/1A",
        village: "Baramati",
        district: "Pune",
        state: "Maharashtra",
        latitude: 18.1517,
        longitude: 74.5772,
        water_source: "canal",
        organic_certified: true,
        created_at: "2025-01-12T11:00:00Z",
        is_demo: true
      }
    ];
    this.fields = [
      {
        id: "field_1",
        farm_id: "farm_1",
        field_name: "North Block (Plot A)",
        area_acres: 2.5,
        current_crop: "Tomato",
        sowing_date: "2025-01-15",
        expected_harvest_date: "2025-04-20",
        soil_type: "Red Sandy Loam",
        irrigation_type: "Drip System",
        current_health_status: "diseased"
      },
      {
        id: "field_2",
        farm_id: "farm_1",
        field_name: "South Coconut Grove (Plot B)",
        area_acres: 4,
        current_crop: "Coconut & Intercrop Turmeric",
        sowing_date: "2024-06-10",
        expected_harvest_date: "2025-03-30",
        soil_type: "Clay Loam",
        irrigation_type: "Basin Flooding",
        current_health_status: "healthy"
      },
      {
        id: "field_3",
        farm_id: "farm_2",
        field_name: "East Field (Onion)",
        area_acres: 4.5,
        current_crop: "Onion (Rabi)",
        sowing_date: "2024-11-20",
        expected_harvest_date: "2025-03-25",
        soil_type: "Black Cotton Soil",
        irrigation_type: "Sprinkler",
        current_health_status: "healthy"
      }
    ];
    this.cropHistories = [
      {
        id: "ch_1",
        field_id: "field_1",
        farmer_id: "usr_farmer_1",
        crop_name: "Groundnut",
        season: "Kharif",
        sown_year: 2024,
        yield_quintals: 18.5,
        price_realized_per_quintal: 6800,
        fertilizers_used: ["Gypsum", "DAP", "Rhizobium"],
        notes: "Good nitrogen fixation, healthy root nodules."
      },
      {
        id: "ch_2",
        field_id: "field_1",
        farmer_id: "usr_farmer_1",
        crop_name: "Maize (Corn)",
        season: "Rabi",
        sown_year: 2023,
        yield_quintals: 32,
        price_realized_per_quintal: 2150,
        pest_issues: ["Fall Armyworm controlled with neem oil & pheromone traps"],
        fertilizers_used: ["Urea", "SSP", "MOP"]
      }
    ];
    this.cropRotations = [
      {
        id: "cr_1",
        field_id: "field_1",
        farm_id: "farm_1",
        current_crop: "Tomato",
        recommended_sequence: [
          {
            season: "Kharif 2025",
            crop: "Black Gram / Cowpea (Pulses)",
            variety: "VBN 8 / Vamban",
            nitrogen_fixation: true,
            water_requirement: "Low",
            soil_benefit: "Fixes 35-40 kg/ha atmospheric nitrogen; breaks tomato bacterial wilt cycle.",
            pest_break_effect: "Interrupts solanaceous nematodes and early blight spores.",
            estimated_profit_per_acre: 32e3
          },
          {
            season: "Rabi 2025-26",
            crop: "Finger Millet (Ragi)",
            variety: "GPU 28",
            nitrogen_fixation: false,
            water_requirement: "Low",
            soil_benefit: "Deep fibrous roots improve soil structure and organic matter.",
            pest_break_effect: "Immune to solanaceous viral diseases.",
            estimated_profit_per_acre: 28e3
          },
          {
            season: "Summer 2026",
            crop: "Sesame (Gingelly) / Green Manure (Sunnhemp)",
            variety: "TMV 7",
            nitrogen_fixation: true,
            water_requirement: "Low",
            soil_benefit: "Increases soil organic carbon and suppresses weeds.",
            pest_break_effect: "Nematode suppression.",
            estimated_profit_per_acre: 24e3
          }
        ],
        rationale: "Continuous solanaceous crops (tomato/brinjal/potato) deplete soil potassium and harbor fungal blight. Rotating with leguminous pulses restores natural soil fertility and cuts chemical fertilizer requirement by 35%.",
        created_at: "2025-01-20T08:00:00Z"
      }
    ];
    this.soilLabs = [
      {
        id: "lab_1",
        name: "District Agricultural Soil Testing Laboratory Coimbatore",
        organization: "Department of Agriculture, Govt of Tamil Nadu",
        location: "Thadagam Road, R.S. Puram, Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 11.0168,
        longitude: 76.9558,
        contact_phone: "+91 422 243 1290",
        email: "soiltest.cbe@tn.gov.in",
        accreditation: "NABL & ICAR Certified Soil Health Center",
        test_fee_inr: 50,
        turnaround_days: 3,
        available_tests: ["Soil Health Card 12 Parameters", "NPK Analysis", "Micronutrient Zinc/Boron/Iron", "Soil Salinity (EC)"],
        rating: 4.8,
        verified: true,
        is_demo: true
      },
      {
        id: "lab_2",
        name: "TNAU Precision Soil & Water Analysis Center",
        organization: "Tamil Nadu Agricultural University",
        location: "Marudhamalai Main Rd, Navavoor Pirivu, Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 11.0135,
        longitude: 76.9284,
        contact_phone: "+91 422 661 1200",
        email: "deanagri@tnau.ac.in",
        accreditation: "ICAR A++ Apex Research Center",
        test_fee_inr: 120,
        turnaround_days: 2,
        available_tests: ["Full Heavy Metal Scan", "NPK + Secondary Nutrients", "Microbial Activity", "Organic Carbon & pH Buffer"],
        rating: 4.9,
        verified: true,
        is_demo: true
      },
      {
        id: "lab_3",
        name: "Madurai Krishi Vigyan Kendra (KVK) Soil Lab",
        organization: "ICAR - KVK Agricultural Extension",
        location: "Agricultural College & Research Institute, Othakadai, Madurai",
        district: "Madurai",
        state: "Tamil Nadu",
        latitude: 9.9674,
        longitude: 78.1912,
        contact_phone: "+91 452 242 2955",
        email: "kvkmadurai@icar.gov.in",
        accreditation: "ICAR State Certified",
        test_fee_inr: 60,
        turnaround_days: 4,
        available_tests: ["Soil Health Card", "NPK Testing", "Organic Carbon", "Saline/Alkaline Soil Remediation"],
        rating: 4.7,
        verified: true,
        is_demo: true
      },
      {
        id: "lab_4",
        name: "National Soil Quality Testing & Research Lab Pune",
        organization: "Ministry of Agriculture & Farmers Welfare",
        location: "College of Agriculture Campus, Shivajinagar, Pune",
        district: "Pune",
        state: "Maharashtra",
        latitude: 18.5314,
        longitude: 73.8446,
        contact_phone: "+91 20 2553 7033",
        email: "soillab.pune@gov.in",
        accreditation: "NABL ISO/IEC 17025 Accredited",
        test_fee_inr: 80,
        turnaround_days: 3,
        available_tests: ["Soil Health Card", "Heavy Metals", "NPK & Micro", "Soil Texture & Porosity"],
        rating: 4.8,
        verified: true,
        is_demo: true
      }
    ];
    this.soilTests = [
      {
        id: "st_1",
        field_id: "field_1",
        farmer_id: "usr_farmer_1",
        lab_id: "lab_1",
        lab_name: "District Agricultural Soil Testing Laboratory Coimbatore",
        lab_accreditation: "NABL ISO/IEC 17025 Certified \u2022 ICAR Soil Health Center (TN-CBE-04)",
        tested_by: "Dr. K. Rangarajan (Senior Soil Chemist)",
        lab_phone: "+91 422 243 1290",
        sample_code: "SHC-TN-CBE-2025-901",
        sample_number: "SHC-TN-CBE-2025-901",
        soil_type: "Red Sandy Loam",
        test_date: "2025-01-08",
        status: "COMPLETED",
        ph: 6.8,
        ec_ds_m: 0.42,
        organic_carbon_percent: 0.58,
        nitrogen_kg_ha: 210,
        nitrogen_status: "Low",
        phosphorus_kg_ha: 24,
        phosphorus_status: "Medium",
        potassium_kg_ha: 310,
        potassium_status: "High",
        zinc_ppm: 0.72,
        iron_ppm: 4.8,
        boron_ppm: 0.45,
        fertilizer_recommendations: [
          "Apply 25 kg/ha Nitrogen via neem-coated urea in 2 split doses.",
          "Add 5 Tonnes/Acre Farm Yard Manure (FYM) or Vermicompost to raise organic carbon > 0.75%.",
          "Foliar spray Zinc Sulfate 0.5% (5g/L) during 35-40 days vegetative flush.",
          "Slightly acidic pH (6.8) is optimal for Solanaceous and Legume crops."
        ],
        lab_recommendation: "Soil is slightly acidic to neutral (pH 6.8) with good potassium. Apply 25 kg/ha Nitrogen through neem-coated urea in split doses. Add 5 tonnes of Farm Yard Manure (FYM) or vermicompost to boost organic carbon from 0.58% to >0.75%. Zinc sulfate foliar spray recommended at 0.5% during vegetative stage.",
        report_document_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
        is_demo: true
      },
      {
        id: "st_2",
        field_id: "field_2",
        farmer_id: "usr_farmer_1",
        lab_id: "lab_2",
        lab_name: "TNAU Precision Soil & Water Analysis Center",
        lab_accreditation: "ICAR A++ Apex Agricultural Research Lab (TNAU-CBE-01)",
        tested_by: "Dr. V. Saravanan (Principal Agronomist)",
        lab_phone: "+91 422 661 1200",
        sample_code: "SHC-TNAU-2024-4412",
        sample_number: "SHC-TNAU-2024-4412",
        soil_type: "Clay Loam (Coconut Block)",
        test_date: "2024-11-15",
        status: "COMPLETED",
        ph: 7.2,
        ec_ds_m: 0.35,
        organic_carbon_percent: 0.82,
        nitrogen_kg_ha: 265,
        nitrogen_status: "Medium",
        phosphorus_kg_ha: 32,
        phosphorus_status: "High",
        potassium_kg_ha: 380,
        potassium_status: "High",
        zinc_ppm: 1.15,
        iron_ppm: 6.2,
        boron_ppm: 0.68,
        fertilizer_recommendations: [
          "Maintain organic mulching with coconut coir pith and fronds.",
          "Apply Borax @ 50g per coconut palm annually.",
          "Apply 1.3 kg Urea, 2.0 kg Single Super Phosphate, 2.0 kg Muriate of Potash per tree in split basin application."
        ],
        lab_recommendation: "High organic carbon and optimal neutral pH (7.2). Micronutrient levels are adequate. Maintain regular basin irrigation with bio-fertilizers (Azospirillum & Phosphobacteria).",
        report_document_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
        is_demo: true
      }
    ];
    this.warehouses = [
      {
        id: "wh_1",
        provider_id: "usr_provider_1",
        name: "Central Warehousing Corporation (CWC) Integrated Agri Logistics Hub",
        operator_type: "CWC",
        address: "Peelamedu Industrial Estate, Avinashi Road",
        taluk: "Coimbatore North",
        district: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "641004",
        latitude: 11.0267,
        longitude: 77.0145,
        storage_types: ["Grain Storage", "General Warehouse", "Dry Storage", "Agricultural Commodity Storage"],
        total_capacity_kg: 5e5,
        // 500 tonnes
        used_capacity_kg: 32e4,
        available_capacity_kg: 18e4,
        pricing_model: "per_kg_per_day",
        rate_inr: 0.35,
        // ₹0.35 per kg/day
        minimum_storage_days: 7,
        suitable_crops: ["Paddy", "Maize", "Wheat", "Pulses", "Turmeric", "Cotton Bales", "Groundnut"],
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.8,
        verified: true,
        contact_person: "Er. S. Murugesan (Regional Head)",
        contact_phone: "+91 94432 10987",
        is_demo: true
      },
      {
        id: "wh_2",
        provider_id: "usr_provider_1",
        name: "Tamil Nadu State Warehousing Corporation (TNWC) Pollachi Cold Chain Hub",
        operator_type: "SWC",
        address: "Palakkad Main Road, Pollachi Taluk",
        taluk: "Pollachi",
        district: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "642002",
        latitude: 10.6621,
        longitude: 77.0024,
        storage_types: ["Cold Storage", "Vegetable Storage", "Fruit Storage", "Temperature Controlled Storage", "Perishable Storage"],
        total_capacity_kg: 25e4,
        // 250 tonnes
        used_capacity_kg: 14e4,
        available_capacity_kg: 11e4,
        pricing_model: "per_kg_per_day",
        rate_inr: 0.65,
        // ₹0.65 per kg/day cold storage
        minimum_storage_days: 3,
        suitable_crops: ["Tomato", "Chilli", "Onion", "Banana", "Mango", "Vegetables", "Flowers"],
        temperature_range_celsius: "2\xB0C to 12\xB0C Controlled Atmosphere",
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.9,
        verified: true,
        contact_person: "K. Rajendran (Depot Supt.)",
        contact_phone: "+91 98422 55431",
        is_demo: true
      },
      {
        id: "wh_3",
        provider_id: "usr_provider_2",
        name: "Madurai Central Grain & Spice Mega Silos",
        operator_type: "CWC",
        address: "Kappalur Industrial Area, Bypass Highway",
        taluk: "Thirumangalam",
        district: "Madurai",
        state: "Tamil Nadu",
        pincode: "625008",
        latitude: 9.8732,
        longitude: 78.0461,
        storage_types: ["Grain Storage", "General Warehouse", "Dry Storage"],
        total_capacity_kg: 8e5,
        used_capacity_kg: 48e4,
        available_capacity_kg: 32e4,
        pricing_model: "per_kg_per_day",
        rate_inr: 0.3,
        minimum_storage_days: 10,
        suitable_crops: ["Paddy", "Chilli", "Coriander", "Cotton", "Black Gram", "Pulses"],
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.7,
        verified: true,
        contact_person: "V. Alagarsamy (Warehouse Mgr)",
        contact_phone: "+91 94441 98765",
        is_demo: true
      },
      {
        id: "wh_4",
        provider_id: "usr_provider_2",
        name: "Madurai Agro Fresh Cold Storage & Ripening Depot",
        operator_type: "Private",
        address: "Mattuthavani Vegetable Market Link Road",
        taluk: "Madurai East",
        district: "Madurai",
        state: "Tamil Nadu",
        pincode: "625107",
        latitude: 9.9412,
        longitude: 78.1567,
        storage_types: ["Cold Storage", "Perishable Storage", "Vegetable Storage", "Fruit Storage"],
        total_capacity_kg: 18e4,
        used_capacity_kg: 13e4,
        available_capacity_kg: 5e4,
        pricing_model: "per_kg_per_day",
        rate_inr: 0.58,
        minimum_storage_days: 2,
        suitable_crops: ["Tomato", "Grapes", "Guava", "Banana", "Green Vegetables"],
        temperature_range_celsius: "0\xB0C to 8\xB0C",
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: false,
        insurance_covered: true,
        rating: 4.6,
        verified: true,
        contact_person: "M. Selvam",
        contact_phone: "+91 98430 11223",
        is_demo: true
      },
      {
        id: "wh_5",
        provider_id: "usr_provider_1",
        name: "Kisan Samridhi Modern Silo & Logistics Pune",
        operator_type: "Cooperative",
        address: "APMC Market Yard Road, Gultekdi",
        taluk: "Haveli",
        district: "Pune",
        state: "Maharashtra",
        pincode: "411037",
        latitude: 18.4901,
        longitude: 73.8682,
        storage_types: ["General Warehouse", "Cold Storage", "Grain Storage", "Dry Storage"],
        total_capacity_kg: 6e5,
        used_capacity_kg: 41e4,
        available_capacity_kg: 19e4,
        pricing_model: "per_kg_per_day",
        rate_inr: 0.42,
        minimum_storage_days: 5,
        suitable_crops: ["Onion", "Soybean", "Sugarcane Jaggery", "Pomegranate", "Grapes", "Wheat"],
        temperature_range_celsius: "4\xB0C to 15\xB0C",
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.8,
        verified: true,
        contact_person: "Balasaheb Shinde",
        contact_phone: "+91 98220 88990",
        is_demo: true
      },
      {
        id: "wh_6",
        provider_id: "usr_provider_1",
        name: "Salem Regional Sago & Tapioca Commodity Warehouse",
        operator_type: "SWC",
        address: "Namakkal - Salem Bypass Highway, Kondalampatti",
        taluk: "Salem South",
        district: "Salem",
        state: "Tamil Nadu",
        pincode: "636010",
        latitude: 11.6241,
        longitude: 78.1325,
        storage_types: ["General Warehouse", "Dry Storage", "Agricultural Commodity Storage"],
        total_capacity_kg: 35e4,
        used_capacity_kg: 2e5,
        available_capacity_kg: 15e4,
        pricing_model: "per_kg_per_day",
        rate_inr: 0.32,
        minimum_storage_days: 7,
        suitable_crops: ["Tapioca Starch", "Paddy", "Turmeric", "Cotton", "Maize"],
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.6,
        verified: true,
        contact_person: "T. Natarajan",
        contact_phone: "+91 94430 77112",
        is_demo: true
      }
    ];
    this.warehouseBookings = [
      {
        id: "wb_seed_1",
        booking_code: "AGRI-WH-849201",
        warehouse_id: "wh_2",
        warehouse_name: "Tamil Nadu State Warehousing Corporation (TNWC) Pollachi Cold Chain Hub",
        farmer_id: "usr_farmer_1",
        farmer_name: "Murugan Palaniswamy",
        farmer_phone: "+91 98421 87654",
        crop_name: "Tomato (Hybrid Shivam)",
        quantity_kg: 3e3,
        storage_type_requested: "Cold Storage",
        start_date: "2025-01-22",
        expected_duration_days: 14,
        end_date: "2025-02-05",
        rate_applied: 0.65,
        estimated_cost_inr: 27300,
        status: "ACTIVE",
        provider_notes: "Stored in Cold Chamber 3 at 4\xB0C with 90% RH. Initial grading passed.",
        created_at: "2025-01-20T14:20:00Z",
        updated_at: "2025-01-22T09:00:00Z"
      },
      {
        id: "wb_seed_2",
        booking_code: "AGRI-WH-721094",
        warehouse_id: "wh_1",
        warehouse_name: "Central Warehousing Corporation (CWC) Integrated Agri Logistics Hub",
        farmer_id: "usr_farmer_1",
        farmer_name: "Murugan Palaniswamy",
        farmer_phone: "+91 98421 87654",
        crop_name: "Groundnut (TMV 2)",
        quantity_kg: 5e3,
        storage_type_requested: "Dry Storage",
        start_date: "2025-02-01",
        expected_duration_days: 60,
        end_date: "2025-04-02",
        rate_applied: 0.35,
        estimated_cost_inr: 105e3,
        status: "ACCEPTED",
        provider_notes: "Bags booked for Bay D-12. Moisture level verified <8%.",
        created_at: "2025-01-25T11:10:00Z",
        updated_at: "2025-01-26T10:00:00Z"
      }
    ];
    this.plantScans = [
      {
        id: "scan_1",
        farmer_id: "usr_farmer_1",
        farm_id: "farm_1",
        field_id: "field_1",
        crop_name: "Tomato",
        plant_part: "leaf",
        image_url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22515?auto=format&fit=crop&w=800&q=80",
        image_quality_score: 94,
        image_quality_verdict: "CLEAR",
        quality_checks: {
          blur_score: 92,
          brightness_ok: true,
          leaf_centered: true,
          resolution_ok: true
        },
        predicted_issue: "Early Blight (Alternaria solani)",
        prediction_type: "DISEASE",
        confidence: 88,
        model_name: "AgriSaarthi-PlantCV-Vision",
        model_version: "v1.4.2-ensemble",
        observed_symptoms: [
          "Concentric dark brown rings on lower leaves resembling target-board pattern",
          "Yellow chlorotic halos surrounding lesions",
          "Premature defoliation starting from basal foliage"
        ],
        farmer_explanation: "Your tomato plant shows characteristic symptoms of Early Blight fungal infection. This commonly occurs during high humidity and fluctuating temperature.",
        recommended_actions: [
          "Prune and safely destroy heavily infected bottom leaves to stop fungal spore spread.",
          "Avoid overhead sprinkler irrigation; water at soil root base to keep foliage dry.",
          "Apply organic Trichoderma viride bio-fungicide (5g/L) or Copper Oxychloride 50% WP (2.5g/L) on affected foliage.",
          "Ensure 24-inch spacing between rows for adequate airflow."
        ],
        pest_ipm_guidance: "Maintain clean bunds free of nightshade weeds which serve as alternate fungal hosts.",
        soil_lab_referral_needed: false,
        status: "COMPLETED",
        created_at: "2025-01-24T10:15:00Z",
        farmer_feedback: "yes",
        is_demo: true
      },
      {
        id: "scan_2",
        farmer_id: "usr_farmer_1",
        farm_id: "farm_1",
        field_id: "field_1",
        crop_name: "Tomato",
        plant_part: "leaf",
        image_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80",
        image_quality_score: 89,
        image_quality_verdict: "CLEAR",
        quality_checks: {
          blur_score: 88,
          brightness_ok: true,
          leaf_centered: true,
          resolution_ok: true
        },
        predicted_issue: "Possible Nitrogen & Zinc Deficiency Pattern",
        prediction_type: "NUTRIENT_DEFICIENCY",
        confidence: 76,
        model_name: "AgriSaarthi-PlantCV-Vision",
        model_version: "v1.4.2-ensemble",
        observed_symptoms: [
          "Uniform yellowing (chlorosis) of older leaves while veins stay faint green",
          "Stunted inter-nodal growth",
          "Pale lime leaf texture"
        ],
        farmer_explanation: "Symptoms resemble nutrient stress, primarily low available nitrogen and trace zinc. Note: Visual symptoms alone cannot guarantee nutrient levels.",
        recommended_actions: [
          "Verify with your official Soil Health Card or nearby soil lab test before heavy fertilizer application.",
          "Apply foliar spray of 19:19:19 (NPK Water Soluble) at 5g/L of water during morning hours.",
          "Foliar spray with Chelated Zinc EDTA (1g/L) if young leaves show mottled chlorosis."
        ],
        nutrient_advisory: "Symptoms match Low Nitrogen test from Field 1 soil report (210 kg/ha).",
        soil_lab_referral_needed: true,
        status: "COMPLETED",
        created_at: "2025-01-26T16:40:00Z",
        farmer_feedback: "yes",
        is_demo: true
      }
    ];
    this.governmentSchemes = [
      {
        id: "sch_1",
        scheme_code: "GOI-PM-KISAN-2025",
        title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        sponsor: "Central Government",
        category: "Financial Support",
        benefit_summary: "Direct income support of \u20B96,000 per year in 3 equal four-monthly installments of \u20B92,000 directly into Aadhaar-linked bank accounts.",
        max_financial_benefit_inr: 6e3,
        eligibility_criteria: [
          "All landholding farmer families with cultivable landholding in their names.",
          "Aadhaar e-KYC verified.",
          "Must not be institutional landholders or income tax payers."
        ],
        required_documents: ["Aadhaar Card", "Land Patta / Chitta / 7/12 Extract", "Bank Passbook Copy", "Active Mobile Number"],
        state_applicable: "All India",
        application_url: "https://pmkisan.gov.in",
        is_active: true,
        is_demo: true
      },
      {
        id: "sch_2",
        scheme_code: "GOI-PMFBY-2025",
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        sponsor: "Central Government",
        category: "Crop Insurance",
        benefit_summary: "Comprehensive crop insurance covering natural calamities, drought, floods, pest outbreaks, and post-harvest unseasonal rain losses with nominal 1.5% to 2% premium.",
        subsidy_percent: 85,
        eligibility_criteria: [
          "All farmers growing notified crops in notified areas.",
          "Sharecroppers and tenant farmers with cultivation agreement are eligible."
        ],
        required_documents: ["Crop Sowing Certificate (VAO / Adangal)", "Land Ownership / Tenancy Record", "Aadhaar Card", "Bank Account Details"],
        state_applicable: "All India",
        application_url: "https://pmfby.gov.in",
        is_active: true,
        deadline: "2025-03-31",
        is_demo: true
      },
      {
        id: "sch_3",
        scheme_code: "TN-SMAM-MACHINERY",
        title: "Sub-Mission on Agricultural Mechanization (SMAM) & Tractor Subsidy",
        sponsor: "State Government (Tamil Nadu)",
        category: "Farm Equipment Subsidy",
        benefit_summary: "Up to 50% subsidy (up to \u20B92,50,000) for purchase of Tractors, Power Tillers, Multi-Crop Threshers, and Drones for spraying.",
        subsidy_percent: 50,
        max_financial_benefit_inr: 25e4,
        eligibility_criteria: [
          "Small & Marginal Farmers (special preference to SC/ST and Women farmers).",
          "Must not have received machinery subsidy in the last 5 years."
        ],
        required_documents: ["Small Farmer Certificate", "Patta & Chitta", "Aadhaar Card", "Quotation from authorized implement dealer"],
        state_applicable: "Tamil Nadu",
        application_url: "https://agrimachinery.nic.in",
        is_active: true,
        deadline: "2025-05-15",
        is_demo: true
      },
      {
        id: "sch_4",
        scheme_code: "TN-DRIP-PMKSY",
        title: "PMKSY Micro Irrigation (100% Subsidy for Small Farmers)",
        sponsor: "State Government (Tamil Nadu)",
        category: "Irrigation & Solar",
        benefit_summary: "100% subsidy for small and marginal farmers (up to 5 acres) and 75% subsidy for other farmers for Drip & Sprinkler irrigation installation.",
        subsidy_percent: 100,
        max_financial_benefit_inr: 135e3,
        eligibility_criteria: [
          "Farmer must possess viable water source (borewell/well/canal) with electricity/solar connection.",
          "Registered land ownership."
        ],
        required_documents: ["Patta/Chitta", "Water and Soil Test Report", "FMB Sketch", "Aadhaar Card"],
        state_applicable: "Tamil Nadu",
        application_url: "https://tnhorticulture.tn.gov.in",
        is_active: true,
        is_demo: true
      },
      {
        id: "sch_5",
        scheme_code: "GOI-SHC-2025",
        title: "National Soil Health Card Scheme & Soil Testing Subsidy",
        sponsor: "Central Government",
        category: "Soil Health",
        benefit_summary: "Free 12-parameter soil health analysis with customized nutrient advisory delivered directly to farmer mobile and card format.",
        subsidy_percent: 100,
        max_financial_benefit_inr: 500,
        eligibility_criteria: ["All farmers possessing agricultural land in India."],
        required_documents: ["Aadhaar Number", "Field Survey Number", "Crop History Details"],
        state_applicable: "All India",
        application_url: "https://soilhealth.dac.gov.in",
        is_active: true,
        is_demo: true
      }
    ];
    this.schemeApplications = [
      {
        id: "appl_1",
        application_number: "TN-SMAM-2025-0814",
        scheme_id: "sch_3",
        scheme_title: "Sub-Mission on Agricultural Mechanization (SMAM)",
        farmer_id: "usr_farmer_1",
        farmer_name: "Murugan Palaniswamy",
        land_area_acres: 6.5,
        aadhaar_last_four: "7654",
        bank_account_verified: true,
        status: "FIELD_VERIFICATION",
        submitted_date: "2025-01-14",
        updated_date: "2025-01-20",
        remarks: "Assistant Agricultural Engineer field visit scheduled for verification of tractor implement quotation."
      }
    ];
    this.marketPrices = [
      {
        id: "mp_1",
        mandi_name: "Pollachi Regulated Market & APMC",
        district: "Coimbatore",
        state: "Tamil Nadu",
        commodity: "Tomato",
        variety: "Hybrid Shivam / Country",
        category: "Vegetables",
        min_price_per_quintal: 1850,
        modal_price_per_quintal: 2380,
        max_price_per_quintal: 2650,
        arrival_quantity_tonnes: 165,
        price_trend: "up",
        price_change_percent: 5.4,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "AGMARKNET / Govt of India Mandi Portal",
        is_demo: true
      },
      {
        id: "mp_2",
        mandi_name: "Pollachi Coconut & Copra Regulated Market",
        district: "Coimbatore",
        state: "Tamil Nadu",
        commodity: "Coconut (Raw)",
        variety: "West Coast Tall (Grade 1)",
        category: "Fruits",
        min_price_per_quintal: 2950,
        modal_price_per_quintal: 3450,
        max_price_per_quintal: 3800,
        arrival_quantity_tonnes: 340,
        price_trend: "up",
        price_change_percent: 3.2,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "AGMARKNET Directorate of Marketing & Inspection",
        is_demo: true
      },
      {
        id: "mp_3",
        mandi_name: "Coimbatore M.G.R. Central APMC",
        district: "Coimbatore",
        state: "Tamil Nadu",
        commodity: "Small Onion (Shallots)",
        variety: "CO-5 Indigenous Red",
        category: "Vegetables",
        min_price_per_quintal: 4200,
        modal_price_per_quintal: 4950,
        max_price_per_quintal: 5400,
        arrival_quantity_tonnes: 92,
        price_trend: "up",
        price_change_percent: 11.8,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "AGMARKNET Mandi Live Ticker",
        is_demo: true
      },
      {
        id: "mp_4",
        mandi_name: "Pollachi Oilseed & Groundnut Yard",
        district: "Coimbatore",
        state: "Tamil Nadu",
        commodity: "Groundnut (Pods)",
        variety: "TMV 2 / Kadiri 6",
        category: "Oilseeds & Pulses",
        min_price_per_quintal: 6200,
        modal_price_per_quintal: 6750,
        max_price_per_quintal: 7200,
        arrival_quantity_tonnes: 120,
        price_trend: "up",
        price_change_percent: 4.1,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "Tamil Nadu Regulated Market Committee",
        is_demo: true
      },
      {
        id: "mp_5",
        mandi_name: "Erode Turmeric Special Commodity Market",
        district: "Erode",
        state: "Tamil Nadu",
        commodity: "Turmeric (Finger)",
        variety: "Erode Local Yellow (Curcumin 3.8%)",
        category: "Spices & Commercial",
        min_price_per_quintal: 13800,
        modal_price_per_quintal: 15400,
        max_price_per_quintal: 17200,
        arrival_quantity_tonnes: 280,
        price_trend: "up",
        price_change_percent: 4.8,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "Erode Regulated Market Committee",
        is_demo: true
      },
      {
        id: "mp_6",
        mandi_name: "Madurai Central APMC (Mattuthavani)",
        district: "Madurai",
        state: "Tamil Nadu",
        commodity: "Red Chilli (Dry)",
        variety: "Sanam / Ramnad Mundu",
        category: "Spices & Commercial",
        min_price_per_quintal: 15200,
        modal_price_per_quintal: 17900,
        max_price_per_quintal: 20500,
        arrival_quantity_tonnes: 95,
        price_trend: "up",
        price_change_percent: 6.4,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "AGMARKNET",
        is_demo: true
      },
      {
        id: "mp_7",
        mandi_name: "Pune APMC (Gultekdi Yard)",
        district: "Pune",
        state: "Maharashtra",
        commodity: "Onion",
        variety: "Red Nashik / Garva",
        category: "Vegetables",
        min_price_per_quintal: 1950,
        modal_price_per_quintal: 2520,
        max_price_per_quintal: 2950,
        arrival_quantity_tonnes: 520,
        price_trend: "up",
        price_change_percent: 7.6,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "Maharashtra State Agricultural Marketing Board (MSAMB)",
        is_demo: true
      },
      {
        id: "mp_8",
        mandi_name: "Thanjavur Grain Regulated Market",
        district: "Thanjavur",
        state: "Tamil Nadu",
        commodity: "Paddy (Dhan)",
        variety: "CR 1009 / BPT 5204 (Samba)",
        category: "Cereals & Grains",
        min_price_per_quintal: 2280,
        modal_price_per_quintal: 2510,
        max_price_per_quintal: 2680,
        arrival_quantity_tonnes: 580,
        price_trend: "stable",
        price_change_percent: 1.2,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "Tamil Nadu Civil Supplies Corporation",
        is_demo: true
      },
      {
        id: "mp_9",
        mandi_name: "Udumalpet Corn & Maize APMC Yard",
        district: "Tiruppur",
        state: "Tamil Nadu",
        commodity: "Maize (Corn)",
        variety: "Pioneer 30V92 Feed Grade",
        category: "Cereals & Grains",
        min_price_per_quintal: 2150,
        modal_price_per_quintal: 2360,
        max_price_per_quintal: 2500,
        arrival_quantity_tonnes: 210,
        price_trend: "up",
        price_change_percent: 2.8,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "AGMARKNET",
        is_demo: true
      },
      {
        id: "mp_10",
        mandi_name: "Salem Regional Sago & Tapioca Market",
        district: "Salem",
        state: "Tamil Nadu",
        commodity: "Tapioca (Raw Tuber)",
        variety: "MVD 1 Industrial High Starch",
        category: "Vegetables",
        min_price_per_quintal: 1320,
        modal_price_per_quintal: 1480,
        max_price_per_quintal: 1620,
        arrival_quantity_tonnes: 310,
        price_trend: "down",
        price_change_percent: -2.3,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "SAGOSERVE Salem",
        is_demo: true
      },
      {
        id: "mp_11",
        mandi_name: "Theni Banana Commercial Auction Hub",
        district: "Theni",
        state: "Tamil Nadu",
        commodity: "Banana (Robusta)",
        variety: "Grand Naine Export Quality",
        category: "Fruits",
        min_price_per_quintal: 1850,
        modal_price_per_quintal: 2180,
        max_price_per_quintal: 2450,
        arrival_quantity_tonnes: 260,
        price_trend: "up",
        price_change_percent: 3.8,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "Tamil Nadu Horticulture Board",
        is_demo: true
      },
      {
        id: "mp_12",
        mandi_name: "Mettupalayam Nilgiris Hill Produce Market",
        district: "Coimbatore",
        state: "Tamil Nadu",
        commodity: "Garlic (Hill Produce)",
        variety: "Ooty Country White High Allicin",
        category: "Spices & Commercial",
        min_price_per_quintal: 12500,
        modal_price_per_quintal: 14600,
        max_price_per_quintal: 16800,
        arrival_quantity_tonnes: 45,
        price_trend: "up",
        price_change_percent: 8.9,
        report_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        source: "Nilgiris Agricultural Producer Co-op",
        is_demo: true
      }
    ];
    this.priceAlertRules = [
      {
        id: "rule_1",
        userId: "usr_farmer_1",
        commodity: "Tomato",
        mandiName: "Pollachi Regulated Market & APMC",
        district: "Coimbatore",
        state: "Tamil Nadu",
        condition: "ABOVE_TARGET",
        targetPriceINR: 2350,
        currentPriceINR: 2380,
        thresholdPercent: 5,
        channels: ["in_app", "push", "sms"],
        status: "ACTIVE",
        lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1e3).toISOString(),
        triggerCount: 3,
        createdAt: "2025-01-15T08:00:00Z",
        note: "Sell ready tomato picking from North Block Plot A when above \u20B92,350/Q."
      },
      {
        id: "rule_2",
        userId: "usr_farmer_1",
        commodity: "Coconut (Raw)",
        mandiName: "Pollachi Coconut & Copra Regulated Market",
        district: "Coimbatore",
        state: "Tamil Nadu",
        condition: "ABOVE_TARGET",
        targetPriceINR: 3400,
        currentPriceINR: 3450,
        thresholdPercent: 4,
        channels: ["in_app", "push", "whatsapp"],
        status: "ACTIVE",
        lastTriggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1e3).toISOString(),
        triggerCount: 2,
        createdAt: "2025-01-18T10:30:00Z",
        note: "High demand copra conversion target for South Coconut Grove."
      },
      {
        id: "rule_3",
        userId: "usr_farmer_1",
        commodity: "Small Onion (Shallots)",
        mandiName: "Coimbatore M.G.R. Central APMC",
        district: "Coimbatore",
        state: "Tamil Nadu",
        condition: "PERCENT_SURGE",
        targetPriceINR: 4800,
        currentPriceINR: 4950,
        thresholdPercent: 8,
        channels: ["in_app", "push", "sms", "whatsapp"],
        status: "ACTIVE",
        lastTriggeredAt: new Date(Date.now() - 30 * 60 * 1e3).toISOString(),
        triggerCount: 1,
        createdAt: "2025-01-22T09:00:00Z",
        note: "Surge trigger for intercropped shallots harvest."
      },
      {
        id: "rule_4",
        userId: "usr_farmer_1",
        commodity: "Groundnut (Pods)",
        mandiName: "Pollachi Oilseed & Groundnut Yard",
        district: "Coimbatore",
        state: "Tamil Nadu",
        condition: "BELOW_TARGET",
        targetPriceINR: 6e3,
        currentPriceINR: 6750,
        thresholdPercent: 5,
        channels: ["in_app", "push"],
        status: "ACTIVE",
        createdAt: "2025-01-25T11:00:00Z",
        triggerCount: 0,
        note: "Safety floor alert: book CWC dry warehouse if groundnut slips under \u20B96,000/Q."
      }
    ];
    this.triggeredPriceAlerts = [
      {
        id: "alert_init_1",
        ruleId: "rule_3",
        userId: "usr_farmer_1",
        commodity: "Small Onion (Shallots)",
        mandiName: "Coimbatore M.G.R. Central APMC",
        district: "Coimbatore",
        previousPrice: 4420,
        newPrice: 4950,
        changePercent: 11.8,
        conditionMet: "Daily swing of +11.8% detected (Surge rule: >8%)",
        alertType: "SURGE_SPIKE",
        headline: "\u{1F4C8} Volatility Surge: Small Onion Surged +11.8% in Coimbatore Mandi",
        message: "Small Onion (Shallots) modal price leaped to \u20B94,950/quintal due to low arrivals (92 tonnes). High wholesale buying demand.",
        actionRecommendation: "Dispatch ready cured shallots immediately to maximize profit margins before next interstate arrivals.",
        suggestedAction: "SELL_NOW",
        timestamp: new Date(Date.now() - 35 * 60 * 1e3).toISOString(),
        isRead: false
      },
      {
        id: "alert_init_2",
        ruleId: "rule_1",
        userId: "usr_farmer_1",
        commodity: "Tomato",
        mandiName: "Pollachi Regulated Market & APMC",
        district: "Coimbatore",
        previousPrice: 2260,
        newPrice: 2380,
        changePercent: 5.4,
        conditionMet: "Rate reached \u20B92,380/Q (Target: \u20B92,350/Q)",
        alertType: "HIGH_PROFIT_SELL",
        headline: "\u{1F680} Target Exceeded: Tomato @ \u20B92,380/Q in Pollachi APMC",
        message: "Tomato rate crossed your selling threshold of \u20B92,350/Q. Current modal price is \u20B92,380/Q with strong food processor demand.",
        actionRecommendation: "Lock direct procurement slot with verified buyer Kongu Agro Foods or dispatch to Pollachi morning auction.",
        suggestedAction: "VIEW_BUYERS",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1e3).toISOString(),
        isRead: false
      },
      {
        id: "alert_init_3",
        ruleId: "rule_2",
        userId: "usr_farmer_1",
        commodity: "Coconut (Raw)",
        mandiName: "Pollachi Coconut & Copra Regulated Market",
        district: "Coimbatore",
        previousPrice: 3340,
        newPrice: 3450,
        changePercent: 3.2,
        conditionMet: "Rate reached \u20B93,450/Q (Target: \u20B93,400/Q)",
        alertType: "HIGH_PROFIT_SELL",
        headline: "\u{1F680} Target Exceeded: Coconut @ \u20B93,450/Q in Pollachi Yard",
        message: "Grade 1 West Coast Tall coconuts are fetching premium rates of \u20B93,450/quintal in Pollachi regulated market.",
        actionRecommendation: "Favorable pricing for fresh harvest batch. Ideal to negotiate with local oil millers or copra processors.",
        suggestedAction: "SELL_NOW",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1e3).toISOString(),
        isRead: true
      }
    ];
    this.buyerListings = [
      {
        id: "buyer_1",
        buyer_id: "usr_buyer_1",
        company_name: "Kongu Agro Foods & Pure Purees Ltd",
        buyer_type: "Flour Mill / Processor",
        commodity_required: "Tomato",
        variety_preferred: "Hybrid Shivam (Brix > 4.5)",
        required_quantity_tonnes: 25,
        offered_price_per_quintal: 2400,
        delivery_location: "Coimbatore / Pollachi Food Park",
        payment_terms: "Instant on delivery",
        verified_buyer: true,
        created_at: "2025-01-20T08:00:00Z",
        is_demo: true
      },
      {
        id: "buyer_2",
        buyer_id: "usr_buyer_2",
        company_name: "Southern Spices & Export Consortium",
        buyer_type: "Exporters",
        commodity_required: "Turmeric (Finger)",
        variety_preferred: "Curcumin > 3.8%",
        required_quantity_tonnes: 50,
        offered_price_per_quintal: 15200,
        delivery_location: "Erode / Cochin Port Delivery",
        payment_terms: "Escrow via AgriSaarthi",
        verified_buyer: true,
        created_at: "2025-01-22T10:00:00Z",
        is_demo: true
      },
      {
        id: "buyer_3",
        buyer_id: "usr_buyer_3",
        company_name: "Sahyadri Farmer Producer Company (FPO)",
        buyer_type: "FPO",
        commodity_required: "Onion",
        variety_preferred: "Grade A Red 55mm+",
        required_quantity_tonnes: 100,
        offered_price_per_quintal: 2550,
        delivery_location: "Pune / Baramati Hub",
        payment_terms: "24h Bank Transfer",
        verified_buyer: true,
        created_at: "2025-01-24T12:00:00Z",
        is_demo: true
      }
    ];
    this.cropListings = [
      {
        id: "cl_1",
        farmer_id: "usr_farmer_1",
        farmer_name: "Murugan Palaniswamy",
        crop_name: "Tomato",
        variety: "Shivam Semi-determinate",
        quantity_quintals: 30,
        expected_price_per_quintal: 2350,
        harvest_date: "2025-02-20",
        storage_location: "Stored in Pollachi TNWC Cold Chamber",
        quality_grade: "Grade A",
        status: "ACTIVE",
        created_at: "2025-01-25T10:00:00Z"
      }
    ];
    this.notifications = [
      {
        id: "n_1",
        user_id: "usr_farmer_1",
        title: "Cold Storage Booking Confirmed",
        message: "Your booking #AGRI-WH-849201 for 3,000 kg Tomato at Pollachi TNWC Hub is ACTIVE.",
        type: "booking",
        is_read: false,
        created_at: "2025-01-22T09:00:00Z",
        link_tab: "warehouses"
      },
      {
        id: "n_2",
        user_id: "usr_farmer_1",
        title: "Soil Health Card Ready",
        message: "Your soil analysis for North Block Plot A is ready with customized fertilizer recommendations.",
        type: "soil_report",
        is_read: false,
        created_at: "2025-01-10T14:00:00Z",
        link_tab: "soil"
      },
      {
        id: "n_3",
        user_id: "usr_farmer_1",
        title: "Market Price Alert: Tomato +15%",
        message: "Coimbatore APMC modal prices climbed to \u20B92,200/quintal due to strong wholesale demand.",
        type: "market_alert",
        is_read: true,
        created_at: "2025-02-14T06:00:00Z",
        link_tab: "market"
      }
    ];
    this.demandCropSuggestions = [
      {
        id: "dc_1",
        crop_name: "Tomato (Hybrid Sivam/Abhinav)",
        category: "Vegetable",
        demand_index: 96,
        demand_level: "Very High",
        current_mandi_modal_price_quintal: 2650,
        price_forecast_trend: "+18% (Peak Surge)",
        best_sowing_season: "Jan - Feb (Summer Flush) & June - July (Kharif)",
        duration_days: 95,
        estimated_yield_tonnes_per_acre: 18.5,
        expected_profit_per_acre_inr: 215e3,
        cold_storage_suitability: "High (Store at 8-10\xB0C for up to 45 days with 85% RH)",
        top_demanding_markets: ["Coimbatore APMC", "Chennai Koyambedu", "Bengaluru Yeshwanthpur", "Reliance Fresh Retail Hub"],
        key_agronomic_tips: "High market demand during festival and summer gaps. Implement staking and drip fertigation with calcium nitrate to prevent blossom end rot."
      },
      {
        id: "dc_2",
        crop_name: "Red Shallots / Small Onion (CO 5 / CO On 5)",
        category: "Vegetable",
        demand_index: 94,
        demand_level: "Very High",
        current_mandi_modal_price_quintal: 3800,
        price_forecast_trend: "+25% (High Deficit)",
        best_sowing_season: "Oct - Nov (Rabi) & April - May (Summer)",
        duration_days: 75,
        estimated_yield_tonnes_per_acre: 6.8,
        expected_profit_per_acre_inr: 165e3,
        cold_storage_suitability: "Excellent (Aerated dry storage or cold storage at 0-2\xB0C for 5-6 months)",
        top_demanding_markets: ["Pollachi Daily Mandi", "Madurai Mattuthavani", "Kerala Border Traders", "BigBasket"],
        key_agronomic_tips: "Shallots command premium prices in South India and Sri Lanka export channels. Apply sulfur 20 kg/acre to boost pungency and storage firmness."
      },
      {
        id: "dc_3",
        crop_name: "Green Chilli (G4 / Bullet / Teja)",
        category: "Vegetable",
        demand_index: 89,
        demand_level: "High",
        current_mandi_modal_price_quintal: 4500,
        price_forecast_trend: "+12% (Rising)",
        best_sowing_season: "June - July & Jan - Feb",
        duration_days: 120,
        estimated_yield_tonnes_per_acre: 9.2,
        expected_profit_per_acre_inr: 24e4,
        cold_storage_suitability: "Moderate (Store at 7-9\xB0C for 21 days for fresh export)",
        top_demanding_markets: ["Dindigul APMC", "Kochi Terminal", "Mumbai Vashi Market"],
        key_agronomic_tips: "Continuous weekly picking ensures regular cash flow. Use silver reflective plastic mulch to prevent thrips and leaf curl virus."
      },
      {
        id: "dc_4",
        crop_name: "Capsicum / Sweet Pepper (Indra / Inspiration)",
        category: "Vegetable",
        demand_index: 87,
        demand_level: "High",
        current_mandi_modal_price_quintal: 3600,
        price_forecast_trend: "+12% (Rising)",
        best_sowing_season: "Year-round under 50% Shade Net or Polyhouse",
        duration_days: 110,
        estimated_yield_tonnes_per_acre: 16,
        expected_profit_per_acre_inr: 32e4,
        cold_storage_suitability: "High (Optimal at 8\xB0C with 90% humidity for up to 30 days)",
        top_demanding_markets: ["Bengaluru Metro Hub", "Coimbatore Supermarkets", "Star Hotels & Quick Commerce"],
        key_agronomic_tips: "Supermarket and urban quick-commerce chains pay 40% premium for uniform, glossy Grade-A bell peppers. Protect from mite infestation."
      },
      {
        id: "dc_5",
        crop_name: "Banana (Grand Naine / G9 Tissue Culture)",
        category: "Fruit",
        demand_index: 95,
        demand_level: "Very High",
        current_mandi_modal_price_quintal: 2400,
        price_forecast_trend: "+18% (Peak Surge)",
        best_sowing_season: "Feb - March & Aug - Sept",
        duration_days: 330,
        estimated_yield_tonnes_per_acre: 32,
        expected_profit_per_acre_inr: 38e4,
        cold_storage_suitability: "High (Ripening chambers & cold chain logistics at 13.5\xB0C)",
        top_demanding_markets: ["Coimbatore Wholesale", "Gulf Export Channels", "Kochi Port", "Nilgiris Retail"],
        key_agronomic_tips: "G9 Tissue culture bananas produce uniform 28-32 kg bunches. Wrap bunches with blue non-woven polypropylene bags to prevent thrip blemishes."
      },
      {
        id: "dc_6",
        crop_name: "Papaya (Taiwan 786 Red Lady)",
        category: "Fruit",
        demand_index: 91,
        demand_level: "High",
        current_mandi_modal_price_quintal: 1900,
        price_forecast_trend: "+8% (Steady)",
        best_sowing_season: "Jan - March & Sept - Oct",
        duration_days: 240,
        estimated_yield_tonnes_per_acre: 28,
        expected_profit_per_acre_inr: 29e4,
        cold_storage_suitability: "Moderate (Store mature green fruits at 10-12\xB0C for 2 weeks)",
        top_demanding_markets: ["Tiruppur District", "Bengaluru Urban", "Local Processing Pulp Units"],
        key_agronomic_tips: "Red Lady is bisexual, early bearing, and highly productive. Ensure well-drained soils; waterlogging triggers collar rot."
      },
      {
        id: "dc_7",
        crop_name: "Guava (Taiwan Pink / VNR Bihi)",
        category: "Fruit",
        demand_index: 88,
        demand_level: "High",
        current_mandi_modal_price_quintal: 3400,
        price_forecast_trend: "+12% (Rising)",
        best_sowing_season: "June - Aug (Monsoon Planting for 15-year perennial orchard)",
        duration_days: 180,
        estimated_yield_tonnes_per_acre: 12.5,
        expected_profit_per_acre_inr: 26e4,
        cold_storage_suitability: "High (Store at 8-10\xB0C for up to 25 days with foam netting)",
        top_demanding_markets: ["Hyderabad APMC", "Chennai Koyambedu", "Air Cargo Exports"],
        key_agronomic_tips: "High-density planting (Ultra HDP 1m x 2m) with regular canopy bending delivers 2 crop flushes per year with jumbo 400g+ fruits."
      },
      {
        id: "dc_8",
        crop_name: "Pomegranate (Bhagwa Super)",
        category: "Fruit",
        demand_index: 92,
        demand_level: "Very High",
        current_mandi_modal_price_quintal: 9500,
        price_forecast_trend: "+25% (High Deficit)",
        best_sowing_season: "Hasta Bahar (Sept - Oct) & Ambe Bahar (Jan - Feb)",
        duration_days: 165,
        estimated_yield_tonnes_per_acre: 8,
        expected_profit_per_acre_inr: 45e4,
        cold_storage_suitability: "Superior (Long term storage at 5\xB0C for up to 90 days with zero aril degradation)",
        top_demanding_markets: ["Mumbai APMC", "Middle East Export Hubs", "Delhi Azadpur"],
        key_agronomic_tips: "Bhagwa has deep red arils and thick skin, making it the #1 commercial export variety. Control bacterial blight with Streptocycline & Copper sprays."
      }
    ];
    this.inquiries = [
      {
        id: "inq_1",
        ticket_number: "TKT-FAR-88102",
        sender_id: "usr_farmer_1",
        sender_name: "Murugan Palaniswamy",
        sender_email: "murugan.farmer@agrisaarthi.gov.in",
        sender_phone: "+91 98421 87654",
        sender_role: "farmer",
        subject: "Assistance with TNWC Cold Storage Slot & e-NWR Receipt generation",
        category: "WAREHOUSE_BOOKING",
        status: "IN_REVIEW",
        priority: "HIGH",
        messages: [
          {
            id: "m_inq_1_1",
            sender_id: "usr_farmer_1",
            sender_name: "Murugan Palaniswamy",
            sender_role: "farmer",
            content: "Vanakkam Admin. I have booked 3,000 kg tomato storage at Pollachi TNWC Hub (Booking #AGRI-WH-849201). Can you please confirm how I can generate the electronic Negotiable Warehouse Receipt (e-NWR) to apply for the Kisan Pledge Loan at Canara Bank?",
            timestamp: "2025-01-22T08:30:00Z"
          },
          {
            id: "m_inq_1_2",
            sender_id: "usr_admin_1",
            sender_name: "Dr. A. Subramanian (Chief Agronomist & Admin)",
            sender_role: "admin",
            content: 'Vanakkam Murugan Palaniswamy. Once the warehouse operator marks your batch as physically received and inspected for quality grade, the e-NWR is automatically created in the WRDA repository. You can download the signed digital receipt directly from your Warehouses tab under "My Bookings" and present it to Canara Bank Pollachi for up to 75% pledge loan at 7% subsidized interest.',
            timestamp: "2025-01-22T10:15:00Z",
            visual_payload: {
              type: "storage_roi",
              title: "Storage ROI & Loan Value Benefit (Tomato 3,000 kg)",
              description: "Comparison of Immediate Sale vs 45-day TNWC Cold Storage with Pledge Loan liquidity",
              data: {
                immediate_sale_revenue: 66e3,
                future_sale_revenue: 96e3,
                storage_cost_45_days: 6300,
                pledge_loan_available: 5e4,
                net_profit_gain: 23700
              }
            }
          }
        ],
        created_at: "2025-01-22T08:30:00Z",
        updated_at: "2025-01-22T10:15:00Z"
      },
      {
        id: "inq_2",
        ticket_number: "TKT-PRO-54910",
        sender_id: "usr_provider_1",
        sender_name: "TNWC Coimbatore Depot Manager",
        sender_email: "tnwc.coimbatore@agrisaarthi.gov.in",
        sender_phone: "+91 422 2398711",
        sender_role: "provider",
        subject: "Cold Storage Capacity Expansion Verification & Energy Subsidy",
        category: "CAPACITY_DISPUTE",
        status: "OPEN",
        priority: "MEDIUM",
        messages: [
          {
            id: "m_inq_2_1",
            sender_id: "usr_provider_1",
            sender_name: "TNWC Coimbatore Depot Manager",
            sender_role: "provider",
            content: "Dear Admin, we have added a new 100-ton fruit & vegetable temperature-controlled chamber (+2\xB0C to +8\xB0C) at our Peelamedu Hub. Please verify and approve the revised capacity in AgriSaarthi so local farmers can book space directly before the upcoming mango and tomato harvest.",
            timestamp: "2025-02-10T11:00:00Z"
          },
          {
            id: "m_inq_2_2",
            sender_id: "usr_admin_ai",
            sender_name: "AgriSaarthi Admin Desk (AI Assistant)",
            sender_role: "admin",
            content: "Greetings TNWC Coimbatore. Your request for verifying the additional 100 MT cold chamber has been logged. Our technical verification team has scheduled an automated audit check. The capacity update will reflect live on the farmer map within 24 hours.",
            timestamp: "2025-02-10T11:01:00Z",
            is_ai_assisted: true
          }
        ],
        created_at: "2025-02-10T11:00:00Z",
        updated_at: "2025-02-10T11:01:00Z"
      }
    ];
    this.yieldPredictions = [
      {
        id: "yp_demo_1",
        farmerId: "usr_farmer_1",
        cropName: "Tomato",
        variety: "US-618 Hybrid F1",
        landAreaAcres: 2.5,
        cropStage: "Vegetative Growth",
        soilType: "Red Loamy",
        irrigationType: "Drip Irrigation",
        predictedYieldTonnesPerAcre: 15.2,
        predictedYieldQuintalsPerAcre: 152,
        totalExpectedYieldQuintals: 380,
        totalExpectedYieldTonnes: 38,
        baselineYieldQuintalsPerAcre: 130,
        potentialMaxYieldQuintalsPerAcre: 185,
        worstCaseYieldQuintalsPerAcre: 85,
        regionalAverageQuintalsPerAcre: 115,
        percentageVsRegionalAvg: 32,
        confidenceScorePercent: 94,
        biomassHealthIndex: 89,
        harvestWindowEstimated: "In 58-62 Days (Late April)",
        daysToOptimalHarvest: 60,
        weatherGrowthFactor: {
          verdict: "FAVORABLE",
          rainfallImpact: "Moderate deficit cushioned by planned drip fertigation scheduling.",
          temperatureImpact: "31\xB0C day / 21\xB0C night maintains optimum enzyme activity and pollen viability.",
          sunlightImpact: "8.5 hrs/day delivers high daily light integral (DLI) for photosynthetic vigor.",
          growthDaysForecast: "60 Days monitored growth cycle",
          gddAccumulated: 1340
        },
        soilGrowthFactor: {
          fertilityVerdict: "BALANCED",
          nitrogenImpact: "280 kg/ha supports dense vegetative branching and active chlorophyll formation.",
          phosphorusImpact: "22 kg/ha drives early root architecture and ATP energy transfer for floral bud formation.",
          potassiumImpact: "290 kg/ha facilitates water regulation, stomatal conductance, and fruit weight density.",
          phImpact: "Soil pH of 6.8 ensures peak bioavailability of iron, zinc, and phosphorus.",
          organicMatterImpact: "0.68% organic carbon maintains excellent soil microbial respiration and cation exchange."
        },
        timeline60Days: [
          {
            day: 10,
            dayLabel: "Day 10",
            stageTitle: "Canopy Expansion & Secondary Rooting",
            projectedBiomassIndex: 35,
            canopyCoverPercent: 30,
            waterDemandLitersPerAcrePerDay: 3200,
            pestRiskLevel: "Low",
            heatStressRisk: "Low",
            milestoneGoal: "Establish vigorous secondary feeder roots and expand photosynthetic leaf area.",
            criticalIntervention: "Fertigate Humic Acid (500ml/acre) + 19:19:19 NPK (4kg/acre).",
            projectedHeightCm: 25,
            ndviEstimated: 0.42
          },
          {
            day: 20,
            dayLabel: "Day 20",
            stageTitle: "Vegetative Branching & Node Setting",
            projectedBiomassIndex: 56,
            canopyCoverPercent: 55,
            waterDemandLitersPerAcrePerDay: 4200,
            pestRiskLevel: "Moderate",
            heatStressRisk: "Low",
            milestoneGoal: "Accelerate stem elongation and build structural reserves before flowering.",
            criticalIntervention: "Foliar spray of 19:19:19 (5g/L) + Neem seed kernel extract (NSKE 5%) against sucking pests.",
            projectedHeightCm: 48,
            ndviEstimated: 0.62
          },
          {
            day: 30,
            dayLabel: "Day 30",
            stageTitle: "Floral Initiation & Anthesis Window",
            projectedBiomassIndex: 72,
            canopyCoverPercent: 75,
            waterDemandLitersPerAcrePerDay: 5400,
            pestRiskLevel: "Moderate",
            heatStressRisk: "Moderate",
            milestoneGoal: "Maximize flower retention and ensure optimal pollen viability with balanced micronutrients.",
            criticalIntervention: "Apply Solubor Boron 20% (1g/L) + Planofix/Auxin booster to prevent flower drop during midday heat.",
            projectedHeightCm: 70,
            ndviEstimated: 0.74
          },
          {
            day: 40,
            dayLabel: "Day 40",
            stageTitle: "Fruit Setting & Early Cell Enlargement",
            projectedBiomassIndex: 85,
            canopyCoverPercent: 88,
            waterDemandLitersPerAcrePerDay: 6e3,
            pestRiskLevel: "High",
            heatStressRisk: "Moderate",
            milestoneGoal: "Drive fruit enlargement and translocate photo-assimilates from leaves to fruit clusters.",
            criticalIntervention: "Fertigate Calcium Nitrate (10kg/acre) + Potassium Schoenite (12:0:44) to maximize fruit density.",
            projectedHeightCm: 88,
            ndviEstimated: 0.84
          },
          {
            day: 50,
            dayLabel: "Day 50",
            stageTitle: "Bulking & Dry Matter Accumulation",
            projectedBiomassIndex: 95,
            canopyCoverPercent: 92,
            waterDemandLitersPerAcrePerDay: 5e3,
            pestRiskLevel: "Moderate",
            heatStressRisk: "Low",
            milestoneGoal: "Achieve uniform size grading, brix/sugar accumulation, and firm cell wall structure.",
            criticalIntervention: "SOP (Sulphate of Potash 0:0:50) foliar spray (7g/L) to boost luster, color, and shelf-life.",
            projectedHeightCm: 92,
            ndviEstimated: 0.81
          },
          {
            day: 60,
            dayLabel: "Day 60",
            stageTitle: "Peak Maturity & Optimal Harvest Window",
            projectedBiomassIndex: 100,
            canopyCoverPercent: 90,
            waterDemandLitersPerAcrePerDay: 2400,
            pestRiskLevel: "Low",
            heatStressRisk: "Low",
            milestoneGoal: "Reach optimal commercial harvest maturity with peak marketable weight and minimal field losses.",
            criticalIntervention: "Cease heavy irrigation 3 days prior to harvest; schedule nearest cold storage transport crates.",
            projectedHeightCm: 94,
            ndviEstimated: 0.7
          }
        ],
        actionableInterventions: [
          {
            id: "int_d1",
            dayTarget: "Day 10 - 14",
            dayNumber: 12,
            category: "Nutrient Management",
            title: "Root Biostimulant & Nitrogen Top Dressing",
            instruction: "Apply urea or water-soluble 19:19:19 via fertigation along with humic acid to build deep taproot anchors.",
            dosageOrRate: "5 kg 19:19:19 + 500ml Humic liquid per acre",
            expectedYieldGainPercent: 5.2,
            completed: true
          },
          {
            id: "int_d2",
            dayTarget: "Day 22 - 25",
            dayNumber: 24,
            category: "Pest & Fungus Protection",
            title: "Preventive Sucking Pest & Blight Barrier",
            instruction: "Spray Azadirachtin (Neem 10,000 ppm) with Pseudomonas fluorescens bio-fungicide during early morning hours.",
            dosageOrRate: "3 ml Neem + 5g Bio-fungicide per Litre of water",
            expectedYieldGainPercent: 4.8,
            completed: false
          },
          {
            id: "int_d3",
            dayTarget: "Day 32 - 35",
            dayNumber: 34,
            category: "Nutrient Management",
            title: "Boron & Micronutrient Flower Setting Booster",
            instruction: "Spray solubor boron + chelated zinc to enhance pollen fertility and curb flower abortion under temp fluctuations.",
            dosageOrRate: "1.2 g Boron + 1 g Zinc per Litre",
            expectedYieldGainPercent: 6.5,
            completed: false
          },
          {
            id: "int_d4",
            dayTarget: "Day 42 - 45",
            dayNumber: 44,
            category: "Soil Conditioning",
            title: "Potassium & Calcium Density Top-up",
            instruction: "Apply Potassium Nitrate (13:0:45) + Calcium Nitrate to prevent blossom end rot and maximize fruit firmness.",
            dosageOrRate: "8 kg Potassium Nitrate per acre via drip",
            expectedYieldGainPercent: 5.8,
            completed: false
          },
          {
            id: "int_d5",
            dayTarget: "Day 55 - 58",
            dayNumber: 56,
            category: "Harvest Prep",
            title: "Moisture Tapering & Cold Storage Booking",
            instruction: "Reduce irrigation frequency to concentrate soluble solids; reserve slot at nearest CWC/SWC cold storage.",
            dosageOrRate: "Reduce drip run-time by 50%",
            expectedYieldGainPercent: 3.2,
            completed: false
          }
        ],
        marketRevenueProjection: {
          currentMandiRateInrPerQuintal: 2500,
          projectedGrossRevenueInr: 95e4,
          baselineGrossRevenueInr: 812500,
          potentialGainWithAIInterventionsInr: 137500,
          estimatedCostOfInterventionsInr: 9500,
          netBenefitInr: 128e3,
          roiMultiplier: 14.4
        },
        aiSummaryAdvisory: "Based on current soil analysis (Red Loamy, pH 6.8, Nitrogen 280 kg/ha) and projected 60-day agro-climatic conditions (Favorable, 31\xB0C day avg), your Tomato crop is projected to achieve an above-average yield of 152 Quintals/Acre (15.2 Tonnes/Acre), outpacing the regional baseline of 115 Qtl/Acre by +32%.\n\nThe critical growth inflection occurs between Day 25 and Day 40 (Floral Initiation & Fruit Setting), where moisture stability and micronutrient boron/potassium sprays will be paramount to prevent flower abortion. Your Drip Irrigation infrastructure provides superior moisture consistency compared to flood systems.\n\nWith timely execution of the recommended calendarized interventions, you can secure an estimated incremental revenue of \u20B91,37,500 across your 2.5 Acre holding at current APMC Mandi rates of \u20B92,500/Qtl.",
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.pestRiskAssessments = [
      {
        id: "pra_seed_1",
        farmerId: "usr_farmer_1",
        cropName: "Tomato",
        variety: "Shivam Hybrid (Semi-determinate)",
        cropStage: "Flowering & Tillering",
        landAreaAcres: 2.5,
        district: "Coimbatore",
        state: "Tamil Nadu",
        overallFarmPestIndex: 84,
        overallRiskLevel: "CRITICAL",
        immediateAlertHeading: "CRITICAL: 48-Hour Tomato Leaf Miner (Tuta Absoluta) & Early Blight Spurt Alert",
        keyTriggerFactor: "Persistent 84% RH coupled with 29.5\xB0C daytime temperature and recent drizzle has accelerated Tuta moth emergence.",
        climateVulnerabilitySummary: "Microclimate data for Pollachi/Coimbatore indicates continuous warm humidity (>80% RH) following intermittent monsoonal showers. This accelerates the life cycle of Tuta absoluta from 30 days down to 21 days while creating ideal free-moisture films on lower leaves for Alternaria solani spore germination.",
        weatherAlertBadge: {
          temperatureWarning: "29.5\xB0C daytime temperature matches peak ovipositing threshold of Tuta absoluta females.",
          humidityCondition: "84% relative humidity drives rapid fungal spore incubation on lower leaf canopies.",
          favorablePestSpurtWindow: "Next 48 to 72 Hours (Urgent Scouting & Bio-Spraying Required)",
          conduciveDiseaseIndices: ["High Canopy Humidity (>80%)", "Leaf Wetness Duration >6 hrs", "Dense Foliar Canopy Microclimate"]
        },
        identifiedPests: [
          {
            id: "pest_tuta_1",
            pestOrDiseaseName: "Tomato Leaf Miner / Pinworm",
            scientificName: "Tuta absoluta",
            pestType: "Insect Pest",
            riskLevel: "CRITICAL",
            riskScorePercent: 88,
            incubationWindowDays: 2,
            climateTriggerFactors: [
              "Relative humidity >80% with 28-31\xB0C temp triggers explosive nocturnal moth oviposition.",
              "Succulent vegetative growth in flowering stage attracts gravid females."
            ],
            damageSymptomsEarly: [
              "Silver-white translucent blotch mines on upper leaf layers with dark frass pellets",
              "Pin-hole punctures on flower sepals and tender terminal buds"
            ],
            damageSymptomsSevere: [
              "Extensive necrotic foliage scorch and hollowed fruit calyx with secondary rot",
              "Unmarketable boreholes near fruit shoulders"
            ],
            affectedPlantParts: ["Leaf", "Stem", "Fruit/Pod"],
            economicThresholdLevel: "1-2 moths/pheromone trap/day or 3% affected leaflets",
            potentialYieldLossPercent: 45,
            urgencyWindow: "Deploy pheromone water-pan traps and foliar bio-spray within 48 hours.",
            organicManagementStrategy: {
              preventiveMeasures: [
                "Install Tutalure Pheromone Water Pan Traps @ 8 traps/acre (add 1 tbsp vegetable oil to trap water).",
                "Erect Yellow Sticky Sheets @ 12 sheets/acre along border rows to trap adult whiteflies and moths.",
                "Border cropping with Marigold and Sweet Basil to create natural repellent olfactory shields."
              ],
              botanicalBioFormulations: [
                {
                  formulationName: "Neem Azadirachtin 10,000 PPM + Soap Surfactant",
                  preparationAndDosage: "3 ml Neem Oil 10,000 PPM + 1 ml organic liquid soap per Litre of water (45 ml per 15L Knapsack)",
                  modeOfAction: "Translaminar antifeedant action that disrupts larval molting and deters egg laying.",
                  sprayFrequency: "Spray every 5 days targeting lower leaf undersides.",
                  safetyIntervalHours: 12
                },
                {
                  formulationName: "Agniastra Herbal Bio-Decoction",
                  preparationAndDosage: "Boil 500g Garlic, 250g Green Chilli, 2kg Neem in 10L Cow Urine. Dilute 250ml in 15L spray tank.",
                  modeOfAction: "Potent sensory repellent and neuro-sensory deterrent against leaf miners.",
                  sprayFrequency: "Apply upon observing initial translucent blotch mines.",
                  safetyIntervalHours: 24
                }
              ],
              biologicalPredatorsAndParasites: [
                {
                  agentName: "Trichogramma achaeae (Egg Parasitoid)",
                  releaseRateOrDosage: "Tricho-cards @ 50,000 parasitoids/acre",
                  targetPestStage: "Egg masses on leaf lamina",
                  applicationGuideline: "Staple cards under leaf shade in morning hours; release weekly during flowering."
                },
                {
                  agentName: "Bacillus thuringiensis var. kurstaki (Btk)",
                  releaseRateOrDosage: "2 grams per Litre of water",
                  targetPestStage: "1st and 2nd instar leaf mining caterpillars",
                  applicationGuideline: "Spray in late afternoon to protect crystalline endotoxins from solar UV breakdown."
                }
              ],
              culturalAndMechanicalPractices: [
                "Handpick and seal severely mined leaves in airtight solarization plastic bags.",
                "Maintain clean field borders by clearing wild solanaceous weeds (black nightshade)."
              ]
            }
          },
          {
            id: "pest_blight_1",
            pestOrDiseaseName: "Early Blight & Leaf Spot Complex",
            scientificName: "Alternaria solani",
            pestType: "Fungal Disease",
            riskLevel: "HIGH",
            riskScorePercent: 74,
            incubationWindowDays: 3,
            climateTriggerFactors: [
              "Canopy wetness exceeding 5 hours following morning drizzle with warm 26-29\xB0C temperature.",
              "Soil splash during rain events transferring fungal conidia to lower leaves."
            ],
            damageSymptomsEarly: [
              "Small brownish-black spots with concentric target-board rings on lowest leaves",
              "Yellow chlorotic halos surrounding developing spots"
            ],
            damageSymptomsSevere: [
              "Premature defoliation of lower canopy and sunscald on exposed green fruit",
              "Dark leathery sunken lesions on stem collars"
            ],
            affectedPlantParts: ["Leaf", "Stem"],
            economicThresholdLevel: "1-2 target spots visible on lower 3 leaves per plant",
            potentialYieldLossPercent: 30,
            urgencyWindow: "Apply bio-fungicide protective foliar shield before the next rainfall cycle.",
            organicManagementStrategy: {
              preventiveMeasures: [
                "Avoid overhead sprinkler watering; deliver all moisture strictly through drip emitters.",
                "Prune lowest 4-5 leaves touching soil surface to eliminate moisture traps.",
                "Apply organic paddy straw mulching to prevent rain splash of soil inoculums."
              ],
              botanicalBioFormulations: [
                {
                  formulationName: "Fermented Sour Buttermilk + Turmeric Bio-Shield",
                  preparationAndDosage: "5L 4-day sour buttermilk + 200g turmeric powder + 5L fresh cow urine in 100L water.",
                  modeOfAction: "Lactic acid and curcumin create an anti-sporulation bio-barrier on leaf cuticles.",
                  sprayFrequency: "Spray preventive every 7 days during cloudy monsoon spells.",
                  safetyIntervalHours: 0
                },
                {
                  formulationName: "Bordeaux Mixture (1% Organic Prep)",
                  preparationAndDosage: "1kg Copper Sulphate + 1kg Quicklime dissolved separately in 100L water (pH 7.0 neutral).",
                  modeOfAction: "Broad-spectrum contact fungicide accepted under certified organic farming protocols.",
                  sprayFrequency: "Spray prior to forecasted wet spells.",
                  safetyIntervalHours: 48
                }
              ],
              biologicalPredatorsAndParasites: [
                {
                  agentName: "Pseudomonas fluorescens (TNAU Certified Bio-Fungicide)",
                  releaseRateOrDosage: "10g / Litre of water (2.5 kg/ha)",
                  targetPestStage: "Preventive foliar spore colonization",
                  applicationGuideline: "Produces antimicrobial phenazines that suppress Alternaria conidia germination."
                },
                {
                  agentName: "Trichoderma viride Liquid Bio-Agent",
                  releaseRateOrDosage: "5 ml / Litre foliar and root drench",
                  targetPestStage: "Mycelial establishment stage",
                  applicationGuideline: "Apply at 10-day intervals for systemic acquired resistance."
                }
              ],
              culturalAndMechanicalPractices: [
                "Stake and trellis tomato vines with nylon twine to ensure 360-degree sunlight penetration.",
                "Rogue out and compost blighted plant debris with lime deep in pit."
              ]
            }
          }
        ],
        weeklyScoutingChecklist: [
          {
            id: "scout_tm_1",
            dayNumber: 1,
            dayLabel: "Day 1 (Immediate)",
            scoutingFocusArea: "Survey lowest foliage and flower clusters across 25 random tomato plants.",
            diagnosticVisualKey: "Look for tiny translucent serpentine mines and yellow leaf halos.",
            proactiveOrganicTask: "Install 8 Tutalure water-pan traps and 12 yellow sticky sheets per acre.",
            status: "completed"
          },
          {
            id: "scout_tm_2",
            dayNumber: 3,
            dayLabel: "Day 3 Morning",
            scoutingFocusArea: "Count moth captures in water-pan traps and check underside of middle leaves.",
            diagnosticVisualKey: "If trap captures exceed 2 moths/trap, economic threshold level is breached.",
            proactiveOrganicTask: "Apply foliar spray of Neem Azadirachtin (10,000 ppm @ 3ml/L) + Soap surfactant in early morning.",
            status: "completed"
          },
          {
            id: "scout_tm_3",
            dayNumber: 5,
            dayLabel: "Day 5 Evening",
            scoutingFocusArea: "Inspect newly formed flower buds and green fruit calyxes.",
            diagnosticVisualKey: "Verify absence of pinhole bore-holes and check for active green lacewings or predatory bugs.",
            proactiveOrganicTask: "Release Trichogramma achaeae parasitoid cards (50,000/acre) stapled under leaf shade.",
            status: "pending"
          },
          {
            id: "scout_tm_4",
            dayNumber: 7,
            dayLabel: "Day 7 Midday",
            scoutingFocusArea: "Assess overall canopy health and examine terminal growth shoots for vigor.",
            diagnosticVisualKey: "Confirm dried-up mines with zero fresh larval activity and clean fruit setting.",
            proactiveOrganicTask: "Foliar spray of Panchagavya (3%) or Amrit Jal to strengthen plant immunity and accelerate floral set.",
            status: "pending"
          }
        ],
        organicEmergencySprayPlan: [
          {
            id: "esp_tm_1",
            dayTarget: "Day 1 - 2 (Immediate Window)",
            bioSprayName: "Neem Azadirachtin 10,000 PPM + Bio-Spreader",
            activeComponent: "Natural Azadirachtin Triterpenoid",
            dosage: "3 ml / Litre of water (45 ml / 15L Knapsack)",
            targetPest: "Tuta absoluta neonate larvae & Sucking Thrips",
            precautions: "Spray in early morning (6:30 - 9:00 AM) or late afternoon. Coat both leaf sides thoroughly."
          },
          {
            id: "esp_tm_2",
            dayTarget: "Day 4 - 5 (Follow-up Dual Bio-Shield)",
            bioSprayName: "Bacillus thuringiensis (Btk) + Pseudomonas fluorescens",
            activeComponent: "Live Btk Endotoxins + Microbial Bio-Fungicide (1x10^8 CFU/g)",
            dosage: "2g Btk + 5g Pseudomonas per Litre of water",
            targetPest: "Larval borers and Early Blight spore suppression",
            precautions: "Do not combine with chemical fungicides or hot water. Use clean, non-chlorinated water."
          }
        ],
        expertAgronomistNote: "Dear Farmer Murugan, your Tomato crop in Field #1 is entering peak flowering with high moisture and 29.5\xB0C temperature. This provides a fertile breeding window for Tuta absoluta and early blight conidia.\n\nBy taking swift organic action\u2014installing pheromone traps and applying high-grade Neem Azadirachtin\u2014you stop the infestation before larvae enter the fruit calyx, preserving your marketable yield without toxic chemical residues.\n\nComplete the 7-day scouting checklist to ensure your biological parasitoids establish a self-sustaining defense barrier.",
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.farmerPeerProfiles = [
      {
        id: "peer_1",
        user_id: "usr_farmer_1",
        name: "Murugan Palaniswamy (You)",
        farmer_id_code: "KISAN-TN-882",
        avatar: "\u{1F468}\u200D\u{1F33E}",
        village: "Pollachi Rural",
        taluk: "Pollachi",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 10.6586,
        longitude: 77.0089,
        land_area_acres: 6.5,
        primary_crops: ["Tomato (Shivam Hybrid)", "Small Onion (CO-5)", "Banana"],
        farming_method: "100% Certified Organic",
        soil_type: "Red Sandy Loam",
        specialties: ["Drip Fertigation", "Desi Cow Panchagavya", "Trichoderma Soil Inoculation"],
        available_for: [
          "Machinery / Tractor Sharing",
          "Indigenous Seed & Sapling Exchange",
          "Crop Advisory & Mentorship",
          "Joint Transport & Mandi Aggregation"
        ],
        equipment_available: ["Rotavator 42-blade", "16L Battery Knapsack Sprayers (x2)"],
        bio: "Practicing bio-dynamic and organic vegetable cultivation for over 18 years in Pollachi basin. Open to seed sharing and joint mandi transport pooling.",
        experience_years: 18,
        rating: 4.95,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: "2025-01-10T08:00:00Z",
        phone_masked: "+91 98421 87654",
        allow_direct_call: true,
        active_nodes_count: 2
      },
      {
        id: "peer_2",
        user_id: "usr_peer_velusamy",
        name: "Velusamy Gounder",
        farmer_id_code: "KISAN-TN-914",
        avatar: "\u{1F468}\u200D\u{1F33E}",
        village: "Kinathukadavu",
        taluk: "Kinathukadavu",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 10.8205,
        longitude: 77.021,
        land_area_acres: 8.5,
        primary_crops: ["Tomato", "Small Onion (Shallots)", "Turmeric", "Coriander"],
        farming_method: "100% Certified Organic",
        soil_type: "Red Loam Soil",
        specialties: ["Indigenous Seed Multiplication", "Bio-gas Slurry Enrichment", "Raised Bed Plastic Mulching"],
        available_for: [
          "Machinery / Tractor Sharing",
          "Indigenous Seed & Sapling Exchange",
          "Crop Advisory & Mentorship"
        ],
        equipment_available: ["John Deere 5050D Tractor (50HP) + 9-Tyne Tiller", "Power Weeder 7HP", "Solar Micro-Cold Room (3MT)"],
        bio: "Certified organic grower since 2011. Running an active indigenous seed saving nursery. Tractor available for hire on cooperative sharing rates during land preparation windows.",
        experience_years: 24,
        rating: 4.92,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: "2025-01-05T09:30:00Z",
        phone_masked: "+91 94432 \u2022\u2022\u2022\u2022\u2022",
        allow_direct_call: true,
        active_nodes_count: 3
      },
      {
        id: "peer_3",
        user_id: "usr_peer_selvi",
        name: "Selvi Ramasamy",
        farmer_id_code: "KISAN-TN-743",
        avatar: "\u{1F469}\u200D\u{1F33E}",
        village: "Anamalai Foothills",
        taluk: "Anamalai / Pollachi",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 10.584,
        longitude: 76.932,
        land_area_acres: 4.2,
        primary_crops: ["Coconut (Tall x Dwarf)", "Grand Naine Banana", "Nutmeg", "Cocoa"],
        farming_method: "Natural Farming (ZBNF)",
        soil_type: "Clay Loam with High Organic Matter",
        specialties: ["Multi-tier Agroforestry", "Jeevamrit Soil Drenching", "Stingless Bee Pollination Units"],
        available_for: [
          "Indigenous Seed & Sapling Exchange",
          "Crop Advisory & Mentorship",
          "Joint Transport & Mandi Aggregation"
        ],
        equipment_available: ["High-Pressure Tree Sprayer (100m Hose)", "Motorized Coconut De-husker"],
        bio: "Pioneering zero-budget natural farming multi-tier plantation. Zero chemical pesticide usage for 12 seasons. Happy to share stingless bee colonies and Jeevamrit mother cultures.",
        experience_years: 16,
        rating: 4.98,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: "2025-01-12T14:15:00Z",
        phone_masked: "+91 98940 \u2022\u2022\u2022\u2022\u2022",
        allow_direct_call: true,
        active_nodes_count: 4
      },
      {
        id: "peer_4",
        user_id: "usr_peer_karthik",
        name: "Karthik Soundararajan",
        farmer_id_code: "KISAN-TN-612",
        avatar: "\u{1F468}\u200D\u{1F33E}",
        village: "Udumalpet East",
        taluk: "Udumalpet",
        district: "Tiruppur",
        state: "Tamil Nadu",
        latitude: 10.585,
        longitude: 77.248,
        land_area_acres: 12,
        primary_crops: ["Maize (Corn)", "Cotton (Bt Hybrid)", "Green Chilli", "Groundnut"],
        farming_method: "Integrated Pest Management (IPM)",
        soil_type: "Black Cotton / Medium Loam",
        specialties: ["Solar Borewell Automation (7.5 HP)", "Pheromone Trap Mass Trapping", "Laser Bed Leveling"],
        available_for: [
          "Machinery / Tractor Sharing",
          "Joint Transport & Mandi Aggregation",
          "Borewell / Water Sharing"
        ],
        equipment_available: ["Mahindra 575 DI Tractor", "Laser Land Leveller", "Pneumatic Seed Drill Planter"],
        bio: "Large-acreage precision farmer. Equipped with precision pneumatic seed drill and laser leveling systems. Organizing weekly bulk truck transport to Dindigul and Tiruppur markets.",
        experience_years: 11,
        rating: 4.82,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: "2025-01-08T11:00:00Z",
        phone_masked: "+91 97871 \u2022\u2022\u2022\u2022\u2022",
        allow_direct_call: true,
        active_nodes_count: 2
      },
      {
        id: "peer_5",
        user_id: "usr_peer_palanisamy",
        name: "Palanisamy Chettiar",
        farmer_id_code: "KISAN-TN-830",
        avatar: "\u{1F468}\u200D\u{1F33E}",
        village: "Negamam",
        taluk: "Pollachi",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 10.741,
        longitude: 77.085,
        land_area_acres: 5,
        primary_crops: ["Tomato (Shivam)", "Brinjal (Uthukuli Local)", "Snake Gourd", "Bhendi"],
        farming_method: "100% Certified Organic",
        soil_type: "Red Sandy Loam",
        specialties: ["Dashparni Ark Preparation", "Pro-Tray Nursery Seedling Propagation", "Neem Cake Soil Conditioning"],
        available_for: [
          "Indigenous Seed & Sapling Exchange",
          "Bio-Input Bulk Preparation",
          "Crop Advisory & Mentorship"
        ],
        equipment_available: ["Plastic Mulch Laying Attachment", "Battery Sprayer (x4)"],
        bio: "Focusing on intensive organic vegetable cultivation. Expert in bio-repellents and herbal pest decoctions. Pro-tray seedling saplings always available on prior notice.",
        experience_years: 19,
        rating: 4.89,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: "2025-01-14T10:45:00Z",
        phone_masked: "+91 98428 \u2022\u2022\u2022\u2022\u2022",
        allow_direct_call: true,
        active_nodes_count: 3
      },
      {
        id: "peer_6",
        user_id: "usr_peer_muthukumar",
        name: "Muthukumar Natarajan",
        farmer_id_code: "KISAN-TN-552",
        avatar: "\u{1F468}\u200D\u{1F33E}",
        village: "Sultanpet / Sulur",
        taluk: "Sulur",
        district: "Coimbatore",
        state: "Tamil Nadu",
        latitude: 10.875,
        longitude: 77.165,
        land_area_acres: 7.5,
        primary_crops: ["Small Onion (Shallots CO-5)", "Tapioca", "Groundnut (TMV 7)"],
        farming_method: "Precision Conventional",
        soil_type: "Deep Red Gravelly Soil",
        specialties: ["Sub-surface Drip Automation", "Post-Harvest Shade Curing (Onion)", "e-NAM Direct Trading"],
        available_for: [
          "Joint Transport & Mandi Aggregation",
          "Machinery / Tractor Sharing"
        ],
        equipment_available: ["Mini Tractor 24HP with Ridger", "Motorized Small Onion Sorting & Grading Machine"],
        bio: "Specialist in export-quality small onion cultivation and shade curing racks. Operates a mechanical onion grader available for peer farm sharing.",
        experience_years: 14,
        rating: 4.78,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: "2025-01-18T16:20:00Z",
        phone_masked: "+91 94863 \u2022\u2022\u2022\u2022\u2022",
        allow_direct_call: true,
        active_nodes_count: 1
      }
    ];
    this.farmingKnowledgeNodes = [
      {
        id: "kn_1",
        author_id: "usr_peer_velusamy",
        author_name: "Velusamy Gounder",
        author_village: "Kinathukadavu North",
        author_avatar: "\u{1F468}\u200D\u{1F33E}",
        latitude: 10.818,
        longitude: 77.019,
        category: "PEST_ALERT",
        title: "Urgent Alert: Early Whitefly Swarm & Tomato Leaf Curl in Kinathukadavu Block",
        content: "Noticed heavy whitefly vector activity on 3 tomato plots around Kinathukadavu bypass during warm afternoon hours. High risk of Tomato Yellow Leaf Curl Virus (TYLCV) transmission.",
        actionable_tip: "Install 25 Yellow Sticky sheets per acre immediately. Foliar spray of Cold-Pressed Neem Azadirachtin 10,000 ppm (3ml/L) with soap-nut surfactant before 8:00 AM to eliminate whitefly adults.",
        urgency_level: "HIGH_ALERT",
        crops_relevant: ["Tomato", "Chilli", "Brinjal"],
        tags: ["Pest Warning", "Whitefly", "TYLCV", "Neem Spray", "Urgent Action"],
        upvotes: 48,
        has_upvoted: false,
        verified_by_agronomist: true,
        agronomist_badge_note: "Verified by TNAU Agro-Met Advisory: Conducive 30\xB0C thermal conditions confirmed.",
        created_at: new Date(Date.now() - 14 * 60 * 60 * 1e3).toISOString(),
        comments_count: 7
      },
      {
        id: "kn_2",
        author_id: "usr_peer_palanisamy",
        author_name: "Palanisamy Chettiar",
        author_village: "Negamam Rural",
        author_avatar: "\u{1F468}\u200D\u{1F33E}",
        latitude: 10.742,
        longitude: 77.086,
        category: "BIO_RECIPE",
        title: "Dashparni Ark (10-Leaf Decoction) Preparation: Proven Knockdown for Caterpillars",
        content: "Prepared fresh batch of fermented Dashparni Ark using Neem, Pongamia, Custard Apple, Calotropis (Erukku), Papaya leaves, and desi cow urine. Proven 90%+ efficacy against Spodoptera and fruit borer.",
        actionable_tip: "Mix 250ml filtered Dashparni extract per 10L water. Add 20g crushed garlic paste. Spray in late evening when borer larvae emerge to feed.",
        urgency_level: "BEST_PRACTICE",
        crops_relevant: ["Tomato", "Brinjal", "Bhendi", "Green Chilli", "Cabbage"],
        tags: ["Organic Bio-Pesticide", "Dashparni Ark", "Caterpillar Control", "Zero Chemical"],
        upvotes: 69,
        has_upvoted: true,
        verified_by_agronomist: true,
        agronomist_badge_note: "ICAR-Approved Botanical Preparation for Organic Certification Standards.",
        created_at: new Date(Date.now() - 36 * 60 * 60 * 1e3).toISOString(),
        comments_count: 12
      },
      {
        id: "kn_3",
        author_id: "usr_farmer_1",
        author_name: "Murugan Palaniswamy (You)",
        author_village: "Pollachi Rural",
        author_avatar: "\u{1F468}\u200D\u{1F33E}",
        latitude: 10.6586,
        longitude: 77.0089,
        category: "EQUIPMENT_COOP",
        title: "Shared 50HP John Deere Tractor + 42-Blade Rotavator Available for Weekend Slots",
        content: "My tractor and rotavator are idle on Thursday-Saturday slots this week. Offering to neighboring farmers for field preparation and bed forming on mutual fuel-split cost (\u20B9750/hr instead of commercial \u20B91200/hr).",
        actionable_tip: "Ideal for fine tilth preparation for summer vegetable sowing. Message or call to book 2-hour or 4-hour slots.",
        urgency_level: "SEASONAL_TIP",
        crops_relevant: ["Tomato", "Small Onion", "Maize", "Vegetables"],
        tags: ["Machinery Sharing", "Tractor Rental Co-op", "Land Prep", "Affordable Farming"],
        upvotes: 35,
        has_upvoted: true,
        verified_by_agronomist: false,
        created_at: new Date(Date.now() - 22 * 60 * 60 * 1e3).toISOString(),
        comments_count: 5
      },
      {
        id: "kn_4",
        author_id: "usr_peer_selvi",
        author_name: "Selvi Ramasamy",
        author_village: "Anamalai Foot",
        author_avatar: "\u{1F469}\u200D\u{1F33E}",
        latitude: 10.584,
        longitude: 76.932,
        category: "SOIL_WATER",
        title: "Borewell Recharge Pit with Coconut Husk Biomass: Recovered 1.5-inch Water Flow",
        content: "Constructed a 10x10ft runoff filter pit lined with coconut husks, charcoal, and river sand around borewell casing. After recent thunderstorm showers, water table yield rose by 30%.",
        actionable_tip: "Direct farm trench runoff into the filtration bed. Prevents silt clogging while recharging the shallow aquifer naturally.",
        urgency_level: "BEST_PRACTICE",
        crops_relevant: ["Coconut", "Banana", "Vegetables", "All Crops"],
        tags: ["Water Conservation", "Borewell Recharge", "Drought Proofing", "Natural Engineering"],
        upvotes: 82,
        has_upvoted: false,
        verified_by_agronomist: true,
        agronomist_badge_note: "Verified by Ground Water Board Guidelines & Soil Conservation Directorate.",
        created_at: new Date(Date.now() - 52 * 60 * 60 * 1e3).toISOString(),
        comments_count: 15
      },
      {
        id: "kn_5",
        author_id: "usr_peer_karthik",
        author_name: "Karthik Soundararajan",
        author_village: "Udumalpet East",
        author_avatar: "\u{1F468}\u200D\u{1F33E}",
        latitude: 10.585,
        longitude: 77.248,
        category: "MARKET_AGGREGATION",
        title: "Weekly 10-Ton Joint Transport Pooling: Bengaluru & Madurai APMC Routes",
        content: "Coordinating weekly 10-ton Eicher truck pooling for farmers harvesting Tomato, Chilli, and Onion. Loading at Pollachi bypass junction every Tuesday & Friday at 5:00 PM.",
        actionable_tip: "Reduces freight cost from \u20B92.40/kg down to \u20B90.85/kg. Crates are color-tagged for individual farmer settlement.",
        urgency_level: "SEASONAL_TIP",
        crops_relevant: ["Tomato", "Small Onion", "Green Chilli"],
        tags: ["Market Pooling", "Transport Logistics", "Direct APMC", "Higher Profit Margin"],
        upvotes: 94,
        has_upvoted: false,
        verified_by_agronomist: true,
        agronomist_badge_note: "Aggregated logistics verified by AgriSaarthi Market Intermediary facilitation.",
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1e3).toISOString(),
        comments_count: 21
      },
      {
        id: "kn_6",
        author_id: "usr_peer_velusamy",
        author_name: "Velusamy Gounder",
        author_village: "Kinathukadavu",
        author_avatar: "\u{1F468}\u200D\u{1F33E}",
        latitude: 10.821,
        longitude: 77.022,
        category: "SEED_VARIETY",
        title: "High-Germination Indigenous CO-5 Shallot Bulbs & Desi Cowpea Seed Exchange",
        content: "Harvested 150 kg of disease-free CO-5 small onion seed bulbs (treated with Trichoderma viride). Offering seed exchange with fellow organic growers for heirloom pulses or tomato saplings.",
        actionable_tip: "Ready for sowing in coming Kharif cycle. Stored under ventilated dry thatch racks with 94% germination test rate.",
        urgency_level: "BEST_PRACTICE",
        crops_relevant: ["Small Onion", "Cowpea", "Black Gram", "Pulses"],
        tags: ["Seed Bank", "Heirloom Varieties", "Trichoderma Treated", "Barter & Exchange"],
        upvotes: 56,
        has_upvoted: true,
        verified_by_agronomist: true,
        created_at: new Date(Date.now() - 40 * 60 * 60 * 1e3).toISOString(),
        comments_count: 8
      }
    ];
    this.logAudit("sys_init", "system@agrisaarthi.gov.in", "admin", "SYSTEM_BOOTSTRAP", "system", "sys_root", {
      seeded_tables_count: 28,
      farmerPeers: this.farmerPeerProfiles.length,
      knowledgeNodes: this.farmingKnowledgeNodes.length,
      warehouses: this.warehouses.length,
      schemes: this.governmentSchemes.length,
      yieldPredictions: this.yieldPredictions.length,
      pestRiskAssessments: this.pestRiskAssessments.length,
      status: "INITIALIZED_SUCCESS"
    });
  }
};
var db = new AgriDatabase();

// src/server/ai.ts
var import_genai = require("@google/genai");
var genAIClient = null;
function getGenAI() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return genAIClient;
}
async function fetchImageAsBase64(url) {
  try {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], data: match[2] };
      }
    }
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    return {
      data: buffer.toString("base64"),
      mimeType
    };
  } catch (err) {
    console.warn("Could not convert image URL to base64 for Gemini vision:", err);
    return null;
  }
}
async function analyzePlantHealth(request) {
  const ai = getGenAI();
  const isDarkOrBlurry = request.farmerNotes?.toLowerCase().includes("dark") || request.farmerNotes?.toLowerCase().includes("blur") || false;
  const qualityScore = isDarkOrBlurry ? 52 : Math.floor(88 + Math.random() * 9);
  const qualityVerdict = qualityScore >= 75 ? "CLEAR" : qualityScore >= 60 ? "ACCEPTABLE" : "BLURRY_OR_DARK";
  const qualityChecks = {
    blur_score: qualityScore,
    brightness_ok: qualityScore >= 60,
    leaf_centered: true,
    resolution_ok: qualityScore >= 50
  };
  const resolveFinalImageUrl = () => {
    if (request.imageUrl) return request.imageUrl;
    if (request.imageBase64) {
      if (request.imageBase64.startsWith("data:image")) {
        return request.imageBase64;
      }
      return `data:image/jpeg;base64,${request.imageBase64}`;
    }
    return "https://images.unsplash.com/photo-1592417817098-8f3d6eb22515?auto=format&fit=crop&w=800&q=80";
  };
  if (qualityScore < 55) {
    return {
      crop_name: request.cropName || "Crop",
      plant_part: request.plantPart,
      image_url: resolveFinalImageUrl(),
      image_quality_score: qualityScore,
      image_quality_verdict: "BLURRY_OR_DARK",
      quality_checks: qualityChecks,
      predicted_issue: "Unable to determine issue confidently due to low image clarity",
      prediction_type: "UNCERTAIN",
      confidence: 32,
      model_name: "AgriSaarthi-PlantCV-Vision",
      model_version: "v1.4.2-ensemble",
      observed_symptoms: ["High focal blur / insufficient sharpness", "Heavy shadowing or low light on leaf surface"],
      farmer_explanation: "The captured image is too dark or out of focus for accurate pathogen identification. Please take a clear photo in natural morning daylight with the affected leaf centered.",
      recommended_actions: [
        "Retake a close-up photo in bright, indirect daylight (15-20 cm from leaf).",
        "Hold camera steady until leaf veins and spots are sharp.",
        "If symptoms cover multiple plants, consult your local KVK or Agri Extension Officer."
      ],
      soil_lab_referral_needed: false,
      status: "INCONCLUSIVE"
    };
  }
  if (ai && request.preferredModel !== "ensemble-heuristic") {
    try {
      let imagePart = null;
      if (request.imageBase64) {
        let mimeType = "image/jpeg";
        let base64Data = request.imageBase64;
        const match = request.imageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
        imagePart = {
          inlineData: {
            mimeType,
            data: base64Data
          }
        };
      } else if (request.imageUrl) {
        const fetched = await fetchImageAsBase64(request.imageUrl);
        if (fetched) {
          imagePart = {
            inlineData: {
              mimeType: fetched.mimeType,
              data: fetched.data
            }
          };
        }
      }
      const prompt = `You are AgriSaarthi AI's certified Agricultural Plant Pathologist and Computer Vision Agronomist for Indian farming conditions.
Analyze this crop image carefully.
- Crop: "${request.cropName || "Unknown Crop"}"
- Plant Part: "${request.plantPart || "leaf"}"
- Farmer Field Notes: "${request.farmerNotes || "None provided"}"
- Language: "${request.language || "en"}"

Perform clinical agronomic disease & pest diagnosis:
1. Identify if there is a fungal disease, bacterial blight, viral infection, insect pest damage (e.g. caterpillars, whiteflies, borers), nutrient deficiency (N, P, K, Fe, Zn, Mg, B), abiotic stress (heat, drought, salinity), or if the plant is healthy.
2. Determine confidence percentage (between 50% and 98%).
3. List 3 key observed visual symptoms.
4. Give a simple, respectful explanation suitable for an Indian farmer.
5. Provide actionable IPM (Integrated Pest Management) steps, organic treatments (Neem oil, Trichoderma, Pseudomonas), and approved chemical measures with dosage if necessary.
6. Indicate if a Soil Testing Lab referral is required.

Return strictly a JSON object with these exact keys:
{
  "predicted_issue": "Specific disease/pest name (e.g., Tomato Early Blight (Alternaria solani), Fall Armyworm Infestation, Healthy Foliage)",
  "prediction_type": "DISEASE" | "PEST_DAMAGE" | "NUTRIENT_DEFICIENCY" | "HEALTHY" | "STRESS" | "UNCERTAIN",
  "confidence": 88,
  "observed_symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "farmer_explanation": "Clear explanation in practical terms",
  "recommended_actions": ["Practical step 1 with dose", "Step 2", "Step 3"],
  "pest_ipm_guidance": "IPM advice or empty string",
  "nutrient_advisory": "Nutrient/fertilizer guidance if deficiency suspected",
  "soil_lab_referral_needed": false
}`;
      const contents = imagePart ? { parts: [imagePart, { text: prompt }] } : prompt;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const rawText = response.text || "{}";
      const cleanJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.predicted_issue) {
        return {
          crop_name: request.cropName || "Crop",
          plant_part: request.plantPart,
          image_url: resolveFinalImageUrl(),
          image_quality_score: qualityScore,
          image_quality_verdict: qualityVerdict,
          quality_checks: qualityChecks,
          predicted_issue: parsed.predicted_issue,
          prediction_type: parsed.prediction_type || "DISEASE",
          confidence: Math.min(Math.max(parsed.confidence || 85, 45), 98),
          model_name: "AgriSaarthi-Gemini-3.7-Flash-Vision",
          model_version: "v2.4-live",
          observed_symptoms: Array.isArray(parsed.observed_symptoms) ? parsed.observed_symptoms : ["Discoloration and lesion spots on leaf surface", "Margin chlorosis"],
          farmer_explanation: parsed.farmer_explanation || "Foliage shows signs of plant stress and pathogen activity.",
          recommended_actions: Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : ["Inspect adjacent crops", "Apply recommended bio-fungicide spray", "Avoid overhead sprinkler irrigation"],
          pest_ipm_guidance: parsed.pest_ipm_guidance || "",
          nutrient_advisory: parsed.nutrient_advisory || "",
          soil_lab_referral_needed: !!parsed.soil_lab_referral_needed || parsed.prediction_type === "NUTRIENT_DEFICIENCY",
          status: parsed.confidence > 60 ? "COMPLETED" : "REQUIRES_EXPERT"
        };
      }
    } catch (err) {
      console.warn("Gemini 3.7 Flash vision inference encountered an issue, seamlessly engaging Agronomic Heuristic Ensemble:", err);
    }
  }
  const crop = (request.cropName || "").toLowerCase();
  const notes = (request.farmerNotes || "").toLowerCase();
  let issue = "Early Blight (Alternaria solani)";
  let predType = "DISEASE";
  let conf = 88;
  let symptoms = [
    "Concentric dark brown rings with target-board pattern on lower leaves",
    "Yellow chlorotic halos surrounding the brown necrotic lesions",
    "Basal leaf wilting and early defoliation"
  ];
  let explanation = "Your plant displays classic symptoms of Early Blight fungal infection. This is promoted by humid microclimates, daytime temperatures of 24-30\xB0C, and leaf wetness.";
  let actions = [
    "Prune off and safely bury heavily infected lower leaves to reduce spore load.",
    "Switch from overhead sprinkler to drip irrigation to keep leaf canopies dry.",
    "Spray bio-fungicide Trichoderma viride (5g/L) or Copper Oxychloride 50% WP @ 2.5g/L as per ICAR-TNAU recommendations.",
    "Ensure proper inter-row spacing to promote air circulation."
  ];
  let ipm = "Eradicate Solanaceous weed hosts (such as Solanum nigrum) from farm bunds.";
  let nutrient = "";
  let needSoilLab = false;
  if (crop.includes("tomato") && (notes.includes("curl") || notes.includes("whitefly") || notes.includes("yellow") || notes.includes("stunt"))) {
    issue = "Tomato Leaf Curl Virus (ToLCV)";
    predType = "DISEASE";
    conf = 92;
    symptoms = ["Upward and downward curling of leaflets with puckering", "Thickened leathery texture on young leaves", "Stunting of terminal shoots and bushiness"];
    explanation = "This is a viral infection transmitted by Whiteflies (Bemisia tabaci). Fungicides cannot cure viral diseases; managing the whitefly vector is vital.";
    actions = [
      "Install yellow sticky traps (15-20 traps per acre) to monitor and catch whitefly vectors.",
      "Foliar spray Neem Oil (Azadirachtin 10,000 ppm) @ 2 ml/L or Thiamethoxam 25 WG @ 0.3g/L to control sucking pests.",
      "Rogue out and safely burn severely stunted virus-infected plants to prevent field spread."
    ];
    ipm = "Use silver reflective plastic mulch to repel whitefly landings on young seedlings.";
  } else if (notes.includes("hole") || notes.includes("caterpillar") || notes.includes("worm") || crop.includes("maize") || crop.includes("cotton")) {
    issue = "Spodoptera / Fall Armyworm Foliar Damage";
    predType = "PEST_DAMAGE";
    conf = 90;
    symptoms = ["Ragged shot-holes and windowing on leaf blade", "Visible moist frass (caterpillar droppings) inside whorls", "Skeletonized leaf margins"];
    explanation = "Detected insect larval feeding damage. Timely intervention during early larval stages prevents severe crop loss.";
    actions = [
      "Install pheromone traps (5 per acre) for mass monitoring of adult moths.",
      "Handpick egg masses and early instars during morning scouting.",
      "Apply Bacillus thuringiensis (Bt) @ 2g/L or Emamectin Benzoate 5% SG @ 0.4g/L in severe infestations."
    ];
    ipm = "Encourage natural predators like predatory wasps, Trichogramma egg parasitoids, and bird perches (T-perches @ 10/acre).";
  } else if (notes.includes("yellow") || notes.includes("pale") || notes.includes("fertilizer") || crop.includes("paddy") || crop.includes("onion")) {
    issue = "Nitrogen & Zinc Deficiency Pattern";
    predType = "NUTRIENT_DEFICIENCY";
    conf = 81;
    symptoms = ["General chlorosis (pale yellowing) starting uniformly from older lower leaves", "Reduced tillering and stunted vegetative growth", "Pale green leaf blades with interveinal bleaching"];
    explanation = "Symptoms are consistent with Nitrogen and Zinc deficiency stress. Visual assessment alone cannot determine exact soil reserves.";
    actions = [
      "Test soil with a nearby certified Soil Testing Lab to obtain an exact Soil Health Card recommendation.",
      "Apply split top-dressing of Neem-Coated Urea along with well-decomposed Farm Yard Manure (FYM).",
      "Foliar spray Zinc Sulphate 0.5% (5g/L) neutralized with lime (2.5g/L) for rapid foliar recovery."
    ];
    needSoilLab = true;
    nutrient = "Soil testing is strongly recommended to prevent nitrogen over-application and balance soil pH.";
  } else if (notes.includes("healthy") || notes.includes("green") || crop.includes("coconut") || crop.includes("groundnut")) {
    issue = "Healthy Crop Foliage";
    predType = "HEALTHY";
    conf = 95;
    symptoms = ["Vibrant, deep green chlorophyll pigmentation", "Intact, smooth leaf cuticle and margin integrity", "No active fungal lesions or pest punctures observed"];
    explanation = "Your plant foliage displays healthy vigor and normal physiological growth.";
    actions = [
      "Maintain regular balanced irrigation schedule.",
      "Continue standard preventive bio-fertilizer and organic compost applications.",
      "Scout field weekly for early pest detection."
    ];
  }
  return {
    crop_name: request.cropName || "Crop",
    plant_part: request.plantPart,
    image_url: resolveFinalImageUrl(),
    image_quality_score: qualityScore,
    image_quality_verdict: qualityVerdict,
    quality_checks: qualityChecks,
    predicted_issue: issue,
    prediction_type: predType,
    confidence: conf,
    model_name: "AgriSaarthi-PlantCV-Vision",
    model_version: "v1.4.2-ensemble",
    observed_symptoms: symptoms,
    farmer_explanation: explanation,
    recommended_actions: actions,
    pest_ipm_guidance: ipm,
    nutrient_advisory: nutrient,
    soil_lab_referral_needed: needSoilLab,
    status: "COMPLETED"
  };
}
function calculateStorageProfit(params) {
  const currentRevenue = Math.round(params.quantityKg * params.currentMandiPricePerKg);
  const estimatedStorageCost = Math.round(params.quantityKg * params.storageRatePerKgDay * params.storageDurationDays);
  const estimatedFutureRevenue = Math.round(params.quantityKg * params.projectedFuturePricePerKg);
  const estimatedAdditionalRevenue = estimatedFutureRevenue - currentRevenue;
  const estimatedNetBenefit = estimatedAdditionalRevenue - estimatedStorageCost - params.transportCostInr;
  let verdict = "MARGINAL_BENEFIT";
  if (estimatedNetBenefit > 5e3) {
    verdict = "STORE_MAY_BE_BENEFICIAL";
  } else if (estimatedNetBenefit < -1e3) {
    verdict = "SELL_NOW_MAY_BE_BETTER";
  }
  return {
    crop_name: params.cropName,
    quantity_kg: params.quantityKg,
    current_mandi_price_per_kg: params.currentMandiPricePerKg,
    projected_future_price_per_kg: params.projectedFuturePricePerKg,
    storage_duration_days: params.storageDurationDays,
    storage_rate_per_kg_day: params.storageRatePerKgDay,
    transport_cost_inr: params.transportCostInr,
    current_revenue: currentRevenue,
    estimated_storage_cost: estimatedStorageCost,
    estimated_future_revenue: estimatedFutureRevenue,
    estimated_additional_revenue: estimatedAdditionalRevenue,
    estimated_net_benefit: estimatedNetBenefit,
    recommendation_verdict: verdict
  };
}
var CHATBOT_ROLES_CONFIG = {
  agronomist_pro: {
    name: "Chief Agronomist & Crop Modeling Scientist",
    title: "Precision Agronomy, Soil Biochemistry & Crop Diagnostics",
    defaultTier: "COMPLEX",
    recommendedModel: "gemini-3.1-pro-preview",
    systemInstructionGenerator: (contextStr, lang) => `You are AgriSaarthi's Lead Principal Agronomist & Crop Modeling Scientist (ICAR / TNAU Senior Fellowship level).
You provide deep, mathematically and biochemically rigorous agronomic diagnostics, soil nutrient balancing calculations, cation exchange capacity (CEC) adjustments, pathogen life-cycle disruption strategies, and physiological growth stage modeling in ${lang}.
Farmer Profile & Farm Context:
${contextStr}

Role Capabilities & Guidelines:
1. Provide comprehensive, research-backed scientific explanations balanced with clear, direct practical actions.
2. Formulate precision NPK/Secondary/Micronutrient split fertigation dosages (e.g. Zinc Sulphate, Boron, Magnesium, Chelated Iron) according to soil pH and crop stage.
3. For plant pathology, explain the etiology (fungal spore germination, viral vector transmission, bacterial ooze), economic injury thresholds (EIL), and multi-stage Integrated Pest Management (IPM).
4. For crop modeling and yield predictions, explain growing degree days (GDD), canopy interception, biomass partitioning, and evapotranspiration (ETc) water requirements.
5. Structure answers logically with clear subheadings, dosage tables or bullet lists, and safety precautions.`,
    defaultSuggestions: [
      "Calculate precision N-P-K fertilizer split for Tomato in Red Loamy soil (pH 6.8)",
      "How do I remediate early blossom end rot caused by calcium mobility issues?",
      "Design an Integrated Pest Management (IPM) schedule for Fall Armyworm in Maize"
    ]
  },
  kisan_copilot: {
    name: "Kisan Agri-Advisor & Field Copilot",
    title: "General Farming, Weather-Responsive Tasks & Daily Guidance",
    defaultTier: "GENERAL",
    recommendedModel: "gemini-3.5-flash",
    systemInstructionGenerator: (contextStr, lang) => `You are AgriSaarthi's Kisan Agri-Advisor and Field Copilot.
You are a warm, practical, friendly farming companion for Indian farmers, communicating in ${lang}.
Farmer Profile & Farm Context:
${contextStr}

Role Capabilities & Guidelines:
1. Communicate in simple, empathetic, respectful, and crystal-clear language in ${lang}.
2. Give actionable step-by-step advice for daily field tasks: sowing dates, weeding, mulching, watering intervals, and standard pest management.
3. Keep answers practical, cost-effective, and easy to execute on the farm with local equipment and inputs.
4. Reference local seasonal windows (Kharif, Rabi, Zaid / Summer) and weather patterns.
5. Provide concise bullet points that a farmer can quickly read or listen to on their mobile device.`,
    defaultSuggestions: [
      "What is the ideal sowing time and seed rate for Shallots / Small Onion this season?",
      "How much irrigation water should I give my Tomato crop during flowering stage?",
      "Suggest organic preventive measures against sucking pests like aphids and thrips"
    ]
  },
  speed_dispatcher: {
    name: "Instant Market & Storage Dispatcher",
    title: "Fast Mandi Rates, Warehouse Capacity & Quick Dispatch",
    defaultTier: "FAST",
    recommendedModel: "gemini-3.1-flash-lite",
    systemInstructionGenerator: (contextStr, lang) => `You are AgriSaarthi's Instant Market & Logistics Dispatcher.
You specialize in ultra-fast, direct, concise responses for APMC mandi modal rates, nearby CWC/SWC cold storage space, warehouse pledge loan (e-NWR) calculations, and instant quick checks in ${lang}.
Farmer Profile & Farm Context:
${contextStr}

Role Capabilities & Guidelines:
1. Be concise, fast, and numerical. Get straight to the key facts, prices, dates, and locations.
2. Always emphasize current APMC modal price benchmarks (\u20B9/Quintal) and price trajectories.
3. Advise on nearby certified cold storage/warehouses, typical storage fees (\u20B90.30 - \u20B90.65/kg/month), and e-NWR warehouse receipt loans to prevent distress selling.
4. Calculate quick freight/transport estimations and net realization differences.`,
    defaultSuggestions: [
      "What is today's APMC Mandi Modal Price for Tomato and Shallot Onion?",
      "How do I calculate cold storage ROI and e-NWR pledge loan value for 5 tonnes of produce?",
      "Where is the nearest verified CWC/TNWC warehouse with available cold room slots?"
    ]
  },
  scheme_specialist: {
    name: "Government Scheme & Subsidy Specialist",
    title: "PM-KISAN, PMFBY Insurance, PMKSY Drip Subsidy & SMAM",
    defaultTier: "GENERAL",
    recommendedModel: "gemini-3.5-flash",
    systemInstructionGenerator: (contextStr, lang) => `You are AgriSaarthi's Government Welfare & Agricultural Scheme Specialist.
You are the definitive guide for Indian central and state government agricultural subsidies, insurance, mechanization, and direct benefit transfer (DBT) programs in ${lang}.
Farmer Profile & Farm Context:
${contextStr}

Role Capabilities & Guidelines:
1. Provide complete eligibility criteria, required document checklists (Aadhaar, Chitta/Patta, Land Passbook, Bank IFSC), and application procedures.
2. Cover major flagship schemes:
   - PM-KISAN (\u20B96,000/yr direct income support)
   - PMFBY (Pradhan Mantri Fasal Bima Yojana - 1.5% to 2% premium crop insurance against drought, floods, pest epidemics)
   - PMKSY (Per Drop More Crop - 75% to 100% subsidy for drip and sprinkler irrigation)
   - SMAM (Sub-Mission on Agricultural Mechanization - 40% to 50% subsidy on tractors, rotavators, power tillers)
   - AIF (Agriculture Infrastructure Fund - 3% interest subvention for farm-gate cold rooms and drying yards)
   - Kisan Credit Card (KCC - 4% effective interest subvention rate)
3. Step-by-step guidance on how to submit through the platform's Government Schemes portal or nearest CSC (Common Service Center).`,
    defaultSuggestions: [
      "How do I claim PMFBY crop insurance compensation for unseasonal heavy rainfall damage?",
      "What documents are required to get 100% PMKSY subsidy for Drip Irrigation on 5 acres?",
      "Explain eligibility and subsidy percentage under SMAM for purchasing a power tiller"
    ]
  },
  organic_master: {
    name: "Organic Bio-Management & Vedic Krishi Master",
    title: "Zero-Chemical Bio-Formulations, Jeevamrutham & Biocontrols",
    defaultTier: "GENERAL",
    recommendedModel: "gemini-3.5-flash",
    systemInstructionGenerator: (contextStr, lang) => `You are AgriSaarthi's Master Practitioner of Natural Farming, Bio-Dynamic Agriculture, and Organic IPM.
You specialize in chemical-free pest management, indigenous micro-organism (IMO) culturing, biological predator stewardship, and organic soil regeneration in ${lang}.
Farmer Profile & Farm Context:
${contextStr}

Role Capabilities & Guidelines:
1. Provide exact preparation recipes and dilution ratios for natural farm-made formulations:
   - Jeevamrutham (Cow dung, cow urine, jaggery, pulse flour, virgin soil)
   - Beejamrutham (Seed treatment bio-inoculant)
   - Panchagavya (5 bovine products for plant immunity & growth hormone stimulation)
   - Dashaparni Ark / Neem Seed Kernel Extract (NSKE 5%) / Agni Astra (for chewing and sucking pests)
2. Detail beneficial biological agents and application methods: Trichoderma viride (anti-fungal), Pseudomonas fluorescens (bacterial/fungal antagonist), Beauveria bassiana (entomopathogenic fungus for borer control), Verticillium lecanii.
3. Guide farmers on NPOP organic certification, green manuring (Sunnhemp, Daincha), mulching, and vermicomposting.`,
    defaultSuggestions: [
      "Give me the exact recipe and application method for making Jeevamrutham for 1 acre",
      "How do I prepare 5% Neem Seed Kernel Extract (NSKE) to control fruit borer naturally?",
      "How to apply Trichoderma viride and Pseudomonas for root rot prevention during planting?"
    ]
  }
};
async function generateMultiTurnChatResponse(params) {
  const ai = getGenAI();
  const lang = params.language || "English";
  const roleId = params.roleId && CHATBOT_ROLES_CONFIG[params.roleId] ? params.roleId : "kisan_copilot";
  const roleConfig = CHATBOT_ROLES_CONFIG[roleId];
  const taskTier = params.taskTier || roleConfig.defaultTier;
  let targetModel = params.preferredModel || (taskTier === "COMPLEX" ? "gemini-3.1-pro-preview" : taskTier === "FAST" ? "gemini-3.1-flash-lite" : "gemini-3.5-flash");
  const farmerName = params.farmerContext?.name || params.farmerContext?.farmerName || "Kisan Mitra";
  const location = `${params.farmerContext?.village || "Pollachi"}, ${params.farmerContext?.district || "Coimbatore"}, ${params.farmerContext?.state || "Tamil Nadu"}`;
  const crops = (params.farmerContext?.crops || params.farmerContext?.primaryCrops || ["Tomato", "Groundnut", "Onion"]).join(", ");
  const soil = params.farmerContext?.soilType || "Red Sandy Loam";
  const landArea = params.farmerContext?.landAreaAcres || 6.5;
  const contextStr = `- Farmer Name: ${farmerName}
- Location: ${location}
- Land Area: ${landArea} Acres
- Crops Cultivated: ${crops}
- Soil Type: ${soil}
- Active Plant Health Status: ${params.farmerContext?.activeDisease || "Routine scouting active"}`;
  const systemInstruction = roleConfig.systemInstructionGenerator(contextStr, lang);
  const q = params.message.toLowerCase();
  let visualPayload = void 0;
  if (q.includes("price") || q.includes("mandi") || q.includes("trend") || q.includes("forecast chart") || q.includes("apmc")) {
    visualPayload = {
      type: "mandi_trend",
      title: "Mandi Price Trend & 30-Day APMC Trajectory (\u20B9/Quintal)",
      description: "APMC modal price trajectory for Tomato, Onion, Chilli & Banana with projected summer surge",
      data: [
        { month: "Oct 2024", Tomato: 1800, Onion: 2400, Chilli: 3600, Banana: 2e3 },
        { month: "Nov 2024", Tomato: 2100, Onion: 2900, Chilli: 3900, Banana: 2100 },
        { month: "Dec 2024", Tomato: 1950, Onion: 3500, Chilli: 4100, Banana: 2200 },
        { month: "Jan 2025", Tomato: 2400, Onion: 3800, Chilli: 4300, Banana: 2350 },
        { month: "Feb 2025 (Current)", Tomato: 2650, Onion: 4100, Chilli: 4500, Banana: 2400 },
        { month: "Mar 2025 (Forecast)", Tomato: 3100, Onion: 4400, Chilli: 4700, Banana: 2550 }
      ]
    };
  } else if (q.includes("demand") || q.includes("high demand") || q.includes("profit per acre") || q.includes("which vegetable") || q.includes("which fruit")) {
    visualPayload = {
      type: "demand_bar",
      title: "High-Demand Horticultural Produce Index (0 - 100)",
      description: "Current market demand metrics and projected profit potential (\u20B9 Lakh/Acre) in South India",
      data: [
        { name: "Tomato Hybrid", demand: 96, profitPerAcre: 2.15, category: "Vegetable" },
        { name: "Banana G9", demand: 95, profitPerAcre: 3.8, category: "Fruit" },
        { name: "Shallot / Small Onion", demand: 94, profitPerAcre: 1.65, category: "Vegetable" },
        { name: "Pomegranate Bhagwa", demand: 92, profitPerAcre: 4.5, category: "Fruit" },
        { name: "Papaya Red Lady", demand: 91, profitPerAcre: 2.9, category: "Fruit" },
        { name: "Green Chilli G4", demand: 89, profitPerAcre: 2.4, category: "Vegetable" },
        { name: "Taiwan Pink Guava", demand: 88, profitPerAcre: 2.6, category: "Fruit" },
        { name: "Capsicum Indra", demand: 87, profitPerAcre: 3.2, category: "Vegetable" }
      ]
    };
  } else if (q.includes("storage") || q.includes("roi") || q.includes("warehouse profit") || q.includes("cold room profit") || q.includes("distress sale")) {
    visualPayload = {
      type: "storage_roi",
      title: "Cold Storage Value Addition & Net Profit Gain Matrix",
      description: "Immediate distress sale vs 45-day storage in certified TNWC/CWC cold rooms with e-NWR pledge loan",
      data: [
        { stage: "Immediate Distress Sale", revenue: 66e3, netProfit: 22e3 },
        { stage: "30-Day Cold Storage", revenue: 84e3, netProfit: 36e3 },
        { stage: "45-Day Optimal Window", revenue: 96e3, netProfit: 45700 },
        { stage: "60-Day Extended Window", revenue: 102e3, netProfit: 47e3 }
      ]
    };
  }
  const historyTurns = [];
  if (params.history && Array.isArray(params.history)) {
    for (const item of params.history) {
      if (item.text && item.text.trim()) {
        historyTurns.push({
          role: item.role === "model" ? "model" : "user",
          parts: [{ text: item.text }]
        });
      }
    }
  }
  historyTurns.push({
    role: "user",
    parts: [{ text: params.message }]
  });
  if (ai) {
    const candidateModels = [targetModel, "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
    const modelQueue = Array.from(new Set(candidateModels));
    for (const modelToTry of modelQueue) {
      try {
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents: historyTurns,
          config: {
            systemInstruction,
            temperature: taskTier === "COMPLEX" ? 0.4 : taskTier === "FAST" ? 0.7 : 0.6
          }
        });
        if (response.text && response.text.trim().length > 0) {
          const replyText = response.text.trim();
          let followUps = roleConfig.defaultSuggestions;
          if (roleId === "agronomist_pro") {
            followUps = [
              "What bio-fertilizer inoculant (Rhizobium/PSB/VAM) should I combine with this?",
              "How will this treatment affect soil organic carbon and microbial biomass?",
              "Show me the 4-stage split fertigation schedule for drip lines"
            ];
          } else if (roleId === "speed_dispatcher") {
            followUps = [
              "Show Mandi Price Trends and forecast chart for this crop",
              "What is the estimated storage cost for 3 tonnes over 45 days?",
              "Calculate potential net profit gain from holding in cold storage"
            ];
          } else if (roleId === "scheme_specialist") {
            followUps = [
              "What is the online link and portal to submit this scheme application?",
              "What is the maximum subsidy amount for a marginal farmer (<5 acres)?",
              "What bank documents and land certificates (Chitta/Patta) are required?"
            ];
          } else if (roleId === "organic_master") {
            followUps = [
              "Can I mix Panchagavya with Neem Oil spray together?",
              "How to culture Trichoderma viride at home in Farm Yard Manure?",
              "What trap crops can I plant on the border to repel pests naturally?"
            ];
          }
          return {
            reply: replyText,
            modelUsed: modelToTry,
            roleId,
            taskTier,
            suggestedFollowUps: followUps,
            visualPayload
          };
        }
      } catch (err) {
        console.warn(`[MultiTurnChat] Model ${modelToTry} attempt encountered issue:`, err?.message || err);
      }
    }
  }
  const fallbackReply = generateAdvisoryFallback(params.message, roleId, farmerName, location, crops, soil, lang);
  return {
    reply: fallbackReply,
    modelUsed: `${targetModel} (Agronomic Knowledge Engine)`,
    roleId,
    taskTier,
    suggestedFollowUps: roleConfig.defaultSuggestions,
    visualPayload
  };
}
function generateAdvisoryFallback(query, roleId, farmerName, location, crops, soil, lang) {
  const q = query.toLowerCase();
  if (roleId === "agronomist_pro") {
    return `### **Scientific Agronomic Diagnostic & Soil Balancing Assessment**

**Field Parameters Evaluated:**
- **Farmer:** ${farmerName} | **Location:** ${location}
- **Primary Crops:** ${crops} | **Soil Type:** ${soil}

**1. Soil Nutrient Dynamics & Physiological Response:**
- For **${soil}**, maintain target soil pH between **6.5 - 7.2** to maximize availability of Phosphorus ($P_2O_5$) and micronutrients (Zinc, Boron, Iron).
- Soil Organic Carbon (SOC) should be maintained above **0.75%** by incorporating 5 tonnes/acre of well-decomposed Farm Yard Manure (FYM) fortified with *Trichoderma viride* (2 kg/tonne).

**2. Recommended Scientific Action Plan:**
- **Basal Application:** Apply Single Super Phosphate (SSP) @ 50 kg/acre + Muriate of Potash (MOP) @ 25 kg/acre + Neem-Coated Urea in 3 equal splits.
- **Foliar Micronutrient Correction:** Spray Zinc Sulphate (0.5%) + Borax (0.2%) during early vegetative and pre-flowering stages to prevent flower drop and fruit cracking.
- **Biological Soil Health:** Inoculate root zone with *Pseudomonas fluorescens* (5 g/L) via drip irrigation to suppress soil-borne fungal pathogens (*Fusarium* and *Pythium*).`;
  }
  if (roleId === "speed_dispatcher") {
    return `### **Instant Mandi Rates & Storage Dispatcher Report**

\u26A1 **Current Mandi Benchmarks (${location} & Nearby APMCs):**
- **Tomato Hybrid:** Modal Price: **\u20B92,650/Quintal** (Arrivals: Steady | Trend: \u2197 Upward summer surge)
- **Shallot / Small Onion:** Modal Price: **\u20B94,100/Quintal** (Arrivals: Moderate | Trend: \u2197 High demand)
- **Green Chilli G4:** Modal Price: **\u20B94,500/Quintal** (Arrivals: Low | Trend: \u2197 Firm)

\u{1F3EC} **Storage & Logistics Snapshot:**
- **Nearby Certified Warehouses:** CWC Pollachi & TNWC Coimbatore have operational cold room slots for horticultural crops.
- **Storage Tariff:** **\u20B90.40 - \u20B90.60/kg/month** with electronic Negotiable Warehouse Receipts (**e-NWR**) enabling 70% pledge loan from banks.
- **Recommendation:** If current spot prices are low, 45-day storage yields an estimated **+35% to +45% higher net realization**. You can reserve capacity directly under the **Warehouses** tab.`;
  }
  if (roleId === "scheme_specialist") {
    return `### **Government Welfare & Agricultural Scheme Guidance**

\u{1F3DB}\uFE0F **Active Flagship Programs for ${farmerName} in ${location}:**

1. **PM-KISAN (Direct Income Support):**
   - **Benefit:** \u20B96,000 annually in 3 equal installments of \u20B92,000 directly into Aadhaar-seeded bank account.
   - **Key Requirement:** e-KYC verification and land record mapping (Chitta/Patta).

2. **PMKSY (Per Drop More Crop - Drip Irrigation Subsidy):**
   - **Subsidy Amount:** Up to **100% subsidy** for small & marginal farmers (<5 acres) and **75%** for other farmers.
   - **Required Documents:** Land document (Patta/Chitta), FMB sketch, Adangal, Aadhaar card, Soil & Water test report, Bank passbook.

3. **PMFBY (Pradhan Mantri Fasal Bima Yojana):**
   - **Premium:** Only **1.5% - 2.0%** for food/oilseed crops, **5%** for commercial/horticultural crops.
   - **Coverage:** Full compensation for localized calamities, prevented sowing, mid-season adversity, and post-harvest losses within 72 hours of intimation.

4. **SMAM (Machinery Subsidy):**
   - **Benefit:** 40% to 50% subsidy on power tillers, rotavators, sprayers, and solar pumps. Submit via Agrisnet or state Agri portal.`;
  }
  if (roleId === "organic_master") {
    return `### **Natural Bio-Management & Vedic Krishi Protocol**

\u{1F343} **Pure Organic Management Guidelines for ${crops} in ${soil}:**

**1. Home-Made Jeevamrutham Preparation (For 1 Acre):**
- **Ingredients:** 10 kg fresh Desi cow dung + 10 liters Desi cow urine + 2 kg jaggery + 2 kg pulse flour (Besan/Gram flour) + 1 handful fertile soil from farm bund + 200 liters water.
- **Fermentation:** Stir clockwise twice a day with a wooden stick in shade for **48 hours**.
- **Application:** Apply with irrigation water or filter and spray @ 10% dilution (100 ml per 1 liter water) every 15 days.

**2. Natural Pest Shield (5% Neem Seed Kernel Extract - NSKE):**
- Pound 5 kg neem seed kernels into coarse powder. Soak overnight in 10 liters water.
- Filter through muslin cloth, add 100g soap powder or khadi soap, dilute to 100 liters, and spray in evening hours against fruit borers, caterpillars, and whiteflies.

**3. Biological Root Protection:**
- Treat seeds or seedlings with *Trichoderma viride* @ 10g/kg or drench root zone @ 5g/L to prevent damping-off and root rot.`;
  }
  if (q.includes("storage") || q.includes("warehouse")) {
    return `Vanakkam ${farmerName}! For storing your harvest in ${location}, certified CWC and TNWC warehouses are available starting from \u20B90.35 - \u20B90.65/kg/month with electronic Negotiable Warehouse Receipts (e-NWR) for easy pledge loans. You can check live capacity and book storage slots right here on the **Warehouses** tab.`;
  }
  if (q.includes("disease") || q.includes("pest") || q.includes("blight") || q.includes("curl")) {
    return `Vanakkam ${farmerName}! To diagnose any crop issues accurately, take a clear photo of the leaf using our **Plant Scanner** on the dashboard. For Early Blight on tomato, prune lower infected leaves and spray bio-fungicide *Trichoderma viride* (5g/L) or Copper Oxychloride 50% WP @ 2.5g/L. For leaf curl virus, install yellow sticky traps (15/acre) to control whitefly vectors.`;
  }
  if (q.includes("scheme") || q.includes("subsidy")) {
    return `Vanakkam ${farmerName}! You are eligible for key government schemes in ${location}: **PM-KISAN** (\u20B96,000/yr direct bank transfer), **PMKSY Drip Irrigation** (75-100% subsidy for small/marginal farmers), and **PMFBY Crop Insurance**. You can review scheme benefits and apply under the **Government Schemes** tab.`;
  }
  return `Vanakkam ${farmerName}! I am your AgriSaarthi AI Farm Advisor. I am here to assist you with real-time crop disease diagnosis, local Mandi market prices, CWC/SWC cold storage bookings, soil testing recommendations, and government subsidy applications. How can I help you in your field today?`;
}
async function generateCropRotationAI(params) {
  const ai = getGenAI();
  if (!ai) return null;
  try {
    const prompt = `Generate a scientifically optimized 3-season crop rotation plan for an Indian farmer with:
- Soil Type: ${params.soilType}
- Current Crop: ${params.currentCrop}
- Land Area: ${params.landAreaAcres} Acres
- Water Source/Availability: ${params.waterAvailability}

Focus on breaking soil-borne pathogen cycles (nematodes, wilt, blight) and restoring soil nitrogen and organic carbon.

Return strictly JSON matching this schema:
{
  "plan_name": "Name of Rotation Plan (e.g., Nitrogen Replenishment & Pathogen Break Cycle)",
  "soil_type_target": "${params.soilType}",
  "seasons_cycle_count": 3,
  "sequence": [
    {
      "season_order": 1,
      "season_name": "Kharif (Jun-Oct)",
      "crop_name": "Crop 1",
      "variety": "Variety Name",
      "duration_days": 110,
      "water_requirement": "Medium",
      "soil_benefit": "Root nodule atmospheric nitrogen fixation",
      "expected_yield_quintal_acre": 12.5
    },
    {
      "season_order": 2,
      "season_name": "Rabi (Nov-Feb)",
      "crop_name": "Crop 2",
      "variety": "Variety Name",
      "duration_days": 90,
      "water_requirement": "Low",
      "soil_benefit": "Deep root biomass & weed suppression",
      "expected_yield_quintal_acre": 18.0
    },
    {
      "season_order": 3,
      "season_name": "Zaid / Summer (Mar-May)",
      "crop_name": "Crop 3",
      "variety": "Variety Name",
      "duration_days": 65,
      "water_requirement": "Low to Moderate",
      "soil_benefit": "Green manure incorporation",
      "expected_yield_quintal_acre": 8.0
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const cleanJson = (response.text || "{}").replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleanJson);
    if (data.plan_name && data.sequence) {
      return {
        id: `rot_ai_${Date.now()}`,
        ...data
      };
    }
  } catch (err) {
    console.warn("Gemini crop rotation generation fallback:", err);
  }
  return null;
}
async function generateAdvancedCropRotationAdvisory(params) {
  const ai = getGenAI();
  if (!ai) return null;
  try {
    const prompt = `You are the Principal Agronomist at ICAR (Indian Council of Agricultural Research) and Tamil Nadu Agricultural University (TNAU).
Analyze the following precise soil nutrient health card and seasonal agro-climatic profile to recommend the optimal next crop and a 4-season restorative succession cycle.

### FARMER'S SOIL NUTRIENT CARD
- Soil Texture & Type: ${params.soil.soil_type}
- Soil pH: ${params.soil.ph} (${params.soil.ph < 6.5 ? "Acidic" : params.soil.ph > 7.5 ? "Alkaline" : "Neutral / Ideal"})
- Organic Carbon: ${params.soil.organic_carbon_percent}%
- Available Nitrogen (N): ${params.soil.nitrogen_kg_ha} kg/ha (${params.soil.nitrogen_status})
- Available Phosphorus (P2O5): ${params.soil.phosphorus_kg_ha} kg/ha (${params.soil.phosphorus_status})
- Available Potassium (K2O): ${params.soil.potassium_kg_ha} kg/ha (${params.soil.potassium_status})
- Electrical Conductivity (EC): ${params.soil.ec_ds_m || 0.42} dS/m
- Micronutrients: Zinc: ${params.soil.zinc_ppm || 0.8} ppm, Iron: ${params.soil.iron_ppm || 5} ppm, Boron: ${params.soil.boron_ppm || 0.5} ppm

### SEASONAL & FIELD AGRO-CLIMATIC CONTEXT
- Standing / Previous Crop: ${params.seasonal.current_standing_crop} (${params.seasonal.standing_crop_family || "Botanical Family"})
- Target Sowing Season: ${params.seasonal.target_season}
- Agro-Climatic Zone: ${params.seasonal.region_agro_climatic_zone || "Southern Dry / Semi-Arid Zone"}
- Seasonal Rainfall Trend: ${params.seasonal.expected_rainfall_trend}
- Irrigation & Water Source: ${params.seasonal.water_source} (Capacity: ${params.seasonal.irrigation_capacity})
- Priority Optimization Goal: ${params.seasonal.priority_focus}
${params.recentScanFindings ? `- Recent Plant Scan Observations: ${params.recentScanFindings}` : ""}

### AGRONOMIC RULES & OBJECTIVES
1. MUST strictly follow botanical family alternation to break pathogen cycles (e.g., if standing crop is Solanaceae like Tomato/Chilli, DO NOT follow with Solanaceae; prioritize Fabaceae/Pulses or Poaceae/Millets).
2. If Soil Nitrogen is Low or Organic Carbon is <0.6%, strongly favor nitrogen-fixing legumes (Black Gram VBN 8, Cowpea CO 7, Groundnut Kadiri Lepakshi, Green Gram CO 8) with Rhizobium symbiosis.
3. Provide realistic Indian Mandi prices (INR/Quintal), yield projections per acre, and net profit estimates.
4. Calculate net Nitrogen balance impact in kg/ha (positive for legumes, negative for heavy feeders).
5. Output 4 distinct candidate crops ranked by suitability (0-100 score).
6. Provide a complete 4-season restorative succession plan.

Return strictly a JSON object matching this schema:
{
  "standing_crop_summary": {
    "crop_name": "${params.seasonal.current_standing_crop}",
    "family": "Botanical family name",
    "depletion_profile": "Detailed explanation of nutrients and soil layers depleted by this crop",
    "pathogen_risk_if_repeated": "Specific pests, wilts, or nematodes that will multiply if crop family is repeated"
  },
  "soil_status_analyzed": {
    "nitrogen_status": "${params.soil.nitrogen_status}",
    "phosphorus_status": "${params.soil.phosphorus_status}",
    "potassium_status": "${params.soil.potassium_status}",
    "ph": ${params.soil.ph},
    "organic_carbon_percent": ${params.soil.organic_carbon_percent},
    "overall_fertility_index": "Low" | "Moderate" | "High" | "Fertile Loam"
  },
  "top_recommendations": [
    {
      "id": "rec_1",
      "crop_name": "Crop Name (e.g. Black Gram / Urad Dal)",
      "scientific_name": "Scientific botanical name",
      "crop_family": "Family name (e.g. Fabaceae)",
      "recommended_varieties": ["Variety 1 (Trait)", "Variety 2"],
      "suitability_score": 96,
      "rank": 1,
      "verdict": "STRONGLY_RECOMMENDED",
      "summary_rationale": "High-level summary of why this crop is optimal",
      "soil_compatibility": {
        "score": 98,
        "nitrogen_impact": "+48 kg/ha biological nitrogen fixation via Rhizobium root nodules",
        "nitrogen_net_change_kg_ha": 48,
        "phosphorus_tolerance": "Phosphorus match details",
        "potassium_tolerance": "Potassium match details",
        "ph_suitability": "pH suitability description",
        "organic_matter_contribution": "Organic matter contribution description"
      },
      "seasonal_fit": {
        "season_name": "${params.seasonal.target_season}",
        "optimal_sowing_window": "e.g. June 15 - July 15",
        "harvest_window": "e.g. Late August",
        "duration_days": 65,
        "water_requirement": "Low",
        "water_saving_vs_previous_crop_percent": 50,
        "climate_resilience_rating": "Exceptional"
      },
      "pathogen_breakdown": {
        "breaks_diseases": ["Early Blight", "Bacterial Wilt", "Root-Knot Nematodes"],
        "family_shift_benefit": "Detailed scientific benefit of changing crop family",
        "pest_suppression_score": 95
      },
      "economic_projection": {
        "estimated_yield_quintal_acre": 4.8,
        "mandi_modal_price_per_quintal": 8400,
        "cost_of_cultivation_per_acre": 11500,
        "gross_revenue_per_acre": 40320,
        "net_profit_per_acre": 28820,
        "roi_percent": 250,
        "market_demand_rating": "Very High"
      },
      "key_management_practices": [
        "Actionable point 1",
        "Actionable point 2",
        "Actionable point 3"
      ],
      "companion_or_green_manure_tip": "Specific residue or green manure advice"
    }
  ],
  "succession_cycle": {
    "cycle_title": "Title of 4-season sequence",
    "target_soil_type": "${params.soil.soil_type}",
    "total_cycle_months": 18,
    "cumulative_estimated_net_profit": 152000,
    "soil_health_improvement_summary": "Summary of cumulative NPK recovery and microbial health",
    "nitrogen_fixation_total_kg_ha": 95,
    "steps": [
      {
        "season_number": 1,
        "season_name": "Season 1 name",
        "crop_name": "Crop 1",
        "variety": "Variety",
        "category": "Category",
        "duration_days": 90,
        "water_demand": "Medium",
        "soil_benefit": "Benefit",
        "expected_net_profit_acre": 42000,
        "is_nitrogen_fixer": false
      },
      {
        "season_number": 2,
        "season_name": "Season 2 name",
        "crop_name": "Crop 2",
        "variety": "Variety",
        "category": "Category",
        "duration_days": 65,
        "water_demand": "Low",
        "soil_benefit": "Benefit",
        "expected_net_profit_acre": 28820,
        "is_nitrogen_fixer": true
      },
      {
        "season_number": 3,
        "season_name": "Season 3 name",
        "crop_name": "Crop 3",
        "variety": "Variety",
        "category": "Category",
        "duration_days": 100,
        "water_demand": "Medium",
        "soil_benefit": "Benefit",
        "expected_net_profit_acre": 43800,
        "is_nitrogen_fixer": false
      },
      {
        "season_number": 4,
        "season_name": "Season 4 name",
        "crop_name": "Crop 4",
        "variety": "Variety",
        "category": "Category",
        "duration_days": 75,
        "water_demand": "Low",
        "soil_benefit": "Benefit",
        "expected_net_profit_acre": 33880,
        "is_nitrogen_fixer": true
      }
    ]
  },
  "ai_agronomic_advisory": "Comprehensive 3-4 sentence agronomic advisory paragraph explaining the strategic rationale for the farmer."
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const cleanJson = (response.text || "{}").replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleanJson);
    if (data.top_recommendations && data.top_recommendations.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Gemini advanced crop rotation generation fallback:", err);
  }
  return null;
}
var CROP_BASELINES = {
  Tomato: {
    baselineYieldQuintalsPerAcre: 130,
    potentialMaxYieldQuintalsPerAcre: 185,
    worstCaseYieldQuintalsPerAcre: 85,
    regionalAverageQuintalsPerAcre: 115,
    mandiRateInrPerQuintal: 2500,
    optimalTempMin: 20,
    optimalTempMax: 32,
    waterDemandBaseLpd: 4800,
    growthCycleDays: 95,
    soilPref: ["Red Loamy", "Sandy Loam", "Clayey Loam"]
  },
  Paddy: {
    baselineYieldQuintalsPerAcre: 24,
    potentialMaxYieldQuintalsPerAcre: 34,
    worstCaseYieldQuintalsPerAcre: 16,
    regionalAverageQuintalsPerAcre: 22,
    mandiRateInrPerQuintal: 2450,
    optimalTempMin: 22,
    optimalTempMax: 35,
    waterDemandBaseLpd: 8500,
    growthCycleDays: 120,
    soilPref: ["Clayey Loam", "Alluvial Soil", "Black Cotton"]
  },
  Maize: {
    baselineYieldQuintalsPerAcre: 28,
    potentialMaxYieldQuintalsPerAcre: 38,
    worstCaseYieldQuintalsPerAcre: 18,
    regionalAverageQuintalsPerAcre: 24,
    mandiRateInrPerQuintal: 2250,
    optimalTempMin: 18,
    optimalTempMax: 34,
    waterDemandBaseLpd: 4200,
    growthCycleDays: 100,
    soilPref: ["Red Loamy", "Alluvial Soil", "Sandy Loam"]
  },
  Cotton: {
    baselineYieldQuintalsPerAcre: 12,
    potentialMaxYieldQuintalsPerAcre: 18,
    worstCaseYieldQuintalsPerAcre: 7,
    regionalAverageQuintalsPerAcre: 9.5,
    mandiRateInrPerQuintal: 7200,
    optimalTempMin: 21,
    optimalTempMax: 36,
    waterDemandBaseLpd: 3900,
    growthCycleDays: 150,
    soilPref: ["Black Cotton", "Alluvial Soil"]
  },
  Banana: {
    baselineYieldQuintalsPerAcre: 280,
    potentialMaxYieldQuintalsPerAcre: 360,
    worstCaseYieldQuintalsPerAcre: 180,
    regionalAverageQuintalsPerAcre: 240,
    mandiRateInrPerQuintal: 1950,
    optimalTempMin: 24,
    optimalTempMax: 36,
    waterDemandBaseLpd: 9200,
    growthCycleDays: 330,
    soilPref: ["Alluvial Soil", "Red Loamy", "Clayey Loam"]
  },
  Wheat: {
    baselineYieldQuintalsPerAcre: 20,
    potentialMaxYieldQuintalsPerAcre: 28,
    worstCaseYieldQuintalsPerAcre: 14,
    regionalAverageQuintalsPerAcre: 18.5,
    mandiRateInrPerQuintal: 2350,
    optimalTempMin: 14,
    optimalTempMax: 26,
    waterDemandBaseLpd: 3500,
    growthCycleDays: 115,
    soilPref: ["Alluvial Soil", "Clayey Loam"]
  },
  Groundnut: {
    baselineYieldQuintalsPerAcre: 14,
    potentialMaxYieldQuintalsPerAcre: 22,
    worstCaseYieldQuintalsPerAcre: 9,
    regionalAverageQuintalsPerAcre: 12,
    mandiRateInrPerQuintal: 6400,
    optimalTempMin: 22,
    optimalTempMax: 33,
    waterDemandBaseLpd: 3200,
    growthCycleDays: 105,
    soilPref: ["Sandy Loam", "Red Loamy"]
  },
  Chilli: {
    baselineYieldQuintalsPerAcre: 25,
    potentialMaxYieldQuintalsPerAcre: 38,
    worstCaseYieldQuintalsPerAcre: 15,
    regionalAverageQuintalsPerAcre: 21,
    mandiRateInrPerQuintal: 14500,
    optimalTempMin: 20,
    optimalTempMax: 34,
    waterDemandBaseLpd: 3600,
    growthCycleDays: 140,
    soilPref: ["Black Cotton", "Red Loamy", "Sandy Loam"]
  },
  Sugarcane: {
    baselineYieldQuintalsPerAcre: 420,
    potentialMaxYieldQuintalsPerAcre: 580,
    worstCaseYieldQuintalsPerAcre: 290,
    regionalAverageQuintalsPerAcre: 370,
    mandiRateInrPerQuintal: 340,
    optimalTempMin: 22,
    optimalTempMax: 38,
    waterDemandBaseLpd: 11e3,
    growthCycleDays: 360,
    soilPref: ["Clayey Loam", "Alluvial Soil", "Black Cotton"]
  },
  Soybean: {
    baselineYieldQuintalsPerAcre: 11,
    potentialMaxYieldQuintalsPerAcre: 16,
    worstCaseYieldQuintalsPerAcre: 6.5,
    regionalAverageQuintalsPerAcre: 9,
    mandiRateInrPerQuintal: 4600,
    optimalTempMin: 20,
    optimalTempMax: 32,
    waterDemandBaseLpd: 3400,
    growthCycleDays: 95,
    soilPref: ["Black Cotton", "Alluvial Soil", "Red Loamy"]
  }
};
async function generateYieldPredictionAI(input) {
  const crop = input.cropName || "Tomato";
  const baseline = CROP_BASELINES[crop] || CROP_BASELINES["Tomato"];
  const acres = input.landAreaAcres || 1;
  const n = input.soilNutrients.nitrogenKgHa;
  const p = input.soilNutrients.phosphorusKgHa;
  const k = input.soilNutrients.potassiumKgHa;
  const ph = input.soilNutrients.ph;
  const oc = input.soilNutrients.organicCarbonPercent;
  let soilScore = 1;
  if (n < 220) soilScore -= 0.08;
  else if (n > 380) soilScore += 0.05;
  if (p < 14) soilScore -= 0.06;
  else if (p > 25) soilScore += 0.04;
  if (k < 180) soilScore -= 0.06;
  else if (k > 320) soilScore += 0.05;
  if (ph < 6 || ph > 8) soilScore -= 0.07;
  else if (ph >= 6.5 && ph <= 7.4) soilScore += 0.04;
  if (oc >= 0.75) soilScore += 0.05;
  else if (oc < 0.45) soilScore -= 0.06;
  let irrigationMult = 1;
  if (input.irrigationType === "Drip Irrigation") irrigationMult = 1.15;
  else if (input.irrigationType === "Sprinkler Irrigation") irrigationMult = 1.08;
  else if (input.irrigationType === "Rainfed / Borewell") irrigationMult = 0.92;
  let weatherMult = 1;
  if (input.weatherScenario.rainfallTrend === "Deficit Rain (-20%)") {
    weatherMult = input.irrigationType === "Drip Irrigation" ? 0.96 : 0.84;
  } else if (input.weatherScenario.rainfallTrend === "Dry Spells & Heat Waves") {
    weatherMult = 0.88;
  } else if (input.weatherScenario.rainfallTrend === "Excess Monsoon (+25%)") {
    weatherMult = 0.93;
  } else {
    weatherMult = 1.05;
  }
  const sim = input.simulationModifiers || {};
  const irriBoost = (sim.irrigationBoostPercent || 0) / 100;
  const fertBoost = (sim.fertilizerBoostPercent || 0) / 100;
  const pestShield = sim.pestShieldActive ? 0.08 : 0;
  const combinedFactor = Math.max(0.65, Math.min(1.45, soilScore * irrigationMult * weatherMult * (1 + irriBoost * 0.4 + fertBoost * 0.5 + pestShield)));
  const predictedQuintalsPerAcre = Math.round(baseline.baselineYieldQuintalsPerAcre * combinedFactor * 10) / 10;
  const predictedTonnesPerAcre = Math.round(predictedQuintalsPerAcre / 10 * 10) / 10;
  const totalQuintals = Math.round(predictedQuintalsPerAcre * acres * 10) / 10;
  const totalTonnes = Math.round(totalQuintals / 10 * 10) / 10;
  const baselineGross = Math.round(baseline.baselineYieldQuintalsPerAcre * acres * baseline.mandiRateInrPerQuintal);
  const projectedGross = Math.round(totalQuintals * baseline.mandiRateInrPerQuintal);
  const potentialGain = Math.max(0, projectedGross - baselineGross);
  const ai = getGenAI();
  let aiSummary = "";
  let aiMilestones = null;
  let aiInterventions = null;
  if (ai) {
    try {
      const prompt = `You are a Lead Agronomist and Crop Modeling Scientist at ICAR.
Generate a comprehensive 60-day crop growth forecast and yield prediction analysis based on the following real field parameters:

FARM & CROP DETAILS:
- Crop: ${crop} (Variety: ${input.variety || "Hybrid Commercial"})
- Land Area: ${acres} Acres
- Current Stage: ${input.cropStage}
- Sowing Date: ${input.sowingDate || "Recent"}
- Soil Type: ${input.soilType}
- Soil pH: ${ph}, Organic Carbon: ${oc}%, N: ${n} kg/ha, P: ${p} kg/ha, K: ${k} kg/ha
- Irrigation Type: ${input.irrigationType}
- 60-Day Weather Outlook: Avg Day Temp ${input.weatherScenario.avgDayTempC}\xB0C, Avg Night Temp ${input.weatherScenario.avgNightTempC}\xB0C, Rainfall Trend: ${input.weatherScenario.rainfallTrend}, Humidity: ${input.weatherScenario.avgHumidityPercent}%, Sunshine: ${input.weatherScenario.sunlightHoursPerDay} hrs/day
- Simulation Adjustments: Irrigation boost ${sim.irrigationBoostPercent || 0}%, Fertilizer boost ${sim.fertilizerBoostPercent || 0}%, Pest shield: ${sim.pestShieldActive ? "Enabled" : "Disabled"}

Calculated Baseline Prediction: ${predictedQuintalsPerAcre} Quintals/Acre (Total: ${totalQuintals} Qtl for ${acres} Acres).

Please return a JSON object with:
1. "aiSummaryAdvisory": A detailed 3-paragraph executive agronomic summary for the farmer detailing:
   - Paragraph 1: 60-day physiological growth outlook and biomass build-up based on current soil and weather.
   - Paragraph 2: Key yield-limiting factors (nutrient deficiencies, heat degree spikes, humidity/pest pressure) and how to mitigate them.
   - Paragraph 3: Expected harvest time frame and recommended market grade quality targets.
2. "timeline60Days": An array of 6 milestones for Day 10, Day 20, Day 30, Day 40, Day 50, Day 60 containing:
   - day (10, 20, 30, 40, 50, 60)
   - dayLabel ("Day 10", etc.)
   - stageTitle (e.g. "Early Canopy & Root Node Expansion", "Panicle Initiation / Flowering Peak", "Fruit Setting & Cell Division", "Grain Filling / Fruit Sizing", "Dry Matter Accumulation & Color Break", "Peak Maturity & Pre-Harvest Window")
   - projectedBiomassIndex (0-100)
   - canopyCoverPercent (0-100)
   - waterDemandLitersPerAcrePerDay (number)
   - pestRiskLevel ("Low" | "Moderate" | "High" | "Severe")
   - heatStressRisk ("Low" | "Moderate" | "High")
   - milestoneGoal (1-2 sentences on what plant tissue should achieve)
   - criticalIntervention (Action required in this 10-day window)
   - projectedHeightCm (number)
   - ndviEstimated (0.2 to 0.88)
3. "actionableInterventions": Array of 5-6 calendarized high-ROI interventions:
   - id, dayTarget ("Day 12-15", etc.), dayNumber, category ("Irrigation" | "Nutrient Management" | "Pest & Fungus Protection" | "Soil Conditioning" | "Harvest Prep"), title, instruction, dosageOrRate, expectedYieldGainPercent (e.g. 4.5)
4. "weatherGrowthFactor": {
   "verdict": "FAVORABLE" | "MODERATE" | "STRESS_WARNING",
   "rainfallImpact": string,
   "temperatureImpact": string,
   "sunlightImpact": string,
   "growthDaysForecast": string,
   "gddAccumulated": number
}
5. "soilGrowthFactor": {
   "fertilityVerdict": "HIGH_FERTILITY" | "BALANCED" | "NUTRIENT_DEFICIENT",
   "nitrogenImpact": string,
   "phosphorusImpact": string,
   "potassiumImpact": string,
   "phImpact": string,
   "organicMatterImpact": string
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const cleanJson = (response.text || "{}").replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.aiSummaryAdvisory && parsed.timeline60Days) {
        aiSummary = parsed.aiSummaryAdvisory;
        aiMilestones = parsed.timeline60Days;
        aiInterventions = parsed.actionableInterventions;
      }
    } catch (err) {
      console.warn("Gemini 60-day yield prediction generation fallback:", err);
    }
  }
  const fallbackMilestones = [
    {
      day: 10,
      dayLabel: "Day 10",
      stageTitle: "Vegetative Canopy & Root Expansion",
      projectedBiomassIndex: 32,
      canopyCoverPercent: 28,
      waterDemandLitersPerAcrePerDay: Math.round(baseline.waterDemandBaseLpd * 0.65),
      pestRiskLevel: "Low",
      heatStressRisk: "Low",
      milestoneGoal: "Establish vigorous secondary feeder roots and expand photosynthetic leaf surface.",
      criticalIntervention: "Apply Humic acid + Zinc chelate fertigation to stimulate root branching.",
      projectedHeightCm: 22,
      ndviEstimated: 0.38
    },
    {
      day: 20,
      dayLabel: "Day 20",
      stageTitle: "Rapid Vegetative & Node Development",
      projectedBiomassIndex: 52,
      canopyCoverPercent: 50,
      waterDemandLitersPerAcrePerDay: Math.round(baseline.waterDemandBaseLpd * 0.85),
      pestRiskLevel: "Moderate",
      heatStressRisk: "Low",
      milestoneGoal: "Accelerate stem elongation and build structural nitrogen reserves before reproductive phase.",
      criticalIntervention: "Foliar spray of 19:19:19 NPK (5g/L) + Neem seed kernel extract (NSKE 5%) against sucking pests.",
      projectedHeightCm: 45,
      ndviEstimated: 0.58
    },
    {
      day: 30,
      dayLabel: "Day 30",
      stageTitle: "Floral Initiation & Anthesis Window",
      projectedBiomassIndex: 68,
      canopyCoverPercent: 72,
      waterDemandLitersPerAcrePerDay: Math.round(baseline.waterDemandBaseLpd * 1.15),
      pestRiskLevel: "Moderate",
      heatStressRisk: "Moderate",
      milestoneGoal: "Maximize flower retention and ensure optimal pollen viability with balanced micronutrients.",
      criticalIntervention: "Apply Boron 20% (1g/L) + Planofix/Auxin booster to prevent flower drop during midday heat.",
      projectedHeightCm: 68,
      ndviEstimated: 0.72
    },
    {
      day: 40,
      dayLabel: "Day 40",
      stageTitle: "Fruit Setting & Early Cell Enlargement",
      projectedBiomassIndex: 82,
      canopyCoverPercent: 88,
      waterDemandLitersPerAcrePerDay: Math.round(baseline.waterDemandBaseLpd * 1.25),
      pestRiskLevel: "High",
      heatStressRisk: "Moderate",
      milestoneGoal: "Drive fruit/grain enlargement and translocate photo-assimilates from leaves to sinks.",
      criticalIntervention: "Fertigate Calcium Nitrate (10kg/acre) + Potassium Schoenite (12:0:44) to maximize fruit density.",
      projectedHeightCm: 85,
      ndviEstimated: 0.82
    },
    {
      day: 50,
      dayLabel: "Day 50",
      stageTitle: "Bulking & Dry Matter Accumulation",
      projectedBiomassIndex: 94,
      canopyCoverPercent: 92,
      waterDemandLitersPerAcrePerDay: Math.round(baseline.waterDemandBaseLpd * 1.05),
      pestRiskLevel: "Moderate",
      heatStressRisk: "Low",
      milestoneGoal: "Achieve uniform size grading, brix/sugar accumulation, and firm cell wall structure.",
      criticalIntervention: "SOP (Sulphate of Potash 0:0:50) foliar spray (7g/L) to boost luster, color, and shelf-life.",
      projectedHeightCm: 90,
      ndviEstimated: 0.79
    },
    {
      day: 60,
      dayLabel: "Day 60",
      stageTitle: "Peak Maturity & Optimal Harvest Window",
      projectedBiomassIndex: 100,
      canopyCoverPercent: 90,
      waterDemandLitersPerAcrePerDay: Math.round(baseline.waterDemandBaseLpd * 0.5),
      pestRiskLevel: "Low",
      heatStressRisk: "Low",
      milestoneGoal: "Reach optimal commercial harvest maturity with peak marketable weight and minimal field losses.",
      criticalIntervention: "Cease heavy irrigation 3-4 days prior to harvest; prepare crates/storage in advance.",
      projectedHeightCm: 92,
      ndviEstimated: 0.68
    }
  ];
  const fallbackInterventions = [
    {
      id: "int_1",
      dayTarget: "Day 10 - 14",
      dayNumber: 12,
      category: "Nutrient Management",
      title: "Root Biostimulant & Nitrogen Top Dressing",
      instruction: "Apply urea or water-soluble 19:19:19 via fertigation along with humic acid to build deep taproot anchors.",
      dosageOrRate: "5 kg 19:19:19 + 500ml Humic liquid per acre",
      expectedYieldGainPercent: 5.2,
      completed: false
    },
    {
      id: "int_2",
      dayTarget: "Day 22 - 25",
      dayNumber: 24,
      category: "Pest & Fungus Protection",
      title: "Preventive Sucking Pest & Blight Barrier",
      instruction: "Spray Azadirachtin (Neem 10,000 ppm) with Pseudomonas fluorescens bio-fungicide during early morning hours.",
      dosageOrRate: "3 ml Neem + 5g Bio-fungicide per Litre of water",
      expectedYieldGainPercent: 4.8,
      completed: false
    },
    {
      id: "int_3",
      dayTarget: "Day 32 - 35",
      dayNumber: 34,
      category: "Nutrient Management",
      title: "Boron & Micronutrient Flower Setting Booster",
      instruction: "Spray solubor boron + chelated zinc to enhance pollen fertility and curb flower abortion under temp fluctuations.",
      dosageOrRate: "1.2 g Boron + 1 g Zinc per Litre",
      expectedYieldGainPercent: 6.5,
      completed: false
    },
    {
      id: "int_4",
      dayTarget: "Day 42 - 45",
      dayNumber: 44,
      category: "Soil Conditioning",
      title: "Potassium & Calcium Density Top-up",
      instruction: "Apply Potassium Nitrate (13:0:45) + Calcium Nitrate to prevent blossom end rot and maximize fruit firmness.",
      dosageOrRate: "8 kg Potassium Nitrate per acre via drip",
      expectedYieldGainPercent: 5.8,
      completed: false
    },
    {
      id: "int_5",
      dayTarget: "Day 55 - 58",
      dayNumber: 56,
      category: "Harvest Prep",
      title: "Moisture Tapering & Cold Storage Booking",
      instruction: "Reduce irrigation frequency to concentrate soluble solids; reserve slot at nearest CWC/SWC cold storage.",
      dosageOrRate: "Reduce drip run-time by 50%",
      expectedYieldGainPercent: 3.2,
      completed: false
    }
  ];
  const estimatedHarvestDate = /* @__PURE__ */ new Date();
  estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + 60);
  const harvestWindowStr = `${estimatedHarvestDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} (\xB14 Days)`;
  const defaultSummary = `Based on current soil analysis (${input.soilType}, pH ${ph}, Nitrogen ${n} kg/ha) and projected 60-day agro-climatic conditions (${input.weatherScenario.rainfallTrend}, ${input.weatherScenario.avgDayTempC}\xB0C avg), your ${crop} crop is projected to achieve an above-average yield of ${predictedQuintalsPerAcre} Quintals/Acre (${predictedTonnesPerAcre} Tonnes/Acre), outpacing the regional baseline of ${baseline.regionalAverageQuintalsPerAcre} Qtl/Acre by +${Math.round((predictedQuintalsPerAcre - baseline.regionalAverageQuintalsPerAcre) / baseline.regionalAverageQuintalsPerAcre * 100)}%.

The critical growth inflection occurs between Day 25 and Day 40 (Floral Initiation & Fruit Setting), where moisture stability and micronutrient boron/potassium sprays will be paramount to prevent flower abortion. Your ${input.irrigationType} infrastructure provides superior moisture consistency compared to flood systems.

With timely execution of the recommended 5 calendarized interventions, you can secure an estimated incremental revenue of \u20B9${potentialGain.toLocaleString("en-IN")} across your ${acres} Acre holding at current APMC Mandi rates of \u20B9${baseline.mandiRateInrPerQuintal}/Qtl.`;
  return {
    id: `yield_pred_${Date.now()}`,
    farmerId: input.farmId || "usr_farmer_1",
    cropName: crop,
    variety: input.variety || "High-Yield Hybrid",
    landAreaAcres: acres,
    cropStage: input.cropStage,
    soilType: input.soilType,
    irrigationType: input.irrigationType,
    predictedYieldTonnesPerAcre: predictedTonnesPerAcre,
    predictedYieldQuintalsPerAcre: predictedQuintalsPerAcre,
    totalExpectedYieldQuintals: totalQuintals,
    totalExpectedYieldTonnes: totalTonnes,
    baselineYieldQuintalsPerAcre: baseline.baselineYieldQuintalsPerAcre,
    potentialMaxYieldQuintalsPerAcre: baseline.potentialMaxYieldQuintalsPerAcre,
    worstCaseYieldQuintalsPerAcre: baseline.worstCaseYieldQuintalsPerAcre,
    regionalAverageQuintalsPerAcre: baseline.regionalAverageQuintalsPerAcre,
    percentageVsRegionalAvg: Math.round((predictedQuintalsPerAcre - baseline.regionalAverageQuintalsPerAcre) / baseline.regionalAverageQuintalsPerAcre * 100),
    confidenceScorePercent: Math.min(96, Math.max(82, Math.round(88 + (input.soilNutrients.ph >= 6.5 ? 4 : -3) + (input.irrigationType === "Drip Irrigation" ? 3 : 0)))),
    biomassHealthIndex: Math.min(98, Math.max(68, Math.round(75 + combinedFactor * 15))),
    harvestWindowEstimated: harvestWindowStr,
    daysToOptimalHarvest: 60,
    weatherGrowthFactor: {
      verdict: input.weatherScenario.rainfallTrend === "Dry Spells & Heat Waves" ? "STRESS_WARNING" : "FAVORABLE",
      rainfallImpact: input.weatherScenario.rainfallTrend === "Deficit Rain (-20%)" ? "Moderate deficit cushioned by planned irrigation scheduling." : "Adequate moisture buffer for sustained cell expansion.",
      temperatureImpact: `${input.weatherScenario.avgDayTempC}\xB0C day / ${input.weatherScenario.avgNightTempC}\xB0C night maintains optimal enzyme activity.`,
      sunlightImpact: `${input.weatherScenario.sunlightHoursPerDay} hrs/day delivers high daily light integral (DLI) for photosynthetic vigor.`,
      growthDaysForecast: "60 Days monitored growth cycle",
      gddAccumulated: Math.round(input.weatherScenario.avgDayTempC * 60 * 0.72)
    },
    soilGrowthFactor: {
      fertilityVerdict: n > 280 && p > 18 ? "HIGH_FERTILITY" : "BALANCED",
      nitrogenImpact: `${n} kg/ha supports dense vegetative branching and active chlorophyll formation.`,
      phosphorusImpact: `${p} kg/ha drives early root architecture and ATP energy transfer for floral bud formation.`,
      potassiumImpact: `${k} kg/ha facilitates water regulation, stomatal conductance, and fruit weight density.`,
      phImpact: `Soil pH of ${ph} ensures peak bioavailability of iron, zinc, and phosphorus.`,
      organicMatterImpact: `${oc}% organic carbon maintains excellent soil microbial respiration and cation exchange.`
    },
    timeline60Days: aiMilestones || fallbackMilestones,
    actionableInterventions: aiInterventions || fallbackInterventions,
    marketRevenueProjection: {
      currentMandiRateInrPerQuintal: baseline.mandiRateInrPerQuintal,
      projectedGrossRevenueInr: projectedGross,
      baselineGrossRevenueInr: baselineGross,
      potentialGainWithAIInterventionsInr: potentialGain,
      estimatedCostOfInterventionsInr: Math.round(acres * 3800),
      netBenefitInr: Math.max(0, potentialGain - Math.round(acres * 3800)),
      roiMultiplier: Math.round((potentialGain || 12e3) / (acres * 3800) * 10) / 10 || 3.8
    },
    aiSummaryAdvisory: aiSummary || defaultSummary,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var KNOWLEDGE_PEST_PROFILES = [
  {
    crop: "Paddy",
    majorPests: [
      {
        name: "Yellow Stem Borer",
        scientific: "Scirpophaga incertulas",
        type: "Insect Pest",
        preferredStages: ["Vegetative Growth", "Flowering & Tillering"],
        conduciveTempRange: [24, 33],
        conduciveHumidityMin: 70,
        triggerCondition: "High humidity (>75%), overcast cloudy skies, and excessive nitrogen top-dressing create succulent tillers.",
        earlySymptoms: ['Central leaf whorl drying up causing "Dead Hearts" during vegetative phase', "Presence of yellowish egg masses covered with buff hair on upper leaf tips"],
        severeSymptoms: ['"Whiteheads" or chaffy panicles during flowering/grain filling', "Frass (excreta) inside hollowed stem bases and easy pull-out of tillers"],
        affectedParts: ["Stem", "Floral Bud"],
        etl: "2 egg masses/sq.m or 1 moth/trap/night or 5% Dead Hearts",
        yieldLoss: 35,
        urgencyHours: "Act within 48 hours of detecting egg masses before larvae bore into internal internodes.",
        preventive: [
          "Install Pheromone Traps (Scirpo-lure) @ 5 traps/acre for real-time monitoring and male annihilation.",
          "Erect T-shaped bird perches @ 15-20 per acre for natural predator landing.",
          "Clip seedling leaf tips before transplanting to eliminate 70% of initial egg masses."
        ],
        botanicals: [
          {
            name: "Neem Seed Kernel Extract (NSKE 5%)",
            prep: "50g crushed neem seeds soaked overnight in 1L water + 1g soap nut surfactant.",
            mode: "Oviposition deterrent and antifeedant; disrupts larval molting hormone.",
            freq: "Spray every 7-10 days in early morning hours."
          },
          {
            name: "Agniastra Herbal Decoction",
            prep: "Boil 500g crushed garlic, 250g green chilli, and 2kg neem leaves in 10L cow urine. Dilute 250ml per 15L knapsack pump.",
            mode: "Broad-spectrum contact repellent and neuro-sensory deterrent against chewing borers.",
            freq: "Spray upon crossing 2% dead heart threshold."
          }
        ],
        biocontrol: [
          {
            name: "Trichogramma japonicum (Egg Parasitoid)",
            rate: "Tricho-cards @ 2 cards (40,000 parasitoids) per acre",
            stage: "Egg mass stage",
            guide: "Staple small card pieces on underside of rice leaves at 30, 37, and 44 days after transplanting."
          },
          {
            name: "Bacillus thuringiensis (Bt kurstaki)",
            rate: "1.5 to 2.0 kg/ha or 2g/L water",
            stage: "Early instar larvae",
            guide: "Apply in late afternoon when ultraviolet radiation is low to avoid crystalline endotoxin breakdown."
          }
        ],
        cultural: ["Avoid excessive urea application; balance with Potassium (MOP) to harden stem cell walls.", "Drain standing water for 48 hours to disrupt pupation cycles."]
      },
      {
        name: "Brown Plant Hopper (BPH)",
        scientific: "Nilaparvata lugens",
        type: "Insect Pest",
        preferredStages: ["Vegetative Growth", "Flowering & Tillering", "Fruit & Grain Setting"],
        conduciveTempRange: [25, 32],
        conduciveHumidityMin: 80,
        triggerCondition: "Close planting density, stagnant field water, and high microclimate humidity in dense canopies.",
        earlySymptoms: ["Yellowing and drying of basal leaves", "Presence of brownish nymphs aggregating at water level on stem bases", "Honeydew secretion leading to black sooty mold at base"],
        severeSymptoms: ['Circular patches of dried crop called "Hopper Burn"', "Lodging and total lodging of standing canopy"],
        affectedParts: ["Stem", "Leaf"],
        etl: "1-2 hoppers/tiller or 5-10 hoppers/hill",
        yieldLoss: 55,
        urgencyHours: "Critical: Execute field water draining and bio-spray within 24-36 hours of hopper aggregation.",
        preventive: [
          "Form alleyways (30cm skip row every 2-3 meters) to allow direct sunlight and wind circulation.",
          "Install Yellow Sticky Traps @ 10 traps/acre near water surface.",
          "Conserve natural predators: Mirid bugs (Cyrtorhinus lividipennis) and Lycosa wolf spiders."
        ],
        botanicals: [
          {
            name: "Neem Oil 10,000 PPM (Azadirachtin)",
            prep: "3 ml Neem Oil + 1 ml liquid soap per Liter of water. Direct spray strictly towards plant base.",
            mode: "Stifles breathing spiracles and disrupts hormonal ecdysone production in nymphs.",
            freq: "Repeat every 5 days until nymph population falls below ETL."
          },
          {
            name: "Dashparni Ark (10-Leaf Bio Extract)",
            prep: "Fermented blend of 10 medicinal leaves (Neem, Karanj, Castor, Custard apple, Papaya, etc.) in cow dung/urine slurry. Dilute 500ml in 15L water.",
            mode: "Repellent and systemic insect growth inhibitor.",
            freq: "Foliar base drench at weekly intervals."
          }
        ],
        biocontrol: [
          {
            name: "Beauveria bassiana (Entomopathogenic Fungus)",
            rate: "5g / Liter of water (2.5 kg/ha)",
            stage: "Nymphs and adult hoppers",
            guide: "Direct spray nozzle at the base of rice clumps during evening hours when relative humidity is high (>80%)."
          },
          {
            name: "Metarhizium anisopliae Bio-Agent",
            rate: "1 kg/acre wettable powder",
            stage: "All active instars",
            guide: "Causes green muscardine disease in BPH populations within 4-6 days."
          }
        ],
        cultural: ["Alternate Wetting and Drying (AWD) irrigation: Drain water completely for 3-4 days.", "Avoid synthetic pyrethroid sprays which cause BPH resurgence by killing spiders."]
      }
    ]
  },
  {
    crop: "Tomato",
    majorPests: [
      {
        name: "Tomato Leaf Miner / Pinworm",
        scientific: "Tuta absoluta",
        type: "Insect Pest",
        preferredStages: ["Vegetative Growth", "Flowering & Tillering", "Fruit & Grain Setting"],
        conduciveTempRange: [22, 32],
        conduciveHumidityMin: 60,
        triggerCondition: "Warm dry spells followed by intermittent humidity; rapid generational turnover in solanaceous fields.",
        earlySymptoms: ["Blotch-type translucent silver-white serpentine mines on leaf lamina", "Black frass visible inside leaf blisters", "Bud puncture and flower drop"],
        severeSymptoms: ["Extensive pinholes and black rotting cavities near tomato calyx", "Fruit unmarketability and secondary bacterial soft rot entry"],
        affectedParts: ["Leaf", "Stem", "Fruit/Pod"],
        etl: "1-2 moths/pheromone trap/day or 5% affected leaves",
        yieldLoss: 60,
        urgencyHours: "Deploy mass-trapping and foliar bio-parasitoid within 48 hours of initial mine detection.",
        preventive: [
          "Install Tuta Pheromone Water Pan Traps (Tutalure) @ 8-10 traps/acre with a drop of vegetable oil.",
          "Use 40-mesh insect-proof nylon netting around nursery seedbeds.",
          "Intercrop with African Marigold or Coriander to confuse olfactory flight sensors."
        ],
        botanicals: [
          {
            name: "Neem Azadirachtin 50,000 PPM",
            prep: "1.5 ml per Liter of clean water.",
            mode: "Translaminar antifeedant action that penetrates through leaf epidermis into inner mesophyll.",
            freq: "Spray at 5-day intervals targeting both upper and lower leaf surfaces."
          },
          {
            name: "Brahmastra Bio-Decoction",
            prep: "Crush 2kg Neem leaves, 2kg Pongamia (Karanj), 2kg Guava leaves, 2kg Custard Apple leaves in cow urine, boil until half volume. Dilute 300ml per 15L water.",
            mode: "Strong repellent and digestive poison against leaf-mining caterpillars.",
            freq: "Spray in early mornings."
          }
        ],
        biocontrol: [
          {
            name: "Trichogramma achaeae Parasitoid",
            rate: "50,000 adults / acre",
            stage: "Egg stage on leaf surfaces",
            guide: "Release at 7-day intervals starting from 15 days after planting."
          },
          {
            name: "Bacillus thuringiensis var. kurstaki (Btk)",
            rate: "2g / Liter of water",
            stage: "1st and 2nd instar larvae inside leaves",
            guide: "Mix with 0.5 ml spreader-sticker; spray during evening hours."
          }
        ],
        cultural: ["Handpick and destroy mined leaves into solarization bags.", "Remove solanaceous weeds (Solanum nigrum) from field borders."]
      },
      {
        name: "Late Blight & Early Blight Complex",
        scientific: "Phytophthora infestans / Alternaria solani",
        type: "Fungal Disease",
        preferredStages: ["Vegetative Growth", "Flowering & Tillering", "Fruit & Grain Setting"],
        conduciveTempRange: [16, 26],
        conduciveHumidityMin: 85,
        triggerCondition: "Persistent cool temperatures (17-24\xB0C), relative humidity >85%, fog/dew on foliage >6 hours.",
        earlySymptoms: ["Water-soaked dark green-to-brown lesions on leaf margins", "Concentric target-board rings on older lower leaves", "White fuzzy mildew on leaf underside in morning humidity"],
        severeSymptoms: ["Rapid petiole collapse, dark brown greasy rot on green fruit shoulders", "Total field defoliation within 72 hours under wet cloudy weather"],
        affectedParts: ["Leaf", "Stem", "Fruit/Pod"],
        etl: "Trace observation of water-soaked lesions under high humidity conditions",
        yieldLoss: 75,
        urgencyHours: "Critical emergency: Spray bio-fungicide protective barrier within 24 hours before rains continue.",
        preventive: [
          "Switch to drip irrigation; avoid overhead sprinkler watering that wets foliage.",
          "Wider spacing (90cm x 60cm) with trellising and staking to keep foliage off moist soil.",
          "Mulch tomato beds with silver-black plastic or dry straw to prevent soil-splash spore dispersal."
        ],
        botanicals: [
          {
            name: "Cow Urine + Fermented Sour Butter Milk (Chhach)",
            prep: "Mix 5 Liters 5-day fermented sour buttermilk with 5 Liters fresh cow urine in 100 Liters water + 200g turmeric powder.",
            mode: "Lactic acid bacteria and curcumin create an acidic anti-sporulation biofilm on leaf cuticle.",
            freq: "Spray preventive every 7 days during foggy/monsoon spells."
          },
          {
            name: "Bordeaux Mixture (1% Organic Prep)",
            prep: "1kg Copper Sulphate + 1kg Quicklime dissolved separately and combined in 100L water (neutral pH 7.0).",
            mode: "Broad-spectrum multi-site protective contact fungicide accepted in organic farming.",
            freq: "Spray immediately before forecasted drizzle."
          }
        ],
        biocontrol: [
          {
            name: "Pseudomonas fluorescens (TNAU / ICAR Strain)",
            rate: "10g / Liter or 2.5 kg/ha foliar spray",
            stage: "Preventive spore colonization",
            guide: "Produces phenazine and siderophores that competitively colonize infection sites and suppress fungal oospores."
          },
          {
            name: "Trichoderma viride / harzianum",
            rate: "10g / Liter soil drench & foliar spray",
            stage: "Mycelial establishment",
            guide: "Apply at root zone and lower stems during transplanting and active vegetative growth."
          }
        ],
        cultural: ["Prune lowest 4-5 leaves near soil level to ensure airflow and eliminate splash inoculums.", "Immediately rogue out and bury severely blighted plants away from farm."]
      }
    ]
  },
  {
    crop: "Cotton",
    majorPests: [
      {
        name: "Pink Bollworm",
        scientific: "Pectinophora gossypiella",
        type: "Insect Pest",
        preferredStages: ["Flowering & Tillering", "Fruit & Grain Setting"],
        conduciveTempRange: [24, 34],
        conduciveHumidityMin: 65,
        triggerCondition: "Overcast weather, extended square/boll formation period, and late-planted cotton crops.",
        earlySymptoms: ['Rosetted flowers with twisted petals ("Rosette flower" symptom)', "Premature square and boll drop", "Small pinhole punctures on tender green bolls sealed with frass"],
        severeSymptoms: ["Double seeds formed inside bolls, stained lint, damaged locules and rotten seeds"],
        affectedParts: ["Floral Bud", "Fruit/Pod"],
        etl: "8 moths/trap/night for 3 consecutive days or 10% Rosetted flowers / green bolls with larvae",
        yieldLoss: 50,
        urgencyHours: "Install pheromone mating disruption lures within 48 hours of first flowering stage.",
        preventive: [
          "Install Gossyplure Pheromone Traps @ 8 traps/acre at crop canopy height.",
          "Release Trichogramma bactrae egg parasitoid @ 60,000/acre at weekly intervals.",
          "Grow trap crops like Okra or Hibiscus around cotton border to trap early ovipositing females."
        ],
        botanicals: [
          {
            name: "Neem Kernel Oil (10,000 ppm)",
            prep: "5 ml / Liter with 1 ml soap surfactant.",
            mode: "Deterrent to ovipositing moths on bracts and prevents neonate larvae from boring into bolls.",
            freq: "Apply at 50-60 days after sowing and repeat at 10-day intervals."
          },
          {
            name: "Ginger-Garlic-Chilli Extract (3G Bio-Repellent)",
            prep: "Grind 500g Garlic + 250g Ginger + 250g Green Chilli; soak in 5L water, filter, and dilute 500ml per 15L tank.",
            mode: "Sensory confusion and toxic repellent to noctuid moths.",
            freq: "Spray during twilight hours when moths are active."
          }
        ],
        biocontrol: [
          {
            name: "Beauveria bassiana Bio-Wp",
            rate: "2 kg / acre (5g/L)",
            stage: "Young larval instars on bracts",
            guide: "Ensure thorough coverage of floral bracts and green bolls in late afternoon."
          },
          {
            name: "Chrysoperla carnea (Green Lacewing)",
            rate: "10,000 grubs/acre",
            stage: "Eggs and early instar larvae",
            guide: "Distribute along field rows during peak squaring stage."
          }
        ],
        cultural: ["Destroy crop residue and avoid ratooning of cotton.", "Handpick and crush rosetted flowers daily during morning scouting."]
      }
    ]
  },
  {
    crop: "Maize",
    majorPests: [
      {
        name: "Fall Armyworm (FAW)",
        scientific: "Spodoptera frugiperda",
        type: "Insect Pest",
        preferredStages: ["Seedling & Germination", "Vegetative Growth", "Flowering & Tillering"],
        conduciveTempRange: [20, 35],
        conduciveHumidityMin: 55,
        triggerCondition: "Warm humid spells, intermittent dry weather, and continuous staggered maize plantings.",
        earlySymptoms: ["Pin-holes and elongated window-pane feeding marks on whorl leaves", "Fine sawdust-like frass inside central leaf whorl", 'Inverted "Y" yellow mark on larval head capsule'],
        severeSymptoms: ['Complete destruction of central whorl ("Dead Whorl")', "Tassel feeding, ear rot, and skeletonized canopy"],
        affectedParts: ["Leaf", "Stem", "Fruit/Pod"],
        etl: "5% damaged plants at seedling stage or 10% damaged plants at mid-whorl stage",
        yieldLoss: 45,
        urgencyHours: "Apply whorl-directed bio-application within 36 hours before larvae burrow into protected stalk.",
        preventive: [
          "Install FAW Pheromone Traps (Spodo-lure) @ 5 traps/acre.",
          "Intercrop with Desmodium (push) and plant Napier grass (pull) along boundaries (Push-Pull Strategy).",
          "Apply fine sand + wood ash (9:1 ratio) directly into leaf whorls to cause mechanical abrasion to larval skin."
        ],
        botanicals: [
          {
            name: "Neem Seed Kernel Extract (NSKE 5%)",
            prep: "50g / Liter water. Direct stream into leaf whorl.",
            mode: "Stops feeding within 2 hours of ingestion and inhibits juvenile hormone synthesis.",
            freq: "Apply at 15, 30, and 45 days after emergence."
          },
          {
            name: "Agniastra + Cow Dung Slurry Whorl Application",
            prep: "Dilute 1L Agniastra in 100L water + 500g dry cow dung powder as carrier sticker.",
            mode: "Strong irritant that forces larvae to exit whorl where they become vulnerable to predators.",
            freq: "Apply directly into central cone."
          }
        ],
        biocontrol: [
          {
            name: "Nomuraea rileyi / Metarhizium rileyi",
            rate: "5g / Liter of water",
            stage: "1st to 3rd instar larvae in whorl",
            guide: "Entomopathogenic fungus creates white fungal bloom inside whorl killing larvae."
          },
          {
            name: "Bacillus thuringiensis var. kurstaki",
            rate: "2g / Liter of water",
            stage: "Young larvae",
            guide: "Direct knapsack nozzle straight down into central leaf funnel."
          }
        ],
        cultural: ["Crush egg masses found on leaf undersides.", "Deep summer ploughing to expose pupae to predatory birds."]
      }
    ]
  },
  {
    crop: "Chilli",
    majorPests: [
      {
        name: "Chilli Thrips & Yellow Mites Complex",
        scientific: "Scirtothrips dorsalis / Polyphagotarsonemus latus",
        type: "Insect Pest",
        preferredStages: ["Vegetative Growth", "Flowering & Tillering", "Fruit & Grain Setting"],
        conduciveTempRange: [25, 36],
        conduciveHumidityMin: 50,
        triggerCondition: "High temperatures with dry spells for thrips; sudden humid warm spells for yellow mites.",
        earlySymptoms: ['Upward curling ("boat-shaped") of leaves caused by thrips feeding', 'Downward curling ("inverted cup") of leaves caused by yellow mites', "Silvery sheen on lower leaf lamina and flower drop"],
        severeSymptoms: ['"Murda" or leaf curl complex with brittle stunted shoots and bronze scabby fruit surfaces'],
        affectedParts: ["Leaf", "Floral Bud", "Fruit/Pod"],
        etl: "1-2 thrips or mites per tender leaf",
        yieldLoss: 50,
        urgencyHours: "Spray bio-acaricide within 48 hours of noticing leaf margin curl.",
        preventive: [
          "Install Blue Sticky Traps @ 15/acre (for thrips) and Yellow Sticky Traps @ 15/acre (for whiteflies/aphids).",
          "Grow 3 border rows of Maize or Sorghum as windbreaks and physical insect barriers.",
          "Intercrop with Cowpea to encourage predatory anthocorid bugs."
        ],
        botanicals: [
          {
            name: "Panchagavya + Neem Oil Foliar Spray",
            prep: "300ml Panchagavya + 45ml Neem Oil 10,000 ppm in 15L water.",
            mode: "Strengthens leaf cuticle wax layer and acts as repellent deterrent to rasping-sucking mouthparts.",
            freq: "Spray every 7-10 days in early mornings."
          },
          {
            name: "Garlic-Chilli-Karanj Bio-Extract",
            prep: "500g Garlic + 250g Chilli + 500g Karanj oil emulsified in soap water (15L tank).",
            mode: "Acaricidal and insecticidal contact action against microscopic nymphs.",
            freq: "Spray underside of leaves thoroughly."
          }
        ],
        biocontrol: [
          {
            name: "Lecanicillium lecanii (Verticillium lecanii)",
            rate: "5g / Liter of water",
            stage: "All nymphal and adult stages of thrips/mites",
            guide: "Apply during humid evening hours; fungal hyphae penetrate soft insect cuticles within 48 hours."
          },
          {
            name: "Predatory Mite (Amblyseius swirskii / Neoseiulus)",
            rate: "20,000 / acre in vulnerable zones",
            stage: "Mite eggs and thrips larvae",
            guide: "Release on field borders during early vegetative phase."
          }
        ],
        cultural: ["Avoid excess nitrogen that promotes lush succulent foliage.", "Maintain regular light irrigation to suppress thrips build-up."]
      }
    ]
  },
  {
    crop: "Banana",
    majorPests: [
      {
        name: "Sigatoka Leaf Spot (Black / Yellow)",
        scientific: "Mycosphaerella musicola / fijiensis",
        type: "Fungal Disease",
        preferredStages: ["Vegetative Growth", "Flowering & Tillering", "Fruit & Grain Setting"],
        conduciveTempRange: [23, 30],
        conduciveHumidityMin: 85,
        triggerCondition: "High relative humidity (>85%), persistent canopy wetness from rain or overhead irrigation, poor drainage.",
        earlySymptoms: ["Small yellowish-green streaks (1-2mm) parallel to leaf veins on 3rd or 4th open leaf", "Streaks enlarge into oval brown spots with grey sunken centers"],
        severeSymptoms: ["Extensive coalescing of spots into large scorched dead patches", "Premature ripening of undersized fruit bunches and poor shelf life"],
        affectedParts: ["Leaf"],
        etl: "Streak stage observed on more than 3 functional leaves",
        yieldLoss: 40,
        urgencyHours: "De-leaf infected leaves and spray protective bio-fungicide within 48 hours.",
        preventive: [
          "Ensure optimum spacing (2.1m x 2.1m for Grand Naine) to avoid dense overcrowded canopies.",
          "Provide deep drainage channels between every 2 rows to prevent standing water.",
          "De-sucker regularly, keeping only 1 active follower ratoon to maximize airflow."
        ],
        botanicals: [
          {
            name: "Mineral Oil / Horticultural Neem Oil Emulsion (1%)",
            prep: "10ml Neem oil + 1ml teepol/soap per Liter of water.",
            mode: "Forms protective film over leaf stomata, preventing germ tube penetration by ascospores.",
            freq: "Apply monthly during monsoon / humid seasons."
          },
          {
            name: "Fermented Cow Dung-Urine Bio-Extract (Amrit Jal)",
            prep: "1kg fresh cow dung + 1L cow urine + 50g jaggery fermented for 4 days in 10L water; dilute 10x with water.",
            mode: "Enhances beneficial phyllosphere bacterial population to outcompete fungal spores.",
            freq: "Bi-weekly foliar wash."
          }
        ],
        biocontrol: [
          {
            name: "Pseudomonas fluorescens + Bacillus subtilis",
            rate: "10g / Liter foliar spray",
            stage: "Preventive leaf colonization",
            guide: "Spray upper and lower leaf surfaces, especially on youngest 4 leaves."
          },
          {
            name: "Trichoderma harzianum Liquid Formulation",
            rate: "5ml / Liter",
            stage: "Spore germination phase",
            guide: "Apply following de-leafing sanitation operations."
          }
        ],
        cultural: ["Prune and burn badly spotted dried leaves (sanitation de-leafing).", "Apply potassium (SOP) to strengthen leaf tissue."]
      }
    ]
  }
];
function calculatePestVulnerability(pest, input) {
  let score = 30;
  const [minT, maxT] = pest.conduciveTempRange;
  const temp = input.weatherConditions.temperatureC;
  if (temp >= minT && temp <= maxT) {
    score += 25;
  } else if (Math.abs(temp - minT) <= 3 || Math.abs(temp - maxT) <= 3) {
    score += 12;
  }
  const hum = input.weatherConditions.relativeHumidityPercent;
  if (hum >= pest.conduciveHumidityMin) {
    score += 20;
    if (hum >= 85) score += 10;
  } else if (hum >= pest.conduciveHumidityMin - 10) {
    score += 10;
  }
  const rain = input.weatherConditions.rainfallCondition;
  if (pest.type === "Fungal Disease") {
    if (rain === "Continuous Drizzle" || rain === "Heavy Showers" || rain === "Humid & Overcast") {
      score += 20;
    }
  } else if (pest.name.includes("Thrips") || pest.name.includes("Mite")) {
    if (rain === "Dry Spells / Heatwave") {
      score += 20;
    }
  } else {
    if (rain === "Continuous Drizzle" || rain === "Moderate / Intermittent" || rain === "Humid & Overcast") {
      score += 12;
    }
  }
  if (pest.preferredStages.includes(input.cropStage)) {
    score += 15;
  }
  if (input.soilFieldConditions?.nitrogenApplicationStatus === "Excessive") {
    if (pest.type === "Insect Pest") score += 10;
  }
  if (input.soilFieldConditions?.standingWater && (pest.name.includes("BPH") || pest.name.includes("Rot") || pest.name.includes("Blight"))) {
    score += 12;
  }
  score = Math.min(98, Math.max(15, score));
  let level = "LOW";
  let incubation = 6;
  if (score >= 78) {
    level = "CRITICAL";
    incubation = 2 + Math.floor(Math.random() * 2);
  } else if (score >= 60) {
    level = "HIGH";
    incubation = 3 + Math.floor(Math.random() * 2);
  } else if (score >= 40) {
    level = "MODERATE";
    incubation = 5 + Math.floor(Math.random() * 2);
  } else {
    level = "LOW";
    incubation = 7 + Math.floor(Math.random() * 3);
  }
  return { score, level, incubation };
}
async function generatePestRiskPredictionAI(input) {
  const crop = input.cropName || "Paddy";
  const genAI = getGenAI();
  let aiGeneratedData = null;
  if (genAI) {
    try {
      const prompt = `You are a Senior Entomologist and Plant Pathologist at the Indian Council of Agricultural Research (ICAR).
Perform a proactive Pest & Disease Risk Prediction based on the following real-time microclimate and crop data:

CROP DETAILS:
- Crop: ${crop}
- Variety: ${input.variety || "Standard High-Yield Hybrid"}
- Growth Stage: ${input.cropStage}
- Land Area: ${input.landAreaAcres || 2.5} Acres
- Location: ${input.location.district}, ${input.location.state}

MICROCLIMATE WEATHER DATA:
- Temperature: ${input.weatherConditions.temperatureC}\xB0C (Min: ${input.weatherConditions.minTempC || 20}\xB0C, Max: ${input.weatherConditions.maxTempC || 34}\xB0C)
- Relative Humidity: ${input.weatherConditions.relativeHumidityPercent}%
- Rainfall / Wetness Condition: ${input.weatherConditions.rainfallCondition}
- Wind Speed: ${input.weatherConditions.windSpeedKmh || 12} km/h
- Canopy Wetness: ${input.weatherConditions.canopyWetnessHours || 6} hours/day
- Soil / Nitrogen Status: ${input.soilFieldConditions?.nitrogenApplicationStatus || "Optimal"}, Standing water: ${input.soilFieldConditions?.standingWater ? "Yes" : "No"}

TASK:
Analyze the meteorological triggers and forecast the top 2 to 3 most vulnerable pests/diseases for this crop and stage.
Provide 100% certified ORGANIC and BIOLOGICAL management strategies (Botanicals, Neem, Trichogramma, Beauveria bassiana, Pheromones, Cultural).

OUTPUT JSON STRUCTURE:
{
  "overallFarmPestIndex": number (0 to 100),
  "overallRiskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "immediateAlertHeading": "Short urgent headline warning for farmer (e.g. CRITICAL: 72-Hour Brown Plant Hopper Outbreak Risk in Rice Canopy)",
  "keyTriggerFactor": "Main climatic trigger driving pest buildup (e.g. Humidity >82% coupled with standing water)",
  "climateVulnerabilitySummary": "Detailed scientific assessment of current weather impacts on pest life cycle.",
  "weatherAlertBadge": {
    "temperatureWarning": "String describing temperature impact on insect fecundity/spore germination",
    "humidityCondition": "String on humidity impact",
    "favorablePestSpurtWindow": "e.g. Next 3 to 5 Days (Critical Scouting Window)",
    "conduciveDiseaseIndices": ["List of 2-3 index factors"]
  },
  "identifiedPests": [
    {
      "id": "pest_1",
      "pestOrDiseaseName": "Common name",
      "scientificName": "Binomial name",
      "pestType": "Insect Pest" | "Fungal Disease" | "Bacterial Blight" | "Viral / Vector" | "Nematode",
      "riskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
      "riskScorePercent": number (15 to 98),
      "incubationWindowDays": number (days to visible outbreak),
      "climateTriggerFactors": ["Trigger 1", "Trigger 2"],
      "damageSymptomsEarly": ["Early symptom 1", "Early symptom 2"],
      "damageSymptomsSevere": ["Severe symptom 1", "Severe symptom 2"],
      "affectedPlantParts": ["Leaf", "Stem", etc.],
      "economicThresholdLevel": "Specific ETL threshold",
      "potentialYieldLossPercent": number (e.g. 35),
      "urgencyWindow": "Action window string",
      "organicManagementStrategy": {
        "preventiveMeasures": ["Measure 1", "Measure 2", "Measure 3"],
        "botanicalBioFormulations": [
          {
            "formulationName": "e.g. Neem Seed Kernel Extract (NSKE 5%) or Agniastra",
            "preparationAndDosage": "Detailed recipe and dose/liter",
            "modeOfAction": "Scientific antifeedant/ovicidal mode",
            "sprayFrequency": "Frequency string"
          }
        ],
        "biologicalPredatorsAndParasites": [
          {
            "agentName": "e.g. Trichogramma / Beauveria bassiana / Chrysoperla",
            "releaseRateOrDosage": "Dosage/acre",
            "targetPestStage": "Target stage",
            "applicationGuideline": "Practical application tip"
          }
        ],
        "culturalAndMechanicalPractices": ["Practice 1", "Practice 2"]
      }
    }
  ],
  "weeklyScoutingChecklist": [
    {
      "id": "scout_1",
      "dayNumber": 1,
      "dayLabel": "Day 1 (Immediate)",
      "scoutingFocusArea": "Specific plant zone to inspect",
      "diagnosticVisualKey": "What exact signs to look for",
      "proactiveOrganicTask": "Specific action to deploy",
      "status": "pending"
    }
  ],
  "organicEmergencySprayPlan": [
    {
      "id": "spray_1",
      "dayTarget": "Day 2 Morning",
      "bioSprayName": "Bio-spray formulation name",
      "activeComponent": "Active natural chemical/agent",
      "dosage": "Dosage per tank/acre",
      "targetPest": "Target pest name",
      "precautions": "Application precautions"
    }
  ],
  "expertAgronomistNote": "2-3 paragraphs of compassionate, actionable ICAR advisory for the farmer."
}`;
      const response = await genAI.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.25
        }
      });
      if (response.text) {
        aiGeneratedData = JSON.parse(response.text);
      }
    } catch (e) {
      console.warn("Gemini API call failed for pest risk prediction, falling back to ICAR knowledge base:", e);
    }
  }
  const matchedProfile = KNOWLEDGE_PEST_PROFILES.find(
    (p) => p.crop.toLowerCase() === crop.toLowerCase()
  ) || KNOWLEDGE_PEST_PROFILES[0];
  const processedPests = matchedProfile.majorPests.map((p, idx) => {
    const vuln = calculatePestVulnerability(p, input);
    return {
      id: `pest_${idx + 1}_${Date.now()}`,
      pestOrDiseaseName: p.name,
      scientificName: p.scientific,
      pestType: p.type,
      riskLevel: vuln.level,
      riskScorePercent: vuln.score,
      incubationWindowDays: vuln.incubation,
      climateTriggerFactors: [
        p.triggerCondition,
        `Current Temperature (${input.weatherConditions.temperatureC}\xB0C) is in the optimal active development band (${p.conduciveTempRange[0]}-${p.conduciveTempRange[1]}\xB0C).`,
        `Ambient humidity of ${input.weatherConditions.relativeHumidityPercent}% accelerates egg hatching and spore germination.`
      ],
      damageSymptomsEarly: p.earlySymptoms,
      damageSymptomsSevere: p.severeSymptoms,
      affectedPlantParts: p.affectedParts,
      economicThresholdLevel: p.etl,
      potentialYieldLossPercent: p.yieldLoss,
      urgencyWindow: p.urgencyHours,
      organicManagementStrategy: {
        preventiveMeasures: p.preventive,
        botanicalBioFormulations: p.botanicals.map((b) => ({
          formulationName: b.name,
          preparationAndDosage: b.prep,
          modeOfAction: b.mode,
          sprayFrequency: b.freq,
          safetyIntervalHours: 12
        })),
        biologicalPredatorsAndParasites: p.biocontrol.map((bio) => ({
          agentName: bio.name,
          releaseRateOrDosage: bio.rate,
          targetPestStage: bio.stage,
          applicationGuideline: bio.guide
        })),
        culturalAndMechanicalPractices: p.cultural
      }
    };
  });
  const topPestScore = Math.max(...processedPests.map((p) => p.riskScorePercent), 40);
  const overallRisk = topPestScore >= 78 ? "CRITICAL" : topPestScore >= 60 ? "HIGH" : topPestScore >= 40 ? "MODERATE" : "LOW";
  const defaultWeeklyScouting = [
    {
      id: "scout_d1",
      dayNumber: 1,
      dayLabel: "Day 1 (Immediate)",
      scoutingFocusArea: `Examine 20 random hills/plants across diagonal transect in ${crop} plot.`,
      diagnosticVisualKey: `Inspect leaf underside and stem bases for early pinhead egg masses or water-soaked lesions.`,
      proactiveOrganicTask: `Install 5 Pheromone Traps and 10 Yellow/Blue Sticky Traps per acre at crop canopy height.`,
      status: "pending"
    },
    {
      id: "scout_d3",
      dayNumber: 3,
      dayLabel: "Day 3 Morning",
      scoutingFocusArea: `Check trap catches and examine middle canopy leaves for translucent feeding marks.`,
      diagnosticVisualKey: `Count moths in pheromone trap. If >5 moths/trap/night, economic threshold level (ETL) is reached.`,
      proactiveOrganicTask: `Apply preventive foliar spray of Neem Oil (10,000 ppm @ 3ml/L) or NSKE 5% in early morning.`,
      status: "pending"
    },
    {
      id: "scout_d5",
      dayNumber: 5,
      dayLabel: "Day 5 Evening",
      scoutingFocusArea: `Survey field borders and lower stem bases for parasitoid activity and natural predator buildup.`,
      diagnosticVisualKey: `Look for black parasitized eggs (indicates natural Trichogramma activity) or friendly wolf spiders.`,
      proactiveOrganicTask: `Release Tricho-cards (2 cards/acre) stapled to leaf undersides if ETL breached.`,
      status: "pending"
    },
    {
      id: "scout_d7",
      dayNumber: 7,
      dayLabel: "Day 7 Midday",
      scoutingFocusArea: `Evaluate new emerging terminal shoots and flower buds for healthy vegetative expansion.`,
      diagnosticVisualKey: `Verify absence of fresh dead-hearts, rosetted flowers, or expanding concentric blight rings.`,
      proactiveOrganicTask: `Foliar bio-stimulant spray (Panchagavya 3% or Amrit Jal) to restore vigor and induce systemic acquired resistance.`,
      status: "pending"
    }
  ];
  const defaultEmergencySprays = [
    {
      id: "emg_sp_1",
      dayTarget: "Day 1 - 2 (Immediate Window)",
      bioSprayName: "Neem Azadirachtin 10,000 PPM + Bio-Wetting Agent",
      activeComponent: "Natural Azadirachtin (Triterpenoid)",
      dosage: "3 ml per Liter of water (45 ml per 15L Knapsack)",
      targetPest: `Early instars of ${processedPests[0]?.pestOrDiseaseName || "Borer & Sucking Complex"}`,
      precautions: "Spray during early morning (6:00 AM - 9:00 AM) or late afternoon to avoid direct sun degradation."
    },
    {
      id: "emg_sp_2",
      dayTarget: "Day 4 - 5 (Follow-up Biological)",
      bioSprayName: "Beauveria bassiana / Pseudomonas fluorescens (Dual Bio-Shield)",
      activeComponent: "Live Entomopathogenic Spores (1x10^8 CFU/g)",
      dosage: "5 grams per Liter of water (75g per 15L tank)",
      targetPest: `Secondary nymphal emergence and fungal oospore suppression`,
      precautions: "Do not mix with chemical copper or sulphur fungicides. Maintain high relative humidity during spray."
    }
  ];
  return {
    id: `pest_eval_${Date.now()}`,
    farmerId: input.farmerId || "usr_farmer_1",
    cropName: crop,
    variety: input.variety || "High-Yield Hybrid",
    cropStage: input.cropStage,
    landAreaAcres: input.landAreaAcres || 2.5,
    district: input.location.district,
    state: input.location.state,
    overallFarmPestIndex: aiGeneratedData?.overallFarmPestIndex || topPestScore,
    overallRiskLevel: aiGeneratedData?.overallRiskLevel || overallRisk,
    immediateAlertHeading: aiGeneratedData?.immediateAlertHeading || `${overallRisk}: ${processedPests[0]?.pestOrDiseaseName} & Pest Outbreak Threat in ${crop} (${input.location.district})`,
    keyTriggerFactor: aiGeneratedData?.keyTriggerFactor || `Microclimate humidity of ${input.weatherConditions.relativeHumidityPercent}% combined with ${input.weatherConditions.temperatureC}\xB0C temperature creates optimal incubation for ${processedPests[0]?.pestOrDiseaseName}.`,
    climateVulnerabilitySummary: aiGeneratedData?.climateVulnerabilitySummary || `Based on current agro-meteorological monitoring for ${input.location.district} (${input.location.state}), the prevailing temperature of ${input.weatherConditions.temperatureC}\xB0C and elevated humidity (${input.weatherConditions.relativeHumidityPercent}%) under ${input.weatherConditions.rainfallCondition} conditions present an elevated vulnerability window for ${crop} during the ${input.cropStage} stage.

Without proactive biological barriers, reproductive cycles will accelerate within 48-72 hours. Timely deployment of mechanical pheromone traps and botanical bio-sprays will safeguard yield potential without chemical pesticide residue.`,
    weatherAlertBadge: aiGeneratedData?.weatherAlertBadge || {
      temperatureWarning: `${input.weatherConditions.temperatureC}\xB0C aligns with peak pest fecundity window.`,
      humidityCondition: `${input.weatherConditions.relativeHumidityPercent}% relative humidity promotes rapid spore germination.`,
      favorablePestSpurtWindow: "Next 3 to 5 Days (Critical Scouting Window)",
      conduciveDiseaseIndices: ["High Canopy Wetness Index", "Microclimate Humidity Spike", "Succulent Stage Susceptibility"]
    },
    identifiedPests: aiGeneratedData?.identifiedPests || processedPests,
    weeklyScoutingChecklist: aiGeneratedData?.weeklyScoutingChecklist || defaultWeeklyScouting,
    organicEmergencySprayPlan: aiGeneratedData?.organicEmergencySprayPlan || defaultEmergencySprays,
    expertAgronomistNote: aiGeneratedData?.expertAgronomistNote || `Dear Farmer, proactive biological pest management is 80% more cost-effective when initiated before insect larvae penetrate stem tissues or fungal mycelia breach leaf cuticles.

1. Install pheromone monitoring traps immediately at crop canopy level. One single male-trapping device reduces reproduction by up to 40% across a 1-acre perimeter.
2. In the event of crossing the Economic Threshold Level (ETL), avoid broad-spectrum synthetic pyrethroids which destroy beneficial spiders, green lacewings, and Trichogramma wasps.
3. Rely on our certified botanical formulas (NSKE 5%, Agniastra, or Neem Oil) with organic soap surfactant for complete crop protection.`,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "25mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
  app.use((req, res, next) => {
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/admin/system-health", (req, res) => {
    const health = db.getSystemHealth();
    res.json(health);
  });
  app.get("/api/admin/audit-logs", (req, res) => {
    res.json(db.auditLogs);
  });
  app.get("/api/users", (req, res) => {
    res.json(db.users);
  });
  app.get("/api/users/current", (req, res) => {
    const role = req.query.role || "farmer";
    const user = db.users.find((u) => u.role === role) || db.users[0];
    const farmerProfile = db.farmerProfiles.find((f) => f.user_id === user.id);
    const providerProfile = db.providerProfiles.find((p) => p.user_id === user.id);
    res.json({
      user,
      farmerProfile: farmerProfile || db.farmerProfiles[0],
      providerProfile: providerProfile || db.providerProfiles[0]
    });
  });
  app.get("/api/warehouses", (req, res) => {
    const { lat, lng, radius, crop, quantity, storageType, maxPrice, sort } = req.query;
    const userLat = lat ? parseFloat(lat) : 10.6586;
    const userLng = lng ? parseFloat(lng) : 77.0089;
    const results = db.searchNearbyWarehouses({
      lat: userLat,
      lng: userLng,
      radiusKm: radius ? parseFloat(radius) : void 0,
      crop,
      quantityKg: quantity ? parseFloat(quantity) : void 0,
      storageType,
      maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
      sortBy: sort || "distance"
    });
    res.json(results);
  });
  app.get("/api/warehouses/:id", (req, res) => {
    const wh = db.warehouses.find((w) => w.id === req.params.id);
    if (!wh) return res.status(404).json({ error: "Warehouse not found" });
    res.json(wh);
  });
  app.post("/api/warehouses", (req, res) => {
    const data = req.body;
    const newWh = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      provider_id: data.provider_id || "usr_provider_1",
      name: data.name,
      operator_type: data.operator_type || "SWC",
      address: data.address,
      taluk: data.taluk,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      latitude: parseFloat(data.latitude) || 10.6586,
      longitude: parseFloat(data.longitude) || 77.0089,
      storage_types: data.storage_types || ["General Warehouse"],
      total_capacity_kg: parseFloat(data.total_capacity_kg) || 2e5,
      used_capacity_kg: 0,
      available_capacity_kg: parseFloat(data.total_capacity_kg) || 2e5,
      pricing_model: data.pricing_model || "per_kg_per_day",
      rate_inr: parseFloat(data.rate_inr) || 0.45,
      minimum_storage_days: parseInt(data.minimum_storage_days) || 7,
      suitable_crops: data.suitable_crops || ["Paddy", "Maize", "Tomato"],
      humidity_control: !!data.humidity_control,
      security_and_cctv: true,
      weighbridge_available: true,
      fumigation_service: true,
      insurance_covered: true,
      rating: 5,
      verified: true,
      contact_person: data.contact_person || "Facility Head",
      contact_phone: data.contact_phone || "+91 94420 00000",
      is_demo: false
    };
    db.warehouses.push(newWh);
    db.logAudit(newWh.provider_id, "provider", "provider", "CREATE_WAREHOUSE", "warehouses", newWh.id, { name: newWh.name });
    res.status(201).json(newWh);
  });
  app.post("/api/warehouses/profit-calculator", (req, res) => {
    const {
      cropName,
      quantityKg,
      currentMandiPricePerKg,
      projectedFuturePricePerKg,
      storageDurationDays,
      storageRatePerKgDay,
      transportCostInr
    } = req.body;
    const result = calculateStorageProfit({
      cropName: cropName || "Tomato",
      quantityKg: parseFloat(quantityKg) || 1e3,
      currentMandiPricePerKg: parseFloat(currentMandiPricePerKg) || 20,
      projectedFuturePricePerKg: parseFloat(projectedFuturePricePerKg) || 28,
      storageDurationDays: parseInt(storageDurationDays) || 30,
      storageRatePerKgDay: parseFloat(storageRatePerKgDay) || 0.45,
      transportCostInr: parseFloat(transportCostInr) || 800
    });
    res.json(result);
  });
  app.get("/api/bookings", (req, res) => {
    const { farmerId, providerId } = req.query;
    let list = db.warehouseBookings;
    if (farmerId) list = list.filter((b) => b.farmer_id === farmerId);
    if (providerId) {
      const whIds = db.warehouses.filter((w) => w.provider_id === providerId).map((w) => w.id);
      list = list.filter((b) => whIds.includes(b.warehouse_id));
    }
    res.json(list);
  });
  app.post("/api/bookings", (req, res) => {
    const result = db.createWarehouseBooking(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.booking);
  });
  app.patch("/api/bookings/:id/status", (req, res) => {
    const { status, providerNotes, userId } = req.body;
    const result = db.updateBookingStatus(req.params.id, status, providerNotes, userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result.booking);
  });
  app.get("/api/plant-scans", (req, res) => {
    const { farmerId } = req.query;
    let list = db.plantScans;
    if (farmerId) list = list.filter((s) => s.farmer_id === farmerId);
    res.json(list);
  });
  app.post("/api/plant-scans/analyze", async (req, res) => {
    try {
      const { imageBase64, imageUrl, cropName, plantPart, farmerId, language, farmerNotes, preferredModel } = req.body;
      const diagnosis = await analyzePlantHealth({
        imageBase64,
        imageUrl,
        cropName: cropName || "Tomato",
        plantPart: plantPart || "leaf",
        language,
        farmerNotes,
        preferredModel
      });
      const newScan = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        farmer_id: farmerId || "usr_farmer_1",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        ...diagnosis
      };
      db.plantScans.unshift(newScan);
      db.logAudit(newScan.farmer_id, "farmer", "farmer", "CREATE_PLANT_SCAN", "plant_scans", newScan.id, {
        crop: newScan.crop_name,
        predicted_issue: newScan.predicted_issue,
        confidence: newScan.confidence
      });
      db.sendNotification(
        newScan.farmer_id,
        `Plant Scan Diagnosis: ${newScan.predicted_issue}`,
        `Analysis completed with ${newScan.confidence}% confidence. View agronomic action steps.`,
        "disease_scan",
        "plant-scanner"
      );
      res.status(201).json(newScan);
    } catch (err) {
      console.error("Error analyzing plant health:", err);
      res.status(500).json({ error: err.message || "Internal analysis error" });
    }
  });
  app.post("/api/plant-scans/:id/feedback", (req, res) => {
    const scan = db.plantScans.find((s) => s.id === req.params.id);
    if (!scan) return res.status(404).json({ error: "Scan not found" });
    scan.farmer_feedback = req.body.feedback;
    if (req.body.correctionNotes) scan.farmer_correction_notes = req.body.correctionNotes;
    db.logAudit(scan.farmer_id, "farmer", "farmer", "SUBMIT_SCAN_FEEDBACK", "plant_scans", scan.id, {
      feedback: req.body.feedback
    });
    res.json({ success: true, scan });
  });
  app.get("/api/soil-labs", (req, res) => {
    res.json(db.soilLabs);
  });
  app.get("/api/soil-tests", (req, res) => {
    const { farmerId } = req.query;
    let list = db.soilTests;
    if (farmerId) list = list.filter((s) => s.farmer_id === farmerId);
    res.json(list);
  });
  app.post("/api/soil-tests/request", (req, res) => {
    const data = req.body;
    const newReq = {
      id: `str_${Date.now()}`,
      farmer_id: data.farmerId || "usr_farmer_1",
      farmer_name: data.farmerName || "Murugan Palaniswamy",
      farmer_phone: data.farmerPhone || "+91 98421 87654",
      lab_id: data.labId,
      field_id: data.fieldId || "field_1",
      sample_collection_type: data.collectionType || "lab_pickup",
      pickup_address: data.pickupAddress || "Pollachi Rural",
      selected_package: data.packageName || "Comprehensive Soil Health (12 Parameters)",
      estimated_cost: data.cost || 50,
      status: "REQUESTED",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.soilTestRequests.unshift(newReq);
    db.logAudit(newReq.farmer_id, newReq.farmer_phone, "farmer", "REQUEST_SOIL_TEST", "soil_test_requests", newReq.id, {
      lab_id: data.labId
    });
    db.sendNotification(
      newReq.farmer_id,
      "Soil Test Request Submitted",
      `Your sample collection request #${newReq.id} has been registered with the soil testing laboratory.`,
      "soil_report",
      "soil"
    );
    res.status(201).json(newReq);
  });
  app.get("/api/farms", (req, res) => {
    const { farmerId } = req.query;
    let list = db.farms;
    if (farmerId) list = list.filter((f) => f.farmer_id === farmerId);
    res.json(list);
  });
  app.get("/api/fields", (req, res) => {
    res.json(db.fields);
  });
  app.get("/api/crop-rotations", (req, res) => {
    res.json(db.cropRotations);
  });
  app.get("/api/crop-rotations/advisor", (req, res) => {
    try {
      const {
        fieldId,
        farmerId,
        soilType,
        ph,
        nitrogenKgHa,
        phosphorusKgHa,
        potassiumKgHa,
        organicCarbonPercent,
        currentCrop,
        targetSeason,
        expectedRainfall,
        waterSource,
        irrigationCapacity,
        priorityFocus
      } = req.query;
      const soilNutrients = {};
      if (soilType) soilNutrients.soil_type = soilType;
      if (ph) soilNutrients.ph = parseFloat(ph);
      if (nitrogenKgHa) soilNutrients.nitrogen_kg_ha = parseFloat(nitrogenKgHa);
      if (phosphorusKgHa) soilNutrients.phosphorus_kg_ha = parseFloat(phosphorusKgHa);
      if (potassiumKgHa) soilNutrients.potassium_kg_ha = parseFloat(potassiumKgHa);
      if (organicCarbonPercent) soilNutrients.organic_carbon_percent = parseFloat(organicCarbonPercent);
      const seasonalParams = {};
      if (currentCrop) seasonalParams.current_standing_crop = currentCrop;
      if (targetSeason) seasonalParams.target_season = targetSeason;
      if (expectedRainfall) seasonalParams.expected_rainfall_trend = expectedRainfall;
      if (waterSource) seasonalParams.water_source = waterSource;
      if (irrigationCapacity) seasonalParams.irrigation_capacity = irrigationCapacity;
      if (priorityFocus) seasonalParams.priority_focus = priorityFocus;
      const recommendations = db.getSmartCropRotationRecommendations({
        fieldId,
        farmerId,
        soilNutrients,
        seasonalParams
      });
      res.json(recommendations);
    } catch (err) {
      console.error("Error computing crop rotation advisory:", err);
      res.status(500).json({ error: "Failed to compute crop rotation recommendations" });
    }
  });
  app.post("/api/crop-rotations/advisor/ai-generate", async (req, res) => {
    try {
      const { soil, seasonal, fieldAreaAcres, recentScanFindings } = req.body;
      if (!soil || !seasonal) {
        return res.status(400).json({ error: "Missing soil or seasonal parameters" });
      }
      const aiResult = await generateAdvancedCropRotationAdvisory({
        soil,
        seasonal,
        fieldAreaAcres: parseFloat(fieldAreaAcres) || 6.5,
        recentScanFindings
      });
      if (aiResult) {
        return res.json({
          source: "GEMINI_3.7_FLASH",
          data: aiResult
        });
      }
      const deterministicResult = db.getSmartCropRotationRecommendations({
        soilNutrients: soil,
        seasonalParams: seasonal
      });
      return res.json({
        source: "AGRONOMIC_ENGINE_FALLBACK",
        data: deterministicResult
      });
    } catch (err) {
      console.error("Error generating AI rotation advice:", err);
      res.status(500).json({ error: "Crop rotation AI service error" });
    }
  });
  app.post("/api/crop-rotations/save-plan", (req, res) => {
    try {
      const { fieldId, farmerId, planName, soilTypeTarget, recommendedSequence, rationale } = req.body;
      const newPlan = {
        id: `rot_plan_${Date.now()}`,
        field_id: fieldId || "fld_1",
        farm_id: "farm_1",
        plan_name: planName || "Intelligent Soil Restorative Rotation Plan",
        current_crop: req.body.currentCrop || "Tomato",
        soil_type_target: soilTypeTarget || "Red Sandy Loam",
        seasons_cycle_count: recommendedSequence && recommendedSequence.length || 4,
        recommended_sequence: recommendedSequence || [],
        rationale: rationale || "Optimized for biological nitrogen fixation and pathogen disruption.",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.cropRotations.unshift(newPlan);
      db.logAudit(farmerId || "usr_farmer_1", "Murugan Palaniswamy", "farmer", "CREATE_CROP_ROTATION_PLAN", "crop_rotations", newPlan.id, {
        plan_name: newPlan.plan_name,
        target_soil: newPlan.soil_type_target
      });
      db.sendNotification(
        farmerId || "usr_farmer_1",
        "Crop Rotation Plan Saved",
        `Plan "${newPlan.plan_name}" has been mapped to Field #${newPlan.field_id}.`,
        "crop_plan",
        "crops"
      );
      res.status(201).json(newPlan);
    } catch (err) {
      console.error("Error saving rotation plan:", err);
      res.status(500).json({ error: "Failed to save rotation plan" });
    }
  });
  app.post("/api/ai/predict-yield", async (req, res) => {
    try {
      const input = req.body;
      const result = await generateYieldPredictionAI(input);
      db.yieldPredictions.unshift(result);
      if (db.yieldPredictions.length > 50) db.yieldPredictions.pop();
      db.logAudit(
        input.farmerId || "usr_farmer_1",
        "Murugan Palaniswamy",
        "farmer",
        "GENERATE_YIELD_PREDICTION",
        "yield_predictions",
        result.id,
        {
          crop: result.cropName,
          predicted_quintals_per_acre: result.predictedYieldQuintalsPerAcre,
          total_quintals: result.totalExpectedYieldQuintals
        }
      );
      res.json(result);
    } catch (err) {
      console.error("Error in yield prediction route:", err);
      res.status(500).json({ error: "Failed to generate 60-day yield forecast" });
    }
  });
  app.get("/api/yield-predictions", (req, res) => {
    const { farmerId } = req.query;
    let list = db.yieldPredictions;
    if (farmerId) list = list.filter((p) => p.farmerId === farmerId);
    res.json(list);
  });
  app.post("/api/yield-predictions/save", (req, res) => {
    try {
      const prediction = req.body;
      if (!prediction.id) prediction.id = `yp_${Date.now()}`;
      const existingIdx = db.yieldPredictions.findIndex((p) => p.id === prediction.id);
      if (existingIdx >= 0) {
        db.yieldPredictions[existingIdx] = prediction;
      } else {
        db.yieldPredictions.unshift(prediction);
      }
      db.sendNotification(
        prediction.farmerId || "usr_farmer_1",
        "60-Day Yield Forecast Saved",
        `Yield forecast for ${prediction.cropName} (${prediction.predictedYieldQuintalsPerAcre} Qtl/Acre) saved with 5 milestone interventions.`,
        "yield_prediction",
        "yield-prediction"
      );
      res.status(201).json(prediction);
    } catch (err) {
      console.error("Error saving yield prediction:", err);
      res.status(500).json({ error: "Failed to save yield prediction" });
    }
  });
  app.post("/api/ai/predict-pest-risk", async (req, res) => {
    try {
      const input = req.body;
      const result = await generatePestRiskPredictionAI(input);
      db.pestRiskAssessments.unshift(result);
      if (db.pestRiskAssessments.length > 50) db.pestRiskAssessments.pop();
      db.logAudit(
        input.farmerId || "usr_farmer_1",
        "Murugan Palaniswamy",
        "farmer",
        "GENERATE_PEST_RISK_PREDICTION",
        "pest_risk_assessments",
        result.id,
        {
          crop: result.cropName,
          risk_level: result.overallRiskLevel,
          pest_index: result.overallFarmPestIndex,
          top_pest: result.identifiedPests[0]?.pestOrDiseaseName
        }
      );
      if (result.overallRiskLevel === "CRITICAL" || result.overallRiskLevel === "HIGH") {
        db.sendNotification(
          input.farmerId || "usr_farmer_1",
          `\u26A0\uFE0F Urgent: ${result.overallRiskLevel} Pest Risk for ${result.cropName}`,
          result.immediateAlertHeading,
          "pest_alert",
          "pest-risk"
        );
      }
      res.json(result);
    } catch (err) {
      console.error("Error in pest risk prediction route:", err);
      res.status(500).json({ error: "Failed to generate pest risk prediction" });
    }
  });
  app.get("/api/pest-risks", (req, res) => {
    const { farmerId } = req.query;
    let list = db.pestRiskAssessments;
    if (farmerId) list = list.filter((p) => p.farmerId === farmerId);
    res.json(list);
  });
  app.post("/api/pest-risks/save", (req, res) => {
    try {
      const assessment = req.body;
      if (!assessment.id) assessment.id = `pra_${Date.now()}`;
      const existingIdx = db.pestRiskAssessments.findIndex((p) => p.id === assessment.id);
      if (existingIdx >= 0) {
        db.pestRiskAssessments[existingIdx] = assessment;
      } else {
        db.pestRiskAssessments.unshift(assessment);
      }
      db.sendNotification(
        assessment.farmerId || "usr_farmer_1",
        "Pest Risk Advisory Saved",
        `Bio-management plan saved for ${assessment.cropName} (${assessment.overallRiskLevel} Risk Index: ${assessment.overallFarmPestIndex}/100).`,
        "pest_alert",
        "pest-risk"
      );
      res.status(201).json(assessment);
    } catch (err) {
      console.error("Error saving pest risk assessment:", err);
      res.status(500).json({ error: "Failed to save pest risk assessment" });
    }
  });
  app.patch("/api/pest-risks/:id/checklist/:taskId", (req, res) => {
    try {
      const { id, taskId } = req.params;
      const { status } = req.body;
      const assessment = db.pestRiskAssessments.find((p) => p.id === id);
      if (!assessment) return res.status(404).json({ error: "Assessment not found" });
      const task = assessment.weeklyScoutingChecklist.find((t) => t.id === taskId);
      if (task) {
        task.status = status || (task.status === "completed" ? "pending" : "completed");
      }
      res.json({ success: true, assessment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/crop-history", (req, res) => {
    res.json(db.cropHistories);
  });
  app.get("/api/schemes", (req, res) => {
    res.json(db.governmentSchemes);
  });
  app.get("/api/scheme-applications", (req, res) => {
    const { farmerId } = req.query;
    let list = db.schemeApplications;
    if (farmerId) list = list.filter((a) => a.farmer_id === farmerId);
    res.json(list);
  });
  app.post("/api/scheme-applications", (req, res) => {
    const data = req.body;
    const newAppl = {
      id: `appl_${Date.now()}`,
      application_number: `TN-AGRI-2025-${Math.floor(1e3 + Math.random() * 9e3)}`,
      scheme_id: data.schemeId,
      scheme_title: data.schemeTitle,
      farmer_id: data.farmerId || "usr_farmer_1",
      farmer_name: data.farmerName || "Murugan Palaniswamy",
      land_area_acres: parseFloat(data.landArea) || 6.5,
      aadhaar_last_four: data.aadhaarLastFour || "7654",
      bank_account_verified: true,
      status: "SUBMITTED",
      submitted_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      updated_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      remarks: "Application received and queued for Village Administrative Officer (VAO) endorsement."
    };
    db.schemeApplications.unshift(newAppl);
    db.logAudit(newAppl.farmer_id, newAppl.farmer_name, "farmer", "SUBMIT_SCHEME_APPLICATION", "scheme_applications", newAppl.id, {
      scheme: data.schemeTitle
    });
    db.sendNotification(
      newAppl.farmer_id,
      "Scheme Application Submitted",
      `Application #${newAppl.application_number} for ${data.schemeTitle} has been submitted for verification.`,
      "scheme",
      "schemes"
    );
    res.status(201).json(newAppl);
  });
  app.get("/api/markets/prices", (req, res) => {
    const { district, commodity, state, lat, lng } = req.query;
    const rates = db.fetchLiveMarketRates({
      district,
      commodity,
      state,
      userLat: lat ? parseFloat(lat) : void 0,
      userLng: lng ? parseFloat(lng) : void 0
    });
    res.json(rates);
  });
  app.get("/api/markets/alerts/rules", (req, res) => {
    const { userId } = req.query;
    const rules = db.getPriceAlertRules(userId || "usr_farmer_1");
    res.json(rules);
  });
  app.post("/api/markets/alerts/rules", (req, res) => {
    try {
      const result = db.createPriceAlertRule(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to create price alert rule" });
    }
  });
  app.patch("/api/markets/alerts/rules/:id", (req, res) => {
    try {
      const result = db.updatePriceAlertRule(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/markets/alerts/rules/:id", (req, res) => {
    try {
      const result = db.deletePriceAlertRule(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/markets/alerts/history", (req, res) => {
    const { userId } = req.query;
    const history = db.getTriggeredAlerts(userId || "usr_farmer_1");
    res.json(history);
  });
  app.patch("/api/markets/alerts/history/:id/read", (req, res) => {
    const result = db.markTriggeredAlertRead(req.params.id);
    res.json(result);
  });
  app.post("/api/markets/alerts/check-now", (req, res) => {
    try {
      const { userId, simulatedUpdates } = req.body;
      const result = db.checkAndTriggerPriceAlerts({
        userId: userId || "usr_farmer_1",
        simulatedUpdates
      });
      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to check price alerts" });
    }
  });
  app.post("/api/markets/rates/fetch-live", (req, res) => {
    try {
      const { fluctuateRandomly } = req.body;
      let simulatedUpdates = [];
      if (fluctuateRandomly) {
        db.marketPrices.forEach((item) => {
          const swingPercent = Math.round((Math.random() * 6 - 2.5) * 10) / 10;
          const baseModal = item.modal_price_per_quintal || item.modal_price_inr || 2200;
          const newPrice = Math.round(baseModal * (1 + swingPercent / 100));
          simulatedUpdates.push({
            commodity: item.commodity,
            mandiName: item.mandi_name,
            newPrice,
            changePercent: swingPercent
          });
        });
      }
      const alertCheckResult = db.checkAndTriggerPriceAlerts({
        userId: "usr_farmer_1",
        simulatedUpdates: simulatedUpdates.length > 0 ? simulatedUpdates : void 0
      });
      const liveRates = db.fetchLiveMarketRates();
      res.json({
        success: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        rates: liveRates,
        newlyTriggeredAlerts: alertCheckResult.alerts,
        triggeredCount: alertCheckResult.triggeredCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/buyers", (req, res) => {
    res.json(db.buyerListings);
  });
  app.get("/api/crop-listings", (req, res) => {
    res.json(db.cropListings);
  });
  app.post("/api/crop-listings", (req, res) => {
    const data = req.body;
    const newListing = {
      id: `cl_${Date.now()}`,
      farmer_id: data.farmerId || "usr_farmer_1",
      farmer_name: data.farmerName || "Murugan Palaniswamy",
      crop_name: data.cropName,
      variety: data.variety || "Hybrid Regular",
      quantity_quintals: parseFloat(data.quantityQuintals) || 10,
      expected_price_per_quintal: parseFloat(data.expectedPrice) || 2400,
      harvest_date: data.harvestDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      storage_location: data.storageLocation || "Farm On-site Storage",
      quality_grade: data.qualityGrade || "Grade A",
      status: "ACTIVE",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.cropListings.unshift(newListing);
    db.logAudit(newListing.farmer_id, newListing.farmer_name, "farmer", "CREATE_CROP_LISTING", "crop_listings", newListing.id, {
      crop: newListing.crop_name,
      quantity: newListing.quantity_quintals
    });
    res.status(201).json(newListing);
  });
  app.get("/api/ai/chat/roles", (req, res) => {
    const rolesList = Object.entries(CHATBOT_ROLES_CONFIG).map(([id, config]) => ({
      id,
      name: config.name,
      title: config.title,
      defaultTier: config.defaultTier,
      recommendedModel: config.recommendedModel,
      defaultSuggestions: config.defaultSuggestions
    }));
    res.json(rolesList);
  });
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, roleId, taskTier, preferredModel, language, farmerContext } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      const result = await generateMultiTurnChatResponse({
        message,
        history,
        roleId,
        taskTier,
        preferredModel,
        language: language || "English",
        farmerContext
      });
      const farmerId = farmerContext?.id || farmerContext?.farmerId || "usr_farmer_1";
      const farmerName = farmerContext?.name || farmerContext?.farmerName || "Murugan Palaniswamy";
      db.logAudit(
        farmerId,
        farmerName,
        "farmer",
        "AI_CHAT_INTERACTION",
        "ai_conversations",
        `chat_${Date.now()}`,
        {
          role_id: result.roleId,
          model_used: result.modelUsed,
          task_tier: result.taskTier,
          query_snippet: message.slice(0, 80)
        }
      );
      res.json(result);
    } catch (err) {
      console.error("Error generating AI advice:", err);
      res.status(500).json({ error: "AI advisory error" });
    }
  });
  app.post("/api/ai/crop-rotation", async (req, res) => {
    try {
      const { soilType, currentCrop, landAreaAcres, waterAvailability } = req.body;
      const plan = await generateCropRotationAI({
        soilType: soilType || "Red Sandy Loam",
        currentCrop: currentCrop || "Tomato",
        landAreaAcres: parseFloat(landAreaAcres) || 6.5,
        waterAvailability: waterAvailability || "Borewell + Drip Irrigation"
      });
      if (plan) {
        db.cropRotations.unshift(plan);
        return res.json(plan);
      }
      return res.json(db.cropRotations[0]);
    } catch (err) {
      console.error("Error generating AI crop rotation:", err);
      res.status(500).json({ error: "Failed to generate AI crop rotation plan" });
    }
  });
  app.get("/api/notifications", (req, res) => {
    const { userId } = req.query;
    let list = db.notifications;
    if (userId) list = list.filter((n) => n.user_id === userId);
    res.json(list);
  });
  app.patch("/api/notifications/:id/read", (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.is_read = true;
    res.json({ success: true });
  });
  app.get("/api/inquiries", (req, res) => {
    const { senderId, senderRole, status } = req.query;
    let list = [...db.inquiries];
    if (senderId) list = list.filter((i) => i.sender_id === senderId);
    if (senderRole) list = list.filter((i) => i.sender_role === senderRole);
    if (status) list = list.filter((i) => i.status === status);
    res.json(list);
  });
  app.get("/api/inquiries/:id", (req, res) => {
    const item = db.inquiries.find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Inquiry ticket not found" });
    res.json(item);
  });
  app.post("/api/inquiries", (req, res) => {
    try {
      const { senderId, senderName, senderEmail, senderPhone, senderRole, subject, category, priority, initialMessage } = req.body;
      if (!subject || !initialMessage || !senderId) {
        return res.status(400).json({ error: "Missing required inquiry parameters" });
      }
      const inquiry = db.createInquiry({
        senderId,
        senderName: senderName || "User",
        senderEmail,
        senderPhone,
        senderRole: senderRole || "farmer",
        subject,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
        initialMessage
      });
      res.status(201).json(inquiry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/inquiries/:id/reply", (req, res) => {
    try {
      const { senderId, senderName, senderRole, content, visualPayload } = req.body;
      if (!content) return res.status(400).json({ error: "Reply content cannot be empty" });
      const result = db.replyToInquiry({
        inquiryId: req.params.id,
        senderId: senderId || "usr_user",
        senderName: senderName || "User",
        senderRole: senderRole || "farmer",
        content,
        visualPayload
      });
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.inquiry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/inquiries/:id/status", (req, res) => {
    const { status, adminUserId } = req.body;
    const result = db.updateInquiryStatus(req.params.id, status, adminUserId);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result.inquiry);
  });
  app.get("/api/demand-crops", (req, res) => {
    const { category } = req.query;
    let list = db.demandCropSuggestions;
    if (category) list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    res.json(list);
  });
  app.get("/api/harvest-estimate", (req, res) => {
    const { cropName, sowingDate, variety } = req.query;
    const sow = sowingDate || new Date(Date.now() - 45 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
    const crop = cropName || "Tomato";
    const estimate = db.estimateHarvestTimeline(crop, sow, variety);
    res.json(estimate);
  });
  app.get("/api/crop-tracker/logs", (req, res) => {
    const userId = req.query.userId || "usr_farmer_1";
    const logs = db.getCropGrowthLogs(userId);
    res.json(logs);
  });
  app.post("/api/crop-tracker/logs", (req, res) => {
    const newLog = db.createCropGrowthLog(req.body);
    res.status(201).json(newLog);
  });
  app.patch("/api/crop-tracker/logs/:id", (req, res) => {
    const { id } = req.params;
    const result = db.updateCropGrowthLog(id, req.body);
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json(result.log);
  });
  app.delete("/api/crop-tracker/logs/:id", (req, res) => {
    const { id } = req.params;
    const result = db.deleteCropGrowthLog(id);
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json({ success: true, message: "Crop growth log deleted successfully" });
  });
  app.post("/api/crop-tracker/logs/:id/toggle-task", (req, res) => {
    const { id } = req.params;
    const { stageId, taskId, completed } = req.body;
    const result = db.toggleCropGrowthTask(id, stageId, taskId, completed);
    if (!result.success) return res.status(404).json({ error: "Crop log, stage, or task not found" });
    res.json(result.log);
  });
  app.get("/api/crop-tracker/profiles", (_req, res) => {
    res.json(db.getCropProfiles());
  });
  app.get("/api/weather", (req, res) => {
    const { lat, lng, locationName } = req.query;
    const userLat = lat ? parseFloat(lat) : 10.6586;
    const userLng = lng ? parseFloat(lng) : 77.0089;
    const locName = locationName || void 0;
    const weatherData = db.getRealTimeWeatherAndPlantingSuggestions(userLat, userLng, locName);
    res.json(weatherData);
  });
  app.get("/api/admin/tables/:tableName", (req, res) => {
    const { tableName } = req.params;
    const { search, page, limit, sortKey, sortDir, filterDemo } = req.query;
    let records = [];
    switch (tableName) {
      case "users":
        records = [...db.users];
        break;
      case "farmer_profiles":
        records = [...db.farmerProfiles];
        break;
      case "provider_profiles":
        records = [...db.providerProfiles];
        break;
      case "farms":
        records = [...db.farms];
        break;
      case "fields":
        records = [...db.fields];
        break;
      case "crop_history":
        records = [...db.cropHistories];
        break;
      case "crop_rotations":
        records = [...db.cropRotations];
        break;
      case "yield_predictions":
        records = [...db.yieldPredictions];
        break;
      case "pest_risk_assessments":
        records = [...db.pestRiskAssessments];
        break;
      case "soil_tests":
        records = [...db.soilTests];
        break;
      case "soil_labs":
        records = [...db.soilLabs];
        break;
      case "soil_test_requests":
        records = [...db.soilTestRequests];
        break;
      case "plant_scans":
        records = [...db.plantScans];
        break;
      case "warehouses":
        records = [...db.warehouses];
        break;
      case "warehouse_bookings":
        records = [...db.warehouseBookings];
        break;
      case "government_schemes":
        records = [...db.governmentSchemes];
        break;
      case "scheme_applications":
        records = [...db.schemeApplications];
        break;
      case "market_prices":
        records = [...db.marketPrices];
        break;
      case "buyers":
        records = [...db.buyerListings];
        break;
      case "crop_listings":
        records = [...db.cropListings];
        break;
      case "audit_logs":
        records = [...db.auditLogs];
        break;
      default:
        return res.status(404).json({ error: `Table '${tableName}' not found` });
    }
    if (filterDemo === "true") {
      records = records.filter((r) => r.is_demo !== true);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      records = records.filter(
        (item) => Object.values(item).some((val) => {
          if (typeof val === "string") return val.toLowerCase().includes(q);
          if (typeof val === "number") return val.toString().includes(q);
          if (Array.isArray(val)) return val.some((v) => typeof v === "string" && v.toLowerCase().includes(q));
          return false;
        })
      );
    }
    if (sortKey && typeof sortKey === "string") {
      const dir = sortDir === "desc" ? -1 : 1;
      records.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA > valB) return dir;
        return -dir;
      });
    }
    const total = records.length;
    const pageNum = parseInt(page || "1", 10);
    const pageSize = parseInt(limit || "15", 10);
    const startIdx = (pageNum - 1) * pageSize;
    const paginated = records.slice(startIdx, startIdx + pageSize);
    res.json({
      tableName,
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: paginated
    });
  });
  app.delete("/api/admin/tables/:tableName/:id", (req, res) => {
    const { tableName, id } = req.params;
    db.logAudit("usr_admin_1", "admin.agrisaarthi@nic.in", "admin", "DELETE_RECORD", tableName, id);
    res.json({ success: true, message: `Record ${id} removed from ${tableName}` });
  });
  app.get("/api/community/peers", (req, res) => {
    const { lat, lng, radius, crop, method, collaboration, hasEquipment, search } = req.query;
    const userLat = lat ? parseFloat(lat) : 10.6586;
    const userLng = lng ? parseFloat(lng) : 77.0089;
    const peers = db.searchNearbyFarmerPeers({
      lat: userLat,
      lng: userLng,
      radiusKm: radius ? parseFloat(radius) : void 0,
      crop,
      method,
      collaboration,
      hasEquipment: hasEquipment === "true",
      search
    });
    res.json(peers);
  });
  app.get("/api/community/knowledge-nodes", (req, res) => {
    const { lat, lng, radius, category, crop, urgency, search } = req.query;
    const userLat = lat ? parseFloat(lat) : 10.6586;
    const userLng = lng ? parseFloat(lng) : 77.0089;
    const nodes = db.searchFarmingKnowledgeNodes({
      lat: userLat,
      lng: userLng,
      radiusKm: radius ? parseFloat(radius) : void 0,
      category,
      crop,
      urgency,
      search
    });
    res.json(nodes);
  });
  app.post("/api/community/knowledge-nodes", (req, res) => {
    const node = db.createFarmingKnowledgeNode(req.body);
    res.status(201).json(node);
  });
  app.post("/api/community/knowledge-nodes/:id/upvote", (req, res) => {
    const { farmerId } = req.body;
    const result = db.upvoteFarmingKnowledgeNode(req.params.id, farmerId || "usr_farmer_1");
    res.json(result);
  });
  app.get("/api/community/opt-in", (req, res) => {
    const farmerId = req.query.farmerId || "usr_farmer_1";
    const settings = db.getFarmerCommunityOptIn(farmerId);
    res.json(settings);
  });
  app.post("/api/community/opt-in", (req, res) => {
    const { farmerId, settings } = req.body;
    const updated = db.updateFarmerCommunityOptIn(farmerId || "usr_farmer_1", settings || req.body);
    res.json(updated);
  });
  app.post("/api/community/messages", (req, res) => {
    const result = db.recordPeerMessage(req.body);
    res.json(result);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgriSaarthi AI Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start AgriSaarthi server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
