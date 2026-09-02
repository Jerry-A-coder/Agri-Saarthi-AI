// Centralized API Client for AgriSaarthi AI Platform

import {
  User,
  FarmerProfile,
  ProviderProfile,
  Warehouse,
  WarehouseBooking,
  PlantScan,
  SoilLab,
  SoilTest,
  GovernmentScheme,
  SchemeApplication,
  MarketPrice,
  BuyerListing,
  CropListing,
  AuditLog,
  SystemHealthStats,
  StorageProfitCalculation,
  CropRotationPlan,
  Farm,
  Field,
  NotificationItem,
  AdminInquiry,
  DemandCropSuggestion,
  CropHarvestEstimate,
  RealTimeWeatherData,
  CropRotationAdvisorResponse,
  SoilNutrientProfile,
  SeasonalClimateParameters,
  YieldPredictionInput,
  YieldPredictionResult,
  PestRiskAssessmentInput,
  PestRiskAssessmentResult,
  FarmerPeerProfile,
  FarmingKnowledgeNode,
  CommunityOptInSettings,
  PeerMessagePayload,
  MultiTurnChatRequest,
  MultiTurnChatResponse,
  PriceAlertRule,
  TriggeredPriceAlert,
  CropGrowthLog,
} from '../types';
import { swService } from './swService';

const BASE_URL = '/api';

