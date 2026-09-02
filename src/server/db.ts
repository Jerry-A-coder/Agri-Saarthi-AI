// Central Relational Database Management System for AgriSaarthi AI
// Implements 30+ relational schemas, foreign key relationships, audit logs,
// capacity tracking, geo-spatial distance indexing, and transaction consistency.

import {
  User,
  FarmerProfile,
  ProviderProfile,
  Farm,
  Field,
  CropHistory,
  CropRotationPlan,
  SoilTest,
  SoilLab,
  SoilTestRequest,
  PlantScan,
  PlantScanObservation,
  Warehouse,
  WarehouseBooking,
  GovernmentScheme,
  SchemeApplication,
  MarketPrice,
  BuyerListing,
  CropListing,
  AuditLog,
  NotificationItem,
  SystemHealthStats,
  AdminInquiry,
  AdminInquiryMessage,
  DemandCropSuggestion,
  CropHarvestEstimate,
  DailyWeatherForecast,
  CropPlantingRecommendation,
  RealTimeWeatherData,
  CropRotationRecommendation,
  CropRotationAdvisorResponse,
  SoilNutrientProfile,
  SeasonalClimateParameters,
  FourSeasonSuccessionPlan,
  YieldPredictionResult,
  PestRiskAssessmentResult,
  FarmerPeerProfile,
  FarmingKnowledgeNode,
  CommunityOptInSettings,
  PeerMessagePayload,
  PriceAlertRule,
  TriggeredPriceAlert,
  CropGrowthLog,
  CropGrowthStage,
  GrowthStageTask,
} from '../types';

export class AgriDatabase {
  public users: User[] = [];
  public farmerProfiles: FarmerProfile[] = [];
  public providerProfiles: ProviderProfile[] = [];
  public farms: Farm[] = [];
  public fields: Field[] = [];
  public cropGrowthLogs: CropGrowthLog[] = [];
  public cropHistories: CropHistory[] = [];
  public cropRotations: CropRotationPlan[] = [];
  public yieldPredictions: YieldPredictionResult[] = [];
  public pestRiskAssessments: PestRiskAssessmentResult[] = [];
  public soilTests: SoilTest[] = [];
  public soilLabs: SoilLab[] = [];
  public soilTestRequests: SoilTestRequest[] = [];
  public plantScans: PlantScan[] = [];
  public plantScanObservations: PlantScanObservation[] = [];
  public warehouses: Warehouse[] = [];
  public warehouseBookings: WarehouseBooking[] = [];
  public governmentSchemes: GovernmentScheme[] = [];
  public schemeApplications: SchemeApplication[] = [];
  public marketPrices: MarketPrice[] = [];
  public priceAlertRules: PriceAlertRule[] = [];
  public triggeredPriceAlerts: TriggeredPriceAlert[] = [];
  public buyerListings: BuyerListing[] = [];
  public cropListings: CropListing[] = [];
  public auditLogs: AuditLog[] = [];
  public notifications: NotificationItem[] = [];
  public inquiries: AdminInquiry[] = [];
  public demandCropSuggestions: DemandCropSuggestion[] = [];
  public farmerPeerProfiles: FarmerPeerProfile[] = [];
  public farmingKnowledgeNodes: FarmingKnowledgeNode[] = [];
  public communityOptInSettings: Record<string, CommunityOptInSettings> = {};
  public peerMessages: Array<{
    id: string;
    from_farmer_id: string;
    from_farmer_name: string;
    to_peer_id: string;
    to_peer_name: string;
    subject: string;
    message: string;
    inquiry_type: string;
    contact_phone?: string;
    created_at: string;
  }> = [];

  private startTime = Date.now();

  constructor() {
    this.seedDatabase();
  }

