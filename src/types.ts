// Complete TypeScript definitions for AgriSaarthi AI Platform

export type UserRole = 'farmer' | 'provider' | 'admin' | 'public';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'kn' | 'ml' | 'pa' | 'gu' | 'bn';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  language: LanguageCode;
  avatar_url?: string;
  created_at: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  farmer_id_code: string;
  father_or_spouse_name?: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  total_land_acres: number;
  primary_crops: string[];
  soil_type_primary: string;
  irrigation_source: string;
  kisan_credit_card: boolean;
  pm_kisan_registered: boolean;
  is_demo?: boolean;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  company_name: string;
  business_type: 'warehouse_operator' | 'soil_lab' | 'fpo' | 'buyer' | 'equipment';
  gst_number?: string;
  license_number?: string;
  verified: boolean;
  verification_date?: string;
  phone: string;
  district: string;
  state: string;
  is_demo?: boolean;
}

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  total_area_acres: number;
  survey_number?: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  water_source: 'borewell' | 'canal' | 'rainfed' | 'river' | 'drip';
  organic_certified: boolean;
  created_at: string;
  is_demo?: boolean;
}

export interface Field {
  id: string;
  farm_id: string;
  field_name: string;
  area_acres: number;
  current_crop?: string;
  sowing_date?: string;
  expected_harvest_date?: string;
  soil_type: string;
  irrigation_type: string;
  current_health_status: 'healthy' | 'stressed' | 'diseased' | 'harvested' | 'fallow';
}

export interface CropHistory {
  id: string;
  field_id: string;
  farmer_id: string;
  crop_name: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  sown_year: number;
  yield_quintals: number;
  price_realized_per_quintal: number;
  pest_issues?: string[];
  fertilizers_used?: string[];
  notes?: string;
}

export interface SoilNutrientProfile {
  soil_type: string;
  ph: number;
  organic_carbon_percent: number;
  nitrogen_kg_ha: number;
  nitrogen_status: 'Low' | 'Medium' | 'High';
  phosphorus_kg_ha: number;
  phosphorus_status: 'Low' | 'Medium' | 'High';
  potassium_kg_ha: number;
  potassium_status: 'Low' | 'Medium' | 'High';
  ec_ds_m?: number;
  zinc_ppm?: number;
  iron_ppm?: number;
  boron_ppm?: number;
  source_soil_test_id?: string;
  source_sample_code?: string;
}

export interface SeasonalClimateParameters {
  current_standing_crop: string;
  standing_crop_family: string;
  target_season: 'Kharif (Monsoon)' | 'Rabi (Winter/Post-Monsoon)' | 'Zaid (Summer)';
  region_agro_climatic_zone: string;
  expected_rainfall_trend: 'Deficit' | 'Normal Monsoon' | 'Heavy / Excess' | 'Dry Summer';
  water_source: string;
  irrigation_capacity: 'High' | 'Medium' | 'Low / Deficit';
  priority_focus: 'MAX_SOIL_HEALTH' | 'MAX_PROFIT' | 'WATER_SAVING' | 'PEST_BREAK' | 'BALANCED';
}

export interface CropRotationRecommendation {
  id: string;
  crop_name: string;
  scientific_name: string;
  crop_family: string;
  recommended_varieties: string[];
  suitability_score: number; // 0 - 100
  rank: number;
  verdict: 'STRONGLY_RECOMMENDED' | 'HIGHLY_SUITABLE' | 'MODERATELY_VIABLE' | 'NOT_ADVISED';
  summary_rationale: string;
  soil_compatibility: {
    score: number; // 0 - 100
    nitrogen_impact: string;
    nitrogen_net_change_kg_ha: number;
    phosphorus_tolerance: string;
    potassium_tolerance: string;
    ph_suitability: string;
    organic_matter_contribution: string;
  };
  seasonal_fit: {
    season_name: string;
    optimal_sowing_window: string;
    harvest_window: string;
    duration_days: number;
    water_requirement: 'Low' | 'Medium' | 'High';
    water_saving_vs_previous_crop_percent: number;
    climate_resilience_rating: 'Exceptional' | 'High' | 'Moderate';
  };
  pathogen_breakdown: {
    breaks_diseases: string[];
    family_shift_benefit: string;
    pest_suppression_score: number;
  };
  economic_projection: {
    estimated_yield_quintal_acre: number;
    mandi_modal_price_per_quintal: number;
    cost_of_cultivation_per_acre: number;
    gross_revenue_per_acre: number;
    net_profit_per_acre: number;
    roi_percent: number;
    market_demand_rating: 'Very High' | 'High' | 'Moderate';
  };
  key_management_practices: string[];
  companion_or_green_manure_tip: string;
}