export const api = {
  // System & Health
  async getSystemHealth(): Promise<SystemHealthStats> {
    const res = await fetch(`${BASE_URL}/admin/system-health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Auth / Current User
  async getCurrentUser(role: string = 'farmer'): Promise<{
    user: User;
    farmerProfile: FarmerProfile;
    providerProfile: ProviderProfile;
  }> {
    const res = await fetch(`${BASE_URL}/users/current?role=${role}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Warehouses
  async getWarehouses(params: {
    lat?: number;
    lng?: number;
    radius?: number;
    crop?: string;
    quantity?: number;
    storageType?: string;
    maxPrice?: number;
    sort?: string;
  } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.lat) query.set('lat', params.lat.toString());
    if (params.lng) query.set('lng', params.lng.toString());
    if (params.radius) query.set('radius', params.radius.toString());
    if (params.crop) query.set('crop', params.crop);
    if (params.quantity) query.set('quantity', params.quantity.toString());
    if (params.storageType) query.set('storageType', params.storageType);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params.sort) query.set('sort', params.sort);

    const res = await fetch(`${BASE_URL}/warehouses?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch warehouses');
    return res.json();
  },

  async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
    const res = await fetch(`${BASE_URL}/warehouses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create warehouse');
    return res.json();
  },

  async calculateStorageProfit(data: {
    cropName: string;
    quantityKg: number;
    currentMandiPricePerKg: number;
    projectedFuturePricePerKg: number;
    storageDurationDays: number;
    storageRatePerKgDay: number;
    transportCostInr: number;
  }): Promise<StorageProfitCalculation> {
    const res = await fetch(`${BASE_URL}/warehouses/profit-calculator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to calculate storage profit');
    return res.json();
  },

  // Bookings
  async getBookings(params: { farmerId?: string; providerId?: string } = {}): Promise<WarehouseBooking[]> {
    const query = new URLSearchParams();
    if (params.farmerId) query.set('farmerId', params.farmerId);
    if (params.providerId) query.set('providerId', params.providerId);

    const res = await fetch(`${BASE_URL}/bookings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async createBooking(bookingData: {
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
  }): Promise<WarehouseBooking> {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit booking');
    }
    return res.json();
  },

  async updateBookingStatus(
    bookingId: string,
    status: WarehouseBooking['status'],
    providerNotes?: string,
    userId?: string
  ): Promise<WarehouseBooking> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, providerNotes, userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update booking status');
    }
    return res.json();
  },

  // Plant Scanner
  async getPlantScans(farmerId?: string): Promise<PlantScan[]> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const res = await fetch(`${BASE_URL}/plant-scans${query}`);
    if (!res.ok) throw new Error('Failed to fetch plant scans');
    return res.json();
  },

  async analyzePlant(data: {
    imageBase64?: string;
    imageUrl?: string;
    cropName: string;
    plantPart: string;
    farmerId?: string;
    language?: string;
    farmerNotes?: string;
    preferredModel?: 'gemini-3.7-flash' | 'ensemble-heuristic';
  }): Promise<PlantScan> {
    const res = await fetch(`${BASE_URL}/plant-scans/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to analyze plant image');
    }
    return res.json();
  },

  async submitScanFeedback(scanId: string, feedback: 'yes' | 'no' | 'not_sure', correctionNotes?: string) {
    const res = await fetch(`${BASE_URL}/plant-scans/${scanId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, correctionNotes }),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  // Soil Labs & Tests
  async getSoilLabs(): Promise<SoilLab[]> {
    try {
      const res = await fetch(`${BASE_URL}/soil-labs`);
      if (!res.ok) throw new Error('Failed to fetch soil labs');
      const data = await res.json();
      swService.saveOfflineBackup('soil-labs', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching soil labs from offline cache fallback');
      const cached = swService.getOfflineBackup<SoilLab[]>('soil-labs');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async getSoilTests(farmerId?: string): Promise<SoilTest[]> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const cacheKey = `soil-tests-${farmerId || 'all'}`;
    try {
      const res = await fetch(`${BASE_URL}/soil-tests${query}`);
      if (!res.ok) throw new Error('Failed to fetch soil tests');
      const data = await res.json();
      swService.saveOfflineBackup(cacheKey, data);
      swService.saveOfflineBackup('soil-tests', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching soil tests from offline cache fallback');
      const cached =
        swService.getOfflineBackup<SoilTest[]>(cacheKey) ||
        swService.getOfflineBackup<SoilTest[]>('soil-tests');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async requestSoilTest(data: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/soil-tests/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit soil test request');
    return res.json();
  },

  // Farm & Crops
  async getFarms(farmerId?: string): Promise<Farm[]> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const cacheKey = `farms-${farmerId || 'all'}`;
    try {
      const res = await fetch(`${BASE_URL}/farms${query}`);
      if (!res.ok) throw new Error('Failed to fetch farms');
      const data = await res.json();
      swService.saveOfflineBackup(cacheKey, data);
      swService.saveOfflineBackup('farms', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching farms from offline cache fallback');
      const cached =
        swService.getOfflineBackup<Farm[]>(cacheKey) ||
        swService.getOfflineBackup<Farm[]>('farms');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async getFields(): Promise<Field[]> {
    const res = await fetch(`${BASE_URL}/fields`);
    if (!res.ok) throw new Error('Failed to fetch fields');
    return res.json();
  },

  async getCropRotations(): Promise<CropRotationPlan[]> {
    const res = await fetch(`${BASE_URL}/crop-rotations`);
    if (!res.ok) throw new Error('Failed to fetch crop rotations');
    return res.json();
  },

  async getCropRotationAdvisory(params: {
    fieldId?: string;
    farmerId?: string;
    soilType?: string;
    ph?: number;
    nitrogenKgHa?: number;
    phosphorusKgHa?: number;
    potassiumKgHa?: number;
    organicCarbonPercent?: number;
    currentCrop?: string;
    targetSeason?: string;
    expectedRainfall?: string;
    waterSource?: string;
    irrigationCapacity?: string;
    priorityFocus?: string;
  } = {}): Promise<CropRotationAdvisorResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val));
      }
    });
    const res = await fetch(`${BASE_URL}/crop-rotations/advisor?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch crop rotation advisory');
    return res.json();
  },

  async generateCropRotationAIAdvisor(body: {
    soil: Partial<SoilNutrientProfile>;
    seasonal: Partial<SeasonalClimateParameters>;
    fieldAreaAcres?: number;
    recentScanFindings?: string;
  }): Promise<{ source: string; data: CropRotationAdvisorResponse }> {
    const res = await fetch(`${BASE_URL}/crop-rotations/advisor/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to generate AI crop rotation advisory');
    return res.json();
  },

  async saveCropRotationPlan(planData: {
    fieldId?: string;
    farmerId?: string;
    planName?: string;
    currentCrop?: string;
    soilTypeTarget?: string;
    recommendedSequence?: any[];
    rationale?: string;
  }): Promise<CropRotationPlan> {
    const res = await fetch(`${BASE_URL}/crop-rotations/save-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    if (!res.ok) throw new Error('Failed to save crop rotation plan');
    return res.json();
  },

  async generateCropRotationAI(params: {
    soilType: string;
    currentCrop: string;
    landAreaAcres?: number;
    waterAvailability?: string;
  }): Promise<CropRotationPlan> {
    const res = await fetch(`${BASE_URL}/ai/crop-rotation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate AI crop rotation plan');
    return res.json();
  },

  // Schemes
  async getSchemes(): Promise<GovernmentScheme[]> {
    try {
      const res = await fetch(`${BASE_URL}/schemes`);
      if (!res.ok) throw new Error('Failed to fetch schemes');
      const data = await res.json();
      swService.saveOfflineBackup('schemes', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching schemes from offline cache fallback');
      const cached = swService.getOfflineBackup<GovernmentScheme[]>('schemes');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async getSchemeApplications(farmerId?: string): Promise<SchemeApplication[]> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const cacheKey = `scheme-applications-${farmerId || 'all'}`;
    try {
      const res = await fetch(`${BASE_URL}/scheme-applications${query}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      swService.saveOfflineBackup(cacheKey, data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching scheme applications from offline cache fallback');
      const cached = swService.getOfflineBackup<SchemeApplication[]>(cacheKey);
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async submitSchemeApplication(data: any): Promise<SchemeApplication> {
    const res = await fetch(`${BASE_URL}/scheme-applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit scheme application');
    return res.json();
  },

  // Market, Live Rates & Price Alerts
  async getMarketPrices(params?: { district?: string; commodity?: string }): Promise<MarketPrice[]> {
    const queryParts: string[] = [];
    if (params?.district && params.district !== 'ALL') queryParts.push(`district=${encodeURIComponent(params.district)}`);
    if (params?.commodity && params.commodity !== 'ALL') queryParts.push(`commodity=${encodeURIComponent(params.commodity)}`);
    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    try {
      const res = await fetch(`${BASE_URL}/markets/prices${qs}`);
      if (!res.ok) throw new Error('Failed to fetch market prices');
      const data = await res.json();
      swService.saveOfflineBackup('market-prices', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching market prices from offline cache fallback');
      const cached = swService.getOfflineBackup<MarketPrice[]>('market-prices');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async fetchLiveMarketRates(params?: { fluctuateRandomly?: boolean }): Promise<{
    success: boolean;
    timestamp: string;
    rates: MarketPrice[];
    newlyTriggeredAlerts: TriggeredPriceAlert[];
    triggeredCount: number;
  }> {
    const res = await fetch(`${BASE_URL}/markets/rates/fetch-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error('Failed to fetch live market rates');
    return res.json();
  },

  async getPriceAlertRules(userId: string = 'usr_farmer_1'): Promise<PriceAlertRule[]> {
    try {
      const res = await fetch(`${BASE_URL}/markets/alerts/rules?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch price alert rules');
      const data = await res.json();
      swService.saveOfflineBackup('price-alert-rules', data);
      return data;
    } catch (err) {
      const cached = swService.getOfflineBackup<PriceAlertRule[]>('price-alert-rules');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async createPriceAlertRule(rule: Partial<PriceAlertRule>): Promise<{ success: boolean; rule: PriceAlertRule }> {
    const res = await fetch(`${BASE_URL}/markets/alerts/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    if (!res.ok) throw new Error('Failed to create price alert rule');
    return res.json();
  },

  async updatePriceAlertRule(
    id: string,
    updates: Partial<PriceAlertRule>
  ): Promise<{ success: boolean; rule?: PriceAlertRule }> {
    const res = await fetch(`${BASE_URL}/markets/alerts/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update price alert rule');
    return res.json();
  },

  async deletePriceAlertRule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/markets/alerts/rules/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete price alert rule');
    return res.json();
  },

  async getTriggeredPriceAlerts(userId: string = 'usr_farmer_1'): Promise<TriggeredPriceAlert[]> {
    try {
      const res = await fetch(`${BASE_URL}/markets/alerts/history?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch alert history');
      const data = await res.json();
      swService.saveOfflineBackup('price-alerts-history', data);
      return data;
    } catch (err) {
      const cached = swService.getOfflineBackup<TriggeredPriceAlert[]>('price-alerts-history');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async markTriggeredAlertRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/markets/alerts/history/${id}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark alert as read');
    return res.json();
  },

  async checkPriceAlertsNow(params?: {
    userId?: string;
    simulatedUpdates?: any[];
  }): Promise<{ success: boolean; triggeredCount: number; alerts: TriggeredPriceAlert[]; updatedPrices: MarketPrice[] }> {
    const res = await fetch(`${BASE_URL}/markets/alerts/check-now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error('Failed to check price alerts');
    return res.json();
  },

  async getBuyers(): Promise<BuyerListing[]> {
    try {
      const res = await fetch(`${BASE_URL}/buyers`);
      if (!res.ok) throw new Error('Failed to fetch buyers');
      const data = await res.json();
      swService.saveOfflineBackup('buyers', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching buyers from offline cache fallback');
      const cached = swService.getOfflineBackup<BuyerListing[]>('buyers');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async getCropListings(): Promise<CropListing[]> {
    try {
      const res = await fetch(`${BASE_URL}/crop-listings`);
      if (!res.ok) throw new Error('Failed to fetch crop listings');
      const data = await res.json();
      swService.saveOfflineBackup('crop-listings', data);
      return data;
    } catch (err) {
      console.warn('[API] Fetching crop listings from offline cache fallback');
      const cached = swService.getOfflineBackup<CropListing[]>('crop-listings');
      if (cached && cached.data) return cached.data;
      throw err;
    }
  },

  async createCropListing(data: any): Promise<CropListing> {
    const res = await fetch(`${BASE_URL}/crop-listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create crop listing');
    return res.json();
  },

  // AI Chat & Multi-Turn Advisor
  async sendAIChat(message: string, language: string, farmerContext?: any): Promise<string> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, farmerContext }),
    });
    if (!res.ok) throw new Error('Failed to contact AI advisor');
    const data = await res.json();
    return data.reply || data;
  },

  async sendMultiTurnAIChat(request: MultiTurnChatRequest): Promise<MultiTurnChatResponse> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to contact AI multi-turn advisor');
    return res.json();
  },

  async getChatRoles(): Promise<Array<{
    id: string;
    name: string;
    title: string;
    defaultTier: string;
    recommendedModel: string;
    defaultSuggestions: string[];
  }>> {
    const res = await fetch(`${BASE_URL}/ai/chat/roles`);
    if (!res.ok) throw new Error('Failed to fetch chat roles');
    return res.json();
  },

  // Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const res = await fetch(`${BASE_URL}/notifications?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });
  },

  // Admin Table Browser
  async getAdminTableData(
    tableName: string,
    params: {
      search?: string;
      page?: number;
      limit?: number;
      sortKey?: string;
      sortDir?: 'asc' | 'desc';
      filterDemo?: boolean;
    } = {}
  ): Promise<{
    tableName: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: any[];
  }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.sortKey) query.set('sortKey', params.sortKey);
    if (params.sortDir) query.set('sortDir', params.sortDir);
    if (params.filterDemo) query.set('filterDemo', 'true');

    const res = await fetch(`${BASE_URL}/admin/tables/${tableName}?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to load table ${tableName}`);
    return res.json();
  },

  async deleteAdminRecord(tableName: string, id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/tables/${tableName}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete record ${id}`);
  },

  // Admin Inquiries & Helpdesk
  async getInquiries(params?: { senderId?: string; senderRole?: string; status?: string }): Promise<AdminInquiry[]> {
    const query = new URLSearchParams();
    if (params?.senderId) query.set('senderId', params.senderId);
    if (params?.senderRole) query.set('senderRole', params.senderRole);
    if (params?.status) query.set('status', params.status);
    const res = await fetch(`${BASE_URL}/inquiries?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
  },

  async getInquiryById(id: string): Promise<AdminInquiry> {
    const res = await fetch(`${BASE_URL}/inquiries/${id}`);
    if (!res.ok) throw new Error('Failed to fetch inquiry');
    return res.json();
  },

  async createInquiry(data: {
    senderId: string;
    senderName: string;
    senderEmail?: string;
    senderPhone?: string;
    senderRole: 'farmer' | 'provider';
    subject: string;
    category: AdminInquiry['category'];
    priority?: AdminInquiry['priority'];
    initialMessage: string;
  }): Promise<AdminInquiry> {
    const res = await fetch(`${BASE_URL}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit inquiry');
    }
    return res.json();
  },

  async replyToInquiry(
    inquiryId: string,
    data: {
      senderId: string;
      senderName: string;
      senderRole: 'farmer' | 'provider' | 'admin';
      content: string;
      visualPayload?: any;
    }
  ): Promise<AdminInquiry> {
    const res = await fetch(`${BASE_URL}/inquiries/${inquiryId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send reply');
    }
    return res.json();
  },

  async updateInquiryStatus(inquiryId: string, status: AdminInquiry['status'], adminUserId?: string): Promise<AdminInquiry> {
    const res = await fetch(`${BASE_URL}/inquiries/${inquiryId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminUserId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update status');
    }
    return res.json();
  },

  async updateInquiry(
    inquiryId: string,
    data: { status?: AdminInquiry['status']; admin_response?: string; adminUserId?: string }
  ): Promise<AdminInquiry> {
    if (data.admin_response) {
      await this.replyToInquiry(inquiryId, {
        senderId: data.adminUserId || 'usr_admin',
        senderName: 'Agricultural Officer Desk',
        senderRole: 'admin',
        content: data.admin_response,
      });
    }
    if (data.status) {
      return this.updateInquiryStatus(inquiryId, data.status, data.adminUserId);
    }
    const res = await fetch(`${BASE_URL}/inquiries/${inquiryId}`);
    return res.json();
  },


  // Demand Crops & Harvest Estimator
  async getDemandCrops(category?: string): Promise<DemandCropSuggestion[]> {
    const query = category ? `?category=${category}` : '';
    const res = await fetch(`${BASE_URL}/demand-crops${query}`);
    if (!res.ok) throw new Error('Failed to fetch demand crops');
    return res.json();
  },

  async getHarvestEstimate(cropName: string, sowingDate: string, variety?: string): Promise<CropHarvestEstimate> {
    const query = new URLSearchParams({ cropName, sowingDate });
    if (variety) query.set('variety', variety);
    const res = await fetch(`${BASE_URL}/harvest-estimate?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch harvest estimate');
    return res.json();
  },

  // Crop Growth Tracker & Harvest Cycle
  async getCropGrowthLogs(userId?: string): Promise<CropGrowthLog[]> {
    const query = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${BASE_URL}/crop-tracker/logs${query}`);
    if (!res.ok) throw new Error('Failed to fetch crop growth logs');
    return res.json();
  },

  async createCropGrowthLog(data: Partial<CropGrowthLog>): Promise<CropGrowthLog> {
    const res = await fetch(`${BASE_URL}/crop-tracker/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log crop planting date');
    return res.json();
  },

  async updateCropGrowthLog(id: string, data: Partial<CropGrowthLog>): Promise<CropGrowthLog> {
    const res = await fetch(`${BASE_URL}/crop-tracker/logs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update crop growth log');
    return res.json();
  },

  async deleteCropGrowthLog(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/crop-tracker/logs/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete crop growth log');
    return res.json();
  },

  async toggleCropGrowthTask(id: string, stageId: string, taskId: string, completed?: boolean): Promise<CropGrowthLog> {
    const res = await fetch(`${BASE_URL}/crop-tracker/logs/${id}/toggle-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId, taskId, completed }),
    });
    if (!res.ok) throw new Error('Failed to toggle growth stage task');
    return res.json();
  },

  async getCropGrowthProfiles(): Promise<Record<string, any>> {
    const res = await fetch(`${BASE_URL}/crop-tracker/profiles`);
    if (!res.ok) throw new Error('Failed to fetch crop growth profiles');
    return res.json();
  },


  // Real-Time Weather & Planting Suggestions
  async getRealTimeWeather(lat?: number, lng?: number, locationName?: string): Promise<RealTimeWeatherData> {
    const query = new URLSearchParams();
    if (lat !== undefined) query.set('lat', lat.toString());
    if (lng !== undefined) query.set('lng', lng.toString());
    if (locationName) query.set('locationName', locationName);
    const res = await fetch(`${BASE_URL}/weather?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch real-time weather and planting data');
    return res.json();
  },

  // 60-Day Crop Growth & Yield Prediction
  async predictCropYield(input: YieldPredictionInput): Promise<YieldPredictionResult> {
    const res = await fetch(`${BASE_URL}/ai/predict-yield`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to generate AI crop yield forecast');
    return res.json();
  },

  async getYieldPredictions(farmerId?: string): Promise<YieldPredictionResult[]> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const res = await fetch(`${BASE_URL}/yield-predictions${query}`);
    if (!res.ok) throw new Error('Failed to fetch yield predictions');
    return res.json();
  },

  async saveYieldPrediction(prediction: Partial<YieldPredictionResult>): Promise<YieldPredictionResult> {
    const res = await fetch(`${BASE_URL}/yield-predictions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    });
    if (!res.ok) throw new Error('Failed to save yield prediction');
    return res.json();
  },

  // Pest & Disease Risk Prediction and Organic Management
  async predictPestRisk(input: PestRiskAssessmentInput): Promise<PestRiskAssessmentResult> {
    const res = await fetch(`${BASE_URL}/ai/predict-pest-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to analyze pest and disease risks');
    return res.json();
  },

  async getPestRisks(farmerId?: string): Promise<PestRiskAssessmentResult[]> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const res = await fetch(`${BASE_URL}/pest-risks${query}`);
    if (!res.ok) throw new Error('Failed to fetch pest risk assessments');
    return res.json();
  },

  async savePestRisk(assessment: Partial<PestRiskAssessmentResult>): Promise<PestRiskAssessmentResult> {
    const res = await fetch(`${BASE_URL}/pest-risks/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) throw new Error('Failed to save pest risk assessment');
    return res.json();
  },

  async togglePestChecklistTask(assessmentId: string, taskId: string, status?: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/pest-risks/${assessmentId}/checklist/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update scouting checklist task');
    return res.json();
  },

  // Farmer Community & Map Layer
  async getNearbyPeers(params: {
    lat?: number;
    lng?: number;
    radius?: number;
    crop?: string;
    method?: string;
    collaboration?: string;
    hasEquipment?: boolean;
    search?: string;
  } = {}): Promise<FarmerPeerProfile[]> {
    const query = new URLSearchParams();
    if (params.lat) query.set('lat', params.lat.toString());
    if (params.lng) query.set('lng', params.lng.toString());
    if (params.radius) query.set('radius', params.radius.toString());
    if (params.crop) query.set('crop', params.crop);
    if (params.method) query.set('method', params.method);
    if (params.collaboration) query.set('collaboration', params.collaboration);
    if (params.hasEquipment) query.set('hasEquipment', 'true');
    if (params.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/community/peers?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch nearby farmer peers');
    return res.json();
  },

  async getKnowledgeNodes(params: {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    crop?: string;
    urgency?: string;
    search?: string;
  } = {}): Promise<FarmingKnowledgeNode[]> {
    const query = new URLSearchParams();
    if (params.lat) query.set('lat', params.lat.toString());
    if (params.lng) query.set('lng', params.lng.toString());
    if (params.radius) query.set('radius', params.radius.toString());
    if (params.category) query.set('category', params.category);
    if (params.crop) query.set('crop', params.crop);
    if (params.urgency) query.set('urgency', params.urgency);
    if (params.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/community/knowledge-nodes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch farming knowledge nodes');
    return res.json();
  },

  async createKnowledgeNode(data: Partial<FarmingKnowledgeNode>): Promise<FarmingKnowledgeNode> {
    const res = await fetch(`${BASE_URL}/community/knowledge-nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create farming knowledge node');
    return res.json();
  },

  async upvoteKnowledgeNode(nodeId: string, farmerId?: string): Promise<{ success: boolean; upvotes: number; has_upvoted: boolean }> {
    const res = await fetch(`${BASE_URL}/community/knowledge-nodes/${nodeId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId }),
    });
    if (!res.ok) throw new Error('Failed to upvote knowledge node');
    return res.json();
  },

  async getCommunityOptInSettings(farmerId?: string): Promise<CommunityOptInSettings> {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const res = await fetch(`${BASE_URL}/community/opt-in${query}`);
    if (!res.ok) throw new Error('Failed to fetch community opt-in settings');
    return res.json();
  },

  async updateCommunityOptInSettings(farmerId: string, settings: Partial<CommunityOptInSettings>): Promise<CommunityOptInSettings> {
    const res = await fetch(`${BASE_URL}/community/opt-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId, settings }),
    });
    if (!res.ok) throw new Error('Failed to update community opt-in settings');
    return res.json();
  },

  async sendPeerMessage(payload: PeerMessagePayload): Promise<{ success: boolean; messageId: string }> {
    const res = await fetch(`${BASE_URL}/community/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to send peer message');
    return res.json();
  },
};