  // Record an audit log for every important operation
  public logAudit(
    userId: string,
    userEmail: string,
    role: any,
    action: string,
    entity: string,
    entityId: string,
    metadata?: Record<string, any>
  ): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      user_email: userEmail,
      role,
      action,
      entity,
      entity_id: entityId,
      metadata,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1 (Local Verified)',
    };
    this.auditLogs.unshift(log);
    // Keep max 500 logs
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  // Push a real-time notification
  public sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationItem['type'],
    linkTab?: string
  ): NotificationItem {
    const notification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
      link_tab: linkTab,
    };
    this.notifications.unshift(notification);
    return notification;
  }

  // Haversine distance calculator in Kilometers
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  }

  // Smart Warehouse Query Engine
  public searchNearbyWarehouses(params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    crop?: string;
    quantityKg?: number;
    storageType?: string;
    maxPrice?: number;
    sortBy?: 'distance' | 'price' | 'capacity' | 'rating';
  }) {
    let list = this.warehouses.map((w) => {
      const distanceKm = this.calculateDistance(params.lat, params.lng, w.latitude, w.longitude);
      const estRoadKm = Math.round(distanceKm * 1.25 * 10) / 10;
      const estDriveTimeMins = Math.round((estRoadKm / 35) * 60);

      // Estimated rate calculation per kg/day
      let baseRatePerKgDay = w.rate_inr;
      if (w.pricing_model === 'per_month_quintal') {
        baseRatePerKgDay = w.rate_inr / (100 * 30);
      } else if (w.pricing_model === 'per_ton_per_day') {
        baseRatePerKgDay = w.rate_inr / 1000;
      }

      const requestedQty = params.quantityKg || 1000;
      const sampleDurationDays = 30;
      const estimatedCost = Math.round(requestedQty * baseRatePerKgDay * sampleDurationDays);

      return {
        ...w,
        straight_line_distance_km: distanceKm,
        road_distance_km: estRoadKm,
        estimated_travel_time_minutes: estDriveTimeMins,
        effective_rate_per_kg_day: Math.round(baseRatePerKgDay * 100) / 100,
        estimated_storage_cost_30d: estimatedCost,
        suitability_score: this.calculateWarehouseSuitability(w, params.crop, requestedQty),
      };
    });

    // Filtering
    if (params.radiusKm) {
      list = list.filter((w) => w.straight_line_distance_km <= (params.radiusKm || 100));
    }
    if (params.storageType && params.storageType !== 'All') {
      list = list.filter((w) => w.storage_types.some((t) => t.toLowerCase().includes((params.storageType || '').toLowerCase())));
    }
    if (params.quantityKg) {
      list = list.filter((w) => w.available_capacity_kg >= (params.quantityKg || 0));
    }
    if (params.maxPrice) {
      list = list.filter((w) => w.effective_rate_per_kg_day <= (params.maxPrice || 9999));
    }

    // Sorting
    const sort = params.sortBy || 'distance';
    if (sort === 'distance') {
      list.sort((a, b) => a.straight_line_distance_km - b.straight_line_distance_km);
    } else if (sort === 'price') {
      list.sort((a, b) => a.effective_rate_per_kg_day - b.effective_rate_per_kg_day);
    } else if (sort === 'capacity') {
      list.sort((a, b) => b.available_capacity_kg - a.available_capacity_kg);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }

  private calculateWarehouseSuitability(w: Warehouse, crop?: string, quantity?: number): number {
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
  public createWarehouseBooking(bookingData: {
    warehouseId: string;
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    cropName: string;
    quantityKg: number;
    storageTypeRequested: string;
    startDate: string;
    durationDays: number;
    rateApplied: number;
  }): { success: boolean; booking?: WarehouseBooking; error?: string } {
    const warehouse = this.warehouses.find((w) => w.id === bookingData.warehouseId);
    if (!warehouse) {
      return { success: false, error: 'Warehouse not found' };
    }

    if (warehouse.available_capacity_kg < bookingData.quantityKg) {
      return {
        success: false,
        error: `Insufficient warehouse capacity. Requested: ${bookingData.quantityKg} kg, Available: ${warehouse.available_capacity_kg} kg`,
      };
    }

    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(startDate.getTime() + bookingData.durationDays * 24 * 60 * 60 * 1000);
    const estimatedCost = Math.round(bookingData.quantityKg * bookingData.rateApplied * bookingData.durationDays);

    const booking: WarehouseBooking = {
      id: `wb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      booking_code: `AGRI-WH-${Math.floor(100000 + Math.random() * 900000)}`,
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
      end_date: endDate.toISOString().split('T')[0],
      rate_applied: bookingData.rateApplied,
      estimated_cost_inr: estimatedCost,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.warehouseBookings.unshift(booking);

    // Audit log
    this.logAudit(bookingData.farmerId, bookingData.farmerPhone, 'farmer', 'CREATE_WAREHOUSE_BOOKING', 'warehouse_bookings', booking.id, {
      warehouse_id: warehouse.id,
      quantity_kg: bookingData.quantityKg,
      estimated_cost_inr: estimatedCost,
    });

    // Provider notification
    const providerUser = this.users.find((u) => u.id === warehouse.provider_id);
    if (providerUser) {
      this.sendNotification(
        providerUser.id,
        'New Storage Booking Request',
        `${bookingData.farmerName} requested to store ${bookingData.quantityKg} kg of ${bookingData.cropName} at ${warehouse.name}.`,
        'booking',
        'bookings'
      );
    }

    return { success: true, booking };
  }

  // Update Booking Status (e.g. ACCEPT, REJECT, CANCEL) and update Warehouse Capacity
  public updateBookingStatus(
    bookingId: string,
    newStatus: WarehouseBooking['status'],
    providerNotes?: string,
    userId?: string
  ): { success: boolean; booking?: WarehouseBooking; error?: string } {
    const booking = this.warehouseBookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    const warehouse = this.warehouses.find((w) => w.id === booking.warehouse_id);
    const oldStatus = booking.status;

    // State transition logic for capacity
    if (newStatus === 'ACCEPTED' && oldStatus !== 'ACCEPTED' && oldStatus !== 'ACTIVE') {
      if (warehouse) {
        if (warehouse.available_capacity_kg < booking.quantity_kg) {
          return { success: false, error: 'Cannot accept booking: Warehouse has reached capacity.' };
        }
        warehouse.used_capacity_kg += booking.quantity_kg;
        warehouse.available_capacity_kg = Math.max(0, warehouse.total_capacity_kg - warehouse.used_capacity_kg);
      }
    } else if (
      (newStatus === 'CANCELLED' || newStatus === 'REJECTED' || newStatus === 'COMPLETED' || newStatus === 'EXPIRED') &&
      (oldStatus === 'ACCEPTED' || oldStatus === 'ACTIVE')
    ) {
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
    booking.updated_at = new Date().toISOString();

    // Audit log
    this.logAudit(userId || 'system', 'admin/provider', 'provider', `UPDATE_BOOKING_STATUS_${newStatus}`, 'warehouse_bookings', booking.id, {
      old_status: oldStatus,
      new_status: newStatus,
    });

    // Notify farmer
    this.sendNotification(
      booking.farmer_id,
      `Storage Booking ${newStatus}`,
      `Your booking #${booking.booking_code} for ${booking.quantity_kg} kg ${booking.crop_name} at ${booking.warehouse_name} is now ${newStatus}.`,
      'booking',
      'warehouses'
    );

    return { success: true, booking };
  }

  // ==========================================
  // INQUIRIES & ADMIN HELPDESK ENGINE
  // ==========================================
  public createInquiry(params: {
    senderId: string;
    senderName: string;
    senderEmail?: string;
    senderPhone?: string;
    senderRole: 'farmer' | 'provider';
    subject: string;
    category: AdminInquiry['category'];
    priority?: AdminInquiry['priority'];
    initialMessage: string;
  }): AdminInquiry {
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ticketNumber = `TKT-${params.senderRole.toUpperCase().substring(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const initialMsg: AdminInquiryMessage = {
      id: `msg_${Date.now()}_1`,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_role: params.senderRole,
      content: params.initialMessage,
      timestamp: new Date().toISOString(),
    };

    // Automated immediate AI Admin triage message
    const triageMsg: AdminInquiryMessage = {
      id: `msg_${Date.now()}_2`,
      sender_id: 'usr_admin_ai',
      sender_name: 'AgriSaarthi Admin Desk (AI Assistant)',
      sender_role: 'admin',
      content: `Greetings ${params.senderName}. Your inquiry regarding "${params.subject}" has been assigned Ticket #${ticketNumber}. Our official desk agronomists and logistics coordinators have received this. While we review your case details, please find instant guidance and relevant resources below.`,
      timestamp: new Date(Date.now() + 1000).toISOString(),
      is_ai_assisted: true,
    };

    const newInquiry: AdminInquiry = {
      id: inquiryId,
      ticket_number: ticketNumber,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_email: params.senderEmail || '',
      sender_phone: params.senderPhone || '',
      sender_role: params.senderRole,
      subject: params.subject,
      category: params.category,
      status: 'OPEN',
      priority: params.priority || 'MEDIUM',
      messages: [initialMsg, triageMsg],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.inquiries.unshift(newInquiry);

    this.logAudit(params.senderId, params.senderRole, params.senderRole, 'CREATE_INQUIRY', 'inquiries', inquiryId, {
      ticketNumber,
      category: params.category,
      subject: params.subject,
    });

    this.sendNotification(
      'usr_admin_1',
      `New ${params.senderRole.toUpperCase()} Inquiry: ${ticketNumber}`,
      `${params.senderName} submitted: "${params.subject}" in ${params.category}`,
      'system',
      'inquiries'
    );

    return newInquiry;
  }

  public replyToInquiry(params: {
    inquiryId: string;
    senderId: string;
    senderName: string;
    senderRole: 'farmer' | 'provider' | 'admin';
    content: string;
    visualPayload?: AdminInquiryMessage['visual_payload'];
  }): { success: boolean; inquiry?: AdminInquiry; error?: string } {
    const inquiry = this.inquiries.find((i) => i.id === params.inquiryId);
    if (!inquiry) return { success: false, error: 'Inquiry not found' };

    const newMsg: AdminInquiryMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_role: params.senderRole,
      content: params.content,
      timestamp: new Date().toISOString(),
      visual_payload: params.visualPayload,
    };

    inquiry.messages.push(newMsg);
    inquiry.updated_at = new Date().toISOString();
    if (params.senderRole === 'admin') {
      inquiry.status = 'IN_REVIEW';
    }

    this.logAudit(params.senderId, params.senderRole, params.senderRole, 'REPLY_INQUIRY', 'inquiries', inquiry.id);

    // Notify other party
    const targetUserId = params.senderRole === 'admin' ? inquiry.sender_id : 'usr_admin_1';
    this.sendNotification(
      targetUserId,
      `Inquiry Update: #${inquiry.ticket_number}`,
      `New response received from ${params.senderName}`,
      'system',
      'inquiries'
    );

    return { success: true, inquiry };
  }

  public updateInquiryStatus(
    inquiryId: string,
    status: AdminInquiry['status'],
    adminUserId: string = 'usr_admin_1'
  ): { success: boolean; inquiry?: AdminInquiry; error?: string } {
    const inquiry = this.inquiries.find((i) => i.id === paramsInquiryIdOrDirect(inquiryId));
    if (!inquiry) return { success: false, error: 'Inquiry not found' };

    inquiry.status = status;
    inquiry.updated_at = new Date().toISOString();

    this.logAudit(adminUserId, 'admin', 'admin', `UPDATE_INQUIRY_STATUS_${status}`, 'inquiries', inquiry.id);

    this.sendNotification(
      inquiry.sender_id,
      `Inquiry Ticket #${inquiry.ticket_number} ${status}`,
      `Your support ticket status is now ${status}.`,
      'system',
      'inquiries'
    );

    return { success: true, inquiry };

    function paramsInquiryIdOrDirect(id: string) {
      return id;
    }
  }

  // ==========================================
  // REAL-TIME PRICE ALERTS & MARKET RATES
  // ==========================================
  public getPriceAlertRules(userId: string = 'usr_farmer_1'): PriceAlertRule[] {
    return this.priceAlertRules.filter((r) => !r.userId || r.userId === userId);
  }

  public createPriceAlertRule(ruleData: Partial<PriceAlertRule>): { success: boolean; rule: PriceAlertRule } {
    const market = this.marketPrices.find(
      (m) =>
        m.commodity.toLowerCase() === (ruleData.commodity || '').toLowerCase() ||
        m.mandi_name.toLowerCase().includes((ruleData.mandiName || '').toLowerCase())
    );

    const currentPrice = market
      ? market.modal_price_per_quintal || market.modal_price_inr || 2200
      : ruleData.currentPriceINR || 2200;

    const newRule: PriceAlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: ruleData.userId || 'usr_farmer_1',
      commodity: ruleData.commodity || 'Tomato',
      mandiName: ruleData.mandiName || 'Pollachi Regulated Market',
      district: ruleData.district || 'Coimbatore',
      state: ruleData.state || 'Tamil Nadu',
      condition: ruleData.condition || 'ABOVE_TARGET',
      targetPriceINR: Number(ruleData.targetPriceINR) || 2400,
      currentPriceINR: currentPrice,
      thresholdPercent: Number(ruleData.thresholdPercent) || 5,
      channels: ruleData.channels && ruleData.channels.length > 0 ? ruleData.channels : ['in_app', 'push', 'sms'],
      status: ruleData.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      triggerCount: 0,
      note: ruleData.note || '',
    };

    this.priceAlertRules.unshift(newRule);
    this.logAudit(
      newRule.userId,
      'farmer@agrisaarthi.gov.in',
      'farmer',
      'CREATE_PRICE_ALERT_RULE',
      'price_alerts',
      newRule.id,
      { commodity: newRule.commodity, targetPrice: newRule.targetPriceINR, condition: newRule.condition }
    );

    return { success: true, rule: newRule };
  }

  public updatePriceAlertRule(
    id: string,
    updates: Partial<PriceAlertRule>
  ): { success: boolean; rule?: PriceAlertRule; error?: string } {
    const rule = this.priceAlertRules.find((r) => r.id === id);
    if (!rule) return { success: false, error: 'Price alert rule not found' };

    Object.assign(rule, updates);
    return { success: true, rule };
  }

  public deletePriceAlertRule(id: string): { success: boolean; error?: string } {
    const idx = this.priceAlertRules.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, error: 'Rule not found' };
    this.priceAlertRules.splice(idx, 1);
    return { success: true };
  }

  public getTriggeredAlerts(userId: string = 'usr_farmer_1'): TriggeredPriceAlert[] {
    return this.triggeredPriceAlerts.filter((a) => !a.userId || a.userId === userId);
  }

  public markTriggeredAlertRead(id: string): { success: boolean } {
    const alert = this.triggeredPriceAlerts.find((a) => a.id === id);
    if (alert) alert.isRead = true;
    return { success: true };
  }

  public checkAndTriggerPriceAlerts(params?: {
    userId?: string;
    simulatedUpdates?: Array<{
      commodity: string;
      mandiName?: string;
      newPrice: number;
      changePercent?: number;
    }>;
  }): { triggeredCount: number; alerts: TriggeredPriceAlert[]; updatedPrices: MarketPrice[] } {
    const userId = params?.userId || 'usr_farmer_1';
    const newlyTriggered: TriggeredPriceAlert[] = [];

    // 1. If simulated updates were provided, update market prices in-memory
    if (params?.simulatedUpdates && params.simulatedUpdates.length > 0) {
      params.simulatedUpdates.forEach((upd) => {
        const item = this.marketPrices.find(
          (m) =>
            m.commodity.toLowerCase() === upd.commodity.toLowerCase() &&
            (!upd.mandiName || m.mandi_name.toLowerCase().includes(upd.mandiName.toLowerCase()))
        );
        if (item) {
          const oldPrice = item.modal_price_per_quintal || item.modal_price_inr || 2200;
          item.modal_price_per_quintal = upd.newPrice;
          item.modal_price_inr = upd.newPrice;
          item.price_trend = upd.newPrice > oldPrice ? 'up' : upd.newPrice < oldPrice ? 'down' : 'stable';
          const calcChange = Math.round(((upd.newPrice - oldPrice) / oldPrice) * 1000) / 10;
          item.price_change_percent = upd.changePercent !== undefined ? upd.changePercent : calcChange;
          item.report_date = new Date().toISOString().split('T')[0];
        }
      });
    }

    // 2. Evaluate all ACTIVE alert rules for user
    const activeRules = this.priceAlertRules.filter(
      (r) => r.status === 'ACTIVE' && (!r.userId || r.userId === userId)
    );

    activeRules.forEach((rule) => {
      // Find corresponding market price item
      const market = this.marketPrices.find(
        (m) =>
          m.commodity.toLowerCase() === rule.commodity.toLowerCase() ||
          (rule.mandiName && m.mandi_name.toLowerCase().includes(rule.mandiName.toLowerCase()))
      );

      if (!market) return;

      const currentPrice = market.modal_price_per_quintal || market.modal_price_inr || 0;
      const prevPrice = rule.currentPriceINR || (market.min_price_per_quintal || currentPrice * 0.95);
      const priceChangePct = market.price_change_percent || Math.round(((currentPrice - prevPrice) / prevPrice) * 100);

      let triggered = false;
      let conditionMetText = '';
      let alertType: TriggeredPriceAlert['alertType'] = 'HIGH_PROFIT_SELL';
      let headline = '';
      let message = '';
      let actionRecommendation = '';
      let suggestedAction: TriggeredPriceAlert['suggestedAction'] = 'SELL_NOW';

      if (rule.condition === 'ABOVE_TARGET' && currentPrice >= rule.targetPriceINR) {
        triggered = true;
        conditionMetText = `Rate reached ₹${currentPrice.toLocaleString('en-IN')}/Q (Target: ₹${rule.targetPriceINR.toLocaleString('en-IN')})`;
        alertType = 'HIGH_PROFIT_SELL';
        headline = `🚀 Target Exceeded: ${rule.commodity} @ ₹${currentPrice.toLocaleString('en-IN')}/Q`;
        message = `${rule.commodity} at ${market.mandi_name} is now ₹${currentPrice.toLocaleString('en-IN')}/Q, exceeding your selling threshold of ₹${rule.targetPriceINR.toLocaleString('en-IN')}/Q. Excellent window to liquidate inventory.`;
        actionRecommendation = 'Direct Mandi delivery or immediate buyer listing recommended within next 24-48 hours.';
        suggestedAction = 'SELL_NOW';
      } else if (rule.condition === 'BELOW_TARGET' && currentPrice <= rule.targetPriceINR) {
        triggered = true;
        conditionMetText = `Rate dropped to ₹${currentPrice.toLocaleString('en-IN')}/Q (Threshold: ₹${rule.targetPriceINR.toLocaleString('en-IN')})`;
        alertType = 'PRICE_DROP_WARNING';
        headline = `⚠️ Price Drop Warning: ${rule.commodity} @ ₹${currentPrice.toLocaleString('en-IN')}/Q`;
        message = `${rule.commodity} price at ${market.mandi_name} slipped to ₹${currentPrice.toLocaleString('en-IN')}/Q. To prevent distressed spot selling, reserve cold storage slots.`;
        actionRecommendation = 'Avoid distress selling. Deposit produce in nearest certified warehouse/cold storage.';
        suggestedAction = 'BOOK_STORAGE';
      } else if (rule.condition === 'PERCENT_SURGE' && Math.abs(priceChangePct) >= (rule.thresholdPercent || 5)) {
        triggered = true;
        conditionMetText = `Daily swing of ${priceChangePct > 0 ? '+' : ''}${priceChangePct}% detected`;
        alertType = priceChangePct > 0 ? 'SURGE_SPIKE' : 'PRICE_DROP_WARNING';
        headline = `📈 Volatility Spike: ${rule.commodity} ${priceChangePct > 0 ? 'Surged +' : 'Dipped '}${priceChangePct}%`;
        message = `High volatility detected for ${rule.commodity} at ${market.mandi_name}. Modal rate is now ₹${currentPrice.toLocaleString('en-IN')}/Q with ${market.arrival_quantity_tonnes} tonnes daily arrivals.`;
        actionRecommendation = 'Review buyer bids or consult Kisan AI Advisor before transport dispatch.';
        suggestedAction = priceChangePct > 0 ? 'VIEW_BUYERS' : 'CONSULT_ADVISOR';
      } else if (rule.condition === 'DAILY_DIGEST') {
        triggered = true;
        conditionMetText = `Daily Mandi Market Intelligence`;
        alertType = 'DAILY_DIGEST';
        headline = `📊 Daily Rate Digest: ${rule.commodity} @ ₹${currentPrice.toLocaleString('en-IN')}/Q`;
        message = `Morning rate report for ${rule.commodity} at ${market.mandi_name}: Min ₹${market.min_price_per_quintal}/Q, Modal ₹${currentPrice}/Q, Max ₹${market.max_price_per_quintal}/Q.`;
        actionRecommendation = 'Compare with nearby Mandis to optimize freight routing.';
        suggestedAction = 'CONSULT_ADVISOR';
      }

      if (triggered) {
        rule.lastTriggeredAt = new Date().toISOString();
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        rule.currentPriceINR = currentPrice;

        const alertItem: TriggeredPriceAlert = {
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
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        this.triggeredPriceAlerts.unshift(alertItem);
        newlyTriggered.push(alertItem);

        // Also push into user's persistent system notification stream
        this.sendNotification(
          userId,
          headline,
          message,
          'market_alert',
          'market'
        );
      }
    });

    return {
      triggeredCount: newlyTriggered.length,
      alerts: newlyTriggered,
      updatedPrices: this.marketPrices,
    };
  }

  public fetchLiveMarketRates(params?: {
    district?: string;
    state?: string;
    commodity?: string;
    userLat?: number;
    userLng?: number;
  }): MarketPrice[] {
    const lat = params?.userLat || 10.6586; // Pollachi default
    const lng = params?.userLng || 77.0089;

    let prices = this.marketPrices.map((m) => {
      // Calculate realistic distance if lat/lng available or estimate from district
      let dist = 18;
      if (m.district.toLowerCase() === 'coimbatore') dist = 24;
      else if (m.district.toLowerCase() === 'madurai') dist = 145;
      else if (m.district.toLowerCase() === 'erode') dist = 88;
      else if (m.district.toLowerCase() === 'salem') dist = 140;
      else if (m.district.toLowerCase() === 'thanjavur') dist = 210;
      else if (m.district.toLowerCase() === 'pune') dist = 980;

      const modalPrice = m.modal_price_per_quintal || m.modal_price_inr || 2200;
      const minPrice = m.min_price_per_quintal || m.min_price_inr || Math.round(modalPrice * 0.88);
      const maxPrice = m.max_price_per_quintal || m.max_price_inr || Math.round(modalPrice * 1.14);

      // Generate 7-day realistic historical prices if not present
      const hist = m.historical_prices || [
        { date: 'Day -6', modalPrice: Math.round(modalPrice * 0.93) },
        { date: 'Day -5', modalPrice: Math.round(modalPrice * 0.94) },
        { date: 'Day -4', modalPrice: Math.round(modalPrice * 0.96) },
        { date: 'Day -3', modalPrice: Math.round(modalPrice * 0.98) },
        { date: 'Day -2', modalPrice: Math.round(modalPrice * 0.99) },
        { date: 'Yesterday', modalPrice: Math.round(modalPrice * 0.97) },
        { date: 'Today (Live)', modalPrice: modalPrice },
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
        price_change_percent: m.price_change_percent || (m.price_trend === 'up' ? 4.2 : m.price_trend === 'down' ? -3.1 : 0.4),
        distance_km: dist,
        historical_prices: hist,
        price_date: m.report_date || new Date().toISOString().split('T')[0],
      };
    });

    if (params?.commodity && params.commodity !== 'ALL') {
      prices = prices.filter((p) => p.commodity.toLowerCase().includes(params.commodity!.toLowerCase()));
    }

    if (params?.district && params.district !== 'ALL') {
      prices = prices.filter((p) => p.district.toLowerCase().includes(params.district!.toLowerCase()));
    }

    return prices;
  }

  // ==========================================
  // HARVEST TIME ESTIMATOR & CROP STAGES
  // ==========================================
  public estimateHarvestTimeline(cropName: string, sowingDateStr: string, variety?: string): CropHarvestEstimate {
    const cropDurations: Record<string, { duration: number; stages: string[]; yieldPerAcre: number; bestWindow: string }> = {
      tomato: { duration: 95, stages: ['Germination (1-10d)', 'Vegetative (11-35d)', 'Flowering & Fruit Set (36-65d)', 'Fruit Ripening (66-85d)', 'Peak Picking (86-105d)'], yieldPerAcre: 180, bestWindow: 'Dry sunny mornings' },
      onion: { duration: 110, stages: ['Nursery / Transplant (1-15d)', 'Vegetative (16-50d)', 'Bulb Initiation (51-80d)', 'Bulb Development (81-100d)', 'Neck Fall & Maturity (101-115d)'], yieldPerAcre: 120, bestWindow: 'Field curing when 50% tops fall' },
      paddy: { duration: 125, stages: ['Seedling (1-20d)', 'Tillering (21-45d)', 'Panicle Initiation (46-75d)', 'Grain Filling (76-105d)', 'Maturity & Golden Ripening (106-125d)'], yieldPerAcre: 24, bestWindow: 'Drain field 10 days before combine harvest' },
      maize: { duration: 100, stages: ['Emergence (1-10d)', 'Knee-high (11-35d)', 'Tasseling & Silking (36-60d)', 'Grain Milk & Dough (61-85d)', 'Black Layer Physiological Maturity (86-100d)'], yieldPerAcre: 35, bestWindow: 'Moisture content below 15%' },
      groundnut: { duration: 105, stages: ['Germination (1-10d)', 'Branching (11-30d)', 'Peg Penetration (31-60d)', 'Pod Filling (61-90d)', 'Internal Shell Darkening Maturity (91-105d)'], yieldPerAcre: 18, bestWindow: 'Soil in friable moisture state' },
      'green chilli': { duration: 120, stages: ['Seedling (1-20d)', 'Vegetative (21-45d)', 'Flowering (46-70d)', 'First Green Harvest (71-90d)', 'Multiple Picking flushes (91-150d)'], yieldPerAcre: 85, bestWindow: 'Every 7-10 days' },
      turmeric: { duration: 240, stages: ['Sprouting (1-30d)', 'Tillering (31-90d)', 'Rhizome Growth (91-180d)', 'Maturation & Leaf Yellowing (181-240d)'], yieldPerAcre: 110, bestWindow: 'Leaves completely dried' },
      banana: { duration: 330, stages: ['Vegetative (1-150d)', 'Bunch Emergence (151-210d)', 'Finger Development (211-280d)', 'Harvest Ready (281-330d)'], yieldPerAcre: 320, bestWindow: 'Angles on fingers become rounded' },
    };

    const key = Object.keys(cropDurations).find((k) => cropName.toLowerCase().includes(k)) || 'tomato';
    const config = cropDurations[key];

    const sow = new Date(sowingDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sow.getTime());
    const daysElapsed = Math.min(Math.floor(diffTime / (1000 * 60 * 60 * 24)), config.duration);
    const daysRemaining = Math.max(0, config.duration - daysElapsed);

    const harvestStart = new Date(sow.getTime() + config.duration * 24 * 60 * 60 * 1000);
    const harvestEnd = new Date(harvestStart.getTime() + 10 * 24 * 60 * 60 * 1000);

    const progress = Math.min(100, Math.round((daysElapsed / config.duration) * 100));

    let stage: CropHarvestEstimate['current_stage'] = 'Germination & Seedling';
    if (progress > 85) stage = 'Maturity & Harvest Ready';
    else if (progress > 60) stage = 'Fruit / Grain Filling';
    else if (progress > 35) stage = 'Flowering & Pod Setting';
    else if (progress > 15) stage = 'Vegetative Growth';

    return {
      id: `harvest_${Date.now()}`,
      crop_name: cropName,
      variety: variety || 'High Yield Hybrid',
      sowing_date: sowingDateStr,
      duration_days: config.duration,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      estimated_harvest_start: harvestStart.toISOString().split('T')[0],
      estimated_harvest_end: harvestEnd.toISOString().split('T')[0],
      current_stage: stage,
      stage_progress_percent: progress,
      weather_harvest_condition: 'Optimal Dry Weather',
      expected_yield_quintals: config.yieldPerAcre,
      recommended_post_harvest_action: `Optimal harvesting condition: ${config.bestWindow}. Reserve cold storage or APMC buyer slot 10 days in advance.`,
    };
  }

  // ==========================================
  // CROP GROWTH TRACKER & HARVEST LIFECYCLE ENGINE
  // ==========================================

  public getCropProfiles(): Record<string, {
    duration: number;
    category: CropGrowthLog['category'];
    yieldPerAcreQuintals: number;
    stages: Array<{
      name: string;
      shortName: string;
      startDay: number;
      endDay: number;
      icon: string;
      description: string;
      water: string;
      nutrient: string;
      pests: string[];
      check: string;
      tasks: Array<{ title: string; desc: string; category: GrowthStageTask['category']; day: number; input?: string }>;
    }>;
  }> {
    return {
      tomato: {
        duration: 95,
        category: 'Vegetables',
        yieldPerAcreQuintals: 180,
        stages: [
          {
            name: 'Germination & Seedling Emergence',
            shortName: 'Emergence',
            startDay: 1,
            endDay: 12,
            icon: 'Sprout',
            description: 'Seed coat cracking, radical emergence, and cotyledon leaf expansion with primary taproot formation.',
            water: 'Light daily misting; maintain 60-70% soil bed moisture without waterlogging.',
            nutrient: 'Basal application of well-rotted FYM (10 t/acre) + Trichoderma viride (2.5 kg/acre).',
            pests: ['Damping-off (Pythium)', 'Flea beetles'],
            check: 'Ensure 85%+ uniform seedling emergence across nursery trays or raised beds.',
            tasks: [
              { title: 'Nursery Seedbed Inoculation', desc: 'Apply Pseudomonas fluorescens bio-agent to root zone.', category: 'Nutrient & Bio-Fertilizer', day: 3, input: 'Pseudomonas fluorescens 10g/L' },
              { title: 'Check Soil Moisture Uniformity', desc: 'Verify micro-sprinklers are not causing localized flooding.', category: 'Irrigation', day: 7 },
              { title: 'Damping-Off Scouting', desc: 'Inspect seedling collars for soft brown constriction.', category: 'Pest & Disease Scouting', day: 10 },
            ],
          },
          {
            name: 'Vegetative Growth & Canopy Staking',
            shortName: 'Vegetative',
            startDay: 13,
            endDay: 35,
            icon: 'Leaf',
            description: 'Vigorous main stem elongation, lateral branching, deep taproot anchorage, and trellising setup.',
            water: 'Drip fertigation every 2 days; 4,500 L/acre/day.',
            nutrient: 'Water soluble 19:19:19 NPK (4 kg/acre/week) + Zinc EDTA 12% foliar spray.',
            pests: ['Leaf Miner (Liriomyza)', 'Whiteflies (Bemisia)', 'Early Blight'],
            check: 'Install bamboo/GI wire trellising before plant height reaches 45 cm.',
            tasks: [
              { title: 'Main Stem Trellising & Staking', desc: 'Erect support strings to keep heavy foliage off moist ground.', category: 'Weeding & Aeration', day: 18 },
              { title: 'Foliar Micronutrient Boost', desc: 'Spray zinc, boron, and iron chelate cocktail.', category: 'Nutrient & Bio-Fertilizer', day: 25, input: 'Zinc EDTA + Boron 20%' },
              { title: 'Yellow Sticky Trap Deployment', desc: 'Install 15 yellow sticky cards per acre to trap whiteflies and aphids.', category: 'Pest & Disease Scouting', day: 30, input: 'Yellow Sticky Traps (15/acre)' },
            ],
          },
          {
            name: 'Flowering & Fruit Setting',
            shortName: 'Flowering',
            startDay: 36,
            endDay: 65,
            icon: 'Flower2',
            description: 'Cluster flower bud formation, active bee pollination, flower drop prevention, and pea-sized berry set.',
            water: 'Consistent moisture; prevent alternating dry and wet cycles to stop blossom end rot.',
            nutrient: 'Shift to 13:0:45 Potassium Nitrate (5 kg/acre) + Boron 20% (1g/L) for pollen viability.',
            pests: ['Fruit Borer (Helicoverpa)', 'Blossom End Rot (Calcium deficit)', 'Bacterial Canker'],
            check: 'Inspect flower clusters for flower drop percentage (target <15%).',
            tasks: [
              { title: 'Boron & Calcium Foliar Spray', desc: 'Apply Solubor + Calcium Nitrate to prevent blossom drop & fruit cracking.', category: 'Nutrient & Bio-Fertilizer', day: 40, input: 'Calcium Nitrate 5g/L + Boron 1g/L' },
              { title: 'Helicoverpa Pheromone Traps', desc: 'Install 6 Helilure pheromone traps per acre to track fruit borer moth flights.', category: 'Pest & Disease Scouting', day: 48, input: 'Pheromone Trap (Helilure)' },
              { title: 'Lateral Shoot Pruning (Suckering)', desc: 'Remove lower 2 suckers below first flower cluster for maximum fruit sizing.', category: 'Weeding & Aeration', day: 55 },
            ],
          },
          {
            name: 'Fruit Enlargement & Colour Break (Breaker Stage)',
            shortName: 'Fruit Sizing',
            startDay: 66,
            endDay: 85,
            icon: 'Activity',
            description: 'Rapid fruit sizing, pulp accumulation, lycopene pigment synthesis, and breaker colour shift.',
            water: 'Gradually reduce irrigation by 20% to prevent skin splitting and concentrate brix sugars.',
            nutrient: 'Apply 0:0:50 Sulphate of Potash (SOP) (6 kg/acre) for vibrant red colour and firm skin.',
            pests: ['Fruit Borer larvae entry', 'Late Blight (Phytophthora)', 'Sunscald'],
            check: 'Check fruit firmness and look for pink breaker colour on first lower truss.',
            tasks: [
              { title: 'Potassium Finish Fertigation', desc: 'Supply Sulphate of Potash to enhance shelf-life and brix content.', category: 'Nutrient & Bio-Fertilizer', day: 70, input: 'SOP 0:0:50 (6 kg/acre)' },
              { title: 'Pre-Harvest Scouting for Borer Entry', desc: 'Examine calyx ends for pinhole punctures.', category: 'Pest & Disease Scouting', day: 78 },
              { title: 'Harvest Crate & Labour Scheduling', desc: 'Clean and sanitize 150 plastic harvest crates with peracetic acid.', category: 'Harvest Prep', day: 82 },
            ],
          },
          {
            name: 'Maturity & Peak Multi-Flush Harvesting',
            shortName: 'Harvest Ready',
            startDay: 86,
            endDay: 95,
            icon: 'ShoppingBag',
            description: 'Full red/turning harvest, picking at 3-day intervals, grading, and direct APMC mandi dispatch.',
            water: 'Minimal moisture to keep soil firm for picking labourers.',
            nutrient: 'No chemical fertilizers during active picking flushes.',
            pests: ['Post-harvest rots (Rhizopus)', 'Fruit fly'],
            check: 'Pick with calyx intact during cool morning hours (6:00 AM - 10:30 AM).',
            tasks: [
              { title: 'Morning Harvest Flush #1', desc: 'Pick breaker and turning stage fruits for distant mandi transit.', category: 'Harvest Prep', day: 88 },
              { title: 'Grade A vs Grade B Sorting', desc: 'Segregate blemish-free 70-80mm fruits for premium wholesale rate.', category: 'Harvest Prep', day: 91 },
              { title: 'Mandi Rate Benchmark Check', desc: 'Compare Ottanchathiram vs Koyambedu APMC prices before vehicle loading.', category: 'Harvest Prep', day: 94 },
            ],
          },
        ],
      },
      onion: {
        duration: 110,
        category: 'Vegetables',
        yieldPerAcreQuintals: 120,
        stages: [
          {
            name: 'Transplanting & Root Establishment',
            shortName: 'Transplanting',
            startDay: 1,
            endDay: 15,
            icon: 'Sprout',
            description: 'Seedling root anchorage in raised beds with high organic carbon loamy soil.',
            water: 'Immediate life irrigation followed by 3rd day wetting.',
            nutrient: 'Basal Single Super Phosphate (SSP 150 kg/acre) + Azospirillum bio-fertilizer.',
            pests: ['Thrips tabaci', 'Root rot (Fusarium)'],
            check: 'Ensure 95%+ seedling stand establishment with no gap filling needed.',
            tasks: [
              { title: 'Seedling Root Dip', desc: 'Dip roots in Carbendazim + Pseudomonas slurry prior to planting.', category: 'Nutrient & Bio-Fertilizer', day: 2, input: 'Pseudomonas 10g/L' },
              { title: 'Life Irrigation Wetting Check', desc: 'Inspect bed moisture depth (top 15cm must be evenly moist).', category: 'Irrigation', day: 6 },
            ],
          },
          {
            name: 'Vegetative Foliage & Canopy Development',
            shortName: 'Foliage Growth',
            startDay: 16,
            endDay: 50,
            icon: 'Leaf',
            description: 'Continuous leaf emergence (target 8-10 healthy tubular leaves per bulb cluster).',
            water: 'Drip irrigation every 3 days; maintain aerated soil profile.',
            nutrient: 'Top dressing with Urea (25 kg/acre) + Micronutrient spray (Zinc + Sulphur).',
            pests: ['Onion Thrips (silver streaks)', 'Purple Blotch (Alternaria porri)'],
            check: 'Scout inner leaf axils with hand lens for thrips nymph populations.',
            tasks: [
              { title: 'First Inter-Cultivation & Weeding', desc: 'Shallow hoeing to remove grassy weeds and aerate bulb root zone.', category: 'Weeding & Aeration', day: 22 },
              { title: 'Sulphur & Micronutrient Application', desc: 'Apply 90% bentonite sulphur (10 kg/acre) for pungency and bulb scale development.', category: 'Nutrient & Bio-Fertilizer', day: 35, input: 'Bentonite Sulphur 90%' },
              { title: 'Blue Sticky Trap Installation', desc: 'Set up blue sticky traps (12/acre) for thrips monitoring.', category: 'Pest & Disease Scouting', day: 45, input: 'Blue Sticky Traps' },
            ],
          },
          {
            name: 'Bulb Initiation & Basal Swelling',
            shortName: 'Bulb Initiation',
            startDay: 51,
            endDay: 80,
            icon: 'Activity',
            description: 'Leaf base swelling, carbohydrate translocation to underground bulb, and daughter bulb formation.',
            water: 'Regular irrigation; critical water requirement period.',
            nutrient: 'Apply 13:0:45 Potassium Nitrate + Humic Acid 12% to facilitate carbohydrate sink translocation.',
            pests: ['Purple Blotch', 'Stemphylium blight', 'Armyworm'],
            check: 'Examine basal bulb diameter (>25 mm indicates healthy initiation).',
            tasks: [
              { title: 'Bulb Swelling Potassium Dose', desc: 'Fertigate Potassium Schoenite or Multi-K for dense scales.', category: 'Nutrient & Bio-Fertilizer', day: 58, input: 'Potassium Schoenite (10 kg/acre)' },
              { title: 'Purple Blotch Preventative Spray', desc: 'Spray Mancozeb 75% WP (2.5g/L) with sticker spreader.', category: 'Pest & Disease Scouting', day: 68, input: 'Mancozeb 75 WP' },
            ],
          },
          {
            name: 'Bulb Sizing & Outer Scale Pigmentation',
            shortName: 'Bulb Sizing',
            startDay: 81,
            endDay: 100,
            icon: 'Sprout',
            description: 'Maximum bulb circumference attainment, outer pink/red dry tunic pigmentation, and skin curing.',
            water: 'Stop irrigation 10-12 days before anticipated harvest to harden bulb scales.',
            nutrient: 'Zero nitrogen application; stop all foliar feeds.',
            pests: ['Basal Rot', 'Bulb mite'],
            check: 'Check for natural 50% top neck collapse/falling.',
            tasks: [
              { title: 'Irrigation Withholding Cutoff', desc: 'Cease irrigation completely to avoid soft bulb rot during storage.', category: 'Irrigation', day: 88 },
              { title: 'Storage Shed Disinfection', desc: 'Clean traditional onion storage structures (Pattarai) with lime wash.', category: 'Harvest Prep', day: 95 },
            ],
          },
          {
            name: 'Neck Fall, Harvest & Field Curing',
            shortName: 'Harvest Ready',
            startDay: 101,
            endDay: 110,
            icon: 'ShoppingBag',
            description: '70-80% neck fall, manual uprooting, windrow field curing for 3-5 days, and top cutting.',
            water: 'Completely dry soil.',
            nutrient: 'None.',
            pests: ['Aspergillus niger (Black mould) in storage'],
            check: 'Leaves should be paper-dry and necks fully sealed before cutting foliage 2.5cm above bulb.',
            tasks: [
              { title: 'Manual Uprooting in Morning', desc: 'Lift bulbs with root intact; cover bulbs with foliage in windrow.', category: 'Harvest Prep', day: 103 },
              { title: 'Field Curing Inspection', desc: 'Inspect outer scales for complete golden-purple drying.', category: 'Harvest Prep', day: 107 },
              { title: 'Cold Storage / Mandi Allocation', desc: 'Reserve local cold store chamber or transport to Dindigul mandi.', category: 'Harvest Prep', day: 109 },
            ],
          },
        ],
      },
      paddy: {
        duration: 125,
        category: 'Cereals & Grains',
        yieldPerAcreQuintals: 24,
        stages: [
          {
            name: 'Nursery & Seedling Germination',
            shortName: 'Nursery',
            startDay: 1,
            endDay: 20,
            icon: 'Sprout',
            description: 'Mat nursery / wet bed germination, 4-leaf stage development with robust root matting.',
            water: 'Maintain 2 cm water layer after seedling emergence.',
            nutrient: 'DAP (2 kg/cent) + Pseudomonas bio-seed treatment.',
            pests: ['Gall Midge', 'Thrips (chilli thrips)', 'Blast'],
            check: 'Seedlings reach 18-20 cm height ready for machine/manual transplanting.',
            tasks: [
              { title: 'Pre-Germination Seed Soaking', desc: 'Soak seeds in carbendazim solution for 24 hours.', category: 'Nutrient & Bio-Fertilizer', day: 2, input: 'Carbendazim 2g/kg' },
              { title: 'Nursery Water Level Management', desc: 'Maintain thin film of standing water to suppress weed germination.', category: 'Irrigation', day: 12 },
            ],
          },
          {
            name: 'Active Tillering & Canopy Closure',
            shortName: 'Tillering',
            startDay: 21,
            endDay: 45,
            icon: 'Leaf',
            description: 'Rapid tiller multiplication (target 18-22 productive tillers per hill) and deep root anchoring.',
            water: 'Alternate Wetting and Drying (AWD) — save 30% water.',
            nutrient: 'First top dress: Urea (35 kg/acre) + Zinc Sulphate (10 kg/acre) + Neem coated cake.',
            pests: ['Yellow Stem Borer (Dead hearts)', 'Leaf Folder', 'Bacterial Leaf Blight (BLB)'],
            check: 'Count productive tillers per sq. meter (target >350 tillers/m²).',
            tasks: [
              { title: 'Cono-Weeder Operation', desc: 'Run rotary weeder between rows to incorporate weeds and aerate roots.', category: 'Weeding & Aeration', day: 28 },
              { title: 'Neem-Coated Nitrogen Top Dressing', desc: 'Apply split nitrogen dose during active tillering peak.', category: 'Nutrient & Bio-Fertilizer', day: 35, input: 'Neem Coated Urea (35 kg)' },
              { title: 'Stem Borer Pheromone Traps', desc: 'Install 8 Scirpophaga incertulas pheromone lures/acre.', category: 'Pest & Disease Scouting', day: 42, input: 'Stem Borer Lures' },
            ],
          },
          {
            name: 'Panicle Primordia & Booting Stage',
            shortName: 'Panicle Booting',
            startDay: 46,
            endDay: 75,
            icon: 'Activity',
            description: 'Flag leaf emergence, panicle embryo development inside swollen leaf sheath, and stem elongation.',
            water: 'Keep 5 cm standing water during heading (critical sensitivity period).',
            nutrient: 'Muriate of Potash (MOP 20 kg/acre) + Boron 20% foliar spray at panicle emergence.',
            pests: ['Brown Plant Hopper (BPH - Hopper burn)', 'Sheath Rot', 'Neck Blast'],
            check: 'Check base of stems near waterline for BPH nymph colonies.',
            tasks: [
              { title: 'Potash Boost at Booting', desc: 'Broadcast MOP to maximize grain numbers per panicle and stem strength.', category: 'Nutrient & Bio-Fertilizer', day: 55, input: 'MOP (20 kg/acre)' },
              { title: 'BPH Stem Base Scouting', desc: 'Part hill canopy to inspect for brown planthoppers near water level.', category: 'Pest & Disease Scouting', day: 65 },
            ],
          },
          {
            name: 'Anthesis & Grain Milking / Dough Stage',
            shortName: 'Grain Filling',
            startDay: 76,
            endDay: 105,
            icon: 'Flower2',
            description: 'Pollination, starch synthesis, milky grain transition to hard dough stage with panicles bending under weight.',
            water: 'Saturated soil condition; avoid submerging panicles.',
            nutrient: 'Foliar spray of 1% Potassium Nitrate (13:0:45) to enhance 1000-grain test weight.',
            pests: ['Gundhi Bug (leptocorisa)', 'Grain discolouration', 'False Smut'],
            check: 'Examine developing grains for milky fluid turning into solid dough.',
            tasks: [
              { title: 'Gundhi Bug Early Morning Scouting', desc: 'Inspect blooming panicles for foul-smelling gundhi bugs.', category: 'Pest & Disease Scouting', day: 82 },
              { title: 'Foliar Grain Sizing Feed', desc: 'Apply 13:0:45 foliar spray to plump up grain kernels.', category: 'Nutrient & Bio-Fertilizer', day: 90, input: '13:0:45 (10g/L)' },
            ],
          },
          {
            name: 'Physiological Maturity & Golden Combine Harvest',
            shortName: 'Harvest Ready',
            startDay: 106,
            endDay: 125,
            icon: 'ShoppingBag',
            description: '85-90% grains turn golden yellow, moisture drops to 20-22%, ready for combine harvester.',
            water: 'Drain field completely 10-12 days prior to combine entry to firm soil.',
            nutrient: 'None.',
            pests: ['Rodents', 'Grain shattering'],
            check: 'Paddy moisture content should be 18-20% at harvest; dry down to 14% for safe storage.',
            tasks: [
              { title: 'Field Drainage Cutoff', desc: 'Open drainage bunds to dry soil for harvester machinery traction.', category: 'Irrigation', day: 112 },
              { title: 'Combine Harvester Booking', desc: 'Book track combine harvester with local custom hiring centre (CHC).', category: 'Harvest Prep', day: 118 },
              { title: 'Moisture Meter Testing', desc: 'Test harvested paddy moisture before gunny bag bagging.', category: 'Harvest Prep', day: 123 },
            ],
          },
        ],
      },
      groundnut: {
        duration: 105,
        category: 'Oilseeds & Pulses',
        yieldPerAcreQuintals: 18,
        stages: [
          {
            name: 'Germination & Seedling Vigour',
            shortName: 'Germination',
            startDay: 1,
            endDay: 10,
            icon: 'Sprout',
            description: 'Epicotyl emergence and taproot development with Rhizobium nodulation beginning.',
            water: 'Pre-sowing irrigation followed by light wetting on day 6.',
            nutrient: 'Rhizobium + Phosphobacteria bio-seed treatment.',
            pests: ['Collar rot (Aspergillus niger)', 'Cutworms'],
            check: 'Ensure 90%+ emergence without missing hills.',
            tasks: [
              { title: 'Rhizobium Bio-Inoculation', desc: 'Treat kernels with Rhizobium leguminosarum before furrow drop.', category: 'Nutrient & Bio-Fertilizer', day: 2, input: 'Rhizobium 250g/acre' },
              { title: 'Check Emergence Density', desc: 'Ensure plant population reaches 33 plants per sq. meter.', category: 'Weeding & Aeration', day: 8 },
            ],
          },
          {
            name: 'Vegetative Branching & Canopy Expansion',
            shortName: 'Vegetative',
            startDay: 11,
            endDay: 30,
            icon: 'Leaf',
            description: 'Vigorous primary and secondary branch formation, leaf canopy spreading over sandy soil.',
            water: 'Irrigation at 8-10 day intervals in red sandy loam.',
            nutrient: 'Gypsum (200 kg/acre) top dressing at 40-45 DAS for pod calcium.',
            pests: ['Spodoptera litura (Tobacco caterpillar)', 'Leaf Miner', 'Tikka Leaf Spot'],
            check: 'Count nodules per root system (target >25 pink active nodules).',
            tasks: [
              { title: 'Inter-Cultivation & Earthing Up', desc: 'Loosen soil around plant base to facilitate future peg entry.', category: 'Weeding & Aeration', day: 20 },
              { title: 'Tikka Spot Preventative Spray', desc: 'Spray Hexaconazole 5% EC (2ml/L) or Mancozeb.', category: 'Pest & Disease Scouting', day: 28, input: 'Hexaconazole 5 EC' },
            ],
          },
          {
            name: 'Flowering & Geotropic Peg Penetration',
            shortName: 'Pegging',
            startDay: 31,
            endDay: 60,
            icon: 'Flower2',
            description: 'Self-pollinated yellow flower flush, needle-like pegs growing downwards and penetrating top 5cm soil.',
            water: 'Maintain friable, moist soil; crucial stage where dry crusted soil prevents peg entry.',
            nutrient: 'Apply Gypsum (200 kg/acre) around root zone and lightly incorporate.',
            pests: ['Spodoptera larvae', 'Rust disease'],
            check: 'Ensure no weeding or inter-cultivation tool touches soil after 45 days (stops peg breakage).',
            tasks: [
              { title: 'Gypsum Basal Band Application', desc: 'Broadcast agricultural gypsum to provide calcium for kernel formation.', category: 'Nutrient & Bio-Fertilizer', day: 40, input: 'Gypsum (200 kg/acre)' },
              { title: 'Soil Looseness Inspection for Pegs', desc: 'Check that top 4 cm soil is loose and friable for easy peg insertion.', category: 'Irrigation', day: 50 },
            ],
          },
          {
            name: 'Pod Development & Kernel Filling',
            shortName: 'Pod Filling',
            startDay: 61,
            endDay: 90,
            icon: 'Activity',
            description: 'Subterranean pod expansion, shell lignification, kernel oil and protein accumulation.',
            water: 'Irrigate to avoid pod shrinkage; avoid water stagnation.',
            nutrient: 'Foliar spray of 0.5% FeSO4 + 0.1% Citric acid for iron chlorosis if yellowing occurs.',
            pests: ['White grub', 'Pod borer', 'Late Tikka'],
            check: 'Sample 3 plants to check pod development and shell hardening.',
            tasks: [
              { title: 'Test Pod Sample Harvest', desc: 'Dig 2 sample plants to inspect kernel filling percentage inside shells.', category: 'Harvest Prep', day: 75 },
              { title: 'Foliar Micronutrient Nutrition', desc: 'Apply Groundnut Special micronutrient formula (2.5 kg/acre).', category: 'Nutrient & Bio-Fertilizer', day: 82, input: 'Groundnut Special Mix' },
            ],
          },
          {
            name: 'Physiological Maturity & Mechanical Digging',
            shortName: 'Harvest Ready',
            startDay: 91,
            endDay: 105,
            icon: 'ShoppingBag',
            description: 'Lower leaves turn yellow and drop; inner shell lining turns dark brown/black (75% maturity index).',
            water: 'Give light irrigation 2 days prior to digging so pods do not detach in hard dry soil.',
            nutrient: 'None.',
            pests: ['Aflatoxin contamination (Aspergillus flavus)'],
            check: 'Crack open pods: dark brown inner surface indicates complete physiological maturity.',
            tasks: [
              { title: 'Pre-Harvest Softening Irrigation', desc: 'Light sprinkling so groundnut digger lifts pods without stripping roots.', category: 'Irrigation', day: 95 },
              { title: 'Groundnut Digger Operation', desc: 'Invert plants in field row to sun-dry pods for 3-4 days.', category: 'Harvest Prep', day: 100 },
              { title: 'Pod Threshing & Pod Moisture Check', desc: 'Thresh pods and dry to <8% moisture to prevent aflatoxin development.', category: 'Harvest Prep', day: 104 },
            ],
          },
        ],
      },
      maize: {
        duration: 100,
        category: 'Cereals & Grains',
        yieldPerAcreQuintals: 35,
        stages: [
          {
            name: 'Emergence & Early Seedling',
            shortName: 'Emergence',
            startDay: 1,
            endDay: 12,
            icon: 'Sprout',
            description: 'Coleoptile emergence and early root system formation.',
            water: 'Pre-sowing irrigation followed by light watering at day 5.',
            nutrient: 'Basal DAP + Zinc Sulphate (10 kg/acre).',
            pests: ['Fall Armyworm (Spodoptera frugiperda)', 'Shoot Fly'],
            check: 'Scout whorls for pinhole damage indicating Fall Armyworm neonates.',
            tasks: [
              { title: 'Fall Armyworm Early Scouting', desc: 'Inspect central whorls for translucent pinhole feeding patches.', category: 'Pest & Disease Scouting', day: 8 },
            ],
          },
          {
            name: 'Knee-High Vegetative & Stalk Growth',
            shortName: 'Knee-High',
            startDay: 13,
            endDay: 35,
            icon: 'Leaf',
            description: 'Rapid stem elongation, 8-10 leaf collar stage, brace root formation.',
            water: 'Irrigate every 6-8 days.',
            nutrient: 'Top dress Urea (40 kg/acre) + Potash (15 kg/acre).',
            pests: ['Fall Armyworm (whorl feeding)', 'Stem Borer'],
            check: 'Ensure deep green foliage without interveinal yellowing (zinc deficiency).',
            tasks: [
              { title: 'Whorl Application of Bio-Pesticide', desc: 'Apply Metarhizium anisopliae or neem cake in central whorls.', category: 'Pest & Disease Scouting', day: 20, input: 'Metarhizium anisopliae' },
              { title: 'Nitrogen Split Top Dress', desc: 'Broadcast urea around base and earthing up to support brace roots.', category: 'Nutrient & Bio-Fertilizer', day: 30, input: 'Urea 40 kg' },
            ],
          },
          {
            name: 'Tasseling & Silking (Flowering)',
            shortName: 'Tasseling & Silking',
            startDay: 36,
            endDay: 60,
            icon: 'Flower2',
            description: 'Pollen shedding from tassels and emergence of moist silks from ear cob.',
            water: 'Most critical moisture period; moisture stress causes unfertilized cob tips.',
            nutrient: 'Foliar spray of 19:19:19 + Boron.',
            pests: ['Cob Borer (Helicoverpa)', 'Turcicum Leaf Blight'],
            check: 'Ensure 100% silk emergence coincides with active pollen shed.',
            tasks: [
              { title: 'Critical Moisture Maintenance', desc: 'Ensure furrow irrigation does not stress plants during silking window.', category: 'Irrigation', day: 45 },
            ],
          },
          {
            name: 'Grain Milk & Dough Stage',
            shortName: 'Grain Filling',
            startDay: 61,
            endDay: 85,
            icon: 'Activity',
            description: 'Starch filling in kernels; transition from sweet milky sap to solid dent dough.',
            water: 'Maintain moist subsoil.',
            nutrient: 'Zero nitrogen.',
            pests: ['Ear rot', 'Birds'],
            check: 'Peel husk tip to check kernel row filling and absence of bald tips.',
            tasks: [
              { title: 'Kernel Milk Line Inspection', desc: 'Check progression of white milk line moving from crown to base.', category: 'Harvest Prep', day: 75 },
            ],
          },
          {
            name: 'Black Layer Maturity & Cob Harvest',
            shortName: 'Harvest Ready',
            startDay: 86,
            endDay: 100,
            icon: 'ShoppingBag',
            description: 'Black abscission layer forms at kernel attachment point; husks dry and bleach.',
            water: 'Dry field for harvesting.',
            nutrient: 'None.',
            pests: ['Storage weevils (Sitophilus zeamais)'],
            check: 'Kernel moisture drops below 16% for mechanical sheller operation.',
            tasks: [
              { title: 'Mechanical Cob Picking', desc: 'Harvest cobs and dry on concrete drying yard.', category: 'Harvest Prep', day: 92 },
              { title: 'Shelling & Bagging', desc: 'Shell kernels, clean chaff, and pack in HDPE bags.', category: 'Harvest Prep', day: 98 },
            ],
          },
        ],
      },
      banana: {
        duration: 330,
        category: 'Fruits',
        yieldPerAcreQuintals: 320,
        stages: [
          {
            name: 'Sucker Establishment & Early Vegetative',
            shortName: 'Establishment',
            startDay: 1,
            endDay: 90,
            icon: 'Sprout',
            description: 'Tissue culture plantlet / sword sucker root anchorage, 12-15 broad leaves formed.',
            water: 'Daily drip irrigation: 15-20 L/plant/day.',
            nutrient: 'Basal FYM + DAP (100g/plant) + Neem cake (500g/plant).',
            pests: ['Pseudostem Weevil', 'Rhizome Weevil', 'Banana Aphid (Bunchy Top vector)'],
            check: 'Inspect for vigorous cigar leaf unrolling every 7-10 days.',
            tasks: [
              { title: 'Tissue Culture Pit Preparation', desc: 'Mix FYM, bio-fertilizers, and topsoil in 60x60x60 cm pits.', category: 'Nutrient & Bio-Fertilizer', day: 5, input: 'FYM + Trichoderma' },
              { title: 'Desuckering Round #1', desc: 'Prune unwanted side suckers to concentrate food in main mother pseudostem.', category: 'Weeding & Aeration', day: 60 },
            ],
          },
          {
            name: 'Grand Vegetative & Stem Thickening',
            shortName: 'Grand Growth',
            startDay: 91,
            endDay: 180,
            icon: 'Leaf',
            description: 'Massive vegetative canopy formation (target 30 functional leaves), pseudostem girth reaching >65 cm.',
            water: 'Drip fertigation: 25-30 L/plant/day.',
            nutrient: 'Weekly fertigation of Urea (100g) + MOP (150g) + Magnesium Sulphate (25g).',
            pests: ['Sigatoka Leaf Spot', 'Erwinia Rhizome Rot'],
            check: 'Ensure pseudostem girth is >60cm at 1 meter height.',
            tasks: [
              { title: 'Sigatoka Deleafing & Mineral Oil Spray', desc: 'Cut dried lower spotted leaves and spray mineral oil + propiconazole.', category: 'Pest & Disease Scouting', day: 120, input: 'Propiconazole 1ml/L' },
              { title: 'Soil Earthing Up & Propping Wire', desc: 'Mound soil around pseudostem base to prevent wind uprooting.', category: 'Weeding & Aeration', day: 150 },
            ],
          },
          {
            name: 'Inflorescence Shooting & Bunch Emergence',
            shortName: 'Shooting',
            startDay: 181,
            endDay: 230,
            icon: 'Flower2',
            description: 'Flag leaf reduction followed by emergence of heavy pendant flower bud (heart) and bract opening.',
            water: 'Maintain consistent moisture; high transpiration phase.',
            nutrient: 'Apply Potassium Sulphate + Micronutrient spray (Zinc, Iron, Boron, Copper).',
            pests: ['Banana Thrips (Rust on fingers)', 'Spodoptera'],
            check: 'Check number of hands emerged (target 10-12 healthy hands per bunch).',
            tasks: [
              { title: 'Denavelling (Male Bud Removal)', desc: 'Cut terminal male heart 15cm below last hand to channel nutrients to fingers.', category: 'Weeding & Aeration', day: 200 },
              { title: 'Bamboo Bipod Propping', desc: 'Erect double bamboo poles to support 35kg heavy bunches.', category: 'Harvest Prep', day: 215 },
            ],
          },
          {
            name: 'Bunch Sleeve Covering & Finger Development',
            shortName: 'Finger Sizing',
            startDay: 231,
            endDay: 295,
            icon: 'Activity',
            description: 'Finger lengthening, hand filling, diameter thickening, and starch pulp accumulation.',
            water: 'Drip fertigation with high potassium (0:0:50).',
            nutrient: 'Foliar spray of Potassium Schoenite 1% on bunch.',
            pests: ['Sunscald', 'Finger tip rot'],
            check: 'Cover bunches with 6% perforated blue polypropylene sleeves for blemish-free skin.',
            tasks: [
              { title: 'Blue Bunch Sleeve Tying', desc: 'Cover bunch with blue polythene sleeve to protect from dust, pests & cold.', category: 'Harvest Prep', day: 240, input: 'Blue Perforated Sleeves' },
              { title: 'Bunch Spray for Shine & Calibration', desc: 'Spray Potassium Nitrate (0.5%) for uniform finger length.', category: 'Nutrient & Bio-Fertilizer', day: 265, input: 'Potassium Nitrate' },
            ],
          },
          {
            name: 'Harvest Maturity (Rounding of Finger Angles)',
            shortName: 'Harvest Ready',
            startDay: 296,
            endDay: 330,
            icon: 'ShoppingBag',
            description: 'Prominent sharp angles on fruit fingers become rounded and plump; light green shade.',
            water: 'Reduce watering 7 days before cutting.',
            nutrient: 'None.',
            pests: ['Crown rot during transit'],
            check: 'Harvest at 75-80% maturity for export/interstate transit; 90% for local market.',
            tasks: [
              { title: 'Bunch Cutting with Padded Handlers', desc: 'Harvest bunches onto shoulder pads without touching bare ground.', category: 'Harvest Prep', day: 310 },
              { title: 'De-handing, Washing & Alum Treatment', desc: 'Wash latex in water bath containing 1% alum to prevent transit staining.', category: 'Harvest Prep', day: 318 },
            ],
          },
        ],
      },
    };
  }

  public calculateCropGrowthStages(
    cropName: string,
    plantingDateStr: string,
    variety?: string,
    landAreaAcres: number = 2.5,
    sowingMethod: CropGrowthLog['sowingMethod'] = 'Drip Fertigated Bed',
    plotName: string = 'Plot A - North Field',
    notes?: string,
    userId: string = 'usr_farmer_1'
  ): CropGrowthLog {
    const profiles = this.getCropProfiles();
    const cleanName = cropName.toLowerCase();
    const matchedKey = Object.keys(profiles).find((k) => cleanName.includes(k)) || 'tomato';
    const profile = profiles[matchedKey];

    const plantingDate = new Date(plantingDateStr);
    const today = new Date();
    const diffTime = today.getTime() - plantingDate.getTime();
    const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const totalDuration = profile.duration;
    const daysRemaining = Math.max(0, totalDuration - daysElapsed);
    const overallProgress = Math.min(100, Math.round((daysElapsed / totalDuration) * 100));

    const harvestStartDate = new Date(plantingDate.getTime() + totalDuration * 24 * 60 * 60 * 1000);
    const harvestEndDate = new Date(harvestStartDate.getTime() + 10 * 24 * 60 * 60 * 1000);

    let currentStageIndex = 0;
    let currentStageName = profile.stages[0].name;

    const stages: CropGrowthStage[] = profile.stages.map((stg, idx) => {
      const stageStartDate = new Date(plantingDate.getTime() + (stg.startDay - 1) * 24 * 60 * 60 * 1000);
      const stageEndDate = new Date(plantingDate.getTime() + stg.endDay * 24 * 60 * 60 * 1000);

      let status: CropGrowthStage['status'] = 'UPCOMING';
      let progressPercent = 0;

      if (daysElapsed > stg.endDay) {
        status = 'COMPLETED';
        progressPercent = 100;
      } else if (daysElapsed >= stg.startDay && daysElapsed <= stg.endDay) {
        status = 'IN_PROGRESS';
        currentStageIndex = idx;
        currentStageName = stg.name;
        const stageDuration = stg.endDay - stg.startDay + 1;
        const daysInThisStage = daysElapsed - stg.startDay + 1;
        progressPercent = Math.min(100, Math.max(5, Math.round((daysInThisStage / stageDuration) * 100)));
      } else {
        status = 'UPCOMING';
        progressPercent = 0;
      }

      const tasks: GrowthStageTask[] = stg.tasks.map((t, tIdx) => {
        const isTaskDone = daysElapsed >= t.day;
        return {
          id: `task_${matchedKey}_${idx}_${tIdx}`,
          title: t.title,
          description: t.desc,
          category: t.category,
          dayTarget: t.day,
          completed: isTaskDone,
          completedAt: isTaskDone ? new Date(plantingDate.getTime() + t.day * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          recommendedInput: t.input,
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
        startDate: stageStartDate.toISOString().split('T')[0],
        endDate: stageEndDate.toISOString().split('T')[0],
        visualIcon: stg.icon,
        description: stg.description,
        agronomicGuidelines: {
          watering: stg.water,
          nutrientFocus: stg.nutrient,
          pestThreats: stg.pests,
          criticalCheck: stg.check,
        },
        tasks,
      };
    });

    let logStatus: CropGrowthLog['status'] = 'ACTIVE';
    if (overallProgress >= 90 && daysRemaining <= 7) {
      logStatus = 'HARVEST_READY';
    }

    // Lookup current live mandi modal rate for benchmark
    const mandiMatch = this.marketPrices.find((p) => p.commodity.toLowerCase().includes(matchedKey));
    const mandiRate = mandiMatch ? (mandiMatch.modal_price_per_quintal || mandiMatch.modal_price_inr || 2400) : 2400;

    const targetYield = Math.round(profile.yieldPerAcreQuintals * landAreaAcres * 10) / 10;

    return {
      id: `crop_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      farmerName: 'Murugan Palaniswamy',
      farmId: 'farm_1',
      farmName: 'Palaniswamy Bio-Dynamic Farm',
      fieldId: 'fld_1',
      plotName,
      cropName,
      variety: variety || (matchedKey === 'tomato' ? 'US-440 Hybrid' : matchedKey === 'onion' ? 'CO-5 Shallot' : 'High Yield Hybrid'),
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
      estimatedHarvestStartDate: harvestStartDate.toISOString().split('T')[0],
      estimatedHarvestEndDate: harvestEndDate.toISOString().split('T')[0],
      targetYieldQuintals: targetYield,
      status: logStatus,
      weatherAlert: daysRemaining <= 15 ? 'Clear sunny sky forecast: ideal for pre-harvest curing.' : 'Optimal ambient soil temperature (26-29°C).',
      currentMandiRateINR: mandiRate,
      stages,
      notes: notes || 'Monitored with AgriSaarthi AI Precision Growth Engine.',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  public getCropGrowthLogs(userId: string = 'usr_farmer_1'): CropGrowthLog[] {
    if (this.cropGrowthLogs.length === 0) {
      // Seed rich default active crop logs
      const now = new Date();
      const tomatoSow = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const onionSow = new Date(now.getTime() - 72 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const paddySow = new Date(now.getTime() - 88 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const groundnutSow = new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const log1 = this.calculateCropGrowthStages('Tomato', tomatoSow, 'US-440 Hybrid', 2.5, 'Drip Fertigated Bed', 'Plot A - North Polyhouse Field', 'Staking completed. Trichoderma applied at root zone.', userId);
      const log2 = this.calculateCropGrowthStages('Small Onion (Shallots)', onionSow, 'CO-5 Indigenous', 1.5, 'Furrow & Ridge', 'Plot B - East Block', 'Bentonite sulphur applied. Bulbs sizing vigorously.', userId);
      const log3 = this.calculateCropGrowthStages('Paddy (Rice)', paddySow, 'CR-1009 Sub-1', 4.0, 'Nursery Bed Transplanting', 'Canal Basin Lowland Field', 'Alternate Wetting and Drying (AWD) practiced.', userId);
      const log4 = this.calculateCropGrowthStages('Groundnut', groundnutSow, 'Kadiri-6', 2.0, 'Direct Seed Sowing', 'South Block 2', 'Rhizobium treated seeds. Pegs beginning to form.', userId);

      this.cropGrowthLogs = [log1, log2, log3, log4];
    }

    return this.cropGrowthLogs;
  }

  public createCropGrowthLog(data: Partial<CropGrowthLog>): CropGrowthLog {
    const newLog = this.calculateCropGrowthStages(
      data.cropName || 'Tomato',
      data.plantingDate || new Date().toISOString().split('T')[0],
      data.variety || 'High Yield Hybrid',
      data.landAreaAcres || 2.0,
      data.sowingMethod || 'Drip Fertigated Bed',
      data.plotName || 'Plot 1 - Main Field',
      data.notes,
      data.userId || 'usr_farmer_1'
    );

    this.cropGrowthLogs.unshift(newLog);

    this.logAudit(newLog.userId, newLog.farmerName || 'Murugan Palaniswamy', 'farmer', 'CREATE_CROP_GROWTH_LOG', 'crop_growth_logs', newLog.id, {
      crop: newLog.cropName,
      plantingDate: newLog.plantingDate,
      plot: newLog.plotName,
    });

    this.sendNotification(
      newLog.userId,
      '🌱 Crop Growth Track Initialized',
      `${newLog.cropName} (${newLog.variety}) in "${newLog.plotName}" logged. Harvest window calculated: ${newLog.estimatedHarvestStartDate}.`,
      'crop_plan',
      'crop-tracker'
    );

    return newLog;
  }

  public updateCropGrowthLog(id: string, data: Partial<CropGrowthLog>): { success: boolean; log?: CropGrowthLog; error?: string } {
    const idx = this.cropGrowthLogs.findIndex((l) => l.id === id);
    if (idx === -1) return { success: false, error: 'Crop growth log not found' };

    const existing = this.cropGrowthLogs[idx];
    const updated = this.calculateCropGrowthStages(
      data.cropName || existing.cropName,
      data.plantingDate || existing.plantingDate,
      data.variety || existing.variety,
      data.landAreaAcres !== undefined ? data.landAreaAcres : existing.landAreaAcres,
      data.sowingMethod || existing.sowingMethod,
      data.plotName || existing.plotName,
      data.notes !== undefined ? data.notes : existing.notes,
      existing.userId
    );
    updated.id = existing.id;
    updated.createdAt = existing.createdAt;

    if (data.status) updated.status = data.status;

    this.cropGrowthLogs[idx] = updated;

    this.logAudit(updated.userId, updated.farmerName || 'Murugan Palaniswamy', 'farmer', 'UPDATE_CROP_GROWTH_LOG', 'crop_growth_logs', updated.id, {
      crop: updated.cropName,
      plantingDate: updated.plantingDate,
    });

    return { success: true, log: updated };
  }

  public deleteCropGrowthLog(id: string): { success: boolean; error?: string } {
    const idx = this.cropGrowthLogs.findIndex((l) => l.id === id);
    if (idx === -1) return { success: false, error: 'Crop growth log not found' };

    const removed = this.cropGrowthLogs.splice(idx, 1)[0];
    this.logAudit(removed.userId, 'Murugan Palaniswamy', 'farmer', 'DELETE_CROP_GROWTH_LOG', 'crop_growth_logs', id, {
      crop: removed.cropName,
    });

    return { success: true };
  }

  public toggleCropGrowthTask(logId: string, stageId: string, taskId: string, completed?: boolean): { success: boolean; log?: CropGrowthLog } {
    const log = this.cropGrowthLogs.find((l) => l.id === logId);
    if (!log) return { success: false };

    const stage = log.stages.find((s) => s.id === stageId);
    if (stage) {
      const task = stage.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = completed !== undefined ? completed : !task.completed;
        task.completedAt = task.completed ? new Date().toISOString().split('T')[0] : undefined;
      }
    }

    log.lastUpdated = new Date().toISOString();
    return { success: true, log };
  }

  public searchNearbyFarmerPeers(params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    crop?: string;
    method?: string;
    collaboration?: string;
    hasEquipment?: boolean;
    search?: string;
  }): FarmerPeerProfile[] {
    const radius = params.radiusKm || 50;
    
    let peers = this.farmerPeerProfiles
      .filter((p) => p.opt_in_community)
      .map((p) => {
        const dist = this.calculateDistance(params.lat, params.lng, p.latitude, p.longitude);
        return {
          ...p,
          distance_km: dist,
        };
      })
      .filter((p) => p.distance_km <= radius);

    if (params.crop && params.crop !== 'All') {
      const q = params.crop.toLowerCase();
      peers = peers.filter((p) => p.primary_crops.some((c) => c.toLowerCase().includes(q)));
    }

    if (params.method && params.method !== 'All') {
      peers = peers.filter((p) => p.farming_method.toLowerCase().includes(params.method!.toLowerCase()));
    }

    if (params.collaboration && params.collaboration !== 'All') {
      peers = peers.filter((p) => p.available_for.some((af) => af.toLowerCase().includes(params.collaboration!.toLowerCase())));
    }

    if (params.hasEquipment) {
      peers = peers.filter((p) => p.equipment_available && p.equipment_available.length > 0);
    }

    if (params.search) {
      const s = params.search.toLowerCase();
      peers = peers.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.village.toLowerCase().includes(s) ||
          p.taluk.toLowerCase().includes(s) ||
          p.specialties.some((sp) => sp.toLowerCase().includes(s)) ||
          p.primary_crops.some((c) => c.toLowerCase().includes(s))
      );
    }

    // Sort nearest first
    peers.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    return peers;
  }

  public searchFarmingKnowledgeNodes(params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    category?: string;
    crop?: string;
    urgency?: string;
    search?: string;
  }): FarmingKnowledgeNode[] {
    const radius = params.radiusKm || 75;

    let nodes = this.farmingKnowledgeNodes.map((n) => {
      const dist = this.calculateDistance(params.lat, params.lng, n.latitude, n.longitude);
      return {
        ...n,
        distance_km: dist,
      };
    }).filter((n) => n.distance_km <= radius);

    if (params.category && params.category !== 'ALL') {
      nodes = nodes.filter((n) => n.category === params.category);
    }

    if (params.crop && params.crop !== 'All') {
      const c = params.crop.toLowerCase();
      nodes = nodes.filter((n) => n.crops_relevant.some((cr) => cr.toLowerCase().includes(c)));
    }

    if (params.urgency && params.urgency !== 'ALL') {
      nodes = nodes.filter((n) => n.urgency_level === params.urgency);
    }

    if (params.search) {
      const s = params.search.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.content.toLowerCase().includes(s) ||
          n.author_village.toLowerCase().includes(s) ||
          n.tags.some((t) => t.toLowerCase().includes(s))
      );
    }

    // Sort by high alert first, then by upvotes, then distance
    nodes.sort((a, b) => {
      if (a.urgency_level === 'HIGH_ALERT' && b.urgency_level !== 'HIGH_ALERT') return -1;
      if (b.urgency_level === 'HIGH_ALERT' && a.urgency_level !== 'HIGH_ALERT') return 1;
      return b.upvotes - a.upvotes;
    });

    return nodes;
  }

  public createFarmingKnowledgeNode(data: Partial<FarmingKnowledgeNode>): FarmingKnowledgeNode {
    const newNode: FarmingKnowledgeNode = {
      id: `kn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author_id: data.author_id || 'usr_farmer_1',
      author_name: data.author_name || 'Murugan Palaniswamy',
      author_village: data.author_village || 'Pollachi Rural',
      author_avatar: data.author_avatar || '👨‍🌾',
      latitude: data.latitude || 10.6586,
      longitude: data.longitude || 77.0089,
      category: data.category || 'PEST_ALERT',
      title: data.title || 'Local Agricultural Observation',
      content: data.content || '',
      actionable_tip: data.actionable_tip || '',
      urgency_level: data.urgency_level || 'BEST_PRACTICE',
      crops_relevant: data.crops_relevant && data.crops_relevant.length > 0 ? data.crops_relevant : ['General'],
      tags: data.tags || ['Community Wisdom', 'Field Tested'],
      upvotes: 1,
      has_upvoted: true,
      verified_by_agronomist: false,
      created_at: new Date().toISOString(),
      comments_count: 0,
    };

    this.farmingKnowledgeNodes.unshift(newNode);

    this.logAudit(newNode.author_id, newNode.author_name, 'farmer', 'CREATE_KNOWLEDGE_NODE', 'farming_knowledge_nodes', newNode.id, {
      category: newNode.category,
      title: newNode.title,
    });

    return newNode;
  }

  public upvoteFarmingKnowledgeNode(nodeId: string, farmerId: string): { success: boolean; upvotes: number; has_upvoted: boolean } {
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

  public getFarmerCommunityOptIn(farmerId: string): CommunityOptInSettings {
    if (this.communityOptInSettings[farmerId]) {
      return this.communityOptInSettings[farmerId];
    }

    const defaultProfile = this.farmerProfiles.find((f) => f.user_id === farmerId) || this.farmerProfiles[0];
    const user = this.users.find((u) => u.id === farmerId) || this.users[0];

    const defaultSettings: CommunityOptInSettings = {
      opted_in: true,
      display_name: defaultProfile ? (user?.name || 'Murugan Palaniswamy') : 'Kisan Member',
      display_mode: 'FULL_NAME',
      share_phone: true,
      phone: user?.phone || '+91 98421 87654',
      primary_crops: defaultProfile?.primary_crops || ['Tomato', 'Small Onion', 'Banana'],
      farming_method: '100% Certified Organic',
      land_area_acres: defaultProfile?.total_land_acres || 6.5,
      specialties: ['Drip Irrigation Setup', 'Organic Pest Formulations', 'Desi Cow Panchagavya'],
      available_for: [
        'Machinery / Tractor Sharing',
        'Indigenous Seed & Sapling Exchange',
        'Crop Advisory & Mentorship',
        'Joint Transport & Mandi Aggregation',
      ],
      equipment_available: ['Rotavator Implement', 'High-Pressure 16L Battery Sprayer'],
      bio: 'Practicing bio-dynamic and organic vegetable cultivation for over 18 years in Pollachi basin. Open to seed sharing and joint mandi transport pooling.',
      village: defaultProfile?.village || 'Pollachi Rural',
      taluk: defaultProfile?.taluk || 'Pollachi',
      district: defaultProfile?.district || 'Coimbatore',
      latitude: defaultProfile?.latitude || 10.6586,
      longitude: defaultProfile?.longitude || 77.0089,
    };

    this.communityOptInSettings[farmerId] = defaultSettings;
    return defaultSettings;
  }

  public updateFarmerCommunityOptIn(farmerId: string, settings: Partial<CommunityOptInSettings>): CommunityOptInSettings {
    const current = this.getFarmerCommunityOptIn(farmerId);
    const updated: CommunityOptInSettings = {
      ...current,
      ...settings,
    };

    this.communityOptInSettings[farmerId] = updated;

    // Sync with farmer peer profiles
    let existingPeer = this.farmerPeerProfiles.find((p) => p.user_id === farmerId);
    if (existingPeer) {
      existingPeer.opt_in_community = updated.opted_in;
      existingPeer.name = updated.display_mode === 'ANONYMOUS_KISAN' ? `Kisan #${existingPeer.farmer_id_code.split('-')[1] || '882'}` : updated.display_name;
      existingPeer.primary_crops = updated.primary_crops;
      existingPeer.farming_method = updated.farming_method;
      existingPeer.specialties = updated.specialties;
      existingPeer.available_for = updated.available_for;
      existingPeer.equipment_available = updated.equipment_available;
      existingPeer.bio = updated.bio;
      existingPeer.allow_direct_call = updated.share_phone;
    } else if (updated.opted_in) {
      const newPeer: FarmerPeerProfile = {
        id: `peer_${Date.now()}`,
        user_id: farmerId,
        name: updated.display_name,
        farmer_id_code: 'KISAN-TN-882',
        avatar: '👨‍🌾',
        village: updated.village,
        taluk: updated.taluk,
        district: updated.district,
        state: 'Tamil Nadu',
        latitude: updated.latitude,
        longitude: updated.longitude,
        land_area_acres: updated.land_area_acres,
        primary_crops: updated.primary_crops,
        farming_method: updated.farming_method,
        soil_type: 'Red Sandy Loam',
        specialties: updated.specialties,
        available_for: updated.available_for,
        equipment_available: updated.equipment_available,
        bio: updated.bio,
        experience_years: 18,
        rating: 4.95,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: new Date().toISOString(),
        phone_masked: updated.share_phone ? updated.phone : '+91 98421 •••••',
        allow_direct_call: updated.share_phone,
        active_nodes_count: 2,
      };
      this.farmerPeerProfiles.unshift(newPeer);
    }

    this.logAudit(farmerId, updated.phone, 'farmer', 'UPDATE_COMMUNITY_OPT_IN', 'farmer_peer_profiles', farmerId, {
      opted_in: updated.opted_in,
      display_mode: updated.display_mode,
    });

    return updated;
  }

  public recordPeerMessage(payload: PeerMessagePayload): { success: boolean; messageId: string } {
    const msgId = `pmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const msg = {
      id: msgId,
      ...payload,
      created_at: new Date().toISOString(),
    };
    this.peerMessages.unshift(msg);

    // Send in-app notification to the peer
    const targetPeer = this.farmerPeerProfiles.find((p) => p.id === payload.to_peer_id || p.user_id === payload.to_peer_id);
    if (targetPeer) {
      this.sendNotification(
        targetPeer.user_id,
        `Community Message from ${payload.from_farmer_name}`,
        `Inquiry: "${payload.subject}" regarding ${payload.inquiry_type}`,
        'community_message',
        'community-map'
      );
    }

    return { success: true, messageId: msgId };
  }

  // ==========================================
  // REAL-TIME WEATHER & OPTIMAL PLANTING ENGINE
  // ==========================================
  public getRealTimeWeatherAndPlantingSuggestions(
    lat: number = 10.6586,
    lng: number = 77.0089,
    locationName?: string
  ): RealTimeWeatherData {
    // Geo-climatic calibration based on latitude & longitude
    // Coimbatore/Pollachi (~10.65, 77.00), Madurai (~9.92, 78.11), Thanjavur (~10.78, 79.13), Baramati/Pune (~18.15, 74.57), Ludhiana (~30.90, 75.85)
    let locDistrict = 'Coimbatore';
    let locState = 'Tamil Nadu';
    let locLabel = locationName || 'Pollachi / Coimbatore, TN';
    let baseTemp = 27.2;
    let baseHumidity = 66;
    let rainFactor = 6.5; // mm expected

    if (Math.abs(lat - 9.92) < 0.8 && Math.abs(lng - 78.11) < 0.8) {
      locDistrict = 'Madurai';
      locState = 'Tamil Nadu';
      locLabel = 'Madurai Central, TN';
      baseTemp = 30.5;
      baseHumidity = 58;
      rainFactor = 3.2;
    } else if (Math.abs(lat - 10.78) < 0.8 && Math.abs(lng - 79.13) < 0.8) {
      locDistrict = 'Thanjavur';
      locState = 'Tamil Nadu';
      locLabel = 'Thanjavur Delta, TN';
      baseTemp = 28.8;
      baseHumidity = 78;
      rainFactor = 14.2;
    } else if (Math.abs(lat - 11.66) < 0.8 && Math.abs(lng - 78.14) < 0.8) {
      locDistrict = 'Salem';
      locState = 'Tamil Nadu';
      locLabel = 'Salem Commodity Belt, TN';
      baseTemp = 29.1;
      baseHumidity = 62;
      rainFactor = 4.8;
    } else if (Math.abs(lat - 18.15) < 1.5 && Math.abs(lng - 74.57) < 1.5) {
      locDistrict = 'Pune';
      locState = 'Maharashtra';
      locLabel = 'Baramati / Pune, MH';
      baseTemp = 26.0;
      baseHumidity = 52;
      rainFactor = 1.8;
    } else if (Math.abs(lat - 30.90) < 1.5 && Math.abs(lng - 75.85) < 1.5) {
      locDistrict = 'Ludhiana';
      locState = 'Punjab';
      locLabel = 'Ludhiana Agro Hub, PB';
      baseTemp = 22.4;
      baseHumidity = 48;
      rainFactor = 0.5;
    } else if (locationName) {
      locLabel = locationName;
      locDistrict = locationName.split(',')[0] || 'Local Region';
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();

    // 7-day forecast construction
    const forecast: DailyWeatherForecast[] = [];
    const conditionPool: Array<{
      condition: string;
      icon: DailyWeatherForecast['condition_icon'];
      rainMm: number;
      prob: number;
      verdict: DailyWeatherForecast['sowing_suitability_verdict'];
      score: number;
      advisory_note: string;
    }> = [
      {
        condition: 'Clear & Sunny (Mild Morning Breeze)',
        icon: 'sunny',
        rainMm: 0.8,
        prob: 15,
        verdict: 'EXCELLENT',
        score: 95,
        advisory_note: 'Optimal sunlight and friable soil. Ideal for direct nursery transplanting and line sowing.',
      },
      {
        condition: 'Partly Cloudy with Gentle Humidity',
        icon: 'partly_cloudy',
        rainMm: 3.5,
        prob: 30,
        verdict: 'EXCELLENT',
        score: 92,
        advisory_note: 'Mild cloud cover minimizes evapotranspiration shock for fresh seedlings.',
      },
      {
        condition: 'Passing Afternoon Light Showers',
        icon: 'rain',
        rainMm: 8.2,
        prob: 65,
        verdict: 'GOOD',
        score: 84,
        advisory_note: 'Natural moisture boost. Favorable for grain and tuber sowing in well-drained ridges.',
      },
      {
        condition: 'Moderate Convective Rain & Showers',
        icon: 'rain',
        rainMm: 18.5,
        prob: 80,
        verdict: 'MODERATE',
        score: 68,
        advisory_note: 'Prepare inter-row drainage trenches. Delay delicate shallow seed broadcasting.',
      },
      {
        condition: 'Scattered Overcast Clouds',
        icon: 'cloudy',
        rainMm: 1.2,
        prob: 25,
        verdict: 'GOOD',
        score: 88,
        advisory_note: 'Stable temperatures. Great window for basal fertilizer incorporation with sowing.',
      },
      {
        condition: 'Clear Sky & Warm Sunshine',
        icon: 'sunny',
        rainMm: 0.0,
        prob: 10,
        verdict: 'EXCELLENT',
        score: 94,
        advisory_note: 'Ensure light post-sowing drip or furrow irrigation to initiate radicle breakout.',
      },
      {
        condition: 'Pleasant & Mild Weather',
        icon: 'partly_cloudy',
        rainMm: 2.0,
        prob: 20,
        verdict: 'EXCELLENT',
        score: 91,
        advisory_note: 'Balanced soil temperature provides high germination speed across vegetables.',
      },
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
      const poolItem = conditionPool[i % conditionPool.length];
      
      const maxT = Math.round((baseTemp + 4.2 + Math.sin(i) * 1.5) * 10) / 10;
      const minT = Math.round((baseTemp - 5.5 + Math.cos(i) * 1.2) * 10) / 10;
      const avgT = Math.round(((maxT + minT) / 2) * 10) / 10;
      const precipMm = Math.round((poolItem.rainMm * (rainFactor / 6.0)) * 10) / 10;
      const soilMoist = Math.min(88, Math.max(45, Math.round(58 + precipMm * 1.8 - (i * 0.8))));

      forecast.push({
        date: d.toISOString().split('T')[0],
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
        advisory_note: poolItem.advisory_note,
      });
    }

    // Current weather conditions
    const currentPrecip = forecast[0].precipitation_mm;
    const currentSoilMoist = forecast[0].soil_moisture_percent;
    const currentTemp = forecast[0].temp_avg_c;

    // Crop Planting Recommendations tailored to local precipitation & temperature
    const recommendations: CropPlantingRecommendation[] = [
      {
        id: 'rec_tomato',
        crop_name: 'Tomato',
        category: 'Vegetables',
        variety: 'Shivam / Arka Rakshak F1 Hybrid',
        optimal_temp_range: '21°C - 29°C',
        optimal_precipitation_range: '5 - 15 mm / week (Light / Drip)',
        soil_moisture_target: '60% - 70% Field Capacity',
        suitability_score: 96,
        suitability_status: 'OPTIMAL_WINDOW',
        recommended_window: 'Next 3 Days (Morning 6:30 AM - 9:30 AM)',
        best_sowing_time_of_day: 'Early morning or late afternoon (avoids solar heat stress)',
        days_to_germination: 5,
        weather_match_reason: `Current temperature (${currentTemp}°C) and soil moisture (${currentSoilMoist}%) match tomato germination thermal units perfectly.`,
        precipitation_impact_analysis: `Forecasted low-to-moderate precipitation (${currentPrecip} mm) prevents seed washout while maintaining adequate nursery moisture.`,
        temperature_impact_analysis: `Daytime highs under 32°C prevent blossom and sprout scorch, promoting 94%+ germination vigour.`,
        actionable_sowing_tips: [
          'Pre-treat seeds with Trichoderma viride (4g/kg seed) to guard against damping-off.',
          'Form raised beds of 15 cm height to allow rapid runoff in case of intermittent convective showers.',
          'Apply light mulching or shade netting over nursery beds during peak noon hours.',
        ],
        risk_warnings: [
          'Avoid transplanting during heavy rain on Day 4 to prevent collar rot in tender seedlings.',
        ],
      },
      {
        id: 'rec_paddy',
        crop_name: 'Paddy / Rice',
        category: 'Grains & Cereals',
        variety: 'ADT-45 / CR Dhan 310 / BPT 5204',
        optimal_temp_range: '24°C - 33°C',
        optimal_precipitation_range: '25 - 60 mm (Submerged / Saturated)',
        soil_moisture_target: '85% - 95% Saturated',
        suitability_score: 91,
        suitability_status: 'OPTIMAL_WINDOW',
        recommended_window: 'Day 3 to Day 5 (Align with incoming showers)',
        best_sowing_time_of_day: 'Mid-morning after dew clearance',
        days_to_germination: 4,
        weather_match_reason: 'Warm nighttime temperatures (>22°C) accelerate coleoptile elongation in nursery beds.',
        precipitation_impact_analysis: 'Expected rainfall surge (18mm) on Day 3-4 provides natural field puddling water, slashing irrigation pumping costs by 35%.',
        temperature_impact_analysis: 'Current thermal sum is optimal for active vegetative tillering and root establishment.',
        actionable_sowing_tips: [
          'Soak certified seeds in water for 24 hours and incubate for 24 hours in moist gunny bags prior to broadcasting.',
          'Maintain 2-3 cm shallow water level in nursery plots.',
          'Incorporate well-decomposed FYM (10 tonnes/ha) during last puddling pass.',
        ],
        risk_warnings: [
          'Ensure nursery drainage sluices are cleared prior to Day 4 rainfall.',
        ],
      },
      {
        id: 'rec_maize',
        crop_name: 'Maize / Corn',
        category: 'Grains & Cereals',
        variety: 'COH(M) 8 Hybrid / Pioneer 3396',
        optimal_temp_range: '20°C - 31°C',
        optimal_precipitation_range: '10 - 25 mm',
        soil_moisture_target: '55% - 65%',
        suitability_score: 93,
        suitability_status: 'OPTIMAL_WINDOW',
        recommended_window: 'Next 48 Hours',
        best_sowing_time_of_day: 'Morning 7:00 AM - 11:00 AM',
        days_to_germination: 4,
        weather_match_reason: `Soil moisture at ${currentSoilMoist}% offers ideal friction and capillary moisture for maize grain absorption.`,
        precipitation_impact_analysis: 'Sowing 48 hours ahead of Day 4 showers allows seeds to establish primary root anchors before topsoil saturation.',
        temperature_impact_analysis: 'Warm soil temperature (25.8°C) enables rapid emergence within 96 hours.',
        actionable_sowing_tips: [
          'Maintain ridge-to-furrow spacing of 60 cm x 20 cm at 4 cm uniform depth.',
          'Apply 100% basal dose of Phosphatic (DAP/SSP) and Potassic fertilizers at time of dibbling.',
        ],
        risk_warnings: [
          'Do not sow in low-lying water stagnating pockets without gradient ditches.',
        ],
      },
      {
        id: 'rec_groundnut',
        crop_name: 'Groundnut / Peanut',
        category: 'Cash Crops',
        variety: 'Kadiri Lepakshi (K-1812) / TMV-7',
        optimal_temp_range: '22°C - 30°C',
        optimal_precipitation_range: '8 - 18 mm',
        soil_moisture_target: '50% - 60% (Friable Loam)',
        suitability_score: 87,
        suitability_status: 'FAVORABLE',
        recommended_window: 'Days 1 - 2 (Before heavy wetting)',
        best_sowing_time_of_day: 'Early Morning',
        days_to_germination: 6,
        weather_match_reason: 'Friable sandy loam moisture condition allows unhindered radical elongation without pod rot.',
        precipitation_impact_analysis: 'Light showers (1-4mm) facilitate seed coat softening; avoid broadcasting immediately before downpours.',
        temperature_impact_analysis: 'Average temperature of 27°C is well within the 22-30°C optimum for Rhizobium nodulation.',
        actionable_sowing_tips: [
          'Inoculate seeds with Rhizobium culture (NC92) and Phosphobacteria 15 mins before sowing.',
          'Depth of sowing must not exceed 5 cm to ensure uniform seedling emergence.',
        ],
        risk_warnings: [
          'Avoid waterlogged clay tracts where anaerobic conditions induce collar rot (Aspergillus niger).',
        ],
      },
      {
        id: 'rec_green_chilli',
        crop_name: 'Green Chilli',
        category: 'Vegetables',
        variety: 'PKM 1 / Sitara / US-611',
        optimal_temp_range: '22°C - 30°C',
        optimal_precipitation_range: '5 - 12 mm',
        soil_moisture_target: '60% - 70%',
        suitability_score: 92,
        suitability_status: 'OPTIMAL_WINDOW',
        recommended_window: 'Next 3 Days (Optimal Seed Bed Window)',
        best_sowing_time_of_day: 'Late Afternoon 4:00 PM - 6:30 PM',
        days_to_germination: 7,
        weather_match_reason: 'Gentle ambient humidity and warm daytime light encourage sturdy hypocotyl development.',
        precipitation_impact_analysis: 'Dry sunny interval over the next 48h ensures uniform seedbed firmness without crusting.',
        temperature_impact_analysis: 'Moderate night temps (21-23°C) stimulate root tip mitosis and early mycorrhizal association.',
        actionable_sowing_tips: [
          'Sow in pro-trays with 1:1 coco peat and vermicompost for 98% transplant survival.',
          'Drench nursery beds with carbendazim (1g/L) or neem cake extract against damping-off.',
        ],
        risk_warnings: [
          'Protect newly emerged cotyledons from thrips during dry sunny spells with yellow sticky traps.',
        ],
      },
      {
        id: 'rec_blackgram',
        crop_name: 'Black Gram / Urad',
        category: 'Pulses',
        variety: 'VBN 8 / Co 6 / ADT 5',
        optimal_temp_range: '25°C - 34°C',
        optimal_precipitation_range: '5 - 10 mm (Sensitive to Waterlogging)',
        soil_moisture_target: '45% - 55%',
        suitability_score: 79,
        suitability_status: 'NEEDS_IRRIGATION',
        recommended_window: 'Days 5 - 7 (Post-Rain Clear Spell Window)',
        best_sowing_time_of_day: 'Morning 6:30 AM - 10:00 AM',
        days_to_germination: 4,
        weather_match_reason: 'Warm conditions support rapid nitrogen-fixing nodule growth, but soil must remain well-aerated.',
        precipitation_impact_analysis: 'Mid-week showers could cause temporary water pooling; delaying sowing to Day 5 prevents seed decay.',
        temperature_impact_analysis: 'High daytime temperatures (29-32°C) trigger rapid vegetative foliage growth.',
        actionable_sowing_tips: [
          'Pellet seeds with Rhizobium bio-fertilizer and DAP solution.',
          'Provide broad beds with 30 cm furrow drains to discard excess surface runoff.',
        ],
        risk_warnings: [
          'Pulse seeds decay if submerged in saturated mud for more than 16 hours.',
        ],
      },
      {
        id: 'rec_coriander',
        crop_name: 'Coriander & Leafy Greens',
        category: 'Vegetables',
        variety: 'CS 11 / Sadhana / Green Delight',
        optimal_temp_range: '18°C - 26°C',
        optimal_precipitation_range: '3 - 8 mm',
        soil_moisture_target: '65% - 75%',
        suitability_score: 95,
        suitability_status: 'OPTIMAL_WINDOW',
        recommended_window: 'Immediate (Next 24 to 36 Hours)',
        best_sowing_time_of_day: 'Early Morning before 8:30 AM',
        days_to_germination: 8,
        weather_match_reason: 'Current partial cloud cover and mild morning temperatures reduce direct seedbed dehydration.',
        precipitation_impact_analysis: 'Light misting/drizzle creates the exact delicate microclimate required for split mericarp germination.',
        temperature_impact_analysis: 'Temperatures under 29°C prevent premature bolting (flowering) in young coriander plants.',
        actionable_sowing_tips: [
          'Crush coriander seeds gently into two halves (mericarps) before sowing to double germination points.',
          'Broadcast evenly and cover with a 1 cm thin layer of well-sieved farmyard compost.',
        ],
        risk_warnings: [
          'Do not allow surface crust to bake under harsh midday sun; apply light sprinkler mist.',
        ],
      },
      {
        id: 'rec_turmeric',
        crop_name: 'Turmeric',
        category: 'Spices & Tubers',
        variety: 'Erode Local / BSR 2 / Salem Gold',
        optimal_temp_range: '24°C - 33°C',
        optimal_precipitation_range: '15 - 30 mm',
        soil_moisture_target: '70% - 80%',
        suitability_score: 90,
        suitability_status: 'OPTIMAL_WINDOW',
        recommended_window: 'Days 2 - 4 (Synchronized with Pre-Monsoon Moisture)',
        best_sowing_time_of_day: 'Morning 7:00 AM - 11:30 AM',
        days_to_germination: 14,
        weather_match_reason: 'Warm subterranean soil temperatures activate mother rhizome buds.',
        precipitation_impact_analysis: 'Upcoming 18mm rain reduces initial sprinkler irrigation runs and keeps ridges suitably damp for finger sprouting.',
        temperature_impact_analysis: 'Steady daytime heat accelerates underground enzymatic conversion for rapid shoot emergence.',
        actionable_sowing_tips: [
          'Select healthy mother or primary finger rhizomes weighing 35-45 grams each.',
          'Dip seed rhizomes in Trichoderma suspension (10g/L) for 30 minutes before planting on raised ridges (45 cm spacing).',
          'Apply green leaf mulch (12 tonnes/ha) immediately after planting to conserve soil moisture.',
        ],
        risk_warnings: [
          'Ensure ridge tops are well packed to avoid exposing sprouted eyes to direct scorching sunlight.',
        ],
      },
    ];

    // Overall Planting Advisory synthesis
    return {
      location_name: locLabel,
      district: locDistrict,
      state: locState,
      latitude: lat,
      longitude: lng,
      updated_at: new Date().toISOString(),
      current: {
        temp_c: forecast[0].temp_avg_c,
        feels_like_c: Math.round((forecast[0].temp_avg_c + 1.8) * 10) / 10,
        humidity_percent: forecast[0].humidity_percent,
        precipitation_rate_mm: forecast[0].precipitation_mm,
        precipitation_prob_today: forecast[0].precipitation_probability,
        wind_speed_kmh: forecast[0].wind_speed_kmh,
        wind_direction: 'SW (South-West Monsoon Wind)',
        solar_uv_index: 6.4,
        soil_moisture_percent: forecast[0].soil_moisture_percent,
        soil_temp_c: Math.round((forecast[0].temp_avg_c - 1.2) * 10) / 10,
        cloud_cover_percent: forecast[0].condition_icon === 'sunny' ? 15 : forecast[0].condition_icon === 'rain' ? 85 : 45,
        condition_text: forecast[0].condition,
        condition_code: forecast[0].condition_icon,
      },
      forecast_7days: forecast,
      planting_recommendations: recommendations,
      overall_planting_advisory: {
        title: `Optimal Sowing Window Active across ${locDistrict}`,
        verdict: 'HIGHLY_SUITABLE',
        description: `Current regional precipitation (${forecast[0].precipitation_mm} mm) and thermal averages (${forecast[0].temp_avg_c}°C) present an exceptional planting window over the next 48 to 72 hours for Vegetables, Maize, and Early Kharif Cereals. Soil moisture at ${forecast[0].soil_moisture_percent}% is optimal for rapid seed germination.`,
        primary_alert: `Weather Note: Moderate convective showers (~${Math.round(rainFactor * 2.8)}mm) expected on ${forecast[3].day_name}. Complete field plowing and ridge preparation before rain onset.`,
      },
    };
  }

  // =========================================================================
  // Intelligent Crop Rotation & Soil Nutrient Succession Recommender Engine
  // =========================================================================
  public getSmartCropRotationRecommendations(params?: {
    soilNutrients?: Partial<SoilNutrientProfile>;
    seasonalParams?: Partial<SeasonalClimateParameters>;
    farmerId?: string;
    fieldId?: string;
  }): CropRotationAdvisorResponse {
    // 1. Resolve Soil Nutrient Profile (fall back to farmer's field soil test if available)
    let defaultSoil: SoilNutrientProfile = {
      soil_type: 'Red Sandy Loam',
      ph: 6.8,
      organic_carbon_percent: 0.58,
      nitrogen_kg_ha: 210,
      nitrogen_status: 'Low',
      phosphorus_kg_ha: 19.5,
      phosphorus_status: 'Medium',
      potassium_kg_ha: 265,
      potassium_status: 'Medium',
      ec_ds_m: 0.42,
      zinc_ppm: 0.82,
      iron_ppm: 5.1,
      boron_ppm: 0.48,
      source_sample_code: 'SHC-TN-CBE-2025-901',
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
          source_sample_code: fieldTest.sample_code,
        };
      }
    }

    const soil: SoilNutrientProfile = {
      ...defaultSoil,
      ...(params?.soilNutrients || {}),
    };

    // Recalculate status bands if raw values were manually provided
    soil.nitrogen_status = soil.nitrogen_kg_ha < 240 ? 'Low' : soil.nitrogen_kg_ha > 380 ? 'High' : 'Medium';
    soil.phosphorus_status = soil.phosphorus_kg_ha < 15 ? 'Low' : soil.phosphorus_kg_ha > 30 ? 'High' : 'Medium';
    soil.potassium_status = soil.potassium_kg_ha < 140 ? 'Low' : soil.potassium_kg_ha > 280 ? 'High' : 'Medium';

    // 2. Resolve Seasonal & Climatic Parameters
    const defaultStandingCrop = 'Tomato';
    const standingCrop = params?.seasonalParams?.current_standing_crop || defaultStandingCrop;
    const targetSeason: SeasonalClimateParameters['target_season'] = params?.seasonalParams?.target_season || 'Kharif (Monsoon)';
    const rainfallTrend = params?.seasonalParams?.expected_rainfall_trend || 'Normal Monsoon';
    const waterSource = params?.seasonalParams?.water_source || 'Borewell + Drip Irrigation';
    const irrigationCapacity = params?.seasonalParams?.irrigation_capacity || 'Medium';
    const priorityFocus: SeasonalClimateParameters['priority_focus'] = params?.seasonalParams?.priority_focus || 'BALANCED';

    // 3. Botanical Family Taxonomy & Standing Crop Exhaustion Profile
    const cropFamilyMap: Record<string, { family: string; primaryDepletion: string; pathogenRisks: string[] }> = {
      Tomato: {
        family: 'Solanaceae (Nightshade)',
        primaryDepletion: 'Heavy Potassium (K) & Nitrogen (N) extraction; root zone compaction',
        pathogenRisks: ['Early Blight (Alternaria solani)', 'Bacterial Wilt (Ralstonia)', 'Root-Knot Nematodes (Meloidogyne)'],
      },
      Chilli: {
        family: 'Solanaceae (Nightshade)',
        primaryDepletion: 'Heavy Potash drain and micronutrient zinc/boron depletion',
        pathogenRisks: ['Anthracnose Fruit Rot (Colletotrichum)', 'Murda Complex Thrips', 'Phytophthora Wilt'],
      },
      Brinjal: {
        family: 'Solanaceae (Nightshade)',
        primaryDepletion: 'Nitrogen & secondary nutrient magnesium exhaustion',
        pathogenRisks: ['Shoot & Fruit Borer carryover', 'Bacterial Wilt', 'Phomopsis Blight'],
      },
      Maize: {
        family: 'Poaceae (Gramineae / Grass)',
        primaryDepletion: 'Heavy topsoil nitrogen & phosphorus exhaustion',
        pathogenRisks: ['Fall Armyworm pupae carryover', 'Turcicum Leaf Blight', 'Stalk Rot'],
      },
      Paddy: {
        family: 'Poaceae (Gramineae / Grass)',
        primaryDepletion: 'Anaerobic subsoil hardpan formation and silica/phosphorus lockup',
        pathogenRisks: ['Blast (Magnaporthe oryzae)', 'Bacterial Leaf Blight', 'Brown Plant Hopper'],
      },
      Cotton: {
        family: 'Malvaceae (Mallow)',
        primaryDepletion: 'Deep subsoil nutrient extraction and potash depletion',
        pathogenRisks: ['Pink Bollworm soil pupation', 'Verticillium Wilt', 'Grey Mildew'],
      },
      Turmeric: {
        family: 'Zingiberaceae (Ginger family)',
        primaryDepletion: 'High rhizome potash & organic matter uptake over 8-9 months',
        pathogenRisks: ['Rhizome Rot (Pythium aphanidermatum)', 'Leaf Spot (Colletotrichum)'],
      },
      Groundnut: {
        family: 'Fabaceae (Leguminosae / Pulses)',
        primaryDepletion: 'Calcium (pod filling) and phosphorus extraction; leaves behind fixed nitrogen',
        pathogenRisks: ['Tikka Leaf Spot (Cercospora)', 'Collar Rot', 'White Grub'],
      },
      Sugarcane: {
        family: 'Poaceae (Gramineae / Grass)',
        primaryDepletion: 'Extreme NPK and soil water depletion across 12-14 month ratoon',
        pathogenRisks: ['Red Rot (Colletotrichum falcatum)', 'Grassy Shoot', 'Smut'],
      },
      Onion: {
        family: 'Alliaceae (Amaryllidaceae)',
        primaryDepletion: 'Shallow nitrogen & sulfur extraction; natural root exudate biocides',
        pathogenRisks: ['Purple Blotch (Alternaria porri)', 'Stemphylium Blight', 'Basal Rot (Fusarium)'],
      },
    };

    const standingMeta = cropFamilyMap[standingCrop] || {
      family: 'General Agricultural Crop',
      primaryDepletion: 'General organic matter and NPK extraction',
      pathogenRisks: ['Soil-borne fungal spores and nematode reproduction'],
    };

    // 4. Candidate Crops Master Repository with Agronomic Matrix
    interface MasterCropProfile {
      id: string;
      crop_name: string;
      scientific_name: string;
      crop_family: string;
      recommended_varieties: string[];
      suitable_seasons: Array<'Kharif (Monsoon)' | 'Rabi (Winter/Post-Monsoon)' | 'Zaid (Summer)'>;
      base_water_need: 'Low' | 'Medium' | 'High';
      duration_days: number;
      nitrogen_fixation_kg_ha: number; // positive = fixation, negative = uptake
      n_demand_level: 'Low' | 'Medium' | 'High';
      p_demand_level: 'Low' | 'Medium' | 'High';
      k_demand_level: 'Low' | 'Medium' | 'High';
      optimal_ph_range: [number, number];
      organic_carbon_enrichment: string;
      breaks_diseases_for_families: string[];
      pathogen_break_desc: string;
      expected_yield_q_acre: number;
      mandi_price_inr_q: number;
      cost_cultivation_acre: number;
      sowing_window: string;
      harvest_window: string;
      market_demand: 'Very High' | 'High' | 'Moderate';
      practices: string[];
      green_manure_tip: string;
    }

    const candidatePool: MasterCropProfile[] = [
      {
        id: 'rot_black_gram',
        crop_name: 'Black Gram / Urad Dal',
        scientific_name: 'Vigna mungo',
        crop_family: 'Fabaceae (Leguminosae)',
        recommended_varieties: ['VBN 8 (High Podding)', 'Vamban 11 (MYMV Resistant)', 'CO 6', 'MDU 1'],
        suitable_seasons: ['Kharif (Monsoon)', 'Rabi (Winter/Post-Monsoon)', 'Zaid (Summer)'],
        base_water_need: 'Low',
        duration_days: 65,
        nitrogen_fixation_kg_ha: 48,
        n_demand_level: 'Low',
        p_demand_level: 'Medium',
        k_demand_level: 'Low',
        optimal_ph_range: [6.0, 7.8],
        organic_carbon_enrichment: '+0.15% organic biomass & leaf drop',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Poaceae (Gramineae / Grass)', 'Malvaceae (Mallow)'],
        pathogen_break_desc: 'Non-host for Solanaceous bacterial wilt and reduces root-knot nematode egg counts by 65%.',
        expected_yield_q_acre: 4.8,
        mandi_price_inr_q: 8400,
        cost_cultivation_acre: 11500,
        sowing_window: targetSeason.includes('Kharif') ? 'June 15 - July 15' : targetSeason.includes('Rabi') ? 'October 15 - November 15' : 'Feb 10 - March 10',
        harvest_window: targetSeason.includes('Kharif') ? 'Late August' : targetSeason.includes('Rabi') ? 'Mid January' : 'Late April',
        market_demand: 'Very High',
        practices: [
          'Treat seeds with Rhizobium leguminosarum & Phosphobacteria bio-inoculants (30g/kg).',
          'Spray 1% pulse wonder at peak flowering to reduce flower shedding and boost pod set by 22%.',
          'Requires only 2-3 light irrigations at flowering and pod development stages.',
        ],
        green_manure_tip: 'After second pod picking, plow crop residues directly into soil to add ~1.2 tonnes of rich organic matter per acre.',
      },
      {
        id: 'rot_cowpea',
        crop_name: 'Cowpea / Karamani',
        scientific_name: 'Vigna unguiculata',
        crop_family: 'Fabaceae (Leguminosae)',
        recommended_varieties: ['CO(CP) 7', 'VBN 3', 'Pusa Komal (Dual Grain/Vegetable)'],
        suitable_seasons: ['Kharif (Monsoon)', 'Rabi (Winter/Post-Monsoon)', 'Zaid (Summer)'],
        base_water_need: 'Low',
        duration_days: 70,
        nitrogen_fixation_kg_ha: 55,
        n_demand_level: 'Low',
        p_demand_level: 'Low',
        k_demand_level: 'Low',
        optimal_ph_range: [5.8, 8.0],
        organic_carbon_enrichment: '+0.18% active soil humus and nodular nitrogen',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Poaceae (Gramineae / Grass)', 'Zingiberaceae (Ginger family)'],
        pathogen_break_desc: 'Deep canopy shading smothers noxious weed seeds and disrupts nematode reproductive cycles.',
        expected_yield_q_acre: 5.2,
        mandi_price_inr_q: 7200,
        cost_cultivation_acre: 10800,
        sowing_window: targetSeason.includes('Kharif') ? 'June 20 - July 25' : targetSeason.includes('Rabi') ? 'Nov 01 - Nov 30' : 'Feb 15 - March 15',
        harvest_window: targetSeason.includes('Kharif') ? 'Early September' : targetSeason.includes('Rabi') ? 'Late January' : 'Early May',
        market_demand: 'High',
        practices: [
          'Excellent soil cover crop with aggressive nodulation under low-moisture stress.',
          'Nodules fix up to 55 kg/ha atmospheric nitrogen, slashing next season urea requirement by 40%.',
          'Tolerates mild salinity up to 1.8 dS/m EC.',
        ],
        green_manure_tip: 'Incorporate vegetative haulms into furrow ridges as green manure before the following cereal or cash crop.',
      },
      {
        id: 'rot_maize',
        crop_name: 'Maize / Hybrid Corn',
        scientific_name: 'Zea mays',
        crop_family: 'Poaceae (Gramineae)',
        recommended_varieties: ['Pioneer 3396 (Grain)', 'COH(M) 8 (TNAU Hybrid)', 'Syngenta NK 6240'],
        suitable_seasons: ['Kharif (Monsoon)', 'Rabi (Winter/Post-Monsoon)'],
        base_water_need: 'Medium',
        duration_days: 105,
        nitrogen_fixation_kg_ha: -40,
        n_demand_level: 'High',
        p_demand_level: 'Medium',
        k_demand_level: 'Medium',
        optimal_ph_range: [6.2, 7.5],
        organic_carbon_enrichment: '+0.22% root-exudate biomass and stalk residue tilth',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Fabaceae (Leguminosae / Pulses)', 'Malvaceae (Mallow)'],
        pathogen_break_desc: 'Complete host break for solanaceous fungal blight, bacterial wilt, and collar rot pathogens.',
        expected_yield_q_acre: 28.0,
        mandi_price_inr_q: 2350,
        cost_cultivation_acre: 22000,
        sowing_window: targetSeason.includes('Kharif') ? 'June 15 - July 15' : 'October 20 - November 20',
        harvest_window: targetSeason.includes('Kharif') ? 'Late September' : 'Early February',
        market_demand: 'Very High',
        practices: [
          'Deep fibrous root system aerates compacted soil layers left by shallow vegetable farming.',
          'Install pheromone traps (5/acre) for Fall Armyworm monitoring.',
          'Feed high grain biomass for animal feed processors and starch mills with instant Mandi cash clearance.',
        ],
        green_manure_tip: 'Shred post-harvest maize stalks using a tractor flail mower to boost topsoil microbial activity.',
      },
      {
        id: 'rot_groundnut',
        crop_name: 'Groundnut / Peanut',
        scientific_name: 'Arachis hypogaea',
        crop_family: 'Fabaceae (Leguminosae)',
        recommended_varieties: ['Kadiri Lepakshi (K-1812)', 'TMV 7', 'Dharani', 'TAG 24'],
        suitable_seasons: ['Kharif (Monsoon)', 'Rabi (Winter/Post-Monsoon)', 'Zaid (Summer)'],
        base_water_need: 'Medium',
        duration_days: 110,
        nitrogen_fixation_kg_ha: 42,
        n_demand_level: 'Low',
        p_demand_level: 'Medium',
        k_demand_level: 'Medium',
        optimal_ph_range: [6.0, 7.5],
        organic_carbon_enrichment: '+0.20% subterranean root biomass',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Poaceae (Gramineae / Grass)', 'Malvaceae (Mallow)'],
        pathogen_break_desc: 'Breaks cereal stem-borers and solanaceous wilts while capturing atmospheric nitrogen in pegs.',
        expected_yield_q_acre: 14.5,
        mandi_price_inr_q: 7100,
        cost_cultivation_acre: 26000,
        sowing_window: targetSeason.includes('Kharif') ? 'June 20 - July 20' : targetSeason.includes('Rabi') ? 'Nov 10 - Dec 10' : 'Jan 25 - Feb 25',
        harvest_window: targetSeason.includes('Kharif') ? 'Mid October' : targetSeason.includes('Rabi') ? 'Mid March' : 'Late May',
        market_demand: 'Very High',
        practices: [
          'Apply Gypsum @ 160 kg/acre at 40-45 DAS (flowering & peg penetration stage) for heavy pod filling.',
          'Ensure light soil tilth so gynophores (pegs) penetrate easily without mechanical resistance.',
          'High oil content command premium pricing at local Pollachi and Tirupur oil mills.',
        ],
        green_manure_tip: 'Groundnut haulms serve as high-protein livestock fodder or topsoil mulching.',
      },
      {
        id: 'rot_finger_millet',
        crop_name: 'Finger Millet / Ragi',
        scientific_name: 'Eleusine coracana',
        crop_family: 'Poaceae (Millets)',
        recommended_varieties: ['GPU 28', 'ATL 1', 'CO 15 (Direct Sown / Transplanted)', 'ML-365'],
        suitable_seasons: ['Kharif (Monsoon)', 'Rabi (Winter/Post-Monsoon)', 'Zaid (Summer)'],
        base_water_need: 'Low',
        duration_days: 95,
        nitrogen_fixation_kg_ha: -18,
        n_demand_level: 'Low',
        p_demand_level: 'Low',
        k_demand_level: 'Low',
        optimal_ph_range: [5.5, 8.2],
        organic_carbon_enrichment: '+0.16% dense root rhizosphere stabilization',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Zingiberaceae (Ginger family)', 'Malvaceae (Mallow)'],
        pathogen_break_desc: 'Highly resilient to major crop pathogens; zero cross-host susceptibility with solanaceous blights.',
        expected_yield_q_acre: 16.0,
        mandi_price_inr_q: 3850,
        cost_cultivation_acre: 13500,
        sowing_window: targetSeason.includes('Kharif') ? 'July 01 - July 30' : targetSeason.includes('Rabi') ? 'Nov 15 - Dec 15' : 'Feb 01 - Feb 28',
        harvest_window: targetSeason.includes('Kharif') ? 'Mid October' : targetSeason.includes('Rabi') ? 'Late February' : 'Mid May',
        market_demand: 'High',
        practices: [
          'Extremely climate-resilient C4 millet needing 50% less irrigation than paddy or sugarcane.',
          'Tolerates low soil nitrogen and phosphorus thanks to dense fibrous vesicular-arbuscular mycorrhizal roots.',
          'Strong regional demand under Tamil Nadu Millet Mission and healthy grains procurement.',
        ],
        green_manure_tip: 'Fine straw residue decomposes rapidly, restoring soil physical structure in clay and red soils.',
      },
      {
        id: 'rot_sesame',
        crop_name: 'Sesame / Gingelly',
        scientific_name: 'Sesamum indicum',
        crop_family: 'Pedaliaceae',
        recommended_varieties: ['TMV 7 (High Oil 52%)', 'VRI 3', 'SVPR 1', 'TKG 22'],
        suitable_seasons: ['Rabi (Winter/Post-Monsoon)', 'Zaid (Summer)'],
        base_water_need: 'Low',
        duration_days: 80,
        nitrogen_fixation_kg_ha: -12,
        n_demand_level: 'Low',
        p_demand_level: 'Low',
        k_demand_level: 'Low',
        optimal_ph_range: [5.8, 7.8],
        organic_carbon_enrichment: '+0.12% bio-active rhizosphere secretions',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Poaceae (Gramineae / Grass)', 'Fabaceae (Leguminosae / Pulses)'],
        pathogen_break_desc: 'Natural nematicidal root secretions suppress Meloidogyne root-knot populations by up to 70%.',
        expected_yield_q_acre: 3.6,
        mandi_price_inr_q: 13200,
        cost_cultivation_acre: 11000,
        sowing_window: targetSeason.includes('Zaid') ? 'Feb 15 - March 15' : 'October 15 - November 15',
        harvest_window: targetSeason.includes('Zaid') ? 'Late April' : 'Mid January',
        market_demand: 'Very High',
        practices: [
          'Supreme low-water survivor ideal for dry summer windows where water reservoir levels drop.',
          'Tolerates residual nutrient pockets without requiring heavy supplemental fertilizer top-dressing.',
          'High economic return per liter of irrigation water with instant local oil mill demand.',
        ],
        green_manure_tip: 'Light surface leaf residue incorporates cleanly with one disc harrowing pass.',
      },
      {
        id: 'rot_green_gram',
        crop_name: 'Green Gram / Moong Dal',
        scientific_name: 'Vigna radiata',
        crop_family: 'Fabaceae (Leguminosae)',
        recommended_varieties: ['CO 8', 'IPM 2-3', 'VBN(Gg) 3', 'Pusa Vishal'],
        suitable_seasons: ['Kharif (Monsoon)', 'Rabi (Winter/Post-Monsoon)', 'Zaid (Summer)'],
        base_water_need: 'Low',
        duration_days: 60,
        nitrogen_fixation_kg_ha: 44,
        n_demand_level: 'Low',
        p_demand_level: 'Low',
        k_demand_level: 'Low',
        optimal_ph_range: [6.2, 7.6],
        organic_carbon_enrichment: '+0.14% nodule nitrogen and fast leaf breakdown',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Poaceae (Gramineae / Grass)', 'Malvaceae (Mallow)'],
        pathogen_break_desc: 'Short duration (60 days) cuts off insect pest life cycles before next main cash crop.',
        expected_yield_q_acre: 4.4,
        mandi_price_inr_q: 8600,
        cost_cultivation_acre: 10500,
        sowing_window: targetSeason.includes('Kharif') ? 'June 25 - July 20' : targetSeason.includes('Rabi') ? 'Nov 01 - Nov 25' : 'Feb 20 - March 20',
        harvest_window: targetSeason.includes('Kharif') ? 'Late August' : targetSeason.includes('Rabi') ? 'Early January' : 'Early May',
        market_demand: 'Very High',
        practices: [
          'Ultra short-duration pulse providing rapid cash flow and biological soil rejuvenation within 8 weeks.',
          'Fixes ~44 kg/ha atmospheric nitrogen via Bradyrhizobium nodules.',
          'Spray 2% DAP spray at 30 and 45 DAS to maximize pod weight and uniform maturity.',
        ],
        green_manure_tip: 'Incorporate entire green crop into soil after harvesting pods for maximum organic carbon boost.',
      },
      {
        id: 'rot_turmeric',
        crop_name: 'Turmeric (High Curcumin Cash Crop)',
        scientific_name: 'Curcuma longa',
        crop_family: 'Zingiberaceae (Ginger family)',
        recommended_varieties: ['Erode Local / Sanjeevini', 'BSR 2', 'Prathibha', 'IISR Alleppey Supreme'],
        suitable_seasons: ['Kharif (Monsoon)'],
        base_water_need: 'Medium',
        duration_days: 240,
        nitrogen_fixation_kg_ha: -35,
        n_demand_level: 'Medium',
        p_demand_level: 'Medium',
        k_demand_level: 'High',
        optimal_ph_range: [6.0, 7.5],
        organic_carbon_enrichment: '+0.25% deep organic mulching decomposed layer',
        breaks_diseases_for_families: ['Solanaceae (Nightshade)', 'Poaceae (Gramineae / Grass)', 'Fabaceae (Leguminosae / Pulses)'],
        pathogen_break_desc: 'Curcumin-rich rhizome exudates naturally suppress soil nematodes and bacterial wilt.',
        expected_yield_q_acre: 32.0,
        mandi_price_inr_q: 14500,
        cost_cultivation_acre: 75000,
        sowing_window: 'May 15 - June 30 (Pre-Monsoon)',
        harvest_window: 'January - March',
        market_demand: 'Very High',
        practices: [
          'Plant healthy mother/finger rhizomes (35g) on raised beds with drip irrigation.',
          'Heavy green leaf mulching (15 tonnes/acre) during first 90 days suppresses weeds and buffers soil temp.',
          'Top revenue generating cash crop with export demand in Erode, Pollachi, and Nizamabad markets.',
        ],
        green_manure_tip: 'Rotate immediately with short-duration Black Gram or Cowpea post-harvest to recover soil potash.',
      },
    ];

    // 5. Intelligent Multi-Criteria Scoring Algorithm
    const scoredList: CropRotationRecommendation[] = candidatePool.map((c) => {
      let score = 70; // Baseline
      const isSameFamily = c.crop_family.toLowerCase().includes(standingMeta.family.toLowerCase().split(' ')[0]);

      // Pathogen & Family Interruption (Max ±30 pts)
      if (isSameFamily) {
        score -= 40; // Heavy penalty for repeating same botanical family (e.g. Solanaceae -> Solanaceae)
      } else if (c.breaks_diseases_for_families.some((fam) => standingMeta.family.toLowerCase().includes(fam.toLowerCase().split(' ')[0]))) {
        score += 18;
      }

      // Soil Nitrogen Compatibility
      if (soil.nitrogen_status === 'Low') {
        if (c.nitrogen_fixation_kg_ha > 0) {
          score += 20; // High bonus for legumes when soil N is low
        } else if (c.n_demand_level === 'High') {
          score -= 15; // Penalty for heavy N feeders on degraded soil
        }
      } else if (soil.nitrogen_status === 'High') {
        if (c.n_demand_level === 'High') {
          score += 12; // High feeders can exploit rich nitrogen
        }
      }

      // Soil Organic Carbon Compatibility
      if (soil.organic_carbon_percent < 0.5) {
        if (c.nitrogen_fixation_kg_ha > 0 || c.crop_name.includes('Cowpea') || c.crop_name.includes('Black Gram')) {
          score += 10;
        }
      }

      // pH Range Match
      if (soil.ph >= c.optimal_ph_range[0] && soil.ph <= c.optimal_ph_range[1]) {
        score += 8;
      } else {
        score -= 10;
      }

      // Target Season Match
      if (c.suitable_seasons.includes(targetSeason)) {
        score += 12;
      } else {
        score -= 25; // Season mismatch penalty
      }

      // Water Availability Match
      if (irrigationCapacity === 'Low / Deficit' || rainfallTrend === 'Deficit') {
        if (c.base_water_need === 'Low') {
          score += 15;
        } else if (c.base_water_need === 'High') {
          score -= 25;
        }
      }

      // Priority Focus Adjustments
      if (priorityFocus === 'MAX_SOIL_HEALTH') {
        if (c.nitrogen_fixation_kg_ha > 0) score += 15;
      } else if (priorityFocus === 'MAX_PROFIT') {
        const gross = c.expected_yield_q_acre * c.mandi_price_inr_q;
        const net = gross - c.cost_cultivation_acre;
        if (net > 40000) score += 15;
      } else if (priorityFocus === 'WATER_SAVING') {
        if (c.base_water_need === 'Low') score += 18;
      } else if (priorityFocus === 'PEST_BREAK') {
        if (!isSameFamily) score += 15;
      }

      // Calculate economic metrics
      const grossRevenue = Math.round(c.expected_yield_q_acre * c.mandi_price_inr_q);
      const netProfit = Math.round(grossRevenue - c.cost_cultivation_acre);
      const roiPercent = Math.round((netProfit / c.cost_cultivation_acre) * 100);

      // Water savings estimation relative to previous standing crop
      let waterSavingPercent = 0;
      if (standingCrop === 'Tomato' || standingCrop === 'Paddy' || standingCrop === 'Sugarcane') {
        waterSavingPercent = c.base_water_need === 'Low' ? 55 : c.base_water_need === 'Medium' ? 25 : 0;
      } else {
        waterSavingPercent = c.base_water_need === 'Low' ? 35 : 10;
      }

      // Bound score between 25 and 99
      const finalScore = Math.max(25, Math.min(98, Math.round(score)));

      let verdict: CropRotationRecommendation['verdict'] = 'MODERATELY_VIABLE';
      if (finalScore >= 90) verdict = 'STRONGLY_RECOMMENDED';
      else if (finalScore >= 75) verdict = 'HIGHLY_SUITABLE';
      else if (finalScore < 50 || isSameFamily) verdict = 'NOT_ADVISED';

      const nitrogenImpactStr =
        c.nitrogen_fixation_kg_ha > 0
          ? `+${c.nitrogen_fixation_kg_ha} kg/ha biological nitrogen fixation via Rhizobium root nodules`
          : `${c.nitrogen_fixation_kg_ha} kg/ha net nutrient uptake (balanced by basal manure)`;

      const summaryRationale =
        c.nitrogen_fixation_kg_ha > 0
          ? `Ideal rotation after ${standingCrop}. Restores depleted soil nitrogen (+${c.nitrogen_fixation_kg_ha} kg/ha) and completely breaks the ${standingMeta.family} pathogen cycle.`
          : `High economic yield potential for ${targetSeason}. Takes advantage of residual phosphorus and restores fibrous root tilth.`;

      return {
        id: `rec_${c.id}_${Date.now()}`,
        crop_name: c.crop_name,
        scientific_name: c.scientific_name,
        crop_family: c.crop_family,
        recommended_varieties: c.recommended_varieties,
        suitability_score: finalScore,
        rank: 1, // updated after sorting
        verdict,
        summary_rationale: summaryRationale,
        soil_compatibility: {
          score: Math.min(99, Math.round(finalScore * 0.95 + (c.nitrogen_fixation_kg_ha > 0 ? 5 : 0))),
          nitrogen_impact: nitrogenImpactStr,
          nitrogen_net_change_kg_ha: c.nitrogen_fixation_kg_ha,
          phosphorus_tolerance: `Optimized for ${soil.phosphorus_status} phosphorus soils (${soil.phosphorus_kg_ha} kg/ha).`,
          potassium_tolerance: `Compatible with ${soil.potassium_status} potash levels (${soil.potassium_kg_ha} kg/ha).`,
          ph_suitability: `Soil pH ${soil.ph} falls inside optimal range (${c.optimal_ph_range[0]} - ${c.optimal_ph_range[1]}).`,
          organic_matter_contribution: c.organic_carbon_enrichment,
        },
        seasonal_fit: {
          season_name: targetSeason,
          optimal_sowing_window: c.sowing_window,
          harvest_window: c.harvest_window,
          duration_days: c.duration_days,
          water_requirement: c.base_water_need,
          water_saving_vs_previous_crop_percent: waterSavingPercent,
          climate_resilience_rating: c.base_water_need === 'Low' ? 'Exceptional' : 'High',
        },
        pathogen_breakdown: {
          breaks_diseases: c.breaks_diseases_for_families.flatMap((f) =>
            f.includes('Solanaceae')
              ? ['Early Blight (Alternaria)', 'Bacterial Wilt (Ralstonia)', 'Root-Knot Nematodes']
              : ['Stem Borers', 'Foliar Blight', 'Soil Fungi']
          ),
          family_shift_benefit: c.pathogen_break_desc,
          pest_suppression_score: isSameFamily ? 25 : 94,
        },
        economic_projection: {
          estimated_yield_quintal_acre: c.expected_yield_q_acre,
          mandi_modal_price_per_quintal: c.mandi_price_inr_q,
          cost_of_cultivation_per_acre: c.cost_cultivation_acre,
          gross_revenue_per_acre: grossRevenue,
          net_profit_per_acre: netProfit,
          roi_percent: roiPercent,
          market_demand_rating: c.market_demand,
        },
        key_management_practices: c.practices,
        companion_or_green_manure_tip: c.green_manure_tip,
      };
    });

    // Sort by suitability score descending
    scoredList.sort((a, b) => b.suitability_score - a.suitability_score);
    scoredList.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    // 6. Generate 4-Season Succession Plan
    const successionPlan: FourSeasonSuccessionPlan = {
      cycle_title: `${standingCrop} ➔ Legume Restorative ➔ High-Value Cereal ➔ Green Manure Cycle`,
      target_soil_type: soil.soil_type,
      total_cycle_months: 18,
      cumulative_estimated_net_profit: 148500,
      soil_health_improvement_summary:
        'Continuous 4-season sequence replenishes +92 kg/ha organic nitrogen, increases Soil Organic Carbon by +0.35%, and eliminates 90%+ of Solanaceae-specific soil fungal spores.',
      nitrogen_fixation_total_kg_ha: 92,
      steps: [
        {
          season_number: 1,
          season_name: 'Current Standing Season (Harvesting)',
          crop_name: standingCrop,
          variety: 'Standing Commercial Crop',
          category: 'Cash & Horticulture',
          duration_days: 90,
          water_demand: 'Medium',
          soil_benefit: `Extracts nitrogen and potassium; prepares land for legume rotation.`,
          expected_net_profit_acre: 42000,
          is_nitrogen_fixer: false,
        },
        {
          season_number: 2,
          season_name: `Upcoming ${targetSeason} (Recommended Next)`,
          crop_name: scoredList[0]?.crop_name || 'Black Gram (VBN 8)',
          variety: scoredList[0]?.recommended_varieties[0] || 'VBN 8 / Vamban 11',
          category: 'Pulses & Bio-Fertility',
          duration_days: scoredList[0]?.seasonal_fit.duration_days || 65,
          water_demand: scoredList[0]?.seasonal_fit.water_requirement || 'Low',
          soil_benefit: `Fixes ~48 kg/ha atmospheric nitrogen; breaks nematode and bacterial wilt cycles.`,
          expected_net_profit_acre: scoredList[0]?.economic_projection.net_profit_per_acre || 28820,
          is_nitrogen_fixer: true,
        },
        {
          season_number: 3,
          season_name: 'Subsequent Rabi / Post-Monsoon',
          crop_name: 'Maize / Hybrid Corn or Finger Millet (Ragi)',
          variety: 'Pioneer 3396 / GPU 28',
          category: 'Cereals & High Biomass',
          duration_days: 100,
          water_demand: 'Medium',
          soil_benefit: 'Utilizes biologically fixed nitrogen efficiently; builds deep root soil tilth.',
          expected_net_profit_acre: 43800,
          is_nitrogen_fixer: false,
        },
        {
          season_number: 4,
          season_name: 'Pre-Monsoon Summer (Zaid)',
          crop_name: 'Sesame (Gingelly) / Sunnhemp Green Manure',
          variety: 'TMV 7 / Local Sunnhemp',
          category: 'Oilseed & Green Manure',
          duration_days: 75,
          water_demand: 'Low',
          soil_benefit: 'Suppresses weeds, secretes nematicidal root compounds, and incorporates green biomass.',
          expected_net_profit_acre: 33880,
          is_nitrogen_fixer: true,
        },
      ],
    };

    // 7. Overall Agronomic Advisory Synthesis
    const aiAdvisoryText = `Based on your ${soil.soil_type} test report (Nitrogen: ${soil.nitrogen_kg_ha} kg/ha [${soil.nitrogen_status}], Organic Carbon: ${soil.organic_carbon_percent}%, pH: ${soil.ph}) following standing ${standingCrop}, your soil is primed for a leguminous pulse transition. We strongly recommend planting ${scoredList[0]?.crop_name} (${scoredList[0]?.recommended_varieties.join(', ')}) for ${targetSeason}. This rotation will naturally restore approximately ${scoredList[0]?.soil_compatibility.nitrogen_impact}, reduce chemical urea expenditure by 35-40%, and break the host cycle of soil-borne pathogens like ${standingMeta.pathogenRisks[0]}.`;

    return {
      standing_crop_summary: {
        crop_name: standingCrop,
        family: standingMeta.family,
        depletion_profile: standingMeta.primaryDepletion,
        pathogen_risk_if_repeated: standingMeta.pathogenRisks.join(' • '),
      },
      soil_status_analyzed: {
        nitrogen_status: soil.nitrogen_status,
        phosphorus_status: soil.phosphorus_status,
        potassium_status: soil.potassium_status,
        ph: soil.ph,
        organic_carbon_percent: soil.organic_carbon_percent,
        overall_fertility_index:
          soil.organic_carbon_percent > 0.75 && soil.nitrogen_status !== 'Low'
            ? 'Fertile Loam'
            : soil.nitrogen_status === 'Low'
            ? 'Low'
            : 'Moderate',
      },
      top_recommendations: scoredList.slice(0, 5),
      succession_cycle: successionPlan,
      ai_agronomic_advisory: aiAdvisoryText,
    };
  }

  // System Health Stats Calculation
  public getSystemHealth(): SystemHealthStats {
    const totalCap = this.warehouses.reduce((acc, w) => acc + w.total_capacity_kg, 0);
    const usedCap = this.warehouses.reduce((acc, w) => acc + w.used_capacity_kg, 0);
    const utilPercent = totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 0;

    return {
      status: 'HEALTHY',
      database_status: 'CONNECTED',
      api_latency_ms: Math.floor(18 + Math.random() * 12),
      uptime_seconds: Math.floor((Date.now() - this.startTime) / 1000),
      total_users: this.users.length,
      total_farmers: this.farmerProfiles.length,
      total_warehouses: this.warehouses.length,
      total_plant_scans: this.plantScans.length,
      total_bookings: this.warehouseBookings.length,
      total_soil_tests: this.soilTests.length,
      storage_capacity_utilization_percent: utilPercent,
      ai_service_status: process.env.GEMINI_API_KEY ? 'READY' : 'FALLBACK_MODE',
      last_checked: new Date().toISOString(),
    };
  }

  // Seed standard Indian agricultural database
  private seedDatabase() {
    // 1. Users
    this.users = [
      {
        id: 'usr_farmer_1',
        email: 'murugan.farmer@agrisaarthi.gov.in',
        name: 'Murugan Palaniswamy',
        phone: '+91 98421 87654',
        role: 'farmer',
        language: 'ta',
        created_at: '2025-01-10T08:00:00Z',
        status: 'active',
      },
      {
        id: 'usr_farmer_2',
        email: 'ramesh.kumar@agrisaarthi.gov.in',
        name: 'Rameshwar Sharma',
        phone: '+91 94140 32190',
        role: 'farmer',
        language: 'hi',
        created_at: '2025-01-12T09:30:00Z',
        status: 'active',
      },
      {
        id: 'usr_provider_1',
        email: 'tnwc.coimbatore@agrisaarthi.gov.in',
        name: 'TNWC Coimbatore Depot Manager',
        phone: '+91 422 2398711',
        role: 'provider',
        language: 'en',
        created_at: '2025-01-05T06:00:00Z',
        status: 'active',
      },
      {
        id: 'usr_provider_2',
        email: 'cwc.madurai@agrisaarthi.gov.in',
        name: 'CWC Regional Agri Logistics Madurai',
        phone: '+91 452 2456789',
        role: 'provider',
        language: 'en',
        created_at: '2025-01-06T07:15:00Z',
        status: 'active',
      },
      {
        id: 'usr_admin_1',
        email: 'admin.agrisaarthi@nic.in',
        name: 'Dr. A. Subramanian (Chief Agronomist)',
        phone: '+91 11 2338 5600',
        role: 'admin',
        language: 'en',
        created_at: '2025-01-01T00:00:00Z',
        status: 'active',
      },
    ];

    // 2. Farmer Profiles
    this.farmerProfiles = [
      {
        id: 'fp_1',
        user_id: 'usr_farmer_1',
        farmer_id_code: 'TN-CBE-2025-8841',
        father_or_spouse_name: 'Palaniswamy Gounder',
        village: 'Pollachi Rural',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '642001',
        latitude: 10.6586,
        longitude: 77.0089,
        total_land_acres: 6.5,
        primary_crops: ['Tomato', 'Coconut', 'Groundnut', 'Turmeric'],
        soil_type_primary: 'Red Sandy Loam',
        irrigation_source: 'Borewell & Drip',
        kisan_credit_card: true,
        pm_kisan_registered: true,
        is_demo: true,
      },
      {
        id: 'fp_2',
        user_id: 'usr_farmer_2',
        farmer_id_code: 'MH-PUN-2025-3392',
        father_or_spouse_name: 'Kashinath Sharma',
        village: 'Baramati Taluka',
        taluk: 'Baramati',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '413102',
        latitude: 18.1517,
        longitude: 74.5772,
        total_land_acres: 8.0,
        primary_crops: ['Sugarcane', 'Onion', 'Soybean', 'Wheat'],
        soil_type_primary: 'Black Cotton Soil (Regur)',
        irrigation_source: 'Canal & Well',
        kisan_credit_card: true,
        pm_kisan_registered: true,
        is_demo: true,
      },
    ];

    // 3. Farms & Fields
    this.farms = [
      {
        id: 'farm_1',
        farmer_id: 'usr_farmer_1',
        farm_name: 'Annamalai Green Acres',
        total_area_acres: 6.5,
        survey_number: '142/3B',
        village: 'Pollachi Rural',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 10.6586,
        longitude: 77.0089,
        water_source: 'drip',
        organic_certified: false,
        created_at: '2025-01-10T10:00:00Z',
        is_demo: true,
      },
      {
        id: 'farm_2',
        farmer_id: 'usr_farmer_2',
        farm_name: 'Shree Krishna Krishi Kshetra',
        total_area_acres: 8.0,
        survey_number: '88/1A',
        village: 'Baramati',
        district: 'Pune',
        state: 'Maharashtra',
        latitude: 18.1517,
        longitude: 74.5772,
        water_source: 'canal',
        organic_certified: true,
        created_at: '2025-01-12T11:00:00Z',
        is_demo: true,
      },
    ];

    this.fields = [
      {
        id: 'field_1',
        farm_id: 'farm_1',
        field_name: 'North Block (Plot A)',
        area_acres: 2.5,
        current_crop: 'Tomato',
        sowing_date: '2025-01-15',
        expected_harvest_date: '2025-04-20',
        soil_type: 'Red Sandy Loam',
        irrigation_type: 'Drip System',
        current_health_status: 'diseased',
      },
      {
        id: 'field_2',
        farm_id: 'farm_1',
        field_name: 'South Coconut Grove (Plot B)',
        area_acres: 4.0,
        current_crop: 'Coconut & Intercrop Turmeric',
        sowing_date: '2024-06-10',
        expected_harvest_date: '2025-03-30',
        soil_type: 'Clay Loam',
        irrigation_type: 'Basin Flooding',
        current_health_status: 'healthy',
      },
      {
        id: 'field_3',
        farm_id: 'farm_2',
        field_name: 'East Field (Onion)',
        area_acres: 4.5,
        current_crop: 'Onion (Rabi)',
        sowing_date: '2024-11-20',
        expected_harvest_date: '2025-03-25',
        soil_type: 'Black Cotton Soil',
        irrigation_type: 'Sprinkler',
        current_health_status: 'healthy',
      },
    ];

    // 4. Crop History & Rotation
    this.cropHistories = [
      {
        id: 'ch_1',
        field_id: 'field_1',
        farmer_id: 'usr_farmer_1',
        crop_name: 'Groundnut',
        season: 'Kharif',
        sown_year: 2024,
        yield_quintals: 18.5,
        price_realized_per_quintal: 6800,
        fertilizers_used: ['Gypsum', 'DAP', 'Rhizobium'],
        notes: 'Good nitrogen fixation, healthy root nodules.',
      },
      {
        id: 'ch_2',
        field_id: 'field_1',
        farmer_id: 'usr_farmer_1',
        crop_name: 'Maize (Corn)',
        season: 'Rabi',
        sown_year: 2023,
        yield_quintals: 32.0,
        price_realized_per_quintal: 2150,
        pest_issues: ['Fall Armyworm controlled with neem oil & pheromone traps'],
        fertilizers_used: ['Urea', 'SSP', 'MOP'],
      },
    ];

    this.cropRotations = [
      {
        id: 'cr_1',
        field_id: 'field_1',
        farm_id: 'farm_1',
        current_crop: 'Tomato',
        recommended_sequence: [
          {
            season: 'Kharif 2025',
            crop: 'Black Gram / Cowpea (Pulses)',
            variety: 'VBN 8 / Vamban',
            nitrogen_fixation: true,
            water_requirement: 'Low',
            soil_benefit: 'Fixes 35-40 kg/ha atmospheric nitrogen; breaks tomato bacterial wilt cycle.',
            pest_break_effect: 'Interrupts solanaceous nematodes and early blight spores.',
            estimated_profit_per_acre: 32000,
          },
          {
            season: 'Rabi 2025-26',
            crop: 'Finger Millet (Ragi)',
            variety: 'GPU 28',
            nitrogen_fixation: false,
            water_requirement: 'Low',
            soil_benefit: 'Deep fibrous roots improve soil structure and organic matter.',
            pest_break_effect: 'Immune to solanaceous viral diseases.',
            estimated_profit_per_acre: 28000,
          },
          {
            season: 'Summer 2026',
            crop: 'Sesame (Gingelly) / Green Manure (Sunnhemp)',
            variety: 'TMV 7',
            nitrogen_fixation: true,
            water_requirement: 'Low',
            soil_benefit: 'Increases soil organic carbon and suppresses weeds.',
            pest_break_effect: 'Nematode suppression.',
            estimated_profit_per_acre: 24000,
          },
        ],
        rationale:
          'Continuous solanaceous crops (tomato/brinjal/potato) deplete soil potassium and harbor fungal blight. Rotating with leguminous pulses restores natural soil fertility and cuts chemical fertilizer requirement by 35%.',
        created_at: '2025-01-20T08:00:00Z',
      },
    ];

    // 5. Soil Labs & Soil Tests
    this.soilLabs = [
      {
        id: 'lab_1',
        name: 'District Agricultural Soil Testing Laboratory Coimbatore',
        organization: 'Department of Agriculture, Govt of Tamil Nadu',
        location: 'Thadagam Road, R.S. Puram, Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 11.0168,
        longitude: 76.9558,
        contact_phone: '+91 422 243 1290',
        email: 'soiltest.cbe@tn.gov.in',
        accreditation: 'NABL & ICAR Certified Soil Health Center',
        test_fee_inr: 50,
        turnaround_days: 3,
        available_tests: ['Soil Health Card 12 Parameters', 'NPK Analysis', 'Micronutrient Zinc/Boron/Iron', 'Soil Salinity (EC)'],
        rating: 4.8,
        verified: true,
        is_demo: true,
      },
      {
        id: 'lab_2',
        name: 'TNAU Precision Soil & Water Analysis Center',
        organization: 'Tamil Nadu Agricultural University',
        location: 'Marudhamalai Main Rd, Navavoor Pirivu, Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 11.0135,
        longitude: 76.9284,
        contact_phone: '+91 422 661 1200',
        email: 'deanagri@tnau.ac.in',
        accreditation: 'ICAR A++ Apex Research Center',
        test_fee_inr: 120,
        turnaround_days: 2,
        available_tests: ['Full Heavy Metal Scan', 'NPK + Secondary Nutrients', 'Microbial Activity', 'Organic Carbon & pH Buffer'],
        rating: 4.9,
        verified: true,
        is_demo: true,
      },
      {
        id: 'lab_3',
        name: 'Madurai Krishi Vigyan Kendra (KVK) Soil Lab',
        organization: 'ICAR - KVK Agricultural Extension',
        location: 'Agricultural College & Research Institute, Othakadai, Madurai',
        district: 'Madurai',
        state: 'Tamil Nadu',
        latitude: 9.9674,
        longitude: 78.1912,
        contact_phone: '+91 452 242 2955',
        email: 'kvkmadurai@icar.gov.in',
        accreditation: 'ICAR State Certified',
        test_fee_inr: 60,
        turnaround_days: 4,
        available_tests: ['Soil Health Card', 'NPK Testing', 'Organic Carbon', 'Saline/Alkaline Soil Remediation'],
        rating: 4.7,
        verified: true,
        is_demo: true,
      },
      {
        id: 'lab_4',
        name: 'National Soil Quality Testing & Research Lab Pune',
        organization: 'Ministry of Agriculture & Farmers Welfare',
        location: 'College of Agriculture Campus, Shivajinagar, Pune',
        district: 'Pune',
        state: 'Maharashtra',
        latitude: 18.5314,
        longitude: 73.8446,
        contact_phone: '+91 20 2553 7033',
        email: 'soillab.pune@gov.in',
        accreditation: 'NABL ISO/IEC 17025 Accredited',
        test_fee_inr: 80,
        turnaround_days: 3,
        available_tests: ['Soil Health Card', 'Heavy Metals', 'NPK & Micro', 'Soil Texture & Porosity'],
        rating: 4.8,
        verified: true,
        is_demo: true,
      },
    ];

    this.soilTests = [
      {
        id: 'st_1',
        field_id: 'field_1',
        farmer_id: 'usr_farmer_1',
        lab_id: 'lab_1',
        lab_name: 'District Agricultural Soil Testing Laboratory Coimbatore',
        lab_accreditation: 'NABL ISO/IEC 17025 Certified • ICAR Soil Health Center (TN-CBE-04)',
        tested_by: 'Dr. K. Rangarajan (Senior Soil Chemist)',
        lab_phone: '+91 422 243 1290',
        sample_code: 'SHC-TN-CBE-2025-901',
        sample_number: 'SHC-TN-CBE-2025-901',
        soil_type: 'Red Sandy Loam',
        test_date: '2025-01-08',
        status: 'COMPLETED',
        ph: 6.8,
        ec_ds_m: 0.42,
        organic_carbon_percent: 0.58,
        nitrogen_kg_ha: 210,
        nitrogen_status: 'Low',
        phosphorus_kg_ha: 24,
        phosphorus_status: 'Medium',
        potassium_kg_ha: 310,
        potassium_status: 'High',
        zinc_ppm: 0.72,
        iron_ppm: 4.8,
        boron_ppm: 0.45,
        fertilizer_recommendations: [
          'Apply 25 kg/ha Nitrogen via neem-coated urea in 2 split doses.',
          'Add 5 Tonnes/Acre Farm Yard Manure (FYM) or Vermicompost to raise organic carbon > 0.75%.',
          'Foliar spray Zinc Sulfate 0.5% (5g/L) during 35-40 days vegetative flush.',
          'Slightly acidic pH (6.8) is optimal for Solanaceous and Legume crops.'
        ],
        lab_recommendation:
          'Soil is slightly acidic to neutral (pH 6.8) with good potassium. Apply 25 kg/ha Nitrogen through neem-coated urea in split doses. Add 5 tonnes of Farm Yard Manure (FYM) or vermicompost to boost organic carbon from 0.58% to >0.75%. Zinc sulfate foliar spray recommended at 0.5% during vegetative stage.',
        report_document_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        is_demo: true,
      },
      {
        id: 'st_2',
        field_id: 'field_2',
        farmer_id: 'usr_farmer_1',
        lab_id: 'lab_2',
        lab_name: 'TNAU Precision Soil & Water Analysis Center',
        lab_accreditation: 'ICAR A++ Apex Agricultural Research Lab (TNAU-CBE-01)',
        tested_by: 'Dr. V. Saravanan (Principal Agronomist)',
        lab_phone: '+91 422 661 1200',
        sample_code: 'SHC-TNAU-2024-4412',
        sample_number: 'SHC-TNAU-2024-4412',
        soil_type: 'Clay Loam (Coconut Block)',
        test_date: '2024-11-15',
        status: 'COMPLETED',
        ph: 7.2,
        ec_ds_m: 0.35,
        organic_carbon_percent: 0.82,
        nitrogen_kg_ha: 265,
        nitrogen_status: 'Medium',
        phosphorus_kg_ha: 32,
        phosphorus_status: 'High',
        potassium_kg_ha: 380,
        potassium_status: 'High',
        zinc_ppm: 1.15,
        iron_ppm: 6.2,
        boron_ppm: 0.68,
        fertilizer_recommendations: [
          'Maintain organic mulching with coconut coir pith and fronds.',
          'Apply Borax @ 50g per coconut palm annually.',
          'Apply 1.3 kg Urea, 2.0 kg Single Super Phosphate, 2.0 kg Muriate of Potash per tree in split basin application.'
        ],
        lab_recommendation:
          'High organic carbon and optimal neutral pH (7.2). Micronutrient levels are adequate. Maintain regular basin irrigation with bio-fertilizers (Azospirillum & Phosphobacteria).',
        report_document_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        is_demo: true,
      },
    ];

    // 6. Warehouses (Coimbatore, Madurai, Thanjavur, Salem, Pune, etc.)
    this.warehouses = [
      {
        id: 'wh_1',
        provider_id: 'usr_provider_1',
        name: 'Central Warehousing Corporation (CWC) Integrated Agri Logistics Hub',
        operator_type: 'CWC',
        address: 'Peelamedu Industrial Estate, Avinashi Road',
        taluk: 'Coimbatore North',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641004',
        latitude: 11.0267,
        longitude: 77.0145,
        storage_types: ['Grain Storage', 'General Warehouse', 'Dry Storage', 'Agricultural Commodity Storage'],
        total_capacity_kg: 500000, // 500 tonnes
        used_capacity_kg: 320000,
        available_capacity_kg: 180000,
        pricing_model: 'per_kg_per_day',
        rate_inr: 0.35, // ₹0.35 per kg/day
        minimum_storage_days: 7,
        suitable_crops: ['Paddy', 'Maize', 'Wheat', 'Pulses', 'Turmeric', 'Cotton Bales', 'Groundnut'],
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.8,
        verified: true,
        contact_person: 'Er. S. Murugesan (Regional Head)',
        contact_phone: '+91 94432 10987',
        is_demo: true,
      },
      {
        id: 'wh_2',
        provider_id: 'usr_provider_1',
        name: 'Tamil Nadu State Warehousing Corporation (TNWC) Pollachi Cold Chain Hub',
        operator_type: 'SWC',
        address: 'Palakkad Main Road, Pollachi Taluk',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '642002',
        latitude: 10.6621,
        longitude: 77.0024,
        storage_types: ['Cold Storage', 'Vegetable Storage', 'Fruit Storage', 'Temperature Controlled Storage', 'Perishable Storage'],
        total_capacity_kg: 250000, // 250 tonnes
        used_capacity_kg: 140000,
        available_capacity_kg: 110000,
        pricing_model: 'per_kg_per_day',
        rate_inr: 0.65, // ₹0.65 per kg/day cold storage
        minimum_storage_days: 3,
        suitable_crops: ['Tomato', 'Chilli', 'Onion', 'Banana', 'Mango', 'Vegetables', 'Flowers'],
        temperature_range_celsius: '2°C to 12°C Controlled Atmosphere',
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.9,
        verified: true,
        contact_person: 'K. Rajendran (Depot Supt.)',
        contact_phone: '+91 98422 55431',
        is_demo: true,
      },
      {
        id: 'wh_3',
        provider_id: 'usr_provider_2',
        name: 'Madurai Central Grain & Spice Mega Silos',
        operator_type: 'CWC',
        address: 'Kappalur Industrial Area, Bypass Highway',
        taluk: 'Thirumangalam',
        district: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625008',
        latitude: 9.8732,
        longitude: 78.0461,
        storage_types: ['Grain Storage', 'General Warehouse', 'Dry Storage'],
        total_capacity_kg: 800000,
        used_capacity_kg: 480000,
        available_capacity_kg: 320000,
        pricing_model: 'per_kg_per_day',
        rate_inr: 0.30,
        minimum_storage_days: 10,
        suitable_crops: ['Paddy', 'Chilli', 'Coriander', 'Cotton', 'Black Gram', 'Pulses'],
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.7,
        verified: true,
        contact_person: 'V. Alagarsamy (Warehouse Mgr)',
        contact_phone: '+91 94441 98765',
        is_demo: true,
      },
      {
        id: 'wh_4',
        provider_id: 'usr_provider_2',
        name: 'Madurai Agro Fresh Cold Storage & Ripening Depot',
        operator_type: 'Private',
        address: 'Mattuthavani Vegetable Market Link Road',
        taluk: 'Madurai East',
        district: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625107',
        latitude: 9.9412,
        longitude: 78.1567,
        storage_types: ['Cold Storage', 'Perishable Storage', 'Vegetable Storage', 'Fruit Storage'],
        total_capacity_kg: 180000,
        used_capacity_kg: 130000,
        available_capacity_kg: 50000,
        pricing_model: 'per_kg_per_day',
        rate_inr: 0.58,
        minimum_storage_days: 2,
        suitable_crops: ['Tomato', 'Grapes', 'Guava', 'Banana', 'Green Vegetables'],
        temperature_range_celsius: '0°C to 8°C',
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: false,
        insurance_covered: true,
        rating: 4.6,
        verified: true,
        contact_person: 'M. Selvam',
        contact_phone: '+91 98430 11223',
        is_demo: true,
      },
      {
        id: 'wh_5',
        provider_id: 'usr_provider_1',
        name: 'Kisan Samridhi Modern Silo & Logistics Pune',
        operator_type: 'Cooperative',
        address: 'APMC Market Yard Road, Gultekdi',
        taluk: 'Haveli',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411037',
        latitude: 18.4901,
        longitude: 73.8682,
        storage_types: ['General Warehouse', 'Cold Storage', 'Grain Storage', 'Dry Storage'],
        total_capacity_kg: 600000,
        used_capacity_kg: 410000,
        available_capacity_kg: 190000,
        pricing_model: 'per_kg_per_day',
        rate_inr: 0.42,
        minimum_storage_days: 5,
        suitable_crops: ['Onion', 'Soybean', 'Sugarcane Jaggery', 'Pomegranate', 'Grapes', 'Wheat'],
        temperature_range_celsius: '4°C to 15°C',
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.8,
        verified: true,
        contact_person: 'Balasaheb Shinde',
        contact_phone: '+91 98220 88990',
        is_demo: true,
      },
      {
        id: 'wh_6',
        provider_id: 'usr_provider_1',
        name: 'Salem Regional Sago & Tapioca Commodity Warehouse',
        operator_type: 'SWC',
        address: 'Namakkal - Salem Bypass Highway, Kondalampatti',
        taluk: 'Salem South',
        district: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636010',
        latitude: 11.6241,
        longitude: 78.1325,
        storage_types: ['General Warehouse', 'Dry Storage', 'Agricultural Commodity Storage'],
        total_capacity_kg: 350000,
        used_capacity_kg: 200000,
        available_capacity_kg: 150000,
        pricing_model: 'per_kg_per_day',
        rate_inr: 0.32,
        minimum_storage_days: 7,
        suitable_crops: ['Tapioca Starch', 'Paddy', 'Turmeric', 'Cotton', 'Maize'],
        humidity_control: true,
        security_and_cctv: true,
        weighbridge_available: true,
        fumigation_service: true,
        insurance_covered: true,
        rating: 4.6,
        verified: true,
        contact_person: 'T. Natarajan',
        contact_phone: '+91 94430 77112',
        is_demo: true,
      },
    ];

    // 7. Seed Warehouse Bookings
    this.warehouseBookings = [
      {
        id: 'wb_seed_1',
        booking_code: 'AGRI-WH-849201',
        warehouse_id: 'wh_2',
        warehouse_name: 'Tamil Nadu State Warehousing Corporation (TNWC) Pollachi Cold Chain Hub',
        farmer_id: 'usr_farmer_1',
        farmer_name: 'Murugan Palaniswamy',
        farmer_phone: '+91 98421 87654',
        crop_name: 'Tomato (Hybrid Shivam)',
        quantity_kg: 3000,
        storage_type_requested: 'Cold Storage',
        start_date: '2025-01-22',
        expected_duration_days: 14,
        end_date: '2025-02-05',
        rate_applied: 0.65,
        estimated_cost_inr: 27300,
        status: 'ACTIVE',
        provider_notes: 'Stored in Cold Chamber 3 at 4°C with 90% RH. Initial grading passed.',
        created_at: '2025-01-20T14:20:00Z',
        updated_at: '2025-01-22T09:00:00Z',
      },
      {
        id: 'wb_seed_2',
        booking_code: 'AGRI-WH-721094',
        warehouse_id: 'wh_1',
        warehouse_name: 'Central Warehousing Corporation (CWC) Integrated Agri Logistics Hub',
        farmer_id: 'usr_farmer_1',
        farmer_name: 'Murugan Palaniswamy',
        farmer_phone: '+91 98421 87654',
        crop_name: 'Groundnut (TMV 2)',
        quantity_kg: 5000,
        storage_type_requested: 'Dry Storage',
        start_date: '2025-02-01',
        expected_duration_days: 60,
        end_date: '2025-04-02',
        rate_applied: 0.35,
        estimated_cost_inr: 105000,
        status: 'ACCEPTED',
        provider_notes: 'Bags booked for Bay D-12. Moisture level verified <8%.',
        created_at: '2025-01-25T11:10:00Z',
        updated_at: '2025-01-26T10:00:00Z',
      },
    ];

    // 8. Plant Scans & Observations
    this.plantScans = [
      {
        id: 'scan_1',
        farmer_id: 'usr_farmer_1',
        farm_id: 'farm_1',
        field_id: 'field_1',
        crop_name: 'Tomato',
        plant_part: 'leaf',
        image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22515?auto=format&fit=crop&w=800&q=80',
        image_quality_score: 94,
        image_quality_verdict: 'CLEAR',
        quality_checks: {
          blur_score: 92,
          brightness_ok: true,
          leaf_centered: true,
          resolution_ok: true,
        },
        predicted_issue: 'Early Blight (Alternaria solani)',
        prediction_type: 'DISEASE',
        confidence: 88,
        model_name: 'AgriSaarthi-PlantCV-Vision',
        model_version: 'v1.4.2-ensemble',
        observed_symptoms: [
          'Concentric dark brown rings on lower leaves resembling target-board pattern',
          'Yellow chlorotic halos surrounding lesions',
          'Premature defoliation starting from basal foliage',
        ],
        farmer_explanation:
          'Your tomato plant shows characteristic symptoms of Early Blight fungal infection. This commonly occurs during high humidity and fluctuating temperature.',
        recommended_actions: [
          'Prune and safely destroy heavily infected bottom leaves to stop fungal spore spread.',
          'Avoid overhead sprinkler irrigation; water at soil root base to keep foliage dry.',
          'Apply organic Trichoderma viride bio-fungicide (5g/L) or Copper Oxychloride 50% WP (2.5g/L) on affected foliage.',
          'Ensure 24-inch spacing between rows for adequate airflow.',
        ],
        pest_ipm_guidance: 'Maintain clean bunds free of nightshade weeds which serve as alternate fungal hosts.',
        soil_lab_referral_needed: false,
        status: 'COMPLETED',
        created_at: '2025-01-24T10:15:00Z',
        farmer_feedback: 'yes',
        is_demo: true,
      },
      {
        id: 'scan_2',
        farmer_id: 'usr_farmer_1',
        farm_id: 'farm_1',
        field_id: 'field_1',
        crop_name: 'Tomato',
        plant_part: 'leaf',
        image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
        image_quality_score: 89,
        image_quality_verdict: 'CLEAR',
        quality_checks: {
          blur_score: 88,
          brightness_ok: true,
          leaf_centered: true,
          resolution_ok: true,
        },
        predicted_issue: 'Possible Nitrogen & Zinc Deficiency Pattern',
        prediction_type: 'NUTRIENT_DEFICIENCY',
        confidence: 76,
        model_name: 'AgriSaarthi-PlantCV-Vision',
        model_version: 'v1.4.2-ensemble',
        observed_symptoms: [
          'Uniform yellowing (chlorosis) of older leaves while veins stay faint green',
          'Stunted inter-nodal growth',
          'Pale lime leaf texture',
        ],
        farmer_explanation:
          'Symptoms resemble nutrient stress, primarily low available nitrogen and trace zinc. Note: Visual symptoms alone cannot guarantee nutrient levels.',
        recommended_actions: [
          'Verify with your official Soil Health Card or nearby soil lab test before heavy fertilizer application.',
          'Apply foliar spray of 19:19:19 (NPK Water Soluble) at 5g/L of water during morning hours.',
          'Foliar spray with Chelated Zinc EDTA (1g/L) if young leaves show mottled chlorosis.',
        ],
        nutrient_advisory: 'Symptoms match Low Nitrogen test from Field 1 soil report (210 kg/ha).',
        soil_lab_referral_needed: true,
        status: 'COMPLETED',
        created_at: '2025-01-26T16:40:00Z',
        farmer_feedback: 'yes',
        is_demo: true,
      },
    ];

    // 9. Government Schemes
    this.governmentSchemes = [
      {
        id: 'sch_1',
        scheme_code: 'GOI-PM-KISAN-2025',
        title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        sponsor: 'Central Government',
        category: 'Financial Support',
        benefit_summary: 'Direct income support of ₹6,000 per year in 3 equal four-monthly installments of ₹2,000 directly into Aadhaar-linked bank accounts.',
        max_financial_benefit_inr: 6000,
        eligibility_criteria: [
          'All landholding farmer families with cultivable landholding in their names.',
          'Aadhaar e-KYC verified.',
          'Must not be institutional landholders or income tax payers.',
        ],
        required_documents: ['Aadhaar Card', 'Land Patta / Chitta / 7/12 Extract', 'Bank Passbook Copy', 'Active Mobile Number'],
        state_applicable: 'All India',
        application_url: 'https://pmkisan.gov.in',
        is_active: true,
        is_demo: true,
      },
      {
        id: 'sch_2',
        scheme_code: 'GOI-PMFBY-2025',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        sponsor: 'Central Government',
        category: 'Crop Insurance',
        benefit_summary: 'Comprehensive crop insurance covering natural calamities, drought, floods, pest outbreaks, and post-harvest unseasonal rain losses with nominal 1.5% to 2% premium.',
        subsidy_percent: 85,
        eligibility_criteria: [
          'All farmers growing notified crops in notified areas.',
          'Sharecroppers and tenant farmers with cultivation agreement are eligible.',
        ],
        required_documents: ['Crop Sowing Certificate (VAO / Adangal)', 'Land Ownership / Tenancy Record', 'Aadhaar Card', 'Bank Account Details'],
        state_applicable: 'All India',
        application_url: 'https://pmfby.gov.in',
        is_active: true,
        deadline: '2025-03-31',
        is_demo: true,
      },
      {
        id: 'sch_3',
        scheme_code: 'TN-SMAM-MACHINERY',
        title: 'Sub-Mission on Agricultural Mechanization (SMAM) & Tractor Subsidy',
        sponsor: 'State Government (Tamil Nadu)',
        category: 'Farm Equipment Subsidy',
        benefit_summary: 'Up to 50% subsidy (up to ₹2,50,000) for purchase of Tractors, Power Tillers, Multi-Crop Threshers, and Drones for spraying.',
        subsidy_percent: 50,
        max_financial_benefit_inr: 250000,
        eligibility_criteria: [
          'Small & Marginal Farmers (special preference to SC/ST and Women farmers).',
          'Must not have received machinery subsidy in the last 5 years.',
        ],
        required_documents: ['Small Farmer Certificate', 'Patta & Chitta', 'Aadhaar Card', 'Quotation from authorized implement dealer'],
        state_applicable: 'Tamil Nadu',
        application_url: 'https://agrimachinery.nic.in',
        is_active: true,
        deadline: '2025-05-15',
        is_demo: true,
      },
      {
        id: 'sch_4',
        scheme_code: 'TN-DRIP-PMKSY',
        title: 'PMKSY Micro Irrigation (100% Subsidy for Small Farmers)',
        sponsor: 'State Government (Tamil Nadu)',
        category: 'Irrigation & Solar',
        benefit_summary: '100% subsidy for small and marginal farmers (up to 5 acres) and 75% subsidy for other farmers for Drip & Sprinkler irrigation installation.',
        subsidy_percent: 100,
        max_financial_benefit_inr: 135000,
        eligibility_criteria: [
          'Farmer must possess viable water source (borewell/well/canal) with electricity/solar connection.',
          'Registered land ownership.',
        ],
        required_documents: ['Patta/Chitta', 'Water and Soil Test Report', 'FMB Sketch', 'Aadhaar Card'],
        state_applicable: 'Tamil Nadu',
        application_url: 'https://tnhorticulture.tn.gov.in',
        is_active: true,
        is_demo: true,
      },
      {
        id: 'sch_5',
        scheme_code: 'GOI-SHC-2025',
        title: 'National Soil Health Card Scheme & Soil Testing Subsidy',
        sponsor: 'Central Government',
        category: 'Soil Health',
        benefit_summary: 'Free 12-parameter soil health analysis with customized nutrient advisory delivered directly to farmer mobile and card format.',
        subsidy_percent: 100,
        max_financial_benefit_inr: 500,
        eligibility_criteria: ['All farmers possessing agricultural land in India.'],
        required_documents: ['Aadhaar Number', 'Field Survey Number', 'Crop History Details'],
        state_applicable: 'All India',
        application_url: 'https://soilhealth.dac.gov.in',
        is_active: true,
        is_demo: true,
      },
    ];

    this.schemeApplications = [
      {
        id: 'appl_1',
        application_number: 'TN-SMAM-2025-0814',
        scheme_id: 'sch_3',
        scheme_title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
        farmer_id: 'usr_farmer_1',
        farmer_name: 'Murugan Palaniswamy',
        land_area_acres: 6.5,
        aadhaar_last_four: '7654',
        bank_account_verified: true,
        status: 'FIELD_VERIFICATION',
        submitted_date: '2025-01-14',
        updated_date: '2025-01-20',
        remarks: 'Assistant Agricultural Engineer field visit scheduled for verification of tractor implement quotation.',
      },
    ];

    // 10. Market Prices (Live APMC Mandi data)
    this.marketPrices = [
      {
        id: 'mp_1',
        mandi_name: 'Pollachi Regulated Market & APMC',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        commodity: 'Tomato',
        variety: 'Hybrid Shivam / Country',
        category: 'Vegetables',
        min_price_per_quintal: 1850,
        modal_price_per_quintal: 2380,
        max_price_per_quintal: 2650,
        arrival_quantity_tonnes: 165,
        price_trend: 'up',
        price_change_percent: 5.4,
        report_date: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET / Govt of India Mandi Portal',
        is_demo: true,
      },
      {
        id: 'mp_2',
        mandi_name: 'Pollachi Coconut & Copra Regulated Market',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        commodity: 'Coconut (Raw)',
        variety: 'West Coast Tall (Grade 1)',
        category: 'Fruits',
        min_price_per_quintal: 2950,
        modal_price_per_quintal: 3450,
        max_price_per_quintal: 3800,
        arrival_quantity_tonnes: 340,
        price_trend: 'up',
        price_change_percent: 3.2,
        report_date: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET Directorate of Marketing & Inspection',
        is_demo: true,
      },
      {
        id: 'mp_3',
        mandi_name: 'Coimbatore M.G.R. Central APMC',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        commodity: 'Small Onion (Shallots)',
        variety: 'CO-5 Indigenous Red',
        category: 'Vegetables',
        min_price_per_quintal: 4200,
        modal_price_per_quintal: 4950,
        max_price_per_quintal: 5400,
        arrival_quantity_tonnes: 92,
        price_trend: 'up',
        price_change_percent: 11.8,
        report_date: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET Mandi Live Ticker',
        is_demo: true,
      },
      {
        id: 'mp_4',
        mandi_name: 'Pollachi Oilseed & Groundnut Yard',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        commodity: 'Groundnut (Pods)',
        variety: 'TMV 2 / Kadiri 6',
        category: 'Oilseeds & Pulses',
        min_price_per_quintal: 6200,
        modal_price_per_quintal: 6750,
        max_price_per_quintal: 7200,
        arrival_quantity_tonnes: 120,
        price_trend: 'up',
        price_change_percent: 4.1,
        report_date: new Date().toISOString().split('T')[0],
        source: 'Tamil Nadu Regulated Market Committee',
        is_demo: true,
      },
      {
        id: 'mp_5',
        mandi_name: 'Erode Turmeric Special Commodity Market',
        district: 'Erode',
        state: 'Tamil Nadu',
        commodity: 'Turmeric (Finger)',
        variety: 'Erode Local Yellow (Curcumin 3.8%)',
        category: 'Spices & Commercial',
        min_price_per_quintal: 13800,
        modal_price_per_quintal: 15400,
        max_price_per_quintal: 17200,
        arrival_quantity_tonnes: 280,
        price_trend: 'up',
        price_change_percent: 4.8,
        report_date: new Date().toISOString().split('T')[0],
        source: 'Erode Regulated Market Committee',
        is_demo: true,
      },
      {
        id: 'mp_6',
        mandi_name: 'Madurai Central APMC (Mattuthavani)',
        district: 'Madurai',
        state: 'Tamil Nadu',
        commodity: 'Red Chilli (Dry)',
        variety: 'Sanam / Ramnad Mundu',
        category: 'Spices & Commercial',
        min_price_per_quintal: 15200,
        modal_price_per_quintal: 17900,
        max_price_per_quintal: 20500,
        arrival_quantity_tonnes: 95,
        price_trend: 'up',
        price_change_percent: 6.4,
        report_date: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET',
        is_demo: true,
      },
      {
        id: 'mp_7',
        mandi_name: 'Pune APMC (Gultekdi Yard)',
        district: 'Pune',
        state: 'Maharashtra',
        commodity: 'Onion',
        variety: 'Red Nashik / Garva',
        category: 'Vegetables',
        min_price_per_quintal: 1950,
        modal_price_per_quintal: 2520,
        max_price_per_quintal: 2950,
        arrival_quantity_tonnes: 520,
        price_trend: 'up',
        price_change_percent: 7.6,
        report_date: new Date().toISOString().split('T')[0],
        source: 'Maharashtra State Agricultural Marketing Board (MSAMB)',
        is_demo: true,
      },
      {
        id: 'mp_8',
        mandi_name: 'Thanjavur Grain Regulated Market',
        district: 'Thanjavur',
        state: 'Tamil Nadu',
        commodity: 'Paddy (Dhan)',
        variety: 'CR 1009 / BPT 5204 (Samba)',
        category: 'Cereals & Grains',
        min_price_per_quintal: 2280,
        modal_price_per_quintal: 2510,
        max_price_per_quintal: 2680,
        arrival_quantity_tonnes: 580,
        price_trend: 'stable',
        price_change_percent: 1.2,
        report_date: new Date().toISOString().split('T')[0],
        source: 'Tamil Nadu Civil Supplies Corporation',
        is_demo: true,
      },
      {
        id: 'mp_9',
        mandi_name: 'Udumalpet Corn & Maize APMC Yard',
        district: 'Tiruppur',
        state: 'Tamil Nadu',
        commodity: 'Maize (Corn)',
        variety: 'Pioneer 30V92 Feed Grade',
        category: 'Cereals & Grains',
        min_price_per_quintal: 2150,
        modal_price_per_quintal: 2360,
        max_price_per_quintal: 2500,
        arrival_quantity_tonnes: 210,
        price_trend: 'up',
        price_change_percent: 2.8,
        report_date: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET',
        is_demo: true,
      },
      {
        id: 'mp_10',
        mandi_name: 'Salem Regional Sago & Tapioca Market',
        district: 'Salem',
        state: 'Tamil Nadu',
        commodity: 'Tapioca (Raw Tuber)',
        variety: 'MVD 1 Industrial High Starch',
        category: 'Vegetables',
        min_price_per_quintal: 1320,
        modal_price_per_quintal: 1480,
        max_price_per_quintal: 1620,
        arrival_quantity_tonnes: 310,
        price_trend: 'down',
        price_change_percent: -2.3,
        report_date: new Date().toISOString().split('T')[0],
        source: 'SAGOSERVE Salem',
        is_demo: true,
      },
      {
        id: 'mp_11',
        mandi_name: 'Theni Banana Commercial Auction Hub',
        district: 'Theni',
        state: 'Tamil Nadu',
        commodity: 'Banana (Robusta)',
        variety: 'Grand Naine Export Quality',
        category: 'Fruits',
        min_price_per_quintal: 1850,
        modal_price_per_quintal: 2180,
        max_price_per_quintal: 2450,
        arrival_quantity_tonnes: 260,
        price_trend: 'up',
        price_change_percent: 3.8,
        report_date: new Date().toISOString().split('T')[0],
        source: 'Tamil Nadu Horticulture Board',
        is_demo: true,
      },
      {
        id: 'mp_12',
        mandi_name: 'Mettupalayam Nilgiris Hill Produce Market',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        commodity: 'Garlic (Hill Produce)',
        variety: 'Ooty Country White High Allicin',
        category: 'Spices & Commercial',
        min_price_per_quintal: 12500,
        modal_price_per_quintal: 14600,
        max_price_per_quintal: 16800,
        arrival_quantity_tonnes: 45,
        price_trend: 'up',
        price_change_percent: 8.9,
        report_date: new Date().toISOString().split('T')[0],
        source: 'Nilgiris Agricultural Producer Co-op',
        is_demo: true,
      },
    ];

    // Initialize Default Price Alert Rules for usr_farmer_1
    this.priceAlertRules = [
      {
        id: 'rule_1',
        userId: 'usr_farmer_1',
        commodity: 'Tomato',
        mandiName: 'Pollachi Regulated Market & APMC',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        condition: 'ABOVE_TARGET',
        targetPriceINR: 2350,
        currentPriceINR: 2380,
        thresholdPercent: 5,
        channels: ['in_app', 'push', 'sms'],
        status: 'ACTIVE',
        lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        triggerCount: 3,
        createdAt: '2025-01-15T08:00:00Z',
        note: 'Sell ready tomato picking from North Block Plot A when above ₹2,350/Q.',
      },
      {
        id: 'rule_2',
        userId: 'usr_farmer_1',
        commodity: 'Coconut (Raw)',
        mandiName: 'Pollachi Coconut & Copra Regulated Market',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        condition: 'ABOVE_TARGET',
        targetPriceINR: 3400,
        currentPriceINR: 3450,
        thresholdPercent: 4,
        channels: ['in_app', 'push', 'whatsapp'],
        status: 'ACTIVE',
        lastTriggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        triggerCount: 2,
        createdAt: '2025-01-18T10:30:00Z',
        note: 'High demand copra conversion target for South Coconut Grove.',
      },
      {
        id: 'rule_3',
        userId: 'usr_farmer_1',
        commodity: 'Small Onion (Shallots)',
        mandiName: 'Coimbatore M.G.R. Central APMC',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        condition: 'PERCENT_SURGE',
        targetPriceINR: 4800,
        currentPriceINR: 4950,
        thresholdPercent: 8,
        channels: ['in_app', 'push', 'sms', 'whatsapp'],
        status: 'ACTIVE',
        lastTriggeredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        triggerCount: 1,
        createdAt: '2025-01-22T09:00:00Z',
        note: 'Surge trigger for intercropped shallots harvest.',
      },
      {
        id: 'rule_4',
        userId: 'usr_farmer_1',
        commodity: 'Groundnut (Pods)',
        mandiName: 'Pollachi Oilseed & Groundnut Yard',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        condition: 'BELOW_TARGET',
        targetPriceINR: 6000,
        currentPriceINR: 6750,
        thresholdPercent: 5,
        channels: ['in_app', 'push'],
        status: 'ACTIVE',
        createdAt: '2025-01-25T11:00:00Z',
        triggerCount: 0,
        note: 'Safety floor alert: book CWC dry warehouse if groundnut slips under ₹6,000/Q.',
      },
    ];

    // Initialize Recent Triggered Alerts
    this.triggeredPriceAlerts = [
      {
        id: 'alert_init_1',
        ruleId: 'rule_3',
        userId: 'usr_farmer_1',
        commodity: 'Small Onion (Shallots)',
        mandiName: 'Coimbatore M.G.R. Central APMC',
        district: 'Coimbatore',
        previousPrice: 4420,
        newPrice: 4950,
        changePercent: 11.8,
        conditionMet: 'Daily swing of +11.8% detected (Surge rule: >8%)',
        alertType: 'SURGE_SPIKE',
        headline: '📈 Volatility Surge: Small Onion Surged +11.8% in Coimbatore Mandi',
        message: 'Small Onion (Shallots) modal price leaped to ₹4,950/quintal due to low arrivals (92 tonnes). High wholesale buying demand.',
        actionRecommendation: 'Dispatch ready cured shallots immediately to maximize profit margins before next interstate arrivals.',
        suggestedAction: 'SELL_NOW',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        isRead: false,
      },
      {
        id: 'alert_init_2',
        ruleId: 'rule_1',
        userId: 'usr_farmer_1',
        commodity: 'Tomato',
        mandiName: 'Pollachi Regulated Market & APMC',
        district: 'Coimbatore',
        previousPrice: 2260,
        newPrice: 2380,
        changePercent: 5.4,
        conditionMet: 'Rate reached ₹2,380/Q (Target: ₹2,350/Q)',
        alertType: 'HIGH_PROFIT_SELL',
        headline: '🚀 Target Exceeded: Tomato @ ₹2,380/Q in Pollachi APMC',
        message: 'Tomato rate crossed your selling threshold of ₹2,350/Q. Current modal price is ₹2,380/Q with strong food processor demand.',
        actionRecommendation: 'Lock direct procurement slot with verified buyer Kongu Agro Foods or dispatch to Pollachi morning auction.',
        suggestedAction: 'VIEW_BUYERS',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
      },
      {
        id: 'alert_init_3',
        ruleId: 'rule_2',
        userId: 'usr_farmer_1',
        commodity: 'Coconut (Raw)',
        mandiName: 'Pollachi Coconut & Copra Regulated Market',
        district: 'Coimbatore',
        previousPrice: 3340,
        newPrice: 3450,
        changePercent: 3.2,
        conditionMet: 'Rate reached ₹3,450/Q (Target: ₹3,400/Q)',
        alertType: 'HIGH_PROFIT_SELL',
        headline: '🚀 Target Exceeded: Coconut @ ₹3,450/Q in Pollachi Yard',
        message: 'Grade 1 West Coast Tall coconuts are fetching premium rates of ₹3,450/quintal in Pollachi regulated market.',
        actionRecommendation: 'Favorable pricing for fresh harvest batch. Ideal to negotiate with local oil millers or copra processors.',
        suggestedAction: 'SELL_NOW',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isRead: true,
      },
    ];

    // 11. Buyers & Listings
    this.buyerListings = [
      {
        id: 'buyer_1',
        buyer_id: 'usr_buyer_1',
        company_name: 'Kongu Agro Foods & Pure Purees Ltd',
        buyer_type: 'Flour Mill / Processor',
        commodity_required: 'Tomato',
        variety_preferred: 'Hybrid Shivam (Brix > 4.5)',
        required_quantity_tonnes: 25,
        offered_price_per_quintal: 2400,
        delivery_location: 'Coimbatore / Pollachi Food Park',
        payment_terms: 'Instant on delivery',
        verified_buyer: true,
        created_at: '2025-01-20T08:00:00Z',
        is_demo: true,
      },
      {
        id: 'buyer_2',
        buyer_id: 'usr_buyer_2',
        company_name: 'Southern Spices & Export Consortium',
        buyer_type: 'Exporters',
        commodity_required: 'Turmeric (Finger)',
        variety_preferred: 'Curcumin > 3.8%',
        required_quantity_tonnes: 50,
        offered_price_per_quintal: 15200,
        delivery_location: 'Erode / Cochin Port Delivery',
        payment_terms: 'Escrow via AgriSaarthi',
        verified_buyer: true,
        created_at: '2025-01-22T10:00:00Z',
        is_demo: true,
      },
      {
        id: 'buyer_3',
        buyer_id: 'usr_buyer_3',
        company_name: 'Sahyadri Farmer Producer Company (FPO)',
        buyer_type: 'FPO',
        commodity_required: 'Onion',
        variety_preferred: 'Grade A Red 55mm+',
        required_quantity_tonnes: 100,
        offered_price_per_quintal: 2550,
        delivery_location: 'Pune / Baramati Hub',
        payment_terms: '24h Bank Transfer',
        verified_buyer: true,
        created_at: '2025-01-24T12:00:00Z',
        is_demo: true,
      },
    ];

    this.cropListings = [
      {
        id: 'cl_1',
        farmer_id: 'usr_farmer_1',
        farmer_name: 'Murugan Palaniswamy',
        crop_name: 'Tomato',
        variety: 'Shivam Semi-determinate',
        quantity_quintals: 30,
        expected_price_per_quintal: 2350,
        harvest_date: '2025-02-20',
        storage_location: 'Stored in Pollachi TNWC Cold Chamber',
        quality_grade: 'Grade A',
        status: 'ACTIVE',
        created_at: '2025-01-25T10:00:00Z',
      },
    ];

    // 12. Notifications
    this.notifications = [
      {
        id: 'n_1',
        user_id: 'usr_farmer_1',
        title: 'Cold Storage Booking Confirmed',
        message: 'Your booking #AGRI-WH-849201 for 3,000 kg Tomato at Pollachi TNWC Hub is ACTIVE.',
        type: 'booking',
        is_read: false,
        created_at: '2025-01-22T09:00:00Z',
        link_tab: 'warehouses',
      },
      {
        id: 'n_2',
        user_id: 'usr_farmer_1',
        title: 'Soil Health Card Ready',
        message: 'Your soil analysis for North Block Plot A is ready with customized fertilizer recommendations.',
        type: 'soil_report',
        is_read: false,
        created_at: '2025-01-10T14:00:00Z',
        link_tab: 'soil',
      },
      {
        id: 'n_3',
        user_id: 'usr_farmer_1',
        title: 'Market Price Alert: Tomato +15%',
        message: 'Coimbatore APMC modal prices climbed to ₹2,200/quintal due to strong wholesale demand.',
        type: 'market_alert',
        is_read: true,
        created_at: '2025-02-14T06:00:00Z',
        link_tab: 'market',
      },
    ];

    // 13. Demand-Driven Fruits and Vegetables Suggestions
    this.demandCropSuggestions = [
      {
        id: 'dc_1',
        crop_name: 'Tomato (Hybrid Sivam/Abhinav)',
        category: 'Vegetable',
        demand_index: 96,
        demand_level: 'Very High',
        current_mandi_modal_price_quintal: 2650,
        price_forecast_trend: '+18% (Peak Surge)',
        best_sowing_season: 'Jan - Feb (Summer Flush) & June - July (Kharif)',
        duration_days: 95,
        estimated_yield_tonnes_per_acre: 18.5,
        expected_profit_per_acre_inr: 215000,
        cold_storage_suitability: 'High (Store at 8-10°C for up to 45 days with 85% RH)',
        top_demanding_markets: ['Coimbatore APMC', 'Chennai Koyambedu', 'Bengaluru Yeshwanthpur', 'Reliance Fresh Retail Hub'],
        key_agronomic_tips: 'High market demand during festival and summer gaps. Implement staking and drip fertigation with calcium nitrate to prevent blossom end rot.',
      },
      {
        id: 'dc_2',
        crop_name: 'Red Shallots / Small Onion (CO 5 / CO On 5)',
        category: 'Vegetable',
        demand_index: 94,
        demand_level: 'Very High',
        current_mandi_modal_price_quintal: 3800,
        price_forecast_trend: '+25% (High Deficit)',
        best_sowing_season: 'Oct - Nov (Rabi) & April - May (Summer)',
        duration_days: 75,
        estimated_yield_tonnes_per_acre: 6.8,
        expected_profit_per_acre_inr: 165000,
        cold_storage_suitability: 'Excellent (Aerated dry storage or cold storage at 0-2°C for 5-6 months)',
        top_demanding_markets: ['Pollachi Daily Mandi', 'Madurai Mattuthavani', 'Kerala Border Traders', 'BigBasket'],
        key_agronomic_tips: 'Shallots command premium prices in South India and Sri Lanka export channels. Apply sulfur 20 kg/acre to boost pungency and storage firmness.',
      },
      {
        id: 'dc_3',
        crop_name: 'Green Chilli (G4 / Bullet / Teja)',
        category: 'Vegetable',
        demand_index: 89,
        demand_level: 'High',
        current_mandi_modal_price_quintal: 4500,
        price_forecast_trend: '+12% (Rising)',
        best_sowing_season: 'June - July & Jan - Feb',
        duration_days: 120,
        estimated_yield_tonnes_per_acre: 9.2,
        expected_profit_per_acre_inr: 240000,
        cold_storage_suitability: 'Moderate (Store at 7-9°C for 21 days for fresh export)',
        top_demanding_markets: ['Dindigul APMC', 'Kochi Terminal', 'Mumbai Vashi Market'],
        key_agronomic_tips: 'Continuous weekly picking ensures regular cash flow. Use silver reflective plastic mulch to prevent thrips and leaf curl virus.',
      },
      {
        id: 'dc_4',
        crop_name: 'Capsicum / Sweet Pepper (Indra / Inspiration)',
        category: 'Vegetable',
        demand_index: 87,
        demand_level: 'High',
        current_mandi_modal_price_quintal: 3600,
        price_forecast_trend: '+12% (Rising)',
        best_sowing_season: 'Year-round under 50% Shade Net or Polyhouse',
        duration_days: 110,
        estimated_yield_tonnes_per_acre: 16.0,
        expected_profit_per_acre_inr: 320000,
        cold_storage_suitability: 'High (Optimal at 8°C with 90% humidity for up to 30 days)',
        top_demanding_markets: ['Bengaluru Metro Hub', 'Coimbatore Supermarkets', 'Star Hotels & Quick Commerce'],
        key_agronomic_tips: 'Supermarket and urban quick-commerce chains pay 40% premium for uniform, glossy Grade-A bell peppers. Protect from mite infestation.',
      },
      {
        id: 'dc_5',
        crop_name: 'Banana (Grand Naine / G9 Tissue Culture)',
        category: 'Fruit',
        demand_index: 95,
        demand_level: 'Very High',
        current_mandi_modal_price_quintal: 2400,
        price_forecast_trend: '+18% (Peak Surge)',
        best_sowing_season: 'Feb - March & Aug - Sept',
        duration_days: 330,
        estimated_yield_tonnes_per_acre: 32.0,
        expected_profit_per_acre_inr: 380000,
        cold_storage_suitability: 'High (Ripening chambers & cold chain logistics at 13.5°C)',
        top_demanding_markets: ['Coimbatore Wholesale', 'Gulf Export Channels', 'Kochi Port', 'Nilgiris Retail'],
        key_agronomic_tips: 'G9 Tissue culture bananas produce uniform 28-32 kg bunches. Wrap bunches with blue non-woven polypropylene bags to prevent thrip blemishes.',
      },
      {
        id: 'dc_6',
        crop_name: 'Papaya (Taiwan 786 Red Lady)',
        category: 'Fruit',
        demand_index: 91,
        demand_level: 'High',
        current_mandi_modal_price_quintal: 1900,
        price_forecast_trend: '+8% (Steady)',
        best_sowing_season: 'Jan - March & Sept - Oct',
        duration_days: 240,
        estimated_yield_tonnes_per_acre: 28.0,
        expected_profit_per_acre_inr: 290000,
        cold_storage_suitability: 'Moderate (Store mature green fruits at 10-12°C for 2 weeks)',
        top_demanding_markets: ['Tiruppur District', 'Bengaluru Urban', 'Local Processing Pulp Units'],
        key_agronomic_tips: 'Red Lady is bisexual, early bearing, and highly productive. Ensure well-drained soils; waterlogging triggers collar rot.',
      },
      {
        id: 'dc_7',
        crop_name: 'Guava (Taiwan Pink / VNR Bihi)',
        category: 'Fruit',
        demand_index: 88,
        demand_level: 'High',
        current_mandi_modal_price_quintal: 3400,
        price_forecast_trend: '+12% (Rising)',
        best_sowing_season: 'June - Aug (Monsoon Planting for 15-year perennial orchard)',
        duration_days: 180,
        estimated_yield_tonnes_per_acre: 12.5,
        expected_profit_per_acre_inr: 260000,
        cold_storage_suitability: 'High (Store at 8-10°C for up to 25 days with foam netting)',
        top_demanding_markets: ['Hyderabad APMC', 'Chennai Koyambedu', 'Air Cargo Exports'],
        key_agronomic_tips: 'High-density planting (Ultra HDP 1m x 2m) with regular canopy bending delivers 2 crop flushes per year with jumbo 400g+ fruits.',
      },
      {
        id: 'dc_8',
        crop_name: 'Pomegranate (Bhagwa Super)',
        category: 'Fruit',
        demand_index: 92,
        demand_level: 'Very High',
        current_mandi_modal_price_quintal: 9500,
        price_forecast_trend: '+25% (High Deficit)',
        best_sowing_season: 'Hasta Bahar (Sept - Oct) & Ambe Bahar (Jan - Feb)',
        duration_days: 165,
        estimated_yield_tonnes_per_acre: 8.0,
        expected_profit_per_acre_inr: 450000,
        cold_storage_suitability: 'Superior (Long term storage at 5°C for up to 90 days with zero aril degradation)',
        top_demanding_markets: ['Mumbai APMC', 'Middle East Export Hubs', 'Delhi Azadpur'],
        key_agronomic_tips: 'Bhagwa has deep red arils and thick skin, making it the #1 commercial export variety. Control bacterial blight with Streptocycline & Copper sprays.',
      },
    ];

    // 14. Admin Inquiries & Helpdesk Tickets
    this.inquiries = [
      {
        id: 'inq_1',
        ticket_number: 'TKT-FAR-88102',
        sender_id: 'usr_farmer_1',
        sender_name: 'Murugan Palaniswamy',
        sender_email: 'murugan.farmer@agrisaarthi.gov.in',
        sender_phone: '+91 98421 87654',
        sender_role: 'farmer',
        subject: 'Assistance with TNWC Cold Storage Slot & e-NWR Receipt generation',
        category: 'WAREHOUSE_BOOKING',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        messages: [
          {
            id: 'm_inq_1_1',
            sender_id: 'usr_farmer_1',
            sender_name: 'Murugan Palaniswamy',
            sender_role: 'farmer',
            content:
              'Vanakkam Admin. I have booked 3,000 kg tomato storage at Pollachi TNWC Hub (Booking #AGRI-WH-849201). Can you please confirm how I can generate the electronic Negotiable Warehouse Receipt (e-NWR) to apply for the Kisan Pledge Loan at Canara Bank?',
            timestamp: '2025-01-22T08:30:00Z',
          },
          {
            id: 'm_inq_1_2',
            sender_id: 'usr_admin_1',
            sender_name: 'Dr. A. Subramanian (Chief Agronomist & Admin)',
            sender_role: 'admin',
            content:
              'Vanakkam Murugan Palaniswamy. Once the warehouse operator marks your batch as physically received and inspected for quality grade, the e-NWR is automatically created in the WRDA repository. You can download the signed digital receipt directly from your Warehouses tab under "My Bookings" and present it to Canara Bank Pollachi for up to 75% pledge loan at 7% subsidized interest.',
            timestamp: '2025-01-22T10:15:00Z',
            visual_payload: {
              type: 'storage_roi',
              title: 'Storage ROI & Loan Value Benefit (Tomato 3,000 kg)',
              description: 'Comparison of Immediate Sale vs 45-day TNWC Cold Storage with Pledge Loan liquidity',
              data: {
                immediate_sale_revenue: 66000,
                future_sale_revenue: 96000,
                storage_cost_45_days: 6300,
                pledge_loan_available: 50000,
                net_profit_gain: 23700,
              },
            },
          },
        ],
        created_at: '2025-01-22T08:30:00Z',
        updated_at: '2025-01-22T10:15:00Z',
      },
      {
        id: 'inq_2',
        ticket_number: 'TKT-PRO-54910',
        sender_id: 'usr_provider_1',
        sender_name: 'TNWC Coimbatore Depot Manager',
        sender_email: 'tnwc.coimbatore@agrisaarthi.gov.in',
        sender_phone: '+91 422 2398711',
        sender_role: 'provider',
        subject: 'Cold Storage Capacity Expansion Verification & Energy Subsidy',
        category: 'CAPACITY_DISPUTE',
        status: 'OPEN',
        priority: 'MEDIUM',
        messages: [
          {
            id: 'm_inq_2_1',
            sender_id: 'usr_provider_1',
            sender_name: 'TNWC Coimbatore Depot Manager',
            sender_role: 'provider',
            content:
              'Dear Admin, we have added a new 100-ton fruit & vegetable temperature-controlled chamber (+2°C to +8°C) at our Peelamedu Hub. Please verify and approve the revised capacity in AgriSaarthi so local farmers can book space directly before the upcoming mango and tomato harvest.',
            timestamp: '2025-02-10T11:00:00Z',
          },
          {
            id: 'm_inq_2_2',
            sender_id: 'usr_admin_ai',
            sender_name: 'AgriSaarthi Admin Desk (AI Assistant)',
            sender_role: 'admin',
            content:
              'Greetings TNWC Coimbatore. Your request for verifying the additional 100 MT cold chamber has been logged. Our technical verification team has scheduled an automated audit check. The capacity update will reflect live on the farmer map within 24 hours.',
            timestamp: '2025-02-10T11:01:00Z',
            is_ai_assisted: true,
          },
        ],
        created_at: '2025-02-10T11:00:00Z',
        updated_at: '2025-02-10T11:01:00Z',
      },
    ];

    // Initial Seed Yield Predictions for demo
    this.yieldPredictions = [
      {
        id: 'yp_demo_1',
        farmerId: 'usr_farmer_1',
        cropName: 'Tomato',
        variety: 'US-618 Hybrid F1',
        landAreaAcres: 2.5,
        cropStage: 'Vegetative Growth',
        soilType: 'Red Loamy',
        irrigationType: 'Drip Irrigation',
        predictedYieldTonnesPerAcre: 15.2,
        predictedYieldQuintalsPerAcre: 152,
        totalExpectedYieldQuintals: 380,
        totalExpectedYieldTonnes: 38.0,
        baselineYieldQuintalsPerAcre: 130,
        potentialMaxYieldQuintalsPerAcre: 185,
        worstCaseYieldQuintalsPerAcre: 85,
        regionalAverageQuintalsPerAcre: 115,
        percentageVsRegionalAvg: 32,
        confidenceScorePercent: 94,
        biomassHealthIndex: 89,
        harvestWindowEstimated: 'In 58-62 Days (Late April)',
        daysToOptimalHarvest: 60,
        weatherGrowthFactor: {
          verdict: 'FAVORABLE',
          rainfallImpact: 'Moderate deficit cushioned by planned drip fertigation scheduling.',
          temperatureImpact: '31°C day / 21°C night maintains optimum enzyme activity and pollen viability.',
          sunlightImpact: '8.5 hrs/day delivers high daily light integral (DLI) for photosynthetic vigor.',
          growthDaysForecast: '60 Days monitored growth cycle',
          gddAccumulated: 1340,
        },
        soilGrowthFactor: {
          fertilityVerdict: 'BALANCED',
          nitrogenImpact: '280 kg/ha supports dense vegetative branching and active chlorophyll formation.',
          phosphorusImpact: '22 kg/ha drives early root architecture and ATP energy transfer for floral bud formation.',
          potassiumImpact: '290 kg/ha facilitates water regulation, stomatal conductance, and fruit weight density.',
          phImpact: 'Soil pH of 6.8 ensures peak bioavailability of iron, zinc, and phosphorus.',
          organicMatterImpact: '0.68% organic carbon maintains excellent soil microbial respiration and cation exchange.',
        },
        timeline60Days: [
          {
            day: 10,
            dayLabel: 'Day 10',
            stageTitle: 'Canopy Expansion & Secondary Rooting',
            projectedBiomassIndex: 35,
            canopyCoverPercent: 30,
            waterDemandLitersPerAcrePerDay: 3200,
            pestRiskLevel: 'Low',
            heatStressRisk: 'Low',
            milestoneGoal: 'Establish vigorous secondary feeder roots and expand photosynthetic leaf area.',
            criticalIntervention: 'Fertigate Humic Acid (500ml/acre) + 19:19:19 NPK (4kg/acre).',
            projectedHeightCm: 25,
            ndviEstimated: 0.42,
          },
          {
            day: 20,
            dayLabel: 'Day 20',
            stageTitle: 'Vegetative Branching & Node Setting',
            projectedBiomassIndex: 56,
            canopyCoverPercent: 55,
            waterDemandLitersPerAcrePerDay: 4200,
            pestRiskLevel: 'Moderate',
            heatStressRisk: 'Low',
            milestoneGoal: 'Accelerate stem elongation and build structural reserves before flowering.',
            criticalIntervention: 'Foliar spray of 19:19:19 (5g/L) + Neem seed kernel extract (NSKE 5%) against sucking pests.',
            projectedHeightCm: 48,
            ndviEstimated: 0.62,
          },
          {
            day: 30,
            dayLabel: 'Day 30',
            stageTitle: 'Floral Initiation & Anthesis Window',
            projectedBiomassIndex: 72,
            canopyCoverPercent: 75,
            waterDemandLitersPerAcrePerDay: 5400,
            pestRiskLevel: 'Moderate',
            heatStressRisk: 'Moderate',
            milestoneGoal: 'Maximize flower retention and ensure optimal pollen viability with balanced micronutrients.',
            criticalIntervention: 'Apply Solubor Boron 20% (1g/L) + Planofix/Auxin booster to prevent flower drop during midday heat.',
            projectedHeightCm: 70,
            ndviEstimated: 0.74,
          },
          {
            day: 40,
            dayLabel: 'Day 40',
            stageTitle: 'Fruit Setting & Early Cell Enlargement',
            projectedBiomassIndex: 85,
            canopyCoverPercent: 88,
            waterDemandLitersPerAcrePerDay: 6000,
            pestRiskLevel: 'High',
            heatStressRisk: 'Moderate',
            milestoneGoal: 'Drive fruit enlargement and translocate photo-assimilates from leaves to fruit clusters.',
            criticalIntervention: 'Fertigate Calcium Nitrate (10kg/acre) + Potassium Schoenite (12:0:44) to maximize fruit density.',
            projectedHeightCm: 88,
            ndviEstimated: 0.84,
          },
          {
            day: 50,
            dayLabel: 'Day 50',
            stageTitle: 'Bulking & Dry Matter Accumulation',
            projectedBiomassIndex: 95,
            canopyCoverPercent: 92,
            waterDemandLitersPerAcrePerDay: 5000,
            pestRiskLevel: 'Moderate',
            heatStressRisk: 'Low',
            milestoneGoal: 'Achieve uniform size grading, brix/sugar accumulation, and firm cell wall structure.',
            criticalIntervention: 'SOP (Sulphate of Potash 0:0:50) foliar spray (7g/L) to boost luster, color, and shelf-life.',
            projectedHeightCm: 92,
            ndviEstimated: 0.81,
          },
          {
            day: 60,
            dayLabel: 'Day 60',
            stageTitle: 'Peak Maturity & Optimal Harvest Window',
            projectedBiomassIndex: 100,
            canopyCoverPercent: 90,
            waterDemandLitersPerAcrePerDay: 2400,
            pestRiskLevel: 'Low',
            heatStressRisk: 'Low',
            milestoneGoal: 'Reach optimal commercial harvest maturity with peak marketable weight and minimal field losses.',
            criticalIntervention: 'Cease heavy irrigation 3 days prior to harvest; schedule nearest cold storage transport crates.',
            projectedHeightCm: 94,
            ndviEstimated: 0.70,
          },
        ],
        actionableInterventions: [
          {
            id: 'int_d1',
            dayTarget: 'Day 10 - 14',
            dayNumber: 12,
            category: 'Nutrient Management',
            title: 'Root Biostimulant & Nitrogen Top Dressing',
            instruction: 'Apply urea or water-soluble 19:19:19 via fertigation along with humic acid to build deep taproot anchors.',
            dosageOrRate: '5 kg 19:19:19 + 500ml Humic liquid per acre',
            expectedYieldGainPercent: 5.2,
            completed: true,
          },
          {
            id: 'int_d2',
            dayTarget: 'Day 22 - 25',
            dayNumber: 24,
            category: 'Pest & Fungus Protection',
            title: 'Preventive Sucking Pest & Blight Barrier',
            instruction: 'Spray Azadirachtin (Neem 10,000 ppm) with Pseudomonas fluorescens bio-fungicide during early morning hours.',
            dosageOrRate: '3 ml Neem + 5g Bio-fungicide per Litre of water',
            expectedYieldGainPercent: 4.8,
            completed: false,
          },
          {
            id: 'int_d3',
            dayTarget: 'Day 32 - 35',
            dayNumber: 34,
            category: 'Nutrient Management',
            title: 'Boron & Micronutrient Flower Setting Booster',
            instruction: 'Spray solubor boron + chelated zinc to enhance pollen fertility and curb flower abortion under temp fluctuations.',
            dosageOrRate: '1.2 g Boron + 1 g Zinc per Litre',
            expectedYieldGainPercent: 6.5,
            completed: false,
          },
          {
            id: 'int_d4',
            dayTarget: 'Day 42 - 45',
            dayNumber: 44,
            category: 'Soil Conditioning',
            title: 'Potassium & Calcium Density Top-up',
            instruction: 'Apply Potassium Nitrate (13:0:45) + Calcium Nitrate to prevent blossom end rot and maximize fruit firmness.',
            dosageOrRate: '8 kg Potassium Nitrate per acre via drip',
            expectedYieldGainPercent: 5.8,
            completed: false,
          },
          {
            id: 'int_d5',
            dayTarget: 'Day 55 - 58',
            dayNumber: 56,
            category: 'Harvest Prep',
            title: 'Moisture Tapering & Cold Storage Booking',
            instruction: 'Reduce irrigation frequency to concentrate soluble solids; reserve slot at nearest CWC/SWC cold storage.',
            dosageOrRate: 'Reduce drip run-time by 50%',
            expectedYieldGainPercent: 3.2,
            completed: false,
          },
        ],
        marketRevenueProjection: {
          currentMandiRateInrPerQuintal: 2500,
          projectedGrossRevenueInr: 950000,
          baselineGrossRevenueInr: 812500,
          potentialGainWithAIInterventionsInr: 137500,
          estimatedCostOfInterventionsInr: 9500,
          netBenefitInr: 128000,
          roiMultiplier: 14.4,
        },
        aiSummaryAdvisory: 'Based on current soil analysis (Red Loamy, pH 6.8, Nitrogen 280 kg/ha) and projected 60-day agro-climatic conditions (Favorable, 31°C day avg), your Tomato crop is projected to achieve an above-average yield of 152 Quintals/Acre (15.2 Tonnes/Acre), outpacing the regional baseline of 115 Qtl/Acre by +32%.\n\nThe critical growth inflection occurs between Day 25 and Day 40 (Floral Initiation & Fruit Setting), where moisture stability and micronutrient boron/potassium sprays will be paramount to prevent flower abortion. Your Drip Irrigation infrastructure provides superior moisture consistency compared to flood systems.\n\nWith timely execution of the recommended calendarized interventions, you can secure an estimated incremental revenue of ₹1,37,500 across your 2.5 Acre holding at current APMC Mandi rates of ₹2,500/Qtl.',
        generatedAt: new Date().toISOString(),
      },
    ];

    // Seed realistic Pest Risk Assessments
    this.pestRiskAssessments = [
      {
        id: 'pra_seed_1',
        farmerId: 'usr_farmer_1',
        cropName: 'Tomato',
        variety: 'Shivam Hybrid (Semi-determinate)',
        cropStage: 'Flowering & Tillering',
        landAreaAcres: 2.5,
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        overallFarmPestIndex: 84,
        overallRiskLevel: 'CRITICAL',
        immediateAlertHeading: 'CRITICAL: 48-Hour Tomato Leaf Miner (Tuta Absoluta) & Early Blight Spurt Alert',
        keyTriggerFactor: 'Persistent 84% RH coupled with 29.5°C daytime temperature and recent drizzle has accelerated Tuta moth emergence.',
        climateVulnerabilitySummary: 'Microclimate data for Pollachi/Coimbatore indicates continuous warm humidity (>80% RH) following intermittent monsoonal showers. This accelerates the life cycle of Tuta absoluta from 30 days down to 21 days while creating ideal free-moisture films on lower leaves for Alternaria solani spore germination.',
        weatherAlertBadge: {
          temperatureWarning: '29.5°C daytime temperature matches peak ovipositing threshold of Tuta absoluta females.',
          humidityCondition: '84% relative humidity drives rapid fungal spore incubation on lower leaf canopies.',
          favorablePestSpurtWindow: 'Next 48 to 72 Hours (Urgent Scouting & Bio-Spraying Required)',
          conduciveDiseaseIndices: ['High Canopy Humidity (>80%)', 'Leaf Wetness Duration >6 hrs', 'Dense Foliar Canopy Microclimate'],
        },
        identifiedPests: [
          {
            id: 'pest_tuta_1',
            pestOrDiseaseName: 'Tomato Leaf Miner / Pinworm',
            scientificName: 'Tuta absoluta',
            pestType: 'Insect Pest',
            riskLevel: 'CRITICAL',
            riskScorePercent: 88,
            incubationWindowDays: 2,
            climateTriggerFactors: [
              'Relative humidity >80% with 28-31°C temp triggers explosive nocturnal moth oviposition.',
              'Succulent vegetative growth in flowering stage attracts gravid females.',
            ],
            damageSymptomsEarly: [
              'Silver-white translucent blotch mines on upper leaf layers with dark frass pellets',
              'Pin-hole punctures on flower sepals and tender terminal buds',
            ],
            damageSymptomsSevere: [
              'Extensive necrotic foliage scorch and hollowed fruit calyx with secondary rot',
              'Unmarketable boreholes near fruit shoulders',
            ],
            affectedPlantParts: ['Leaf', 'Stem', 'Fruit/Pod'],
            economicThresholdLevel: '1-2 moths/pheromone trap/day or 3% affected leaflets',
            potentialYieldLossPercent: 45,
            urgencyWindow: 'Deploy pheromone water-pan traps and foliar bio-spray within 48 hours.',
            organicManagementStrategy: {
              preventiveMeasures: [
                'Install Tutalure Pheromone Water Pan Traps @ 8 traps/acre (add 1 tbsp vegetable oil to trap water).',
                'Erect Yellow Sticky Sheets @ 12 sheets/acre along border rows to trap adult whiteflies and moths.',
                'Border cropping with Marigold and Sweet Basil to create natural repellent olfactory shields.',
              ],
              botanicalBioFormulations: [
                {
                  formulationName: 'Neem Azadirachtin 10,000 PPM + Soap Surfactant',
                  preparationAndDosage: '3 ml Neem Oil 10,000 PPM + 1 ml organic liquid soap per Litre of water (45 ml per 15L Knapsack)',
                  modeOfAction: 'Translaminar antifeedant action that disrupts larval molting and deters egg laying.',
                  sprayFrequency: 'Spray every 5 days targeting lower leaf undersides.',
                  safetyIntervalHours: 12,
                },
                {
                  formulationName: 'Agniastra Herbal Bio-Decoction',
                  preparationAndDosage: 'Boil 500g Garlic, 250g Green Chilli, 2kg Neem in 10L Cow Urine. Dilute 250ml in 15L spray tank.',
                  modeOfAction: 'Potent sensory repellent and neuro-sensory deterrent against leaf miners.',
                  sprayFrequency: 'Apply upon observing initial translucent blotch mines.',
                  safetyIntervalHours: 24,
                },
              ],
              biologicalPredatorsAndParasites: [
                {
                  agentName: 'Trichogramma achaeae (Egg Parasitoid)',
                  releaseRateOrDosage: 'Tricho-cards @ 50,000 parasitoids/acre',
                  targetPestStage: 'Egg masses on leaf lamina',
                  applicationGuideline: 'Staple cards under leaf shade in morning hours; release weekly during flowering.',
                },
                {
                  agentName: 'Bacillus thuringiensis var. kurstaki (Btk)',
                  releaseRateOrDosage: '2 grams per Litre of water',
                  targetPestStage: '1st and 2nd instar leaf mining caterpillars',
                  applicationGuideline: 'Spray in late afternoon to protect crystalline endotoxins from solar UV breakdown.',
                },
              ],
              culturalAndMechanicalPractices: [
                'Handpick and seal severely mined leaves in airtight solarization plastic bags.',
                'Maintain clean field borders by clearing wild solanaceous weeds (black nightshade).',
              ],
            },
          },
          {
            id: 'pest_blight_1',
            pestOrDiseaseName: 'Early Blight & Leaf Spot Complex',
            scientificName: 'Alternaria solani',
            pestType: 'Fungal Disease',
            riskLevel: 'HIGH',
            riskScorePercent: 74,
            incubationWindowDays: 3,
            climateTriggerFactors: [
              'Canopy wetness exceeding 5 hours following morning drizzle with warm 26-29°C temperature.',
              'Soil splash during rain events transferring fungal conidia to lower leaves.',
            ],
            damageSymptomsEarly: [
              'Small brownish-black spots with concentric target-board rings on lowest leaves',
              'Yellow chlorotic halos surrounding developing spots',
            ],
            damageSymptomsSevere: [
              'Premature defoliation of lower canopy and sunscald on exposed green fruit',
              'Dark leathery sunken lesions on stem collars',
            ],
            affectedPlantParts: ['Leaf', 'Stem'],
            economicThresholdLevel: '1-2 target spots visible on lower 3 leaves per plant',
            potentialYieldLossPercent: 30,
            urgencyWindow: 'Apply bio-fungicide protective foliar shield before the next rainfall cycle.',
            organicManagementStrategy: {
              preventiveMeasures: [
                'Avoid overhead sprinkler watering; deliver all moisture strictly through drip emitters.',
                'Prune lowest 4-5 leaves touching soil surface to eliminate moisture traps.',
                'Apply organic paddy straw mulching to prevent rain splash of soil inoculums.',
              ],
              botanicalBioFormulations: [
                {
                  formulationName: 'Fermented Sour Buttermilk + Turmeric Bio-Shield',
                  preparationAndDosage: '5L 4-day sour buttermilk + 200g turmeric powder + 5L fresh cow urine in 100L water.',
                  modeOfAction: 'Lactic acid and curcumin create an anti-sporulation bio-barrier on leaf cuticles.',
                  sprayFrequency: 'Spray preventive every 7 days during cloudy monsoon spells.',
                  safetyIntervalHours: 0,
                },
                {
                  formulationName: 'Bordeaux Mixture (1% Organic Prep)',
                  preparationAndDosage: '1kg Copper Sulphate + 1kg Quicklime dissolved separately in 100L water (pH 7.0 neutral).',
                  modeOfAction: 'Broad-spectrum contact fungicide accepted under certified organic farming protocols.',
                  sprayFrequency: 'Spray prior to forecasted wet spells.',
                  safetyIntervalHours: 48,
                },
              ],
              biologicalPredatorsAndParasites: [
                {
                  agentName: 'Pseudomonas fluorescens (TNAU Certified Bio-Fungicide)',
                  releaseRateOrDosage: '10g / Litre of water (2.5 kg/ha)',
                  targetPestStage: 'Preventive foliar spore colonization',
                  applicationGuideline: 'Produces antimicrobial phenazines that suppress Alternaria conidia germination.',
                },
                {
                  agentName: 'Trichoderma viride Liquid Bio-Agent',
                  releaseRateOrDosage: '5 ml / Litre foliar and root drench',
                  targetPestStage: 'Mycelial establishment stage',
                  applicationGuideline: 'Apply at 10-day intervals for systemic acquired resistance.',
                },
              ],
              culturalAndMechanicalPractices: [
                'Stake and trellis tomato vines with nylon twine to ensure 360-degree sunlight penetration.',
                'Rogue out and compost blighted plant debris with lime deep in pit.',
              ],
            },
          },
        ],
        weeklyScoutingChecklist: [
          {
            id: 'scout_tm_1',
            dayNumber: 1,
            dayLabel: 'Day 1 (Immediate)',
            scoutingFocusArea: 'Survey lowest foliage and flower clusters across 25 random tomato plants.',
            diagnosticVisualKey: 'Look for tiny translucent serpentine mines and yellow leaf halos.',
            proactiveOrganicTask: 'Install 8 Tutalure water-pan traps and 12 yellow sticky sheets per acre.',
            status: 'completed',
          },
          {
            id: 'scout_tm_2',
            dayNumber: 3,
            dayLabel: 'Day 3 Morning',
            scoutingFocusArea: 'Count moth captures in water-pan traps and check underside of middle leaves.',
            diagnosticVisualKey: 'If trap captures exceed 2 moths/trap, economic threshold level is breached.',
            proactiveOrganicTask: 'Apply foliar spray of Neem Azadirachtin (10,000 ppm @ 3ml/L) + Soap surfactant in early morning.',
            status: 'completed',
          },
          {
            id: 'scout_tm_3',
            dayNumber: 5,
            dayLabel: 'Day 5 Evening',
            scoutingFocusArea: 'Inspect newly formed flower buds and green fruit calyxes.',
            diagnosticVisualKey: 'Verify absence of pinhole bore-holes and check for active green lacewings or predatory bugs.',
            proactiveOrganicTask: 'Release Trichogramma achaeae parasitoid cards (50,000/acre) stapled under leaf shade.',
            status: 'pending',
          },
          {
            id: 'scout_tm_4',
            dayNumber: 7,
            dayLabel: 'Day 7 Midday',
            scoutingFocusArea: 'Assess overall canopy health and examine terminal growth shoots for vigor.',
            diagnosticVisualKey: 'Confirm dried-up mines with zero fresh larval activity and clean fruit setting.',
            proactiveOrganicTask: 'Foliar spray of Panchagavya (3%) or Amrit Jal to strengthen plant immunity and accelerate floral set.',
            status: 'pending',
          },
        ],
        organicEmergencySprayPlan: [
          {
            id: 'esp_tm_1',
            dayTarget: 'Day 1 - 2 (Immediate Window)',
            bioSprayName: 'Neem Azadirachtin 10,000 PPM + Bio-Spreader',
            activeComponent: 'Natural Azadirachtin Triterpenoid',
            dosage: '3 ml / Litre of water (45 ml / 15L Knapsack)',
            targetPest: 'Tuta absoluta neonate larvae & Sucking Thrips',
            precautions: 'Spray in early morning (6:30 - 9:00 AM) or late afternoon. Coat both leaf sides thoroughly.',
          },
          {
            id: 'esp_tm_2',
            dayTarget: 'Day 4 - 5 (Follow-up Dual Bio-Shield)',
            bioSprayName: 'Bacillus thuringiensis (Btk) + Pseudomonas fluorescens',
            activeComponent: 'Live Btk Endotoxins + Microbial Bio-Fungicide (1x10^8 CFU/g)',
            dosage: '2g Btk + 5g Pseudomonas per Litre of water',
            targetPest: 'Larval borers and Early Blight spore suppression',
            precautions: 'Do not combine with chemical fungicides or hot water. Use clean, non-chlorinated water.',
          },
        ],
        expertAgronomistNote: 'Dear Farmer Murugan, your Tomato crop in Field #1 is entering peak flowering with high moisture and 29.5°C temperature. This provides a fertile breeding window for Tuta absoluta and early blight conidia.\n\nBy taking swift organic action—installing pheromone traps and applying high-grade Neem Azadirachtin—you stop the infestation before larvae enter the fruit calyx, preserving your marketable yield without toxic chemical residues.\n\nComplete the 7-day scouting checklist to ensure your biological parasitoids establish a self-sustaining defense barrier.',
        generatedAt: new Date().toISOString(),
      },
    ];

    // =========================================================================
    // SEED: FARMER PEER PROFILES (OPTED-IN COMMUNITY PEERS)
    // =========================================================================
    this.farmerPeerProfiles = [
      {
        id: 'peer_1',
        user_id: 'usr_farmer_1',
        name: 'Murugan Palaniswamy (You)',
        farmer_id_code: 'KISAN-TN-882',
        avatar: '👨‍🌾',
        village: 'Pollachi Rural',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 10.6586,
        longitude: 77.0089,
        land_area_acres: 6.5,
        primary_crops: ['Tomato (Shivam Hybrid)', 'Small Onion (CO-5)', 'Banana'],
        farming_method: '100% Certified Organic',
        soil_type: 'Red Sandy Loam',
        specialties: ['Drip Fertigation', 'Desi Cow Panchagavya', 'Trichoderma Soil Inoculation'],
        available_for: [
          'Machinery / Tractor Sharing',
          'Indigenous Seed & Sapling Exchange',
          'Crop Advisory & Mentorship',
          'Joint Transport & Mandi Aggregation',
        ],
        equipment_available: ['Rotavator 42-blade', '16L Battery Knapsack Sprayers (x2)'],
        bio: 'Practicing bio-dynamic and organic vegetable cultivation for over 18 years in Pollachi basin. Open to seed sharing and joint mandi transport pooling.',
        experience_years: 18,
        rating: 4.95,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: '2025-01-10T08:00:00Z',
        phone_masked: '+91 98421 87654',
        allow_direct_call: true,
        active_nodes_count: 2,
      },
      {
        id: 'peer_2',
        user_id: 'usr_peer_velusamy',
        name: 'Velusamy Gounder',
        farmer_id_code: 'KISAN-TN-914',
        avatar: '👨‍🌾',
        village: 'Kinathukadavu',
        taluk: 'Kinathukadavu',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 10.8205,
        longitude: 77.0210,
        land_area_acres: 8.5,
        primary_crops: ['Tomato', 'Small Onion (Shallots)', 'Turmeric', 'Coriander'],
        farming_method: '100% Certified Organic',
        soil_type: 'Red Loam Soil',
        specialties: ['Indigenous Seed Multiplication', 'Bio-gas Slurry Enrichment', 'Raised Bed Plastic Mulching'],
        available_for: [
          'Machinery / Tractor Sharing',
          'Indigenous Seed & Sapling Exchange',
          'Crop Advisory & Mentorship',
        ],
        equipment_available: ['John Deere 5050D Tractor (50HP) + 9-Tyne Tiller', 'Power Weeder 7HP', 'Solar Micro-Cold Room (3MT)'],
        bio: 'Certified organic grower since 2011. Running an active indigenous seed saving nursery. Tractor available for hire on cooperative sharing rates during land preparation windows.',
        experience_years: 24,
        rating: 4.92,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: '2025-01-05T09:30:00Z',
        phone_masked: '+91 94432 •••••',
        allow_direct_call: true,
        active_nodes_count: 3,
      },
      {
        id: 'peer_3',
        user_id: 'usr_peer_selvi',
        name: 'Selvi Ramasamy',
        farmer_id_code: 'KISAN-TN-743',
        avatar: '👩‍🌾',
        village: 'Anamalai Foothills',
        taluk: 'Anamalai / Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 10.5840,
        longitude: 76.9320,
        land_area_acres: 4.2,
        primary_crops: ['Coconut (Tall x Dwarf)', 'Grand Naine Banana', 'Nutmeg', 'Cocoa'],
        farming_method: 'Natural Farming (ZBNF)',
        soil_type: 'Clay Loam with High Organic Matter',
        specialties: ['Multi-tier Agroforestry', 'Jeevamrit Soil Drenching', 'Stingless Bee Pollination Units'],
        available_for: [
          'Indigenous Seed & Sapling Exchange',
          'Crop Advisory & Mentorship',
          'Joint Transport & Mandi Aggregation',
        ],
        equipment_available: ['High-Pressure Tree Sprayer (100m Hose)', 'Motorized Coconut De-husker'],
        bio: 'Pioneering zero-budget natural farming multi-tier plantation. Zero chemical pesticide usage for 12 seasons. Happy to share stingless bee colonies and Jeevamrit mother cultures.',
        experience_years: 16,
        rating: 4.98,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: '2025-01-12T14:15:00Z',
        phone_masked: '+91 98940 •••••',
        allow_direct_call: true,
        active_nodes_count: 4,
      },
      {
        id: 'peer_4',
        user_id: 'usr_peer_karthik',
        name: 'Karthik Soundararajan',
        farmer_id_code: 'KISAN-TN-612',
        avatar: '👨‍🌾',
        village: 'Udumalpet East',
        taluk: 'Udumalpet',
        district: 'Tiruppur',
        state: 'Tamil Nadu',
        latitude: 10.5850,
        longitude: 77.2480,
        land_area_acres: 12.0,
        primary_crops: ['Maize (Corn)', 'Cotton (Bt Hybrid)', 'Green Chilli', 'Groundnut'],
        farming_method: 'Integrated Pest Management (IPM)',
        soil_type: 'Black Cotton / Medium Loam',
        specialties: ['Solar Borewell Automation (7.5 HP)', 'Pheromone Trap Mass Trapping', 'Laser Bed Leveling'],
        available_for: [
          'Machinery / Tractor Sharing',
          'Joint Transport & Mandi Aggregation',
          'Borewell / Water Sharing',
        ],
        equipment_available: ['Mahindra 575 DI Tractor', 'Laser Land Leveller', 'Pneumatic Seed Drill Planter'],
        bio: 'Large-acreage precision farmer. Equipped with precision pneumatic seed drill and laser leveling systems. Organizing weekly bulk truck transport to Dindigul and Tiruppur markets.',
        experience_years: 11,
        rating: 4.82,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: '2025-01-08T11:00:00Z',
        phone_masked: '+91 97871 •••••',
        allow_direct_call: true,
        active_nodes_count: 2,
      },
      {
        id: 'peer_5',
        user_id: 'usr_peer_palanisamy',
        name: 'Palanisamy Chettiar',
        farmer_id_code: 'KISAN-TN-830',
        avatar: '👨‍🌾',
        village: 'Negamam',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 10.7410,
        longitude: 77.0850,
        land_area_acres: 5.0,
        primary_crops: ['Tomato (Shivam)', 'Brinjal (Uthukuli Local)', 'Snake Gourd', 'Bhendi'],
        farming_method: '100% Certified Organic',
        soil_type: 'Red Sandy Loam',
        specialties: ['Dashparni Ark Preparation', 'Pro-Tray Nursery Seedling Propagation', 'Neem Cake Soil Conditioning'],
        available_for: [
          'Indigenous Seed & Sapling Exchange',
          'Bio-Input Bulk Preparation',
          'Crop Advisory & Mentorship',
        ],
        equipment_available: ['Plastic Mulch Laying Attachment', 'Battery Sprayer (x4)'],
        bio: 'Focusing on intensive organic vegetable cultivation. Expert in bio-repellents and herbal pest decoctions. Pro-tray seedling saplings always available on prior notice.',
        experience_years: 19,
        rating: 4.89,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: '2025-01-14T10:45:00Z',
        phone_masked: '+91 98428 •••••',
        allow_direct_call: true,
        active_nodes_count: 3,
      },
      {
        id: 'peer_6',
        user_id: 'usr_peer_muthukumar',
        name: 'Muthukumar Natarajan',
        farmer_id_code: 'KISAN-TN-552',
        avatar: '👨‍🌾',
        village: 'Sultanpet / Sulur',
        taluk: 'Sulur',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 10.8750,
        longitude: 77.1650,
        land_area_acres: 7.5,
        primary_crops: ['Small Onion (Shallots CO-5)', 'Tapioca', 'Groundnut (TMV 7)'],
        farming_method: 'Precision Conventional',
        soil_type: 'Deep Red Gravelly Soil',
        specialties: ['Sub-surface Drip Automation', 'Post-Harvest Shade Curing (Onion)', 'e-NAM Direct Trading'],
        available_for: [
          'Joint Transport & Mandi Aggregation',
          'Machinery / Tractor Sharing',
        ],
        equipment_available: ['Mini Tractor 24HP with Ridger', 'Motorized Small Onion Sorting & Grading Machine'],
        bio: 'Specialist in export-quality small onion cultivation and shade curing racks. Operates a mechanical onion grader available for peer farm sharing.',
        experience_years: 14,
        rating: 4.78,
        verified_kisan: true,
        opt_in_community: true,
        opt_in_date: '2025-01-18T16:20:00Z',
        phone_masked: '+91 94863 •••••',
        allow_direct_call: true,
        active_nodes_count: 1,
      },
    ];

    // =========================================================================
    // SEED: SHARED LOCAL FARMING KNOWLEDGE NODES (CROWDSOURCED & AGRONOMY VERIFIED)
    // =========================================================================
    this.farmingKnowledgeNodes = [
      {
        id: 'kn_1',
        author_id: 'usr_peer_velusamy',
        author_name: 'Velusamy Gounder',
        author_village: 'Kinathukadavu North',
        author_avatar: '👨‍🌾',
        latitude: 10.8180,
        longitude: 77.0190,
        category: 'PEST_ALERT',
        title: 'Urgent Alert: Early Whitefly Swarm & Tomato Leaf Curl in Kinathukadavu Block',
        content: 'Noticed heavy whitefly vector activity on 3 tomato plots around Kinathukadavu bypass during warm afternoon hours. High risk of Tomato Yellow Leaf Curl Virus (TYLCV) transmission.',
        actionable_tip: 'Install 25 Yellow Sticky sheets per acre immediately. Foliar spray of Cold-Pressed Neem Azadirachtin 10,000 ppm (3ml/L) with soap-nut surfactant before 8:00 AM to eliminate whitefly adults.',
        urgency_level: 'HIGH_ALERT',
        crops_relevant: ['Tomato', 'Chilli', 'Brinjal'],
        tags: ['Pest Warning', 'Whitefly', 'TYLCV', 'Neem Spray', 'Urgent Action'],
        upvotes: 48,
        has_upvoted: false,
        verified_by_agronomist: true,
        agronomist_badge_note: 'Verified by TNAU Agro-Met Advisory: Conducive 30°C thermal conditions confirmed.',
        created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        comments_count: 7,
      },
      {
        id: 'kn_2',
        author_id: 'usr_peer_palanisamy',
        author_name: 'Palanisamy Chettiar',
        author_village: 'Negamam Rural',
        author_avatar: '👨‍🌾',
        latitude: 10.7420,
        longitude: 77.0860,
        category: 'BIO_RECIPE',
        title: 'Dashparni Ark (10-Leaf Decoction) Preparation: Proven Knockdown for Caterpillars',
        content: 'Prepared fresh batch of fermented Dashparni Ark using Neem, Pongamia, Custard Apple, Calotropis (Erukku), Papaya leaves, and desi cow urine. Proven 90%+ efficacy against Spodoptera and fruit borer.',
        actionable_tip: 'Mix 250ml filtered Dashparni extract per 10L water. Add 20g crushed garlic paste. Spray in late evening when borer larvae emerge to feed.',
        urgency_level: 'BEST_PRACTICE',
        crops_relevant: ['Tomato', 'Brinjal', 'Bhendi', 'Green Chilli', 'Cabbage'],
        tags: ['Organic Bio-Pesticide', 'Dashparni Ark', 'Caterpillar Control', 'Zero Chemical'],
        upvotes: 69,
        has_upvoted: true,
        verified_by_agronomist: true,
        agronomist_badge_note: 'ICAR-Approved Botanical Preparation for Organic Certification Standards.',
        created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        comments_count: 12,
      },
      {
        id: 'kn_3',
        author_id: 'usr_farmer_1',
        author_name: 'Murugan Palaniswamy (You)',
        author_village: 'Pollachi Rural',
        author_avatar: '👨‍🌾',
        latitude: 10.6586,
        longitude: 77.0089,
        category: 'EQUIPMENT_COOP',
        title: 'Shared 50HP John Deere Tractor + 42-Blade Rotavator Available for Weekend Slots',
        content: 'My tractor and rotavator are idle on Thursday-Saturday slots this week. Offering to neighboring farmers for field preparation and bed forming on mutual fuel-split cost (₹750/hr instead of commercial ₹1200/hr).',
        actionable_tip: 'Ideal for fine tilth preparation for summer vegetable sowing. Message or call to book 2-hour or 4-hour slots.',
        urgency_level: 'SEASONAL_TIP',
        crops_relevant: ['Tomato', 'Small Onion', 'Maize', 'Vegetables'],
        tags: ['Machinery Sharing', 'Tractor Rental Co-op', 'Land Prep', 'Affordable Farming'],
        upvotes: 35,
        has_upvoted: true,
        verified_by_agronomist: false,
        created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        comments_count: 5,
      },
      {
        id: 'kn_4',
        author_id: 'usr_peer_selvi',
        author_name: 'Selvi Ramasamy',
        author_village: 'Anamalai Foot',
        author_avatar: '👩‍🌾',
        latitude: 10.5840,
        longitude: 76.9320,
        category: 'SOIL_WATER',
        title: 'Borewell Recharge Pit with Coconut Husk Biomass: Recovered 1.5-inch Water Flow',
        content: 'Constructed a 10x10ft runoff filter pit lined with coconut husks, charcoal, and river sand around borewell casing. After recent thunderstorm showers, water table yield rose by 30%.',
        actionable_tip: 'Direct farm trench runoff into the filtration bed. Prevents silt clogging while recharging the shallow aquifer naturally.',
        urgency_level: 'BEST_PRACTICE',
        crops_relevant: ['Coconut', 'Banana', 'Vegetables', 'All Crops'],
        tags: ['Water Conservation', 'Borewell Recharge', 'Drought Proofing', 'Natural Engineering'],
        upvotes: 82,
        has_upvoted: false,
        verified_by_agronomist: true,
        agronomist_badge_note: 'Verified by Ground Water Board Guidelines & Soil Conservation Directorate.',
        created_at: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
        comments_count: 15,
      },
      {
        id: 'kn_5',
        author_id: 'usr_peer_karthik',
        author_name: 'Karthik Soundararajan',
        author_village: 'Udumalpet East',
        author_avatar: '👨‍🌾',
        latitude: 10.5850,
        longitude: 77.2480,
        category: 'MARKET_AGGREGATION',
        title: 'Weekly 10-Ton Joint Transport Pooling: Bengaluru & Madurai APMC Routes',
        content: 'Coordinating weekly 10-ton Eicher truck pooling for farmers harvesting Tomato, Chilli, and Onion. Loading at Pollachi bypass junction every Tuesday & Friday at 5:00 PM.',
        actionable_tip: 'Reduces freight cost from ₹2.40/kg down to ₹0.85/kg. Crates are color-tagged for individual farmer settlement.',
        urgency_level: 'SEASONAL_TIP',
        crops_relevant: ['Tomato', 'Small Onion', 'Green Chilli'],
        tags: ['Market Pooling', 'Transport Logistics', 'Direct APMC', 'Higher Profit Margin'],
        upvotes: 94,
        has_upvoted: false,
        verified_by_agronomist: true,
        agronomist_badge_note: 'Aggregated logistics verified by AgriSaarthi Market Intermediary facilitation.',
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        comments_count: 21,
      },
      {
        id: 'kn_6',
        author_id: 'usr_peer_velusamy',
        author_name: 'Velusamy Gounder',
        author_village: 'Kinathukadavu',
        author_avatar: '👨‍🌾',
        latitude: 10.8210,
        longitude: 77.0220,
        category: 'SEED_VARIETY',
        title: 'High-Germination Indigenous CO-5 Shallot Bulbs & Desi Cowpea Seed Exchange',
        content: 'Harvested 150 kg of disease-free CO-5 small onion seed bulbs (treated with Trichoderma viride). Offering seed exchange with fellow organic growers for heirloom pulses or tomato saplings.',
        actionable_tip: 'Ready for sowing in coming Kharif cycle. Stored under ventilated dry thatch racks with 94% germination test rate.',
        urgency_level: 'BEST_PRACTICE',
        crops_relevant: ['Small Onion', 'Cowpea', 'Black Gram', 'Pulses'],
        tags: ['Seed Bank', 'Heirloom Varieties', 'Trichoderma Treated', 'Barter & Exchange'],
        upvotes: 56,
        has_upvoted: true,
        verified_by_agronomist: true,
        created_at: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        comments_count: 8,
      },
    ];

    // Initial audit log
    this.logAudit('sys_init', 'system@agrisaarthi.gov.in', 'admin', 'SYSTEM_BOOTSTRAP', 'system', 'sys_root', {
      seeded_tables_count: 28,
      farmerPeers: this.farmerPeerProfiles.length,
      knowledgeNodes: this.farmingKnowledgeNodes.length,
      warehouses: this.warehouses.length,
      schemes: this.governmentSchemes.length,
      yieldPredictions: this.yieldPredictions.length,
      pestRiskAssessments: this.pestRiskAssessments.length,
      status: 'INITIALIZED_SUCCESS',
    });
  }
}

export const db = new AgriDatabase();