export interface FourSeasonSuccessionPlan {
  cycle_title: string;
  target_soil_type: string;
  total_cycle_months: number;
  cumulative_estimated_net_profit: number;
  soil_health_improvement_summary: string;
  nitrogen_fixation_total_kg_ha: number;
  steps: {
    season_number: number;
    season_name: string;
    crop_name: string;
    variety: string;
    category: string;
    duration_days: number;
    water_demand: 'Low' | 'Medium' | 'High';
    soil_benefit: string;
    expected_net_profit_acre: number;
    is_nitrogen_fixer: boolean;
  }[];
}

export interface CropRotationAdvisorResponse {
  standing_crop_summary: {
    crop_name: string;
    family: string;
    depletion_profile: string;
    pathogen_risk_if_repeated: string;
  };
  soil_status_analyzed: {
    nitrogen_status: string;
    phosphorus_status: string;
    potassium_status: string;
    ph: number;
    organic_carbon_percent: number;
    overall_fertility_index: 'Low' | 'Moderate' | 'High' | 'Fertile Loam';
  };
  top_recommendations: CropRotationRecommendation[];
  succession_cycle: FourSeasonSuccessionPlan;
  ai_agronomic_advisory: string;
}

export interface CropRotationPlan {
  id: string;
  field_id?: string;
  farm_id?: string;
  current_crop?: string;
  plan_name?: string;
  soil_type_target?: string;
  seasons_cycle_count?: number;
  sequence?: {
    season_order: number;
    season_name: string;
    crop_name: string;
    variety: string;
    duration_days: number;
    water_requirement: string;
    soil_benefit: string;
    expected_yield_quintal_acre: number;
  }[];
  recommended_sequence?: {
    season: string;
    crop: string;
    variety: string;
    nitrogen_fixation: boolean;
    water_requirement: 'Low' | 'Medium' | 'High';
    soil_benefit: string;
    pest_break_effect: string;
    estimated_profit_per_acre: number;
  }[];
  rationale?: string;
  created_at: string;
}

export interface SoilTest {
  id: string;
  field_id: string;
  farmer_id: string;
  lab_id?: string;
  lab_name?: string;
  lab_accreditation?: string;
  tested_by?: string;
  lab_phone?: string;
  sample_code: string;
  sample_number?: string;
  soil_type?: string;
  test_date: string;
  status: 'PENDING_COLLECTION' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  ph: number;
  ec_ds_m: number;
  organic_carbon_percent: number;
  nitrogen_kg_ha: number;
  nitrogen_status: 'Low' | 'Medium' | 'High';
  phosphorus_kg_ha: number;
  phosphorus_status: 'Low' | 'Medium' | 'High';
  potassium_kg_ha: number;
  potassium_status: 'Low' | 'Medium' | 'High';
  zinc_ppm?: number;
  iron_ppm?: number;
  boron_ppm?: number;
  fertilizer_recommendations?: string[];
  lab_recommendation?: string;
  report_document_url?: string;
  is_demo?: boolean;
}

export interface SoilLab {
  id: string;
  name: string;
  organization: string;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  email: string;
  accreditation: string;
  test_fee_inr: number;
  turnaround_days: number;
  available_tests: string[];
  rating: number;
  verified: boolean;
  is_demo?: boolean;
}

export interface SoilTestRequest {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  lab_id: string;
  field_id: string;
  sample_collection_type: 'lab_pickup' | 'farmer_drop' | 'courier';
  pickup_address: string;
  selected_package: string;
  estimated_cost: number;
  status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'IN_TESTING' | 'REPORT_READY';
  created_at: string;
}

export type PlantPart = 'leaf' | 'whole_plant' | 'stem' | 'fruit_or_vegetable';

export interface PlantScan {
  id: string;
  farmer_id: string;
  farm_id?: string;
  field_id?: string;
  crop_name: string;
  plant_part: PlantPart;
  image_url: string;
  image_quality_score: number; // 0 - 100
  image_quality_verdict: 'CLEAR' | 'ACCEPTABLE' | 'BLURRY_OR_DARK' | 'LOW_RESOLUTION';
  quality_checks: {
    blur_score: number;
    brightness_ok: boolean;
    leaf_centered: boolean;
    resolution_ok: boolean;
  };
  predicted_issue: string;
  prediction_type: 'DISEASE' | 'PEST_DAMAGE' | 'NUTRIENT_DEFICIENCY' | 'HEALTHY' | 'STRESS' | 'UNCERTAIN';
  confidence: number; // 0 - 100
  model_name: string;
  model_version: string;
  observed_symptoms: string[];
  farmer_explanation: string;
  recommended_actions: string[];
  pest_ipm_guidance?: string;
  nutrient_advisory?: string;
  soil_lab_referral_needed: boolean;
  status: 'COMPLETED' | 'REQUIRES_EXPERT' | 'INCONCLUSIVE';
  created_at: string;
  farmer_feedback?: 'yes' | 'no' | 'not_sure';
  farmer_correction_notes?: string;
  is_demo?: boolean;
}

export interface PlantScanObservation {
  id: string;
  scan_id: string;
  observation_name: string;
  probability: number;
  category: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'abiotic' | 'healthy';
}

export interface Warehouse {
  id: string;
  provider_id: string;
  name: string;
  operator_type: 'CWC' | 'SWC' | 'Private' | 'Cooperative' | 'FPO';
  address: string;
  taluk: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  storage_types: Array<
    | 'General Warehouse'
    | 'Grain Storage'
    | 'Cold Storage'
    | 'Vegetable Storage'
    | 'Fruit Storage'
    | 'Perishable Storage'
    | 'Temperature Controlled Storage'
    | 'Dry Storage'
    | 'Agricultural Commodity Storage'
  >;
  total_capacity_kg: number;
  used_capacity_kg: number;
  available_capacity_kg: number;
  pricing_model: 'per_kg_per_day' | 'per_ton_per_day' | 'per_month_quintal' | 'flat_monthly';
  rate_inr: number; // e.g. 0.40 /kg/day or 35/quintal/month
  minimum_storage_days: number;
  suitable_crops: string[];
  temperature_range_celsius?: string;
  humidity_control: boolean;
  security_and_cctv: boolean;
  weighbridge_available: boolean;
  fumigation_service: boolean;
  insurance_covered: boolean;
  rating: number;
  verified: boolean;
  contact_person: string;
  contact_phone: string;
  is_demo?: boolean;
}

export interface WarehouseBooking {
  id: string;
  booking_code: string;
  warehouse_id: string;
  warehouse_name: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  crop_name: string;
  quantity_kg: number;
  storage_type_requested: string;
  start_date: string;
  expected_duration_days: number;
  end_date: string;
  rate_applied: number;
  estimated_cost_inr: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  provider_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StorageProfitCalculation {
  crop_name: string;
  quantity_kg: number;
  current_mandi_price_per_kg: number;
  projected_future_price_per_kg: number;
  storage_duration_days: number;
  storage_rate_per_kg_day: number;
  transport_cost_inr: number;
  current_revenue: number;
  estimated_storage_cost: number;
  estimated_future_revenue: number;
  estimated_additional_revenue: number;
  estimated_net_benefit: number;
  recommendation_verdict: 'STORE_MAY_BE_BENEFICIAL' | 'SELL_NOW_MAY_BE_BETTER' | 'MARGINAL_BENEFIT';
}

export interface GovernmentScheme {
  id: string;
  scheme_code: string;
  title: string;
  sponsor: 'Central Government' | 'State Government (Tamil Nadu)' | 'State Government (Maharashtra)' | 'State Government (Punjab)' | 'NABARD';
  category: 'Financial Support' | 'Crop Insurance' | 'Farm Equipment Subsidy' | 'Irrigation & Solar' | 'Horticulture' | 'Soil Health';
  benefit_summary: string;
  subsidy_percent?: number;
  max_financial_benefit_inr?: number;
  eligibility_criteria: string[];
  required_documents: string[];
  state_applicable: string;
  application_url: string;
  is_active: boolean;
  deadline?: string;
  is_demo?: boolean;
}

export interface SchemeApplication {
  id: string;
  application_number: string;
  scheme_id: string;
  scheme_title: string;
  farmer_id: string;
  farmer_name: string;
  land_area_acres: number;
  aadhaar_last_four: string;
  bank_account_verified: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_SCRUTINY' | 'FIELD_VERIFICATION' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  submitted_date: string;
  updated_date: string;
  remarks?: string;
}

export interface MarketPrice {
  id: string;
  mandi_name: string;
  district: string;
  state: string;
  commodity: string;
  crop_name?: string;
  variety: string;
  category?: 'Vegetables' | 'Fruits' | 'Cereals & Grains' | 'Spices & Commercial' | 'Oilseeds & Pulses';
  min_price_per_quintal: number;
  min_price_inr?: number;
  modal_price_per_quintal: number;
  modal_price_inr?: number;
  max_price_per_quintal: number;
  max_price_inr?: number;
  arrival_quantity_tonnes: number;
  daily_arrival_volume_quintals?: number;
  price_trend: 'up' | 'down' | 'stable';
  price_change_percent?: number;
  historical_prices?: { date: string; modalPrice: number }[];
  report_date: string;
  price_date?: string;
  source: string;
  distance_km?: number;
  is_demo?: boolean;
}

export type PriceAlertCondition = 'ABOVE_TARGET' | 'BELOW_TARGET' | 'PERCENT_SURGE' | 'PERCENT_DROP' | 'DAILY_DIGEST';

export interface PriceAlertRule {
  id: string;
  userId: string;
  commodity: string;
  mandiName: string;
  district: string;
  state: string;
  condition: PriceAlertCondition;
  targetPriceINR: number;
  currentPriceINR?: number;
  thresholdPercent?: number;
  channels: ('in_app' | 'push' | 'sms' | 'whatsapp')[];
  status: 'ACTIVE' | 'PAUSED';
  lastTriggeredAt?: string;
  triggerCount?: number;
  createdAt: string;
  note?: string;
}

export interface TriggeredPriceAlert {
  id: string;
  ruleId?: string;
  userId: string;
  commodity: string;
  mandiName: string;
  district: string;
  previousPrice: number;
  newPrice: number;
  changePercent: number;
  conditionMet: string;
  alertType: 'HIGH_PROFIT_SELL' | 'PRICE_DROP_WARNING' | 'PRICE_DIP_WARNING' | 'SURGE_SPIKE' | 'DAILY_DIGEST';
  headline: string;
  message: string;
  actionRecommendation: string;
  suggestedAction: 'SELL_NOW' | 'BOOK_STORAGE' | 'STORE_IN_WAREHOUSE' | 'CONSULT_ADVISOR' | 'VIEW_BUYERS';
  timestamp: string;
  isRead: boolean;
}

export interface BuyerListing {
  id: string;
  buyer_id: string;
  company_name: string;
  buyer_type: 'FPO' | 'Exporters' | 'Flour Mill / Processor' | 'Wholesale Trader' | 'Retail Chain';
  commodity_required: string;
  variety_preferred?: string;
  required_quantity_tonnes: number;
  offered_price_per_quintal: number;
  delivery_location: string;
  payment_terms: 'Instant on delivery' | '24h Bank Transfer' | 'Escrow via AgriSaarthi';
  verified_buyer: boolean;
  created_at: string;
  is_demo?: boolean;
}

export interface CropListing {
  id: string;
  farmer_id: string;
  farmer_name: string;
  crop_name: string;
  variety: string;
  quantity_quintals: number;
  expected_price_per_quintal: number;
  harvest_date: string;
  storage_location: string;
  quality_grade: 'Grade A' | 'Grade B' | 'Organic';
  status: 'ACTIVE' | 'SOLD' | 'NEGOTIATING';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
}

export interface SystemHealthStats {
  status: 'HEALTHY' | 'DEGRADED' | 'OPERATIONAL';
  database_status: 'CONNECTED' | 'DISCONNECTED';
  api_latency_ms: number;
  uptime_seconds: number;
  total_users: number;
  total_farmers: number;
  total_warehouses: number;
  total_plant_scans: number;
  total_bookings: number;
  total_soil_tests: number;
  storage_capacity_utilization_percent: number;
  ai_service_status: 'READY' | 'RATE_LIMITED' | 'FALLBACK_MODE';
  last_checked: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'soil_report' | 'disease_scan' | 'scheme' | 'market_alert' | 'crop_plan' | 'yield_prediction' | 'pest_alert' | 'community_message' | 'system';
  is_read: boolean;
  created_at: string;
  link_tab?: string;
}

export interface AdminInquiryMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'farmer' | 'provider' | 'admin';
  content: string;
  timestamp: string;
  is_ai_assisted?: boolean;
  visual_payload?: {
    type: 'mandi_trend' | 'demand_bar' | 'harvest_timeline' | 'storage_roi' | 'crop_comparison';
    title: string;
    description?: string;
    data: any;
  };
}

export interface AdminInquiry {
  id: string;
  ticket_number: string;
  sender_id: string;
  sender_name: string;
  sender_email?: string;
  sender_phone?: string;
  sender_role: 'farmer' | 'provider';
  subject: string;
  category:
    | 'WAREHOUSE_BOOKING'
    | 'SOIL_TESTING'
    | 'GOVT_SCHEME'
    | 'PLANT_HEALTH'
    | 'PAYMENT_ESCROW'
    | 'CAPACITY_DISPUTE'
    | 'TECHNICAL_SUPPORT'
    | 'GENERAL';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: AdminInquiryMessage[];
  created_at: string;
  updated_at: string;
}

export interface DemandCropSuggestion {
  id: string;
  crop_name: string;
  category: 'Fruit' | 'Vegetable';
  demand_index: number; // 0 - 100
  demand_level: 'Very High' | 'High' | 'Moderate';
  current_mandi_modal_price_quintal: number;
  price_forecast_trend: '+12% (Rising)' | '+18% (Peak Surge)' | '+25% (High Deficit)' | '+8% (Steady)';
  best_sowing_season: string;
  duration_days: number;
  estimated_yield_tonnes_per_acre: number;
  expected_profit_per_acre_inr: number;
  cold_storage_suitability: string;
  top_demanding_markets: string[];
  key_agronomic_tips: string;
}

export interface CropHarvestEstimate {
  id: string;
  crop_name: string;
  variety?: string;
  sowing_date: string;
  duration_days: number;
  days_elapsed: number;
  days_remaining: number;
  estimated_harvest_start: string;
  estimated_harvest_end: string;
  current_stage: 'Germination & Seedling' | 'Vegetative Growth' | 'Flowering & Pod Setting' | 'Fruit / Grain Filling' | 'Maturity & Harvest Ready';
  stage_progress_percent: number;
  weather_harvest_condition: 'Optimal Dry Weather' | 'Moderate' | 'Risk of Rain - Plan Early Harvest';
  expected_yield_quintals: number;
  recommended_post_harvest_action: string;
}

export interface DailyWeatherForecast {
  date: string;
  day_name: string;
  temp_max_c: number;
  temp_min_c: number;
  temp_avg_c: number;
  precipitation_mm: number;
  precipitation_probability: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  soil_moisture_percent: number;
  condition: string;
  condition_icon: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm';
  sowing_suitability_score: number; // 0 - 100
  sowing_suitability_verdict: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'NOT_RECOMMENDED';
  advisory_note: string;
}

export interface CropPlantingRecommendation {
  id: string;
  crop_name: string;
  category: 'Vegetables' | 'Grains & Cereals' | 'Pulses' | 'Cash Crops' | 'Spices & Tubers';
  variety: string;
  optimal_temp_range: string;
  optimal_precipitation_range: string;
  soil_moisture_target: string;
  suitability_score: number; // 0 - 100
  suitability_status: 'OPTIMAL_WINDOW' | 'FAVORABLE' | 'NEEDS_IRRIGATION' | 'DELAY_SOWING';
  recommended_window: string;
  best_sowing_time_of_day: string;
  days_to_germination: number;
  weather_match_reason: string;
  precipitation_impact_analysis: string;
  temperature_impact_analysis: string;
  actionable_sowing_tips: string[];
  risk_warnings: string[];
}

export interface RealTimeWeatherData {
  location_name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  current: {
    temp_c: number;
    feels_like_c: number;
    humidity_percent: number;
    precipitation_rate_mm: number;
    precipitation_prob_today: number;
    wind_speed_kmh: number;
    wind_direction: string;
    solar_uv_index: number;
    soil_moisture_percent: number;
    soil_temp_c: number;
    cloud_cover_percent: number;
    condition_text: string;
    condition_code: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm';
  };
  forecast_7days: DailyWeatherForecast[];
  planting_recommendations: CropPlantingRecommendation[];
  overall_planting_advisory: {
    title: string;
    verdict: 'HIGHLY_SUITABLE' | 'MODERATELY_SUITABLE' | 'CAUTION_RAIN_ALERT' | 'DROUGHT_IRRIGATE';
    description: string;
    primary_alert?: string;
  };
}

export interface YieldPredictionInput {
  farmId?: string;
  farmName?: string;
  fieldId?: string;
  fieldName?: string;
  cropName: string;
  variety?: string;
  landAreaAcres: number;
  sowingDate?: string;
  cropStage: 'Germination & Seedling' | 'Vegetative Growth' | 'Flowering & Tillering' | 'Fruit & Grain Setting' | 'Ripening & Maturation';
  soilType: 'Red Loamy' | 'Black Cotton' | 'Alluvial Soil' | 'Sandy Loam' | 'Clayey Loam' | 'Laterite';
  soilNutrients: {
    nitrogenKgHa: number;
    nitrogenStatus?: 'Low' | 'Medium' | 'High';
    phosphorusKgHa: number;
    phosphorusStatus?: 'Low' | 'Medium' | 'High';
    potassiumKgHa: number;
    potassiumStatus?: 'Low' | 'Medium' | 'High';
    ph: number;
    organicCarbonPercent: number;
    soilMoisturePercent?: number;
    ecDsM?: number;
  };
  irrigationType: 'Drip Irrigation' | 'Sprinkler Irrigation' | 'Canal / Furrow Flooding' | 'Rainfed / Borewell';
  weatherScenario: {
    avgDayTempC: number;
    avgNightTempC: number;
    rainfallTrend: 'Normal Seasonal' | 'Deficit Rain (-20%)' | 'Excess Monsoon (+25%)' | 'Dry Spells & Heat Waves';
    avgHumidityPercent: number;
    sunlightHoursPerDay: number;
  };
  simulationModifiers?: {
    irrigationBoostPercent?: number;
    fertilizerBoostPercent?: number;
    pestShieldActive?: boolean;
  };
}

export interface YieldForecastMilestone {
  day: number;
  dayLabel: string;
  stageTitle: string;
  projectedBiomassIndex: number; // 0 - 100
  canopyCoverPercent: number; // 0 - 100
  waterDemandLitersPerAcrePerDay: number;
  pestRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  heatStressRisk: 'Low' | 'Moderate' | 'High';
  milestoneGoal: string;
  criticalIntervention: string;
  projectedHeightCm?: number;
  ndviEstimated?: number;
}

export interface YieldIntervention {
  id: string;
  dayTarget: string;
  dayNumber: number;
  category: 'Irrigation' | 'Nutrient Management' | 'Pest & Fungus Protection' | 'Soil Conditioning' | 'Harvest Prep';
  title: string;
  instruction: string;
  dosageOrRate: string;
  expectedYieldGainPercent: number;
  completed?: boolean;
}

export interface YieldPredictionResult {
  id: string;
  farmerId?: string;
  cropName: string;
  variety: string;
  landAreaAcres: number;
  cropStage: string;
  soilType: string;
  irrigationType: string;
  predictedYieldTonnesPerAcre: number;
  predictedYieldQuintalsPerAcre: number;
  totalExpectedYieldQuintals: number;
  totalExpectedYieldTonnes: number;
  baselineYieldQuintalsPerAcre: number;
  potentialMaxYieldQuintalsPerAcre: number;
  worstCaseYieldQuintalsPerAcre: number;
  regionalAverageQuintalsPerAcre: number;
  percentageVsRegionalAvg: number;
  confidenceScorePercent: number;
  biomassHealthIndex: number;
  harvestWindowEstimated: string;
  daysToOptimalHarvest: number;
  weatherGrowthFactor: {
    verdict: 'FAVORABLE' | 'MODERATE' | 'STRESS_WARNING';
    rainfallImpact: string;
    temperatureImpact: string;
    sunlightImpact: string;
    growthDaysForecast: string;
    gddAccumulated: number; // Growing Degree Days
  };
  soilGrowthFactor: {
    fertilityVerdict: 'HIGH_FERTILITY' | 'BALANCED' | 'NUTRIENT_DEFICIENT';
    nitrogenImpact: string;
    phosphorusImpact: string;
    potassiumImpact: string;
    phImpact: string;
    organicMatterImpact: string;
  };
  timeline60Days: YieldForecastMilestone[];
  actionableInterventions: YieldIntervention[];
  marketRevenueProjection: {
    currentMandiRateInrPerQuintal: number;
    projectedGrossRevenueInr: number;
    baselineGrossRevenueInr: number;
    potentialGainWithAIInterventionsInr: number;
    estimatedCostOfInterventionsInr: number;
    netBenefitInr: number;
    roiMultiplier: number;
  };
  aiSummaryAdvisory: string;
  generatedAt: string;
}

export interface PestRiskAssessmentInput {
  farmId?: string;
  farmName?: string;
  fieldId?: string;
  fieldName?: string;
  farmerId?: string;
  cropName: string;
  variety?: string;
  cropStage: 'Seedling & Germination' | 'Vegetative Growth' | 'Flowering & Tillering' | 'Fruit & Grain Setting' | 'Ripening & Maturation';
  landAreaAcres?: number;
  sowingDate?: string;
  location: {
    district: string;
    state: string;
    talukOrVillage?: string;
    agroClimaticZone?: string;
  };
  weatherConditions: {
    temperatureC: number;
    minTempC?: number;
    maxTempC?: number;
    relativeHumidityPercent: number;
    rainfallCondition: 'Continuous Drizzle' | 'Heavy Showers' | 'Dry Spells / Heatwave' | 'Moderate / Intermittent' | 'Humid & Overcast' | 'Optimal Clear Sky';
    windSpeedKmh?: number;
    canopyWetnessHours?: number;
    forecastTrend?: string;
  };
  soilFieldConditions?: {
    soilMoisturePercent?: number;
    standingWater?: boolean;
    previousCropPestHistory?: string;
    nitrogenApplicationStatus?: 'Optimal' | 'Excessive' | 'Deficient';
    mulchingPresent?: boolean;
  };
  customNotes?: string;
  preferredLanguage?: string;
}

export interface BotanicalBioFormulation {
  formulationName: string;
  preparationAndDosage: string;
  modeOfAction: string;
  sprayFrequency: string;
  safetyIntervalHours?: number;
}

export interface BiologicalPredatorOrParasite {
  agentName: string;
  releaseRateOrDosage: string;
  targetPestStage: string;
  applicationGuideline: string;
}

export interface PestRiskVulnerabilityItem {
  id: string;
  pestOrDiseaseName: string;
  scientificName: string;
  pestType: 'Insect Pest' | 'Fungal Disease' | 'Bacterial Blight' | 'Viral / Vector' | 'Nematode';
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  riskScorePercent: number; // 0 - 100
  incubationWindowDays: number; // e.g. 3-5 days
  climateTriggerFactors: string[];
  damageSymptomsEarly: string[];
  damageSymptomsSevere: string[];
  affectedPlantParts: ('Leaf' | 'Stem' | 'Floral Bud' | 'Fruit/Pod' | 'Root')[];
  economicThresholdLevel: string; // ETL e.g. "5-10% dead hearts or 1 egg mass/sqm"
  potentialYieldLossPercent: number; // e.g. 25-45%
  urgencyWindow: string; // e.g. "Take action within 48-72 hours"
  organicManagementStrategy: {
    preventiveMeasures: string[];
    botanicalBioFormulations: BotanicalBioFormulation[];
    biologicalPredatorsAndParasites: BiologicalPredatorOrParasite[];
    culturalAndMechanicalPractices: string[];
  };
}

export interface WeeklyScoutingChecklistTask {
  id: string;
  dayNumber: number;
  dayLabel: string;
  scoutingFocusArea: string;
  diagnosticVisualKey: string;
  proactiveOrganicTask: string;
  status: 'pending' | 'completed';
}

export interface OrganicEmergencySprayItem {
  id: string;
  dayTarget: string;
  bioSprayName: string;
  activeComponent: string;
  dosage: string;
  targetPest: string;
  precautions: string;
}

export interface PestRiskAssessmentResult {
  id: string;
  farmerId?: string;
  cropName: string;
  variety?: string;
  cropStage: string;
  landAreaAcres?: number;
  district: string;
  state: string;
  overallFarmPestIndex: number; // 0 - 100
  overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  immediateAlertHeading: string;
  keyTriggerFactor: string;
  climateVulnerabilitySummary: string;
  weatherAlertBadge: {
    temperatureWarning: string;
    humidityCondition: string;
    favorablePestSpurtWindow: string;
    conduciveDiseaseIndices: string[];
  };
  identifiedPests: PestRiskVulnerabilityItem[];
  weeklyScoutingChecklist: WeeklyScoutingChecklistTask[];
  organicEmergencySprayPlan: OrganicEmergencySprayItem[];
  expertAgronomistNote: string;
  generatedAt: string;
}

// ============================================================================
// FARMER COMMUNITY & INTERACTIVE MAP TYPES
// ============================================================================

export type FarmingMethodology = '100% Certified Organic' | 'Natural Farming (ZBNF)' | 'Integrated Pest Management (IPM)' | 'Precision Conventional' | 'Permaculture / Agroforestry';

export type CommunityCollaborationType = 
  | 'Machinery / Tractor Sharing'
  | 'Indigenous Seed & Sapling Exchange'
  | 'Crop Advisory & Mentorship'
  | 'Joint Transport & Mandi Aggregation'
  | 'Borewell / Water Sharing'
  | 'Bio-Input Bulk Preparation';

export interface FarmerPeerProfile {
  id: string;
  user_id: string;
  name: string;
  farmer_id_code: string;
  avatar?: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  land_area_acres: number;
  primary_crops: string[];
  farming_method: FarmingMethodology;
  soil_type: string;
  specialties: string[];
  available_for: CommunityCollaborationType[];
  equipment_available: string[];
  bio: string;
  experience_years: number;
  rating: number;
  verified_kisan: boolean;
  opt_in_community: boolean;
  opt_in_date: string;
  phone_masked?: string;
  allow_direct_call: boolean;
  active_nodes_count: number;
}

export type KnowledgeNodeCategory = 
  | 'PEST_ALERT'
  | 'SOIL_WATER'
  | 'BIO_RECIPE'
  | 'SEED_VARIETY'
  | 'EQUIPMENT_COOP'
  | 'MARKET_AGGREGATION'
  | 'WEATHER_ANOMALY';

export interface FarmingKnowledgeNode {
  id: string;
  author_id: string;
  author_name: string;
  author_village: string;
  author_avatar?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  category: KnowledgeNodeCategory;
  title: string;
  content: string;
  actionable_tip?: string;
  urgency_level: 'HIGH_ALERT' | 'SEASONAL_TIP' | 'BEST_PRACTICE';
  crops_relevant: string[];
  tags: string[];
  upvotes: number;
  has_upvoted?: boolean;
  verified_by_agronomist: boolean;
  agronomist_badge_note?: string;
  created_at: string;
  comments_count: number;
}

export interface CommunityOptInSettings {
  opted_in: boolean;
  display_name: string;
  display_mode: 'FULL_NAME' | 'FIRST_NAME_INITIAL' | 'ANONYMOUS_KISAN';
  share_phone: boolean;
  phone: string;
  primary_crops: string[];
  farming_method: FarmingMethodology;
  land_area_acres: number;
  specialties: string[];
  available_for: CommunityCollaborationType[];
  equipment_available: string[];
  bio: string;
  village: string;
  taluk: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface PeerMessagePayload {
  from_farmer_id: string;
  from_farmer_name: string;
  to_peer_id: string;
  to_peer_name: string;
  subject: string;
  message: string;
  inquiry_type: CommunityCollaborationType | 'General Discussion';
  contact_phone?: string;
}

// ============================================================================
// MULTI-TURN GEMINI CHATBOT ROLES & TASK TIERS
// ============================================================================

export type ChatbotRoleId = 
  | 'agronomist_pro'
  | 'kisan_copilot'
  | 'speed_dispatcher'
  | 'scheme_specialist'
  | 'organic_master';

export type ChatTaskTier = 'COMPLEX' | 'GENERAL' | 'FAST';

export interface ChatbotRoleDefinition {
  id: ChatbotRoleId;
  name: string;
  title: string;
  description: string;
  icon: string;
  defaultTier: ChatTaskTier;
  recommendedModel: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  systemInstruction: string;
  samplePrompts: string[];
  expertiseTags: string[];
  badgeColor: string;
}

export interface ChatTurnHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface MultiTurnChatMessage {
  id: string;
  sender: 'user' | 'ai';
  role?: 'user' | 'model';
  text: string;
  timestamp: string;
  roleId?: ChatbotRoleId;
  modelUsed?: string;
  taskTier?: ChatTaskTier;
  suggestedFollowUps?: string[];
  visualPayload?: {
    type: 'mandi_trend' | 'demand_bar' | 'harvest_timeline' | 'storage_roi' | 'crop_comparison';
    title: string;
    description?: string;
    data: any;
  };
}

export interface MultiTurnChatRequest {
  message: string;
  history?: ChatTurnHistoryItem[];
  roleId?: ChatbotRoleId;
  taskTier?: ChatTaskTier;
  preferredModel?: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | string;
  language?: string;
  farmerContext?: {
    name?: string;
    farmerName?: string;
    village?: string;
    district?: string;
    state?: string;
    crops?: string[];
    primaryCrops?: string[];
    soilType?: string;
    landAreaAcres?: number;
    activeDisease?: string;
  };
}

export interface MultiTurnChatResponse {
  reply: string;
  modelUsed: string;
  roleId: ChatbotRoleId;
  taskTier: ChatTaskTier;
  suggestedFollowUps: string[];
  visualPayload?: {
    type: 'mandi_trend' | 'demand_bar' | 'harvest_timeline' | 'storage_roi' | 'crop_comparison';
    title: string;
    description?: string;
    data: any;
  };
}

// ============================================================================
// CROP GROWTH TRACKER & HARVEST CYCLE TYPES
// ============================================================================

export interface GrowthStageTask {
  id: string;
  title: string;
  description: string;
  category: 'Irrigation' | 'Nutrient & Bio-Fertilizer' | 'Pest & Disease Scouting' | 'Weeding & Aeration' | 'Harvest Prep';
  dayTarget: number;
  completed: boolean;
  completedAt?: string;
  recommendedInput?: string;
}

export interface CropGrowthStage {
  id: string;
  stageName: string;
  stageShortName: string;
  stageOrder: number;
  startDay: number;
  endDay: number;
  durationDays: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  progressPercent: number; // 0-100 within this stage
  startDate: string;
  endDate: string;
  visualIcon: string;
  description: string;
  agronomicGuidelines: {
    watering: string;
    nutrientFocus: string;
    pestThreats: string[];
    criticalCheck: string;
  };
  tasks: GrowthStageTask[];
}

export interface CropGrowthLog {
  id: string;
  userId: string;
  farmerName?: string;
  farmId?: string;
  farmName?: string;
  fieldId?: string;
  plotName: string;
  cropName: string;
  variety: string;
  category: 'Vegetables' | 'Fruits' | 'Cereals & Grains' | 'Spices & Commercial' | 'Oilseeds & Pulses';
  plantingDate: string; // YYYY-MM-DD
  sowingMethod: 'Direct Seed Sowing' | 'Nursery Bed Transplanting' | 'Drip Fertigated Bed' | 'Furrow & Ridge' | 'Broadcasting';
  landAreaAcres: number;
  totalCycleDurationDays: number;
  daysElapsed: number;
  daysRemaining: number;
  overallProgressPercent: number; // 0-100
  currentStageName: string;
  currentStageIndex: number;
  estimatedHarvestStartDate: string;
  estimatedHarvestEndDate: string;
  targetYieldQuintals: number;
  status: 'ACTIVE' | 'HARVEST_READY' | 'HARVESTED' | 'ARCHIVED';
  weatherAlert?: string;
  currentMandiRateINR?: number;
  stages: CropGrowthStage[];
  notes?: string;
  lastUpdated: string;
  createdAt: string;
}

